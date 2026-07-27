import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const ordersApp = new Hono<{ Bindings: Env }>();

// ── GET all orders (Admin) ───────────────────────────────────────────────────
ordersApp.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const status = c.req.query('status') || '';
  const payment_status = c.req.query('payment_status') || '';
  const sort = c.req.query('sort') || 'created_at';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM orders WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (q) { sql += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    if (status) { sql += ' AND order_status = ?'; params.push(status); }
    if (payment_status) { sql += ' AND payment_status = ?'; params.push(payment_status); }
    sql += ` ORDER BY ${sort === 'amount' ? 'total_amount' : 'created_at'} DESC LIMIT 200`;
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, orders: rows });
  }
  return c.json({ success: true, orders: mockOrdersList() });
});

// ── GET /summary (Admin metrics) ─────────────────────────────────────────────
ordersApp.get('/summary', async (c) => {
  if (c.env?.DB) {
    const stats: any = await queryFirst(c.env.DB,
      "SELECT COUNT(*) as total, SUM(total_amount) as total_revenue, SUM(CASE WHEN order_status='Pending' OR order_status='Confirmed' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN order_status='Processing' OR order_status='Packed' THEN 1 ELSE 0 END) as processing, SUM(CASE WHEN order_status='Shipped' OR order_status='Out For Delivery' THEN 1 ELSE 0 END) as in_transit, SUM(CASE WHEN order_status='Delivered' OR order_status='Completed' THEN 1 ELSE 0 END) as delivered, SUM(CASE WHEN order_status='Cancelled' THEN 1 ELSE 0 END) as cancelled FROM orders WHERE deleted_at IS NULL"
    );
    return c.json({ success: true, stats });
  }
  return c.json({
    success: true,
    stats: { total: 142, total_revenue: 184200, pending: 18, processing: 34, in_transit: 42, delivered: 40, cancelled: 8 }
  });
});

// ── GET single order by ID or order_number ────────────────────────────────────
ordersApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const order: any = await queryFirst(c.env.DB, 'SELECT * FROM orders WHERE (id=? OR order_number=?) AND deleted_at IS NULL', [id, id]);
    if (!order) return c.json({ success: false, message: 'Order not found' }, 404);

    const items = await queryAll(c.env.DB, 'SELECT * FROM order_items WHERE order_id=?', [order.id]);
    const timeline = await queryAll(c.env.DB, 'SELECT * FROM order_status_history WHERE order_id=? ORDER BY created_at ASC', [order.id]);
    const notes = await queryAll(c.env.DB, 'SELECT * FROM order_notes WHERE order_id=? ORDER BY created_at DESC', [order.id]);

    return c.json({ success: true, order: { ...order, items, timeline, notes } });
  }

  const mock = mockOrdersList().find(o => o.id.toString() === id || o.order_number === id);
  if (!mock) return c.json({ success: false, message: 'Order not found' }, 404);
  return c.json({ success: true, order: mock });
});

// ── POST /api/orders (Create Order) ──────────────────────────────────────────
ordersApp.post('/', async (c) => {
  const body = await c.req.json();
  const {
    customer_name, customer_email, customer_phone, shipping_address,
    city, state = 'Karnataka', pincode, payment_method = 'cod', items = [],
    coupon_code, discount_amount = 0, shipping_fee = 0, delivery_method = 'standard', notes
  } = body;

  if (!customer_name || !customer_phone || !items.length) {
    return c.json({ success: false, message: 'Customer name, phone and items are required' }, 400);
  }

  const orderNumber = 'HM-ORD-' + Math.floor(100000 + Math.random() * 900000);
  const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  let subtotal = 0;
  items.forEach((i: any) => { subtotal += (i.price || 0) * (i.quantity || 1); });

  const total_amount = Math.max(0, subtotal - discount_amount + shipping_fee);
  const payment_status = payment_method === 'cod' ? 'pending' : 'paid';
  const order_status = 'Pending';
  const orderId = `ord_${Date.now()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      `INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone, shipping_address,
        city, state, pincode, payment_method, payment_status, order_status, subtotal,
        discount_amount, coupon_code, shipping_fee, total_amount, invoice_number, notes
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [orderId, orderNumber, customer_name, customer_email || '', customer_phone, shipping_address || '', city || '', state, pincode || '', payment_method, payment_status, order_status, subtotal, discount_amount, coupon_code || null, shipping_fee, total_amount, invoiceNumber, notes || null]
    );

    for (const item of items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      await executeRun(c.env.DB,
        'INSERT INTO order_items (id, order_id, product_id, variant_id, product_title, variant_name, price, quantity, total_price) VALUES (?,?,?,?,?,?,?,?,?)',
        [itemId, orderId, item.product_id, item.variant_id || null, item.name || item.title || 'Product', item.variant_name || null, item.price, item.quantity, item.price * item.quantity]
      );

      // Decrement Inventory Stock
      await executeRun(c.env.DB, 'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', [item.quantity, item.product_id]).catch(() => {});
    }

    // Record Timeline history
    await executeRun(c.env.DB,
      'INSERT INTO order_status_history (id, order_id, status, comment) VALUES (?,?,?,?)',
      [`h_${Date.now()}`, orderId, 'Pending', 'Order created and payment pending/confirmed.']
    ).catch(() => {});
  }

  return c.json({
    success: true,
    message: `Order #${orderNumber} placed successfully`,
    order: { id: orderId, order_number: orderNumber, invoice_number: invoiceNumber, total_amount, order_status }
  });
});

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
ordersApp.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status, comment, tracking_number, courier_name } = await c.req.json();

  if (!status) return c.json({ success: false, message: 'Status is required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE orders SET order_status=?, tracking_number=COALESCE(?,tracking_number), courier_name=COALESCE(?,courier_name), updated_at=CURRENT_TIMESTAMP WHERE id=? OR order_number=?',
      [status, tracking_number, courier_name, id, id]
    );

    // Record status history timeline
    await executeRun(c.env.DB,
      'INSERT INTO order_status_history (id, order_id, status, comment) VALUES (?,?,?,?)',
      [`h_${Date.now()}`, id, status, comment || `Status updated to ${status}`]
    ).catch(() => {});

    // If status changed to Cancelled or Returned, restore inventory stock
    if (status === 'Cancelled' || status === 'Returned') {
      const items = await queryAll(c.env.DB, 'SELECT product_id, quantity FROM order_items WHERE order_id=?', [id]);
      for (const i of items) {
        await executeRun(c.env.DB, 'UPDATE products SET stock = stock + ? WHERE id=?', [i.quantity, i.product_id]).catch(() => {});
      }
    }
  }

  return c.json({ success: true, message: `Order status updated to ${status}` });
});

// ── POST /api/orders/:id/notes (Internal Staff Notes) ────────────────────────
ordersApp.post('/:id/notes', async (c) => {
  const id = c.req.param('id');
  const { note, author = 'Staff Admin' } = await c.req.json();

  if (!note) return c.json({ success: false, message: 'Note text required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO order_notes (id, order_id, author, note) VALUES (?,?,?,?)',
      [`n_${Date.now()}`, id, author, note]
    );
  }

  return c.json({ success: true, message: 'Internal note added' });
});

// ── POST /api/orders/cancel (Customer Cancel) ────────────────────────────────
ordersApp.post('/cancel', async (c) => {
  const { order_number, reason } = await c.req.json();
  if (!order_number) return c.json({ success: false, message: 'Order number required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      "UPDATE orders SET order_status='Cancelled', updated_at=CURRENT_TIMESTAMP WHERE order_number=?",
      [order_number]
    );
  }

  return c.json({ success: true, message: `Order #${order_number} has been cancelled.` });
});

// ── Track order by order_number (Customer Tracking) ─────────────────────────
ordersApp.get('/track/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');

  if (c.env?.DB) {
    const order: any = await queryFirst(c.env.DB, 'SELECT * FROM orders WHERE order_number = ? AND deleted_at IS NULL', [orderNumber]);
    if (!order) return c.json({ success: false, message: 'Order not found' }, 404);

    const items = await queryAll(c.env.DB, 'SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const timeline = await queryAll(c.env.DB, 'SELECT * FROM order_status_history WHERE order_id=? ORDER BY created_at ASC', [order.id]);

    return c.json({ success: true, order: { ...order, items, timeline } });
  }

  const mock = mockOrdersList().find(o => o.order_number === orderNumber) || mockOrdersList()[0];
  return c.json({ success: true, order: mock });
});

function mockOrdersList() {
  return [
    {
      id: 'ord1', order_number: 'HM-ORD-482910', invoice_number: 'INV-2026-1029',
      customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', customer_phone: '+91 9812345678',
      shipping_address: '42 Lotus Heights, MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038',
      payment_method: 'cod', payment_status: 'pending', order_status: 'Processing',
      subtotal: 798, discount_amount: 100, coupon_code: 'WELCOME100', shipping_fee: 0, total_amount: 698,
      courier_name: 'Delhivery Logistics', tracking_number: 'DEL123456789IN', tracking_url: 'https://www.delhivery.com/track/package/DEL123456789IN',
      notes: 'Customer requested evening delivery', created_at: '2026-07-27T14:30:00Z',
      items: [
        { id: 'i1', product_title: 'KSM-66 Ashwagandha Root Powder', variant_name: '250g Jar', price: 499, quantity: 1, total_price: 499 },
        { id: 'i2', product_title: 'Himalayan Tulsi Green Tea', variant_name: '100g Tin Box', price: 299, quantity: 1, total_price: 299 }
      ],
      timeline: [
        { id: 't1', status: 'Pending', comment: 'Order placed via Online Checkout', created_at: '2026-07-27T14:30:00Z' },
        { id: 't2', status: 'Confirmed', comment: 'Order verified & inventory allocated', created_at: '2026-07-27T14:32:00Z' },
        { id: 't3', status: 'Processing', comment: 'Sent to Himalayan Warehouse for packing', created_at: '2026-07-27T15:00:00Z' }
      ],
      notes_list: [
        { id: 'n1', author: 'Inventory Lead', note: 'Batch #AY2026 verified for quality purity seal.', created_at: '2026-07-27T15:10:00Z' }
      ]
    },
    {
      id: 'ord2', order_number: 'HM-ORD-839210', invoice_number: 'INV-2026-1030',
      customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', customer_phone: '+91 9765432109',
      shipping_address: '15 Sector 4, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102',
      payment_method: 'prepaid', payment_status: 'paid', order_status: 'Shipped',
      subtotal: 1299, discount_amount: 150, coupon_code: 'MONK15', shipping_fee: 0, total_amount: 1149,
      courier_name: 'Blue Dart Air', tracking_number: 'BD987654321IN', tracking_url: 'https://www.bluedart.com',
      created_at: '2026-07-26T11:20:00Z',
      items: [
        { id: 'i3', product_title: 'Amla Chyawanprash Supreme', variant_name: '1kg Jar', price: 899, quantity: 1, total_price: 899 },
        { id: 'i4', product_title: 'Moringa Leaf Superfood Powder', variant_name: '200g Pouch', price: 400, quantity: 1, total_price: 400 }
      ],
      timeline: [
        { id: 't4', status: 'Pending', comment: 'Order placed', created_at: '2026-07-26T11:20:00Z' },
        { id: 't5', status: 'Confirmed', comment: 'Payment confirmed via Razorpay UPI', created_at: '2026-07-26T11:21:00Z' },
        { id: 't6', status: 'Packed', comment: 'Packed in eco-friendly tamper-evident box', created_at: '2026-07-26T14:00:00Z' },
        { id: 't7', status: 'Shipped', comment: 'Handed over to Blue Dart Air Courier (AWB: BD987654321IN)', created_at: '2026-07-26T18:00:00Z' }
      ]
    },
    {
      id: 'ord3', order_number: 'HM-ORD-109283', invoice_number: 'INV-2026-1031',
      customer_name: 'Vikram Singh', customer_email: 'vikram@yahoo.com', customer_phone: '+91 9123456789',
      shipping_address: '88 Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302006',
      payment_method: 'cod', payment_status: 'pending', order_status: 'Pending',
      subtotal: 499, discount_amount: 0, coupon_code: null, shipping_fee: 40, total_amount: 539,
      created_at: '2026-07-27T17:10:00Z',
      items: [
        { id: 'i5', product_title: 'KSM-66 Ashwagandha Root Powder', variant_name: '250g Jar', price: 499, quantity: 1, total_price: 499 }
      ],
      timeline: [
        { id: 't8', status: 'Pending', comment: 'Order placed', created_at: '2026-07-27T17:10:00Z' }
      ]
    }
  ];
}

export default ordersApp;
