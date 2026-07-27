import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const cmsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/cms/pages (List CMS Pages) ──────────────────────────────────────
cmsApp.get('/pages', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM cms_pages WHERE deleted_at IS NULL ORDER BY updated_at DESC');
    return c.json({ success: true, pages: rows.length ? rows : mockCmsPages() });
  }
  return c.json({ success: true, pages: mockCmsPages() });
});

// ── GET /api/cms/pages/:slug (Get Page by Slug) ─────────────────────────────
cmsApp.get('/pages/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (c.env?.DB) {
    const page: any = await queryFirst(c.env.DB, 'SELECT * FROM cms_pages WHERE slug = ? AND deleted_at IS NULL', [slug]);
    if (page) {
      const blocks = await queryAll(c.env.DB, 'SELECT * FROM cms_page_blocks WHERE page_id = ? ORDER BY sort_order ASC', [page.id]);
      return c.json({ success: true, page: { ...page, blocks } });
    }
  }

  const mock = mockCmsPages().find(p => p.slug === slug || p.id === slug);
  if (mock) {
    return c.json({ success: true, page: mock });
  }
  return c.json({ success: false, message: 'Page not found' }, 404);
});

// ── POST /api/cms/pages (Create Page) ─────────────────────────────────────────
cmsApp.post('/pages', async (c) => {
  const { title, slug, content, status, blocks, author } = await c.req.json();
  if (!title || !slug) return c.json({ success: false, message: 'Title and slug required' }, 400);

  const pageId = `page_${Date.now()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO cms_pages (id, title, slug, content, status, author, version, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [pageId, title, slug, content || '', status || 'Draft', author || 'Super Admin', 1, now, now]
    );

    // Initial Revision
    await executeRun(c.env.DB,
      'INSERT INTO cms_page_revisions (id, page_id, version, title, content, author, created_at) VALUES (?,?,?,?,?,?,?)',
      [`rev_${Date.now()}`, pageId, 1, title, content || '', author || 'Super Admin', now]
    );
  }

  return c.json({
    success: true,
    message: `Page "${title}" created successfully`,
    page: { id: pageId, title, slug, status: status || 'Draft', version: 1 }
  });
});

// ── PUT /api/cms/pages/:id (Update Page) ─────────────────────────────────────
cmsApp.put('/pages/:id', async (c) => {
  const id = c.req.param('id');
  const { title, slug, content, status, author } = await c.req.json();
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const existing: any = await queryFirst(c.env.DB, 'SELECT version FROM cms_pages WHERE id = ?', [id]);
    const newVersion = (existing?.version || 1) + 1;

    await executeRun(c.env.DB,
      'UPDATE cms_pages SET title = ?, slug = ?, content = ?, status = ?, version = ?, updated_at = ? WHERE id = ?',
      [title, slug, content, status, newVersion, now, id]
    );

    await executeRun(c.env.DB,
      'INSERT INTO cms_page_revisions (id, page_id, version, title, content, author, created_at) VALUES (?,?,?,?,?,?,?)',
      [`rev_${Date.now()}`, id, newVersion, title, content, author || 'Super Admin', now]
    );
  }

  return c.json({ success: true, message: `Page updated (Version revision saved)` });
});

// ── DELETE /api/cms/pages/:id (Soft Delete) ───────────────────────────────────
cmsApp.delete('/pages/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE cms_pages SET deleted_at = ? WHERE id = ?', [new Date().toISOString(), id]);
  }
  return c.json({ success: true, message: 'Page archived & moved to bin' });
});

// ── GET /api/cms/menus (Navigation Menus) ─────────────────────────────────────
cmsApp.get('/menus', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM cms_menus ORDER BY location ASC');
    return c.json({ success: true, menus: rows.length ? rows : mockCmsMenus() });
  }
  return c.json({ success: true, menus: mockCmsMenus() });
});

// ── POST /api/cms/menus (Create/Update Menu) ──────────────────────────────────
cmsApp.post('/menus', async (c) => {
  const { name, location, items } = await c.req.json();
  if (!name || !location) return c.json({ success: false, message: 'Menu name and location required' }, 400);

  const menuId = `menu_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO cms_menus (id, name, location, items_json) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, items_json=excluded.items_json',
      [menuId, name, location, JSON.stringify(items || [])]
    );
  }

  return c.json({ success: true, message: `Menu "${name}" saved` });
});

// ── GET /api/cms/blocks (Reusable Content Blocks) ─────────────────────────────
cmsApp.get('/blocks', async (c) => {
  return c.json({
    success: true,
    blocks: [
      { id: 'blk_hero', type: 'Hero', name: 'Ayurvedic Wellness Hero Banner', category: 'Headers', icon: 'Layout' },
      { id: 'blk_features', type: 'Feature Grid', name: '100% Organic & Doctor Formulated Badges', category: 'Content', icon: 'Grid' },
      { id: 'blk_faq', type: 'FAQ Accordion', name: 'Frequently Asked Health Questions', category: 'Interactivity', icon: 'HelpCircle' },
      { id: 'blk_cta', type: 'CTA', name: 'Consult Ayurvedic Doctor Banner', category: 'Marketing', icon: 'Zap' },
      { id: 'blk_testimonials', type: 'Testimonial Slider', name: 'Verified Customer Doctor Reviews', category: 'Social Proof', icon: 'MessageSquare' },
    ]
  });
});

// ── GET /api/cms/revisions/:pageId (Revision History) ─────────────────────────
cmsApp.get('/revisions/:pageId', async (c) => {
  const pageId = c.req.param('pageId');
  if (c.env?.DB) {
    const revs = await queryAll(c.env.DB, 'SELECT * FROM cms_page_revisions WHERE page_id = ? ORDER BY version DESC', [pageId]);
    return c.json({ success: true, revisions: revs });
  }

  return c.json({
    success: true,
    revisions: [
      { id: 'rev_2', page_id: pageId, version: 2, title: 'About Healthy Monks', author: 'Mohd Nomaan', created_at: '2026-07-27T14:30:00Z', notes: 'Updated GST & ISO certifications' },
      { id: 'rev_1', page_id: pageId, version: 1, title: 'About Us Initial Draft', author: 'Mohd Nomaan', created_at: '2026-07-26T10:00:00Z', notes: 'Initial publish' }
    ]
  });
});

function mockCmsPages() {
  return [
    { id: 'pg1', title: 'Home Page', slug: 'home', status: 'Published', version: 5, author: 'Super Admin', updated_at: '2026-07-27T16:00:00Z', is_system: 1 },
    { id: 'pg2', title: 'About Healthy Monks', slug: 'about-us', status: 'Published', version: 3, author: 'Super Admin', updated_at: '2026-07-27T14:30:00Z', is_system: 1 },
    { id: 'pg3', title: 'Contact & Doctor Consultation', slug: 'contact-us', status: 'Published', version: 2, author: 'Support Admin', updated_at: '2026-07-25T11:20:00Z', is_system: 1 },
    { id: 'pg4', title: 'Privacy Policy & Data Security', slug: 'privacy-policy', status: 'Published', version: 1, author: 'Legal Team', updated_at: '2026-07-20T09:00:00Z', is_system: 1 },
    { id: 'pg5', title: 'Terms & Conditions', slug: 'terms-and-conditions', status: 'Published', version: 1, author: 'Legal Team', updated_at: '2026-07-20T09:15:00Z', is_system: 1 },
    { id: 'pg6', title: 'Shipping & Delivery Policy', slug: 'shipping-policy', status: 'Published', version: 2, author: 'Operations', updated_at: '2026-07-24T18:00:00Z', is_system: 1 },
    { id: 'pg7', title: 'Return, Refund & RMA Policy', slug: 'refund-policy', status: 'Published', version: 2, author: 'Finance', updated_at: '2026-07-24T18:10:00Z', is_system: 1 },
    { id: 'pg8', title: 'Ayurvedic Wellness Festival 2026', slug: 'wellness-fest-2026', status: 'Draft', version: 1, author: 'Marketing Lead', updated_at: '2026-07-27T12:00:00Z', is_system: 0 }
  ];
}

function mockCmsMenus() {
  return [
    {
      id: 'menu_hdr', name: 'Header Main Navigation', location: 'Header',
      items: [
        { id: 'm1', label: 'Home', url: '/', icon: 'Home' },
        { id: 'm2', label: 'Ayurvedic Herbs', url: '/shop?cat=herbs', icon: 'Leaf', badge: 'Hot' },
        { id: 'm3', label: 'Supplements', url: '/shop?cat=supplements', icon: 'Package' },
        { id: 'm4', label: 'Doctor Consultation', url: '/contact-us', icon: 'HeartHandshake' },
        { id: 'm5', label: 'Track Order', url: '/track', icon: 'Truck' }
      ]
    },
    {
      id: 'menu_ftr', name: 'Footer Policy Links', location: 'Footer',
      items: [
        { id: 'f1', label: 'About Us', url: '/about-us' },
        { id: 'f2', label: 'Privacy Policy', url: '/privacy-policy' },
        { id: 'f3', label: 'Terms & Conditions', url: '/terms-and-conditions' },
        { id: 'f4', label: 'Shipping Policy', url: '/shipping-policy' },
        { id: 'f5', label: 'Refund & RMA Policy', url: '/refund-policy' }
      ]
    }
  ];
}

export default cmsApp;
