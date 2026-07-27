import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const returnsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/returns (Admin RMA List) ─────────────────────────────────────────
returnsApp.get('/', async (c) => {
  const status = c.req.query('status') || '';
  const reason = c.req.query('reason') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM return_requests WHERE 1=1';
    const params: any[] = [];
    if (status) { sql += ' AND rma_status=?'; params.push(status); }
    if (reason) { sql += ' AND return_reason=?'; params.push(reason); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, returns: rows });
  }
  return c.json({ success: true, returns: mockReturnsList() });
});

// ── GET /api/returns/:id ──────────────────────────────────────────────────────
returnsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const rma: any = await queryFirst(c.env.DB, 'SELECT * FROM return_requests WHERE id=? OR rma_number=?', [id, id]);
    if (!rma) return c.json({ success: false, message: 'RMA request not found' }, 404);

    const items = await queryAll(c.env.DB, 'SELECT * FROM return_items WHERE return_id=?', [rma.id]);
    const timeline = await queryAll(c.env.DB, 'SELECT * FROM order_status_history WHERE order_id=? ORDER BY created_at ASC', [rma.order_id]);

    return c.json({ success: true, return: { ...rma, items, timeline } });
  }
  const mock = mockReturnsList().find(r => r.id === id || r.rma_number === id) || mockReturnsList()[0];
  return c.json({ success: true, return: mock });
});

// ── POST /api/returns (Customer Submit Return Request) ────────────────────────
returnsApp.post('/', async (c) => {
  const { order_number, customer_name, customer_email, return_reason = 'Damaged Product', resolution = 'Refund', items = [], comments, evidence_url } = await c.req.json();
  if (!order_number || !items.length) {
    return c.json({ success: false, message: 'Order number and returned items required' }, 400);
  }

  const rmaNumber = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
  const returnId = `rma_${Date.now()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO return_requests (id, rma_number, order_number, customer_name, customer_email, return_reason, resolution, rma_status, comments, evidence_url) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [returnId, rmaNumber, order_number, customer_name || 'Customer', customer_email || '', return_reason, resolution, 'Requested', comments || null, evidence_url || null]
    );

    for (const i of items) {
      await executeRun(c.env.DB,
        'INSERT INTO return_items (id, return_id, product_title, quantity, refund_amount) VALUES (?,?,?,?,?)',
        [`ri_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, returnId, i.product_title || 'Item', i.quantity || 1, i.price || 0]
      );
    }
  }

  return c.json({ success: true, message: `Return Request #${rmaNumber} submitted successfully.`, rma_number: rmaNumber });
});

// ── PATCH /api/returns/:id/status ─────────────────────────────────────────────
returnsApp.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status, remarks } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE return_requests SET rma_status=?, admin_remarks=COALESCE(?,admin_remarks), updated_at=CURRENT_TIMESTAMP WHERE id=? OR rma_number=?',
      [status, remarks, id, id]
    );

    // If status is Inspection Passed & Restocked, update inventory
    if (status === 'Inspection Passed') {
      const rma: any = await queryFirst(c.env.DB, 'SELECT order_number FROM return_requests WHERE id=? OR rma_number=?', [id, id]);
      if (rma) {
        await executeRun(c.env.DB, "UPDATE orders SET order_status='Returned' WHERE order_number=?", [rma.order_number]).catch(() => {});
      }
    }
  }

  return c.json({ success: true, message: `RMA status updated to ${status}` });
});

// ── POST /api/returns/:id/inspection (Record Quality Inspection) ──────────────
returnsApp.post('/:id/inspection', async (c) => {
  const id = c.req.param('id');
  const { is_sealed, condition = 'Good', action = 'restock', inspector_notes } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      "UPDATE return_requests SET rma_status='Inspection Passed', admin_remarks=? WHERE id=?",
      [`Condition: ${condition}. Inspection Decision: ${action.toUpperCase()}. ${inspector_notes || ''}`, id]
    );

    if (action === 'restock') {
      const items = await queryAll(c.env.DB, 'SELECT * FROM return_items WHERE return_id=?', [id]);
      for (const item of items) {
        await executeRun(c.env.DB, 'UPDATE products SET stock = stock + ? WHERE name LIKE ?', [item.quantity, `%${item.product_title}%`]).catch(() => {});
      }
    }
  }

  return c.json({ success: true, message: `Quality inspection completed. Action: ${action.toUpperCase()}` });
});

function mockReturnsList() {
  return [
    { id: 'rma1', rma_number: 'RMA-981203', order_number: 'HM-ORD-482910', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', return_reason: 'Damaged Product', resolution: 'Replacement', rma_status: 'Under Review', refund_amount: 499, comments: 'Jar seal was broken upon arrival', evidence_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60', created_at: '2026-07-27T16:00:00Z' },
    { id: 'rma2', rma_number: 'RMA-448102', order_number: 'HM-ORD-839210', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', return_reason: 'Wrong Product Sent', resolution: 'Refund', rma_status: 'Inspection Passed', refund_amount: 899, comments: 'Received Chyawanprash instead of Ashwagandha', created_at: '2026-07-26T14:20:00Z' },
    { id: 'rma3', rma_number: 'RMA-110293', order_number: 'HM-ORD-109283', customer_name: 'Vikram Singh', customer_email: 'vikram@yahoo.com', return_reason: 'Quality Issue', resolution: 'Refund', rma_status: 'Refund Completed', refund_amount: 539, comments: 'Moisture inside seal', created_at: '2026-07-25T11:10:00Z' },
  ];
}

export default returnsApp;
