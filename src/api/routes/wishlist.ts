import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const wishlistApp = new Hono<{ Bindings: Env }>();

// ── GET /api/wishlist ─────────────────────────────────────────────────────────
wishlistApp.get('/', async (c) => {
  const userId = c.req.query('user_id') || 'guest';
  if (c.env?.DB) {
    const items = await queryAll(c.env.DB,
      'SELECT wi.*, p.name as product_name, p.price as product_price, p.image_url, p.rating, p.stock FROM wishlist_items wi JOIN products p ON wi.product_id = p.id WHERE wi.user_id = ? ORDER BY wi.created_at DESC',
      [userId]
    );
    return c.json({ success: true, items });
  }
  return c.json({ success: true, items: [] });
});

// ── POST /api/wishlist ────────────────────────────────────────────────────────
wishlistApp.post('/', async (c) => {
  const { user_id = 'guest', product_id } = await c.req.json();
  if (!product_id) return c.json({ success: false, message: 'product_id is required' }, 400);

  const id = `wl_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT OR IGNORE INTO wishlist_items (id, user_id, product_id) VALUES (?,?,?)',
      [id, user_id, product_id]
    );
  }
  return c.json({ success: true, message: 'Added to wishlist' });
});

// ── DELETE /api/wishlist/:id ──────────────────────────────────────────────────
wishlistApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'DELETE FROM wishlist_items WHERE id=? OR product_id=?', [id, id]);
  return c.json({ success: true, message: 'Removed from wishlist' });
});

// ── POST /api/wishlist/move-to-cart ──────────────────────────────────────────
wishlistApp.post('/move-to-cart', async (c) => {
  const { user_id = 'guest', product_id, price } = await c.req.json();
  if (!product_id) return c.json({ success: false, message: 'product_id is required' }, 400);

  if (c.env?.DB) {
    // Add to cart
    const cartId = `cart_${Date.now()}`;
    await executeRun(c.env.DB,
      'INSERT INTO cart_items (id, user_id, product_id, quantity, price, saved_for_later) VALUES (?,?,?,1,?,0)',
      [cartId, user_id, product_id, price || 0]
    );
    // Remove from wishlist
    await executeRun(c.env.DB, 'DELETE FROM wishlist_items WHERE user_id=? AND product_id=?', [user_id, product_id]);
  }

  return c.json({ success: true, message: 'Moved from wishlist to cart' });
});

export default wishlistApp;
