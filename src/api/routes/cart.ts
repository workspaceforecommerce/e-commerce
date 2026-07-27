import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const cartApp = new Hono<{ Bindings: Env }>();

// ── GET /api/cart ────────────────────────────────────────────────────────────
cartApp.get('/', async (c) => {
  const userId = c.req.query('user_id') || 'guest';
  if (c.env?.DB) {
    const items = await queryAll(c.env.DB,
      'SELECT ci.*, p.name as product_name, p.price as product_price, p.image_url, p.stock as current_stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ? AND ci.saved_for_later = 0',
      [userId]
    );
    const savedForLater = await queryAll(c.env.DB,
      'SELECT ci.*, p.name as product_name, p.price as product_price, p.image_url, p.stock as current_stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ? AND ci.saved_for_later = 1',
      [userId]
    );
    return c.json({ success: true, items, savedForLater });
  }
  return c.json({ success: true, items: [], savedForLater: [] });
});

// ── POST /api/cart/items ──────────────────────────────────────────────────────
cartApp.post('/items', async (c) => {
  const { user_id = 'guest', product_id, variant_id, quantity = 1, price } = await c.req.json();
  if (!product_id) return c.json({ success: false, message: 'product_id is required' }, 400);

  if (c.env?.DB) {
    // Check stock
    const prod: any = await queryFirst(c.env.DB, 'SELECT stock, name FROM products WHERE id=?', [product_id]);
    if (prod && prod.stock < quantity) {
      return c.json({ success: false, message: `Only ${prod.stock} units of ${prod.name} available in stock.` }, 400);
    }

    const existing: any = await queryFirst(c.env.DB,
      'SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=? AND (variant_id=? OR (variant_id IS NULL AND ? IS NULL)) AND saved_for_later=0',
      [user_id, product_id, variant_id || null, variant_id || null]
    );

    if (existing) {
      const newQty = existing.quantity + quantity;
      await executeRun(c.env.DB, 'UPDATE cart_items SET quantity=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [newQty, existing.id]);
    } else {
      const id = `cart_${Date.now()}`;
      await executeRun(c.env.DB,
        'INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity, price, saved_for_later) VALUES (?,?,?,?,?,?,0)',
        [id, user_id, product_id, variant_id || null, quantity, price || 0]
      );
    }
  }

  return c.json({ success: true, message: 'Added to cart' });
});

// ── PUT /api/cart/items/:id ───────────────────────────────────────────────────
cartApp.put('/items/:id', async (c) => {
  const id = c.req.param('id');
  const { quantity, saved_for_later } = await c.req.json();

  if (c.env?.DB) {
    if (quantity <= 0) {
      await executeRun(c.env.DB, 'DELETE FROM cart_items WHERE id=?', [id]);
    } else {
      await executeRun(c.env.DB,
        'UPDATE cart_items SET quantity=COALESCE(?,quantity), saved_for_later=COALESCE(?,saved_for_later), updated_at=CURRENT_TIMESTAMP WHERE id=?',
        [quantity, saved_for_later, id]
      );
    }
  }

  return c.json({ success: true, message: 'Cart item updated' });
});

// ── DELETE /api/cart/items/:id ────────────────────────────────────────────────
cartApp.delete('/items/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'DELETE FROM cart_items WHERE id=?', [id]);
  return c.json({ success: true, message: 'Item removed from cart' });
});

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
cartApp.delete('/', async (c) => {
  const userId = c.req.query('user_id') || 'guest';
  if (c.env?.DB) await executeRun(c.env.DB, 'DELETE FROM cart_items WHERE user_id=?', [userId]);
  return c.json({ success: true, message: 'Cart cleared' });
});

// ── POST /api/cart/merge ──────────────────────────────────────────────────────
cartApp.post('/merge', async (c) => {
  const { guest_id, user_id } = await c.req.json();
  if (c.env?.DB && guest_id && user_id) {
    await executeRun(c.env.DB, 'UPDATE cart_items SET user_id=? WHERE user_id=?', [user_id, guest_id]);
  }
  return c.json({ success: true, message: 'Guest cart merged into account' });
});

// ── GET /api/cart/abandoned (Admin view) ──────────────────────────────────────
cartApp.get('/abandoned', async (c) => {
  if (c.env?.DB) {
    const carts = await queryAll(c.env.DB,
      "SELECT user_id, COUNT(*) as item_count, SUM(price * quantity) as total_value, MAX(updated_at) as last_activity FROM cart_items WHERE updated_at < datetime('now', '-1 hour') GROUP BY user_id ORDER BY last_activity DESC"
    );
    return c.json({ success: true, abandonedCarts: carts });
  }
  return c.json({
    success: true,
    abandonedCarts: [
      { user_id: 'usr_9918', item_count: 3, total_value: 1298, last_activity: '2026-07-27T18:30:00Z', customer_name: 'Pooja Verma', customer_email: 'pooja@gmail.com' },
      { user_id: 'guest_4812', item_count: 2, total_value: 849, last_activity: '2026-07-27T19:15:00Z', customer_name: 'Guest Customer', customer_email: 'guest@healthymonks.com' },
    ]
  });
});

export default cartApp;
