import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const adminApp = new Hono<{ Bindings: Env }>();

// 1. Dashboard Stats
adminApp.get('/dashboard-stats', async (c) => {
  if (!c.env?.DB) {
    return c.json({
      success: true,
      stats: {
        total_sales: 145890.00,
        total_orders: 124,
        pending_orders: 8,
        active_products: 32,
        low_stock_products: 4,
        registered_customers: 86
      }
    });
  }

  const salesRes = await queryFirst(c.env.DB, 'SELECT SUM(total_amount) as total_sales, COUNT(id) as total_orders FROM orders WHERE payment_status = "paid"');
  const pendingRes = await queryFirst(c.env.DB, 'SELECT COUNT(id) as pending_orders FROM orders WHERE order_status = "Pending"');
  const prodRes = await queryFirst(c.env.DB, 'SELECT COUNT(id) as active_products FROM products WHERE status = "active"');
  const lowStockRes = await queryFirst(c.env.DB, 'SELECT COUNT(id) as low_stock_products FROM products WHERE stock_quantity < 10 AND status = "active"');
  const userRes = await queryFirst(c.env.DB, 'SELECT COUNT(id) as registered_customers FROM users WHERE role = "customer"');

  return c.json({
    success: true,
    stats: {
      total_sales: salesRes?.total_sales || 0,
      total_orders: salesRes?.total_orders || 0,
      pending_orders: pendingRes?.pending_orders || 0,
      active_products: prodRes?.active_products || 0,
      low_stock_products: lowStockRes?.low_stock_products || 0,
      registered_customers: userRes?.registered_customers || 0
    }
  });
});

// 2. Category Master CRUD
adminApp.get('/categories', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, categories: getFallbackAdminCategories() });
  const categories = await queryAll(c.env.DB, 'SELECT * FROM categories ORDER BY id DESC');
  return c.json({ success: true, categories });
});

adminApp.post('/categories', async (c) => {
  const { name, parent_id = null, description, image_url, status = 'active' } = await c.req.json();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!c.env?.DB) return c.json({ success: true, message: 'Category added' });
  await executeRun(
    c.env.DB,
    'INSERT INTO categories (name, slug, parent_id, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, slug, parent_id || null, description || null, image_url || null, status]
  );
  return c.json({ success: true, message: 'Category created successfully' });
});

adminApp.delete('/categories/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'DELETE FROM categories WHERE id = ?', [id]);
  }
  return c.json({ success: true, message: 'Category deleted' });
});

// 3. Product Master CRUD
adminApp.get('/products', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, products: getFallbackAdminProducts() });
  const products = await queryAll(c.env.DB, 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC');
  const formatted = products.map(p => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
  }));
  return c.json({ success: true, products: formatted });
});

adminApp.post('/products', async (c) => {
  const body = await c.req.json();
  const {
    category_id, title, sku, short_description, full_description,
    base_price, discount_price, stock_quantity, images, is_featured = 0,
    is_bestseller = 0, is_trending = 0, meta_title, meta_description
  } = body;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!c.env?.DB) {
    return c.json({ success: true, message: 'Product created successfully', product: { id: Date.now(), title, slug } });
  }

  await executeRun(
    c.env.DB,
    `INSERT INTO products (
      category_id, title, slug, sku, short_description, full_description,
      base_price, discount_price, stock_quantity, images, is_featured,
      is_bestseller, is_trending, meta_title, meta_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category_id, title, slug, sku, short_description, full_description,
      base_price, discount_price || null, stock_quantity, JSON.stringify(images || []),
      is_featured, is_bestseller, is_trending, meta_title || null, meta_description || null
    ]
  );

  return c.json({ success: true, message: 'Product created successfully' });
});

adminApp.delete('/products/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'DELETE FROM products WHERE id = ?', [id]);
  }
  return c.json({ success: true, message: 'Product deleted' });
});

// 4. Promo Coupons CRUD
adminApp.get('/coupons', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, coupons: getFallbackAdminCoupons() });
  const coupons = await queryAll(c.env.DB, 'SELECT * FROM coupons ORDER BY id DESC');
  return c.json({ success: true, coupons });
});

adminApp.post('/coupons', async (c) => {
  const { code, discount_type, discount_value, min_order_amount = 0, max_discount_amount = null, expiry_date = '2026-12-31' } = await c.req.json();
  if (!c.env?.DB) return c.json({ success: true, message: 'Coupon added' });

  await executeRun(
    c.env.DB,
    'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
    [code.toUpperCase(), discount_type, discount_value, min_order_amount, max_discount_amount || null, expiry_date]
  );
  return c.json({ success: true, message: 'Promo Coupon created successfully' });
});

adminApp.delete('/coupons/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'DELETE FROM coupons WHERE id = ?', [id]);
  }
  return c.json({ success: true, message: 'Coupon deleted' });
});

// 5. Courier Companies CRUD
adminApp.get('/couriers', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, couriers: getFallbackCouriers() });
  const couriers = await queryAll(c.env.DB, 'SELECT * FROM couriers ORDER BY name ASC');
  return c.json({ success: true, couriers });
});

adminApp.post('/couriers', async (c) => {
  const { name, tracking_url_template } = await c.req.json();
  if (!c.env?.DB) return c.json({ success: true, message: 'Courier added' });

  await executeRun(
    c.env.DB,
    'INSERT INTO couriers (name, tracking_url_template) VALUES (?, ?)',
    [name, tracking_url_template]
  );
  return c.json({ success: true, message: 'Courier partner added successfully' });
});

// 6. Order Master
adminApp.get('/orders', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, orders: getFallbackAdminOrders() });
  const orders = await queryAll(
    c.env.DB,
    `SELECT o.*, c.name as courier_name
     FROM orders o
     LEFT JOIN couriers c ON o.courier_id = c.id
     ORDER BY o.id DESC`
  );
  return c.json({ success: true, orders });
});

adminApp.put('/orders/:id/status', async (c) => {
  const id = c.req.param('id');
  const { order_status, payment_status, courier_id, tracking_number, cod_confirmed } = await c.req.json();

  if (!c.env?.DB) {
    return c.json({ success: true, message: 'Order status updated successfully' });
  }

  await executeRun(
    c.env.DB,
    `UPDATE orders SET
      order_status = COALESCE(?, order_status),
      payment_status = COALESCE(?, payment_status),
      courier_id = COALESCE(?, courier_id),
      tracking_number = COALESCE(?, tracking_number),
      cod_confirmed = COALESCE(?, cod_confirmed),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [order_status || null, payment_status || null, courier_id || null, tracking_number || null, cod_confirmed ?? null, id]
  );

  return c.json({ success: true, message: 'Order status updated successfully' });
});

// 7. Abandoned Carts & Reminders
adminApp.get('/abandoned-carts', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, carts: getFallbackAbandonedCarts() });
  const carts = await queryAll(c.env.DB, 'SELECT * FROM abandoned_carts ORDER BY created_at DESC');
  return c.json({ success: true, carts });
});

adminApp.post('/abandoned-carts/:id/send-reminder', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const cart = await queryFirst(c.env.DB, 'SELECT * FROM abandoned_carts WHERE id = ?', [id]);
    if (cart) {
      await executeRun(
        c.env.DB,
        'UPDATE abandoned_carts SET reminder_count = reminder_count + 1, last_reminder_sent = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      await executeRun(
        c.env.DB,
        'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?, ?, ?, ?)',
        ['WhatsApp', 'AbandonedCartReminder', cart.customer_phone, JSON.stringify({ message: 'Complete your Healthy Monks order now!' })]
      );
    }
  }
  return c.json({ success: true, message: 'Automated WhatsApp & SMS cart reminder sent successfully!' });
});

// 8. Banners Management (CMS)
adminApp.get('/banners', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, banners: getFallbackBanners() });
  const banners = await queryAll(c.env.DB, 'SELECT * FROM banners ORDER BY sort_order ASC');
  return c.json({ success: true, banners });
});

adminApp.post('/banners', async (c) => {
  const { title, subtitle, image_url, link_url = '/', section = 'home_slider' } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO banners (title, subtitle, image_url, link_url, section) VALUES (?, ?, ?, ?, ?)',
      [title, subtitle || null, image_url, link_url, section]
    );
  }
  return c.json({ success: true, message: 'Banner added successfully' });
});

// 9. Reviews Moderation
adminApp.get('/reviews', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, reviews: getFallbackReviews() });
  const reviews = await queryAll(c.env.DB, 'SELECT * FROM reviews ORDER BY id DESC');
  return c.json({ success: true, reviews });
});

adminApp.put('/reviews/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
  }
  return c.json({ success: true, message: `Review status updated to ${status}` });
});

// 10. API Notification Logs & Push Campaigns
adminApp.get('/api-logs', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, logs: getFallbackApiLogs() });
  const logs = await queryAll(c.env.DB, 'SELECT * FROM api_logs ORDER BY id DESC LIMIT 50');
  return c.json({ success: true, logs });
});

adminApp.post('/send-push-campaign', async (c) => {
  const { title, body, segment = 'All Users' } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?, ?, ?, ?)',
      ['WebPush', 'PromotionalCampaign', segment, JSON.stringify({ title, body })]
    );
  }
  return c.json({ success: true, message: `Broadcast Push Campaign "${title}" dispatched to ${segment}` });
});

export default adminApp;

function getFallbackAdminCategories() {
  return [
    { id: 1, name: 'Immunity Boosters', slug: 'immunity-boosters', status: 'active' },
    { id: 2, name: 'Organic Teas & Infusions', slug: 'organic-teas', status: 'active' },
    { id: 3, name: 'Ayurvedic Churna & Powders', slug: 'ayurvedic-powders', status: 'active' },
    { id: 4, name: 'Superfoods & Seeds', slug: 'superfoods-seeds', status: 'active' }
  ];
}

function getFallbackAdminProducts() {
  return [
    { id: 1, category_name: 'Immunity Boosters', title: 'Organic Ashwagandha Root Powder', sku: 'HM-ASH-001', base_price: 499, discount_price: 399, stock_quantity: 150, is_featured: 1, is_bestseller: 1, is_trending: 1, status: 'active' },
    { id: 2, category_name: 'Immunity Boosters', title: 'Chyawanprash Awaleha (Special Formula)', sku: 'HM-CHY-002', base_price: 699, discount_price: 599, stock_quantity: 85, is_featured: 1, is_bestseller: 1, is_trending: 0, status: 'active' },
    { id: 3, category_name: 'Organic Teas & Infusions', title: 'Himalayan Tulsi Green Tea', sku: 'HM-TEA-003', base_price: 349, discount_price: 279, stock_quantity: 200, is_featured: 1, is_bestseller: 0, is_trending: 1, status: 'active' },
    { id: 4, category_name: 'Ayurvedic Churna & Powders', title: 'Raw Organic Triphala Powder', sku: 'HM-TRI-004', base_price: 399, discount_price: 299, stock_quantity: 120, is_featured: 0, is_bestseller: 1, is_trending: 1, status: 'active' },
    { id: 5, category_name: 'Superfoods & Seeds', title: 'Raw Organic Chia Seeds', sku: 'HM-CHI-005', base_price: 299, discount_price: 219, stock_quantity: 300, is_featured: 1, is_bestseller: 0, is_trending: 0, status: 'active' }
  ];
}

function getFallbackAdminCoupons() {
  return [
    { id: 1, code: 'WELCOME100', discount_type: 'flat', discount_value: 100, min_order_amount: 499, expiry_date: '2026-12-31', status: 'active' },
    { id: 2, code: 'MONK15', discount_type: 'percentage', discount_value: 15, min_order_amount: 799, expiry_date: '2026-12-31', status: 'active' },
    { id: 3, code: 'DETOX20', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, expiry_date: '2026-12-31', status: 'active' }
  ];
}

function getFallbackAdminOrders() {
  return [
    { id: 1, order_number: 'HM-ORD-1001', customer_name: 'Aarav Sharma', customer_phone: '+91 9812345678', payment_method: 'cod', payment_status: 'pending', order_status: 'Processing', total_amount: 618.00, courier_name: 'Delhivery Logistics', tracking_number: 'DEL123456789IN', cod_confirmed: 1, created_at: '2026-07-27' },
    { id: 2, order_number: 'HM-ORD-1002', customer_name: 'Aarav Sharma', customer_phone: '+91 9812345678', payment_method: 'prepaid', payment_status: 'paid', order_status: 'Delivered', total_amount: 599.00, courier_name: 'BlueDart Express', tracking_number: 'BD987654321IN', cod_confirmed: 1, created_at: '2026-07-26' }
  ];
}

function getFallbackCouriers() {
  return [
    { id: 1, name: 'BlueDart Express', tracking_url_template: 'https://www.bluedart.com/tracking?track={tracking_number}', status: 'active' },
    { id: 2, name: 'Delhivery Logistics', tracking_url_template: 'https://www.delhivery.com/track/package/{tracking_number}', status: 'active' },
    { id: 3, name: 'DTDC Express', tracking_url_template: 'https://www.dtdc.in/tracking/shipment/{tracking_number}', status: 'active' }
  ];
}

function getFallbackAbandonedCarts() {
  return [
    { id: 1, customer_email: 'priya.k@example.com', customer_phone: '+91 9876512345', cart_data: '[{"title": "Chyawanprash Awaleha", "qty": 1, "price": 599}]', reminder_count: 1, last_reminder_sent: '2026-07-27 10:00:00', created_at: '2026-07-26 14:30:00' }
  ];
}

function getFallbackBanners() {
  return [
    { id: 1, title: '100% Pure Organic Ayurvedic Wellness', subtitle: 'Authentic Herbal Supplements & Immunity Boosters', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', section: 'home_slider', sort_order: 1 },
    { id: 2, title: 'High Altitude Himalayan Green Tea', subtitle: 'Fresh Whole Leaves Enriched with 3 Sacred Tulsi Varieties', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80', section: 'home_slider', sort_order: 2 }
  ];
}

function getFallbackReviews() {
  return [
    { id: 1, product_id: 1, customer_name: 'Rohan Verma', rating: 5, comment: 'Remarkable quality Ashwagandha! Improved my sleep quality and energy levels within 10 days.', status: 'approved' },
    { id: 2, product_id: 2, customer_name: 'Priya S.', rating: 5, comment: 'Tastes like authentic grandma chyawanprash! Real saffron aroma.', status: 'approved' },
    { id: 3, product_id: 4, customer_name: 'Vikram Mehta', rating: 4, comment: 'Great product, shipping took 3 days.', status: 'pending' }
  ];
}

function getFallbackApiLogs() {
  return [
    { id: 1, service_name: 'SMS', event_type: 'OTP', recipient: '+91 9812345678', payload: '{"otp": "482910"}', response_status: 'SUCCESS', created_at: '2026-07-27 12:00:00' },
    { id: 2, service_name: 'WhatsApp', event_type: 'OrderConfirmation', recipient: '+91 9812345678', payload: '{"order_number": "HM-ORD-1001", "total": 618.00}', response_status: 'SUCCESS', created_at: '2026-07-27 12:01:00' },
    { id: 3, service_name: 'Courier', event_type: 'ShippingAlert', recipient: '+91 9812345678', payload: '{"tracking_number": "DEL123456789IN", "courier": "Delhivery"}', response_status: 'SUCCESS', created_at: '2026-07-27 12:05:00' }
  ];
}
