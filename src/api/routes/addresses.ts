import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const addressesApp = new Hono<{ Bindings: Env }>();

// ── GET /api/addresses ────────────────────────────────────────────────────────
addressesApp.get('/', async (c) => {
  const userId = c.req.query('user_id') || 'guest';
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM customer_addresses WHERE user_id=? ORDER BY is_default DESC, created_at DESC', [userId]);
    return c.json({ success: true, addresses: rows });
  }
  return c.json({ success: true, addresses: mockAddresses() });
});

// ── POST /api/addresses ───────────────────────────────────────────────────────
addressesApp.post('/', async (c) => {
  const body = await c.req.json();
  const {
    user_id = 'guest', full_name, mobile, email, address_line1, address_line2,
    landmark, city, state, country = 'India', postal_code, address_type = 'Home',
    is_default = 0, gst_number
  } = body;

  if (!full_name || !mobile || !address_line1 || !city || !postal_code) {
    return c.json({ success: false, message: 'Full name, mobile, address, city and postal code are required' }, 400);
  }

  const id = `addr_${Date.now()}`;

  if (c.env?.DB) {
    if (is_default) {
      await executeRun(c.env.DB, 'UPDATE customer_addresses SET is_default=0 WHERE user_id=?', [user_id]);
    }
    await executeRun(c.env.DB,
      'INSERT INTO customer_addresses (id, user_id, full_name, mobile, email, address_line1, address_line2, landmark, city, state, country, postal_code, address_type, is_default, gst_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, user_id, full_name, mobile, email || '', address_line1, address_line2 || '', landmark || '', city, state || '', country, postal_code, address_type, is_default ? 1 : 0, gst_number || '']
    );
  }

  return c.json({ success: true, message: 'Address saved', address: { id, full_name, city, postal_code } });
});

// ── PUT /api/addresses/:id ────────────────────────────────────────────────────
addressesApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const {
    full_name, mobile, email, address_line1, address_line2, landmark,
    city, state, country, postal_code, address_type, is_default, gst_number, user_id = 'guest'
  } = body;

  if (c.env?.DB) {
    if (is_default) {
      await executeRun(c.env.DB, 'UPDATE customer_addresses SET is_default=0 WHERE user_id=?', [user_id]);
    }
    await executeRun(c.env.DB,
      'UPDATE customer_addresses SET full_name=COALESCE(?,full_name), mobile=COALESCE(?,mobile), email=COALESCE(?,email), address_line1=COALESCE(?,address_line1), address_line2=COALESCE(?,address_line2), landmark=COALESCE(?,landmark), city=COALESCE(?,city), state=COALESCE(?,state), country=COALESCE(?,country), postal_code=COALESCE(?,postal_code), address_type=COALESCE(?,address_type), is_default=COALESCE(?,is_default), gst_number=COALESCE(?,gst_number), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [full_name, mobile, email, address_line1, address_line2, landmark, city, state, country, postal_code, address_type, is_default !== undefined ? (is_default ? 1 : 0) : null, gst_number, id]
    );
  }

  return c.json({ success: true, message: 'Address updated' });
});

// ── DELETE /api/addresses/:id ─────────────────────────────────────────────────
addressesApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'DELETE FROM customer_addresses WHERE id=?', [id]);
  return c.json({ success: true, message: 'Address deleted' });
});

function mockAddresses() {
  return [
    { id: 'addr1', user_id: 'guest', full_name: 'Aarav Sharma', mobile: '+91 9812345678', email: 'aarav@example.com', address_line1: '42 Lotus Heights, MG Road', address_line2: 'Indiranagar', landmark: 'Near Indiranagar Metro Station', city: 'Bengaluru', state: 'Karnataka', country: 'India', postal_code: '560038', address_type: 'Home', is_default: 1, gst_number: '' },
    { id: 'addr2', user_id: 'guest', full_name: 'Aarav Sharma (Office)', mobile: '+91 9812345678', email: 'aarav@company.com', address_line1: 'Building 7, Embassy TechVillage', address_line2: 'Outer Ring Road', landmark: 'Devarabeesanahalli', city: 'Bengaluru', state: 'Karnataka', country: 'India', postal_code: '560103', address_type: 'Office', is_default: 0, gst_number: '29AAACH7409R1ZX' },
  ];
}

export default addressesApp;
