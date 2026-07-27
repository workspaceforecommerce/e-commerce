import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const ordersApp = new Hono<{ Bindings: Env }>();

// Create new order
ordersApp.post('/', async (c) => {
  const body = await c.req.json();
  const {
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    city,
    pincode,
    payment_method,
    items,
    coupon_code,
    discount_amount = 0,
    notes
  } = body;

  if (!customer_name || !customer_email || !customer_phone || !items || items.length === 0) {
    return c.json({ success: false, message: 'Missing required order details' }, 400);
  }

  const orderNumber = 'HM-ORD-' + Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  let subtotal = 0;
  items.forEach((item: any) => {
    subtotal += item.price * item.quantity;
  });

  const shipping_fee = subtotal > 499 ? 0 : 40;
  const total_amount = Math.max(0, subtotal - discount_amount + shipping_fee);
  const payment_status = payment_method === 'cod' ? 'pending' : 'paid';
  const order_status = 'Pending';

  if (!c.env?.DB) {
    return c.json({
      success: true,
      order: {
        id: Math.floor(Math.random() * 10000),
        order_number: orderNumber,
        invoice_number: invoiceNumber,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        pincode,
        payment_method,
        payment_status,
        order_status,
        subtotal,
        discount_amount,
        shipping_fee,
        total_amount,
        items,
        created_at: new Date().toISOString()
      }
    });
  }

  // Insert order record into D1
  const res = await executeRun(
    c.env.DB,
    `INSERT INTO orders (
      order_number, customer_name, customer_email, customer_phone, shipping_address,
      city, pincode, payment_method, payment_status, order_status, subtotal,
      discount_amount, coupon_code, shipping_fee, total_amount, invoice_number, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber, customer_name, customer_email, customer_phone, shipping_address,
      city, pincode, payment_method, payment_status, order_status, subtotal,
      discount_amount, coupon_code || null, shipping_fee, total_amount, invoiceNumber, notes || null
    ]
  );

  // Fetch created order ID
  const newOrder = await queryFirst(c.env.DB, 'SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

  if (newOrder) {
    for (const item of items) {
      await executeRun(
        c.env.DB,
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_title, variant_name, price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id, item.product_id, item.variant_id || null, item.title, item.variant_name || null,
          item.price, item.quantity, item.price * item.quantity
        ]
      );
    }

    // Log notification simulation
    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?, ?, ?, ?)',
      ['SMS', 'OrderConfirmation', customer_phone, JSON.stringify({ order_number: orderNumber, total: total_amount })]
    );

    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?, ?, ?, ?)',
      ['WhatsApp', 'OrderConfirmation', customer_phone, JSON.stringify({ order_number: orderNumber, total: total_amount })]
    );
  }

  return c.json({
    success: true,
    order: {
      id: newOrder ? newOrder.id : 99,
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      customer_name,
      customer_email,
      customer_phone,
      total_amount,
      payment_method,
      order_status
    }
  });
});

// Track order by order_number
ordersApp.get('/track/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');

  if (!c.env?.DB) {
    return c.json({
      success: true,
      order: {
        order_number: orderNumber,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav@example.com',
        customer_phone: '+91 9812345678',
        shipping_address: '42 Lotus Heights, MG Road',
        city: 'Bengaluru',
        pincode: '560001',
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'Processing',
        subtotal: 678,
        discount_amount: 100,
        shipping_fee: 40,
        total_amount: 618,
        courier_name: 'Delhivery Logistics',
        tracking_number: 'DEL123456789IN',
        tracking_url: 'https://www.delhivery.com/track/package/DEL123456789IN',
        created_at: new Date().toISOString(),
        items: [
          { product_title: 'Organic Ashwagandha Root Powder', variant_name: '250g Jar', price: 399, quantity: 1, total_price: 399 },
          { product_title: 'Himalayan Tulsi Green Tea', variant_name: '100g Tin Box', price: 279, quantity: 1, total_price: 279 }
        ]
      }
    });
  }

  const order = await queryFirst(
    c.env.DB,
    `SELECT o.*, c.name as courier_name, c.tracking_url_template
     FROM orders o
     LEFT JOIN couriers c ON o.courier_id = c.id
     WHERE o.order_number = ?`,
    [orderNumber]
  );

  if (!order) {
    return c.json({ success: false, message: 'Order not found' }, 404);
  }

  const items = await queryAll(c.env.DB, 'SELECT * FROM order_items WHERE order_id = ?', [order.id]);

  let tracking_url = null;
  if (order.courier_name && order.tracking_number && order.tracking_url_template) {
    tracking_url = order.tracking_url_template.replace('{tracking_number}', order.tracking_number);
  }

  return c.json({
    success: true,
    order: {
      ...order,
      tracking_url,
      items
    }
  });
});

export default ordersApp;
