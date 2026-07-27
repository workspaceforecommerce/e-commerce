import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const customersApp = new Hono<{ Bindings: Env }>();

// ── GET /api/customers (Admin List & Search) ──────────────────────────────────
customersApp.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const group = c.req.query('group') || '';
  const status = c.req.query('status') || '';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM customers WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (q) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (group) { sql += ' AND customer_group = ?'; params.push(group); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY total_spent DESC, created_at DESC LIMIT 100';

    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, customers: rows });
  }
  return c.json({ success: true, customers: mockCustomersList() });
});

// ── GET /api/customers/:id (Customer 360° Profile) ────────────────────────────
customersApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const cust: any = await queryFirst(c.env.DB, 'SELECT * FROM customers WHERE (id=? OR email=?) AND deleted_at IS NULL', [id, id]);
    if (!cust) return c.json({ success: false, message: 'Customer not found' }, 404);

    const addresses = await queryAll(c.env.DB, 'SELECT * FROM customer_addresses WHERE user_id=?', [cust.id]);
    const timeline = await queryAll(c.env.DB, 'SELECT * FROM customer_timeline WHERE customer_id=? ORDER BY created_at DESC', [cust.id]);
    const notes = await queryAll(c.env.DB, 'SELECT * FROM customer_notes WHERE customer_id=? ORDER BY created_at DESC', [cust.id]);

    return c.json({ success: true, customer: { ...cust, addresses, timeline, notes } });
  }
  const mock = mockCustomersList().find(c => c.id === id || c.email === id) || mockCustomersList()[0];
  return c.json({ success: true, customer: mock });
});

// ── POST /api/customers (Create Customer) ─────────────────────────────────────
customersApp.post('/', async (c) => {
  const { name, email, phone, company, gst_number, customer_group = 'Retail', tags = [] } = await c.req.json();
  if (!name || !email) return c.json({ success: false, message: 'Name and email are required' }, 400);

  const custId = `cust_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO customers (id, name, email, phone, company, gst_number, customer_group, tags, status) VALUES (?,?,?,?,?,?,?,?,?)',
      [custId, name, email, phone || '', company || '', gst_number || '', customer_group, JSON.stringify(tags), 'Active']
    );

    // Record timeline
    await executeRun(c.env.DB,
      'INSERT INTO customer_timeline (id, customer_id, event_type, description) VALUES (?,?,?,?)',
      [`ctl_${Date.now()}`, custId, 'Account Created', `Customer registered under ${customer_group} group.`]
    ).catch(() => {});
  }

  return c.json({ success: true, message: 'Customer account created', customer: { id: custId, name, email } });
});

// ── PUT /api/customers/:id (Update Customer) ──────────────────────────────────
customersApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const { name, phone, company, gst_number, customer_group, status, tags } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE customers SET name=COALESCE(?,name), phone=COALESCE(?,phone), company=COALESCE(?,company), gst_number=COALESCE(?,gst_number), customer_group=COALESCE(?,customer_group), status=COALESCE(?,status), tags=COALESCE(?,tags), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name, phone, company, gst_number, customer_group, status, tags ? JSON.stringify(tags) : null, id]
    );
  }

  return c.json({ success: true, message: 'Customer profile updated' });
});

// ── POST /api/customers/:id/notes (Add Staff Note) ───────────────────────────
customersApp.post('/:id/notes', async (c) => {
  const id = c.req.param('id');
  const { note, author = 'CRM Manager' } = await c.req.json();
  if (!note) return c.json({ success: false, message: 'Note text required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO customer_notes (id, customer_id, author, note) VALUES (?,?,?,?)',
      [`cn_${Date.now()}`, id, author, note]
    );
  }

  return c.json({ success: true, message: 'CRM note added' });
});

function mockCustomersList() {
  return [
    {
      id: 'cust1', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9812345678',
      company: 'Lotus Wellness Ltd', gst_number: '29AAACH7409R1ZX', customer_group: 'VIP',
      status: 'Active', total_orders: 8, total_spent: 14890, aov: 1861, created_at: '2025-11-10T10:00:00Z',
      tags: ['Frequent Buyer', 'Ayurveda Enthusiast', 'High LTV'],
      addresses: [
        { id: 'ca1', address_type: 'Home', full_name: 'Aarav Sharma', mobile: '+91 9812345678', address_line1: '42 Lotus Heights, MG Road', city: 'Bengaluru', state: 'Karnataka', postal_code: '560038', is_default: 1 }
      ],
      timeline: [
        { id: 'ctl1', event_type: 'Order Placed', description: 'Placed Order #HM-ORD-482910 for ₹698', created_at: '2026-07-27T14:30:00Z' },
        { id: 'ctl2', event_type: 'Review Submitted', description: 'Rated 5 Stars on KSM-66 Ashwagandha Root Powder', created_at: '2026-07-25T11:00:00Z' },
        { id: 'ctl3', event_type: 'Account Created', description: 'Registered via Web Checkout', created_at: '2025-11-10T10:00:00Z' }
      ],
      notes: [
        { id: 'cn1', author: 'Senior Support Lead', note: 'Prefers WhatsApp order updates over SMS.', created_at: '2026-07-26T16:00:00Z' }
      ]
    },
    {
      id: 'cust2', name: 'Priya Mehta', email: 'priya@gmail.com', phone: '+91 9765432109',
      company: 'Mehta Herbal Spa', gst_number: '27AAACH9918K1Z5', customer_group: 'Wholesale',
      status: 'Active', total_orders: 14, total_spent: 38400, aov: 2742, created_at: '2025-08-14T12:30:00Z',
      tags: ['Bulk Wholesale', 'B2B GST Verified'],
      addresses: [
        { id: 'ca2', address_type: 'Office', full_name: 'Priya Mehta', mobile: '+91 9765432109', address_line1: '15 Sector 4, HSR Layout', city: 'Bengaluru', state: 'Karnataka', postal_code: '560102', is_default: 1 }
      ],
      timeline: [
        { id: 'ctl4', event_type: 'Order Placed', description: 'Placed Order #HM-ORD-839210 for ₹1,149', created_at: '2026-07-26T11:20:00Z' },
        { id: 'ctl5', event_type: 'Coupon Redeemed', description: 'Applied MONK15 voucher code', created_at: '2026-07-26T11:20:00Z' }
      ]
    },
    {
      id: 'cust3', name: 'Vikram Singh', email: 'vikram@yahoo.com', phone: '+91 9123456789',
      company: '', gst_number: '', customer_group: 'Retail',
      status: 'Active', total_orders: 2, total_spent: 1078, aov: 539, created_at: '2026-07-20T09:15:00Z',
      tags: ['First Time Buyer'],
      addresses: [
        { id: 'ca3', address_type: 'Home', full_name: 'Vikram Singh', mobile: '+91 9123456789', address_line1: '88 Civil Lines', city: 'Jaipur', state: 'Rajasthan', postal_code: '302006', is_default: 1 }
      ],
      timeline: [
        { id: 'ctl6', event_type: 'RMA Requested', description: 'Submitted RMA-110293 for Quality Issue', created_at: '2026-07-25T11:10:00Z' }
      ]
    }
  ];
}

export default customersApp;
