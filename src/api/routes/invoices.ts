import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const invoicesApp = new Hono<{ Bindings: Env }>();

// ── GET /api/invoices (List Invoices) ─────────────────────────────────────────
invoicesApp.get('/', async (c) => {
  const q = c.req.query('q') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM invoices WHERE 1=1';
    const params: any[] = [];
    if (q) { sql += ' AND (invoice_number LIKE ? OR order_number LIKE ? OR customer_name LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, invoices: rows });
  }
  return c.json({ success: true, invoices: mockInvoicesList() });
});

// ── GET /api/invoices/:id (Invoice Details) ───────────────────────────────────
invoicesApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const inv: any = await queryFirst(c.env.DB, 'SELECT * FROM invoices WHERE id=? OR invoice_number=?', [id, id]);
    if (!inv) return c.json({ success: false, message: 'Invoice not found' }, 404);
    const items = await queryAll(c.env.DB, 'SELECT * FROM invoice_items WHERE invoice_id=?', [inv.id]);
    return c.json({ success: true, invoice: { ...inv, items } });
  }
  const mock = mockInvoicesList().find(i => i.id === id || i.invoice_number === id) || mockInvoicesList()[0];
  return c.json({ success: true, invoice: mock });
});

// ── POST /api/invoices/generate ──────────────────────────────────────────────
invoicesApp.post('/generate', async (c) => {
  const { order_number, customer_name, customer_email, subtotal = 798, discount_amount = 100, gst_number } = await c.req.json();
  if (!order_number) return c.json({ success: false, message: 'Order number is required' }, 400);

  const invNum = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const invId = `inv_${Date.now()}`;
  const taxAmount = Math.round(subtotal * 0.05);
  const totalAmount = subtotal - discount_amount + (subtotal >= 499 ? 0 : 40);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO invoices (id, invoice_number, order_number, customer_name, customer_email, subtotal, discount_amount, tax_amount, grand_total, gst_number) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [invId, invNum, order_number, customer_name || 'Customer', customer_email || '', subtotal, discount_amount, taxAmount, totalAmount, gst_number || null]
    );
  }

  return c.json({ success: true, message: `Invoice #${invNum} generated.`, invoice: { id: invId, invoice_number: invNum } });
});

function mockInvoicesList() {
  return [
    {
      id: 'inv1', invoice_number: 'INV-2026-1029', order_number: 'HM-ORD-482910', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', customer_phone: '+91 9812345678', shipping_address: '42 Lotus Heights, MG Road, Bengaluru, KA 560038', subtotal: 798, discount_amount: 100, coupon_code: 'WELCOME100', tax_amount: 40, shipping_fee: 0, grand_total: 698, payment_method: 'COD', payment_status: 'Pending', gst_number: '29AAACH7409R1ZX', created_at: '2026-07-27T14:30:00Z',
      items: [
        { id: 'ii1', product_title: 'KSM-66 Ashwagandha Root Powder (250g Jar)', price: 499, quantity: 1, total_price: 499 },
        { id: 'ii2', product_title: 'Himalayan Tulsi Green Tea (100g Tin)', price: 299, quantity: 1, total_price: 299 }
      ]
    },
    {
      id: 'inv2', invoice_number: 'INV-2026-1030', order_number: 'HM-ORD-839210', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', customer_phone: '+91 9765432109', shipping_address: '15 Sector 4, HSR Layout, Bengaluru, KA 560102', subtotal: 1299, discount_amount: 150, coupon_code: 'MONK15', tax_amount: 65, shipping_fee: 0, grand_total: 1149, payment_method: 'Prepaid (Razorpay UPI)', payment_status: 'Paid', created_at: '2026-07-26T11:20:00Z',
      items: [
        { id: 'ii3', product_title: 'Amla Chyawanprash Supreme (1kg Jar)', price: 899, quantity: 1, total_price: 899 },
        { id: 'ii4', product_title: 'Moringa Leaf Superfood Powder (200g Pouch)', price: 400, quantity: 1, total_price: 400 }
      ]
    }
  ];
}

export default invoicesApp;
