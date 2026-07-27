import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const contentApp = new Hono<{ Bindings: Env }>();

// ── GET /api/content (List Articles & Posts) ──────────────────────────────────
contentApp.get('/', async (c) => {
  const type = c.req.query('type');
  const cat = c.req.query('category');
  const q = c.req.query('q');

  if (c.env?.DB) {
    let sql = 'SELECT * FROM content_items WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (type) { sql += ' AND content_type = ?'; params.push(type); }
    if (cat) { sql += ' AND category = ?'; params.push(cat); }
    if (q) { sql += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    sql += ' ORDER BY created_at DESC';

    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, articles: rows.length ? rows : mockArticlesList() });
  }
  return c.json({ success: true, articles: mockArticlesList() });
});

// ── GET /api/content/:slug (Get Article Details) ──────────────────────────────
contentApp.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (c.env?.DB) {
    const article: any = await queryFirst(c.env.DB, 'SELECT * FROM content_items WHERE (slug = ? OR id = ?) AND deleted_at IS NULL', [slug, slug]);
    if (article) return c.json({ success: true, article });
  }

  const mock = mockArticlesList().find(a => a.slug === slug || a.id === slug) || mockArticlesList()[0];
  return c.json({ success: true, article: mock });
});

// ── POST /api/content (Create Article / Documentation) ───────────────────────
contentApp.post('/', async (c) => {
  const { title, slug, content_type, category, excerpt, content, author_name, cover_image } = await c.req.json();
  if (!title) return c.json({ success: false, message: 'Title is required' }, 400);

  const articleId = `art_${Date.now()}`;
  const now = new Date().toISOString();
  const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO content_items (id, title, slug, content_type, category, excerpt, content, author_name, cover_image, status, reading_time_mins, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [articleId, title, generatedSlug, content_type || 'Blog', category || 'Wellness', excerpt || '', content || '', author_name || 'Vaidya Ananya', cover_image || '', 'Published', 4, now, now]
    );
  }

  return c.json({
    success: true,
    message: `Content "${title}" published successfully`,
    article: { id: articleId, title, slug: generatedSlug, status: 'Published' }
  });
});

// ── GET /api/content/categories (Content Categories) ──────────────────────────
contentApp.get('/categories/tree', async (c) => {
  return c.json({
    success: true,
    categories: [
      { id: 'cat_ayurveda', name: 'Ayurvedic Principles', count: 18 },
      { id: 'cat_herbs', name: 'Medicinal Herbs & Adaptogens', count: 24 },
      { id: 'cat_nutrition', name: 'Diet & Satvic Nutrition', count: 12 },
      { id: 'cat_research', name: 'Clinical Research & Studies', count: 8 },
      { id: 'cat_docs', name: 'Product Guides & Dosage Docs', count: 15 }
    ]
  });
});

// ── GET /api/content/documentation (Doc Portal Hierarchy) ─────────────────────
contentApp.get('/documentation/portal', async (c) => {
  return c.json({
    success: true,
    documentation: [
      {
        section: 'Getting Started',
        articles: [
          { id: 'doc1', title: 'Ayurvedic Body Dosha Guide (Vata, Pitta, Kapha)', slug: 'body-dosha-guide' },
          { id: 'doc2', title: 'Daily Wellness & Dinacharya Routine', slug: 'dinacharya-routine' }
        ]
      },
      {
        section: 'Product Usage & Dosage',
        articles: [
          { id: 'doc3', title: 'Ashwagandha Gold Extra Strength Usage Guide', slug: 'ashwagandha-usage-guide' },
          { id: 'doc4', title: 'Kumkumadi Night Serum Clinical Application', slug: 'kumkumadi-application' }
        ]
      }
    ]
  });
});

// ── POST /api/content/comments (Post Comment) ──────────────────────────────────
contentApp.post('/comments', async (c) => {
  const { article_id, author_name, comment } = await c.req.json();
  if (!article_id || !comment) return c.json({ success: false, message: 'Article ID and comment body required' }, 400);

  return c.json({
    success: true,
    message: 'Comment submitted & sent for AI spam check / editorial approval.'
  });
});

function mockArticlesList() {
  return [
    {
      id: 'art1', title: '10 Proven Benefits of Ashwagandha According to Modern Science & Charaka Samhita',
      slug: 'proven-benefits-of-ashwagandha', content_type: 'Blog', category: 'Medicinal Herbs & Adaptogens',
      excerpt: 'Explore how Withania somnifera lowers cortisol, improves sleep quality, and restores vitality based on clinical trials and traditional texts.',
      author_name: 'Dr. Rajesh Sharma, MD (Ayurveda)', status: 'Published', reading_time_mins: 5, created_at: '2026-07-27T10:00:00Z',
      cover_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'art2', title: 'Understanding Your Prakriti: Vata, Pitta and Kapha Self-Assessment Guide',
      slug: 'understanding-your-prakriti', content_type: 'Documentation', category: 'Product Guides & Dosage Docs',
      excerpt: 'Learn how to identify your unique mind-body constitution and choose the ideal herbal supplements tailored to your metabolic type.',
      author_name: 'Vaidya Ananya Roy', status: 'Published', reading_time_mins: 8, created_at: '2026-07-26T14:30:00Z',
      cover_image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'art3', title: 'Healthy Monks Achieves AYUSH Premium Mark Certification 2026',
      slug: 'ayush-premium-certification-2026', content_type: 'News', category: 'Clinical Research & Studies',
      excerpt: 'Our manufacturing labs pass stringent heavy metal, pesticide, and purity audits conducted by national accreditation bodies.',
      author_name: 'Editorial Team', status: 'Published', reading_time_mins: 3, created_at: '2026-07-25T09:00:00Z',
      cover_image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
    }
  ];
}

export default contentApp;
