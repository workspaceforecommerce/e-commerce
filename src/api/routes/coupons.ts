import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const couponsApp = new Hono<{ Bindings: Env }>();

// ── GET all coupons (Admin) ──────────────────────────────────────────────────
couponsApp.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const status = c.req.query('status') || '';
  const type = c.req.query('type') || '';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM coupons WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (q) { sql += ' AND (code LIKE ? OR name LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (type) { sql += ' AND discount_type = ?'; params.push(type); }
    sql += ' ORDER BY created_at DESC';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, coupons: rows });
  }
  return c.json({ success: true, coupons: mockCoupons() });
});

// ── GET single coupon ─────────────────────────────────────────────────────────
couponsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const coupon = await queryFirst(c.env.DB, 'SELECT * FROM coupons WHERE id=? AND deleted_at IS NULL', [id]);
    if (!coupon) return c.json({ success: false, message: 'Coupon not found' }, 404);
    return c.json({ success: true, coupon });
  }
  return c.json({ success: true, coupon: mockCoupons().find(cp => cp.id === id) });
});

// ── POST create coupon ────────────────────────────────────────────────────────
couponsApp.post('/', async (c) => {
  const body = await c.req.json();
  const {
    code, name, description, discount_type = 'percentage', discount_value,
    min_order_amount = 0, max_discount_amount = 0, usage_limit = 0,
    per_customer_limit = 1, is_stackable = 0, auto_apply = 0,
    start_date, end_date, status = 'active', target_type = 'all',
    target_ids = [], rules = []
  } = body;

  if (!code || !discount_value) {
    return c.json({ success: false, message: 'Coupon code and discount value are required' }, 400);
  }

  const normalizedCode = code.trim().toUpperCase();
  const id = `cpn_${Date.now()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO coupons (id, code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_customer_limit, is_stackable, auto_apply, start_date, end_date, status, target_type, target_ids, rules) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, normalizedCode, name || normalizedCode, description || '', discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_customer_limit, is_stackable ? 1 : 0, auto_apply ? 1 : 0, start_date || null, end_date || null, status, target_type, JSON.stringify(target_ids), JSON.stringify(rules)]
    );
  }

  return c.json({ success: true, message: `Coupon "${normalizedCode}" created successfully`, coupon: { id, code: normalizedCode } });
});

// ── PUT update coupon ─────────────────────────────────────────────────────────
couponsApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const {
    code, name, description, discount_type, discount_value,
    min_order_amount, max_discount_amount, usage_limit,
    per_customer_limit, is_stackable, auto_apply,
    start_date, end_date, status, target_type, target_ids, rules
  } = body;

  if (c.env?.DB) {
    const normalizedCode = code ? code.trim().toUpperCase() : null;
    await executeRun(c.env.DB,
      'UPDATE coupons SET code=COALESCE(?,code), name=COALESCE(?,name), description=COALESCE(?,description), discount_type=COALESCE(?,discount_type), discount_value=COALESCE(?,discount_value), min_order_amount=COALESCE(?,min_order_amount), max_discount_amount=COALESCE(?,max_discount_amount), usage_limit=COALESCE(?,usage_limit), per_customer_limit=COALESCE(?,per_customer_limit), is_stackable=COALESCE(?,is_stackable), auto_apply=COALESCE(?,auto_apply), start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date), status=COALESCE(?,status), target_type=COALESCE(?,target_type), target_ids=COALESCE(?,target_ids), rules=COALESCE(?,rules), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [normalizedCode, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_customer_limit, is_stackable !== undefined ? (is_stackable ? 1 : 0) : null, auto_apply !== undefined ? (auto_apply ? 1 : 0) : null, start_date, end_date, status, target_type, target_ids ? JSON.stringify(target_ids) : null, rules ? JSON.stringify(rules) : null, id]
    );
  }

  return c.json({ success: true, message: 'Coupon updated successfully' });
});

// ── DELETE coupon ─────────────────────────────────────────────────────────────
couponsApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'UPDATE coupons SET deleted_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
  return c.json({ success: true, message: 'Coupon deleted' });
});

// ── POST duplicate coupon ─────────────────────────────────────────────────────
couponsApp.post('/:id/duplicate', async (c) => {
  const id = c.req.param('id');
  let coupon: any = null;
  if (c.env?.DB) coupon = await queryFirst(c.env.DB, 'SELECT * FROM coupons WHERE id=?', [id]);
  if (!coupon) coupon = mockCoupons().find(cp => cp.id === id);

  if (!coupon) return c.json({ success: false, message: 'Coupon not found' }, 404);

  const newId = `cpn_${Date.now()}`;
  const newCode = `${coupon.code}_COPY_${Date.now().toString().slice(-4)}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO coupons (id, code, name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_customer_limit, is_stackable, auto_apply, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [newId, newCode, `${coupon.name} (Copy)`, coupon.description, coupon.discount_type, coupon.discount_value, coupon.min_order_amount, coupon.max_discount_amount, coupon.usage_limit, coupon.per_customer_limit, coupon.is_stackable, coupon.auto_apply, coupon.start_date, coupon.end_date, 'draft']
    );
  }

  return c.json({ success: true, message: 'Coupon duplicated', id: newId, code: newCode });
});

// ── POST /validate or /apply ──────────────────────────────────────────────────
couponsApp.post('/validate', async (c) => {
  const { code, cartTotal = 0, items = [], customer_id } = await c.req.json();
  if (!code) return c.json({ success: false, message: 'Coupon code is required' }, 400);

  const normalizedCode = code.trim().toUpperCase();
  let coupon: any = null;

  if (c.env?.DB) {
    coupon = await queryFirst(c.env.DB, 'SELECT * FROM coupons WHERE code = ? AND status = "active" AND deleted_at IS NULL', [normalizedCode]);
  } else {
    coupon = mockCoupons().find(cp => cp.code === normalizedCode && cp.status === 'active');
  }

  if (!coupon) return c.json({ success: false, message: 'Invalid or inactive coupon code' }, 404);

  // Check validity dates
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return c.json({ success: false, message: 'Coupon promotion has not started yet' }, 400);
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return c.json({ success: false, message: 'Coupon has expired' }, 400);
  }

  // Check usage limit
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return c.json({ success: false, message: 'Coupon usage limit reached' }, 400);
  }

  // Check minimum cart total
  if (coupon.min_order_amount > 0 && cartTotal < coupon.min_order_amount) {
    return c.json({ success: false, message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.` }, 400);
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (cartTotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount > 0 && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === 'flat' || coupon.discount_type === 'fixed_amount') {
    discount = Math.min(coupon.discount_value, cartTotal);
  } else if (coupon.discount_type === 'free_shipping') {
    discount = 0; // Free shipping handled in cart shipping fee
  }

  discount = Math.round(discount * 100) / 100;

  return c.json({
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      calculatedDiscount: discount,
      is_free_shipping: coupon.discount_type === 'free_shipping',
      is_stackable: !!coupon.is_stackable,
    }
  });
});

couponsApp.post('/apply', async (c) => {
  const body = await c.req.json();
  const res = await fetch(`${c.req.url.replace('/apply', '/validate')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  return c.json(data, res.status as any);
});

// ── GET /campaigns ────────────────────────────────────────────────────────────
couponsApp.get('/campaigns/list', async (c) => {
  return c.json({
    success: true,
    campaigns: [
      { id: 'camp1', name: 'Monsoon Immunity Drive', code_prefix: 'IMMUNITY', status: 'active', budget: 50000, spent: 18400, total_redemptions: 184, created_at: '2026-07-01T10:00:00Z' },
      { id: 'camp2', name: 'Festival Super Saver', code_prefix: 'FESTIVAL', status: 'scheduled', budget: 100000, spent: 0, total_redemptions: 0, created_at: '2026-07-15T10:00:00Z' },
    ]
  });
});

// ── Mock data ─────────────────────────────────────────────────────────────────
function mockCoupons() {
  return [
    { id: 'cpn1', code: 'WELCOME100', name: 'New Customer Welcome', description: '₹100 flat discount on orders over ₹499', discount_type: 'flat', discount_value: 100, min_order_amount: 499, max_discount_amount: 100, usage_limit: 1000, used_count: 342, per_customer_limit: 1, is_stackable: 0, auto_apply: 0, start_date: '2026-01-01T00:00:00Z', end_date: '2026-12-31T23:59:59Z', status: 'active', created_at: '2026-01-01T00:00:00Z' },
    { id: 'cpn2', code: 'MONK15', name: '15% Off Organic Wellness', description: '15% percentage discount up to ₹250', discount_type: 'percentage', discount_value: 15, min_order_amount: 799, max_discount_amount: 250, usage_limit: 500, used_count: 189, per_customer_limit: 2, is_stackable: 0, auto_apply: 0, start_date: '2026-06-01T00:00:00Z', end_date: '2026-08-31T23:59:59Z', status: 'active', created_at: '2026-06-01T00:00:00Z' },
    { id: 'cpn3', code: 'DETOX20', name: '20% Summer Detox Sale', description: '20% discount on herbal teas & cleanses', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, max_discount_amount: 300, usage_limit: 300, used_count: 78, per_customer_limit: 1, is_stackable: 1, auto_apply: 0, start_date: '2026-07-01T00:00:00Z', end_date: '2026-07-31T23:59:59Z', status: 'active', created_at: '2026-07-01T00:00:00Z' },
    { id: 'cpn4', code: 'FREESHIP', name: 'Free Shipping Voucher', description: 'Zero shipping charges on any order value', discount_type: 'free_shipping', discount_value: 0, min_order_amount: 299, max_discount_amount: 0, usage_limit: 2000, used_count: 614, per_customer_limit: 5, is_stackable: 1, auto_apply: 1, start_date: '2026-01-01T00:00:00Z', end_date: '2026-12-31T23:59:59Z', status: 'active', created_at: '2026-01-01T00:00:00Z' },
    { id: 'cpn5', code: 'FLASH30', name: '⚡ Flash Sale 30% Off', description: '30% massive discount for flash sale weekend', discount_type: 'percentage', discount_value: 30, min_order_amount: 1499, max_discount_amount: 500, usage_limit: 100, used_count: 100, per_customer_limit: 1, is_stackable: 0, auto_apply: 0, start_date: '2026-07-20T00:00:00Z', end_date: '2026-07-22T23:59:59Z', status: 'expired', created_at: '2026-07-15T00:00:00Z' },
  ];
}

export default couponsApp;
