import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const reviewsApp = new Hono<{ Bindings: Env }>();

// ── GET all reviews (admin view, with filters) ────────────────────────────────
reviewsApp.get('/', async (c) => {
  const status = c.req.query('status') || '';
  const product_id = c.req.query('product_id') || '';
  const rating = c.req.query('rating') || '';
  const q = c.req.query('q') || '';
  const sort = c.req.query('sort') || 'created_at';

  if (c.env?.DB) {
    let sql = 'SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id WHERE 1=1';
    const params: any[] = [];
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    if (product_id) { sql += ' AND r.product_id = ?'; params.push(product_id); }
    if (rating) { sql += ' AND r.rating = ?'; params.push(parseInt(rating)); }
    if (q) { sql += ' AND (r.title LIKE ? OR r.body LIKE ? OR r.reviewer_name LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    sql += ` ORDER BY r.${sort === 'rating' ? 'rating' : sort === 'helpful' ? 'helpful_count' : 'created_at'} DESC LIMIT 200`;
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, reviews: rows });
  }
  return c.json({ success: true, reviews: mockReviews() });
});

// ── GET public reviews for a product ─────────────────────────────────────────
reviewsApp.get('/product/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, "SELECT * FROM reviews WHERE product_id=? AND status='approved' ORDER BY created_at DESC", [id]);
    const stats = await queryFirst(c.env.DB, "SELECT AVG(rating) as avg_rating, COUNT(*) as total, SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END) as r5, SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END) as r4, SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END) as r3, SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END) as r2, SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) as r1 FROM reviews WHERE product_id=? AND status='approved'", [id]);
    return c.json({ success: true, reviews: rows, stats });
  }
  return c.json({ success: true, reviews: mockReviews().filter(r => r.product_id === id), stats: { avg_rating: 4.5, total: 6, r5: 3, r4: 2, r3: 1, r2: 0, r1: 0 } });
});

// ── POST submit a review (customer) ───────────────────────────────────────────
reviewsApp.post('/', async (c) => {
  const { product_id, reviewer_name, reviewer_email, rating, title, body, is_verified_purchase = 0, media_urls } = await c.req.json();
  if (!product_id || !rating || !body) return c.json({ success: false, message: 'product_id, rating and body are required' }, 400);
  if (rating < 1 || rating > 5) return c.json({ success: false, message: 'Rating must be between 1 and 5' }, 400);

  const id = `rev_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO reviews (id, product_id, reviewer_name, reviewer_email, rating, title, body, status, is_verified_purchase, media_urls, helpful_count) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, product_id, reviewer_name || 'Anonymous', reviewer_email || '', rating, title || '', body, 'pending', is_verified_purchase, JSON.stringify(media_urls || []), 0]
    );
    await executeRun(c.env.DB,
      "UPDATE products SET review_count = review_count + 1 WHERE id = ?", [product_id]
    ).catch(() => {});
  }
  return c.json({ success: true, message: 'Review submitted. It will appear after moderation.' });
});

// ── PATCH /reviews/:id — approve/reject/feature + edit admin reply ────────────
reviewsApp.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const { status, admin_reply, is_featured } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE reviews SET status=COALESCE(?,status), admin_reply=COALESCE(?,admin_reply), is_featured=COALESCE(?,is_featured), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [status, admin_reply, is_featured, id]
    );
    // Recalculate product average rating if status changed
    if (status === 'approved') {
      const rev = await queryFirst(c.env.DB, 'SELECT product_id FROM reviews WHERE id=?', [id]);
      if (rev) {
        const stats: any = await queryFirst(c.env.DB, "SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id=? AND status='approved'", [rev.product_id]);
        await executeRun(c.env.DB, 'UPDATE products SET avg_rating=?, review_count=? WHERE id=?', [stats?.avg || 0, stats?.cnt || 0, rev.product_id]).catch(() => {});
      }
    }
  }
  return c.json({ success: true, message: 'Review updated' });
});

// ── DELETE /reviews/:id ────────────────────────────────────────────────────────
reviewsApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'DELETE FROM reviews WHERE id=?', [id]);
  return c.json({ success: true, message: 'Review deleted' });
});

// ── POST /reviews/:id/helpful — increment helpful votes ──────────────────────
reviewsApp.post('/:id/helpful', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id=?', [id]);
  return c.json({ success: true, message: 'Marked as helpful' });
});

// ── GET /qa — Q&A for a product ───────────────────────────────────────────────
reviewsApp.get('/qa/:product_id', async (c) => {
  const product_id = c.req.param('product_id');
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, "SELECT * FROM product_qa WHERE product_id=? AND status='approved' ORDER BY created_at DESC", [product_id]);
    return c.json({ success: true, qa: rows });
  }
  return c.json({ success: true, qa: mockQA() });
});

// ── POST /qa — submit question ────────────────────────────────────────────────
reviewsApp.post('/qa', async (c) => {
  const { product_id, question, asker_name, asker_email } = await c.req.json();
  if (!product_id || !question) return c.json({ success: false, message: 'product_id and question are required' }, 400);
  const id = `qa_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO product_qa (id, product_id, question, asker_name, asker_email, status) VALUES (?,?,?,?,?,?)',
      [id, product_id, question, asker_name || 'Customer', asker_email || '', 'pending']
    );
  }
  return c.json({ success: true, message: 'Question submitted. Admin will reply shortly.' });
});

// ── PATCH /qa/:id — admin answer ─────────────────────────────────────────────
reviewsApp.patch('/qa/:id', async (c) => {
  const id = c.req.param('id');
  const { answer, status } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE product_qa SET answer=COALESCE(?,answer), status=COALESCE(?,status), answered_at=CURRENT_TIMESTAMP WHERE id=?',
      [answer, status, id]
    );
  }
  return c.json({ success: true, message: 'Q&A updated' });
});

// ── GET /reviews/summary — dashboard stats ────────────────────────────────────
reviewsApp.get('/summary', async (c) => {
  if (c.env?.DB) {
    const stats: any = await queryFirst(c.env.DB, "SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected, AVG(rating) as avg_rating FROM reviews");
    const qa_pending: any = await queryFirst(c.env.DB, "SELECT COUNT(*) as cnt FROM product_qa WHERE status='pending'");
    return c.json({ success: true, stats: { ...stats, qa_pending: qa_pending?.cnt || 0 } });
  }
  return c.json({ success: true, stats: { total: 41, pending: 7, approved: 30, rejected: 4, avg_rating: 4.3, qa_pending: 3 } });
});

// ── Mock data ─────────────────────────────────────────────────────────────────
function mockReviews() {
  return [
    { id: 'rev1', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Priya Sharma', reviewer_email: 'priya@gmail.com', rating: 5, title: 'Life-changing supplement!', body: 'I\'ve been taking this for 2 months and my stress levels have dropped significantly. Sleep quality is amazing. Highly recommended!', status: 'approved', is_verified_purchase: 1, is_featured: 1, helpful_count: 24, admin_reply: null, media_urls: '[]', created_at: '2026-07-20T10:00:00Z' },
    { id: 'rev2', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Rohit Mehta', reviewer_email: 'rohit@email.com', rating: 4, title: 'Very effective, packaging could be better', body: 'Great product, noticed energy improvements within 3 weeks. Packaging seal was slightly loose. Will buy again.', status: 'approved', is_verified_purchase: 1, is_featured: 0, helpful_count: 8, admin_reply: 'Thank you for your feedback! We\'re improving our packaging.', media_urls: '[]', created_at: '2026-07-22T10:00:00Z' },
    { id: 'rev3', product_id: 'p2', product_name: 'Himalayan Tulsi Green Tea', reviewer_name: 'Anjali Kapoor', reviewer_email: 'anjali@email.com', rating: 5, title: 'Best green tea I\'ve ever had!', body: 'The aroma is incredible, very soothing. I drink 2 cups daily. Noticeable boost in immunity.', status: 'approved', is_verified_purchase: 1, is_featured: 1, helpful_count: 31, admin_reply: null, media_urls: '[]', created_at: '2026-07-18T10:00:00Z' },
    { id: 'rev4', product_id: 'p3', product_name: 'Moringa Leaf Powder', reviewer_name: 'Vikram Singh', reviewer_email: 'vikram@email.com', rating: 3, title: 'Okay product, taste is bitter', body: 'Works fine but the bitter taste is hard to handle. Mixing with smoothies helps a lot.', status: 'pending', is_verified_purchase: 0, is_featured: 0, helpful_count: 2, admin_reply: null, media_urls: '[]', created_at: '2026-07-26T10:00:00Z' },
    { id: 'rev5', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Neha Gupta', reviewer_email: 'neha@email.com', rating: 2, title: 'Did not notice any difference', body: 'Used for 1 month but no significant changes. Maybe it\'s a placebo. Expected more.', status: 'pending', is_verified_purchase: 1, is_featured: 0, helpful_count: 0, admin_reply: null, media_urls: '[]', created_at: '2026-07-27T08:00:00Z' },
    { id: 'rev6', product_id: 'p4', product_name: 'Amla Chyawanprash', reviewer_name: 'Ramesh Patel', reviewer_email: 'ramesh@email.com', rating: 5, title: 'Grandma\'s recipe quality!', body: 'Exactly like the traditional chyawanprash. My kids love it. Family has been ordering for 6 months.', status: 'approved', is_verified_purchase: 1, is_featured: 0, helpful_count: 19, admin_reply: null, media_urls: '[]', created_at: '2026-07-15T10:00:00Z' },
  ];
}

function mockQA() {
  return [
    { id: 'qa1', product_id: 'p1', question: 'Can I take Ashwagandha with milk at night?', asker_name: 'Suresh K.', asker_email: '', answer: 'Yes! Taking KSM-66 Ashwagandha with warm milk at night is one of the most traditional and effective methods. It helps with absorption and promotes better sleep.', status: 'approved', answered_at: '2026-07-21T10:00:00Z', created_at: '2026-07-20T10:00:00Z' },
    { id: 'qa2', product_id: 'p1', question: 'Is this suitable for diabetics?', asker_name: 'Meena R.', asker_email: '', answer: 'Ashwagandha may help regulate blood sugar levels, but we recommend consulting your physician before starting any supplement if you are diabetic or on medication.', status: 'approved', answered_at: '2026-07-23T10:00:00Z', created_at: '2026-07-22T10:00:00Z' },
    { id: 'qa3', product_id: 'p1', question: 'What is the recommended dosage for adults?', asker_name: 'Ankit M.', asker_email: '', answer: null, status: 'pending', answered_at: null, created_at: '2026-07-27T09:00:00Z' },
  ];
}

export default reviewsApp;
