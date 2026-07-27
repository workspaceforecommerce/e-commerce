import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const builderApp = new Hono<{ Bindings: Env }>();

// ── GET /api/builder/pages (List Editable Page Layouts) ────────────────────────
builderApp.get('/pages', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM page_layouts ORDER BY updated_at DESC');
    return c.json({ success: true, layouts: rows.length ? rows : mockLayoutsList() });
  }
  return c.json({ success: true, layouts: mockLayoutsList() });
});

// ── GET /api/builder/layout/:pageId (Get Page Layout Sections) ─────────────────
builderApp.get('/layout/:pageId', async (c) => {
  const pageId = c.req.param('pageId');
  if (c.env?.DB) {
    const layout: any = await queryFirst(c.env.DB, 'SELECT * FROM page_layouts WHERE page_id = ?', [pageId]);
    if (layout) {
      const sections = await queryAll(c.env.DB, 'SELECT * FROM page_sections WHERE layout_id = ? ORDER BY sort_order ASC', [layout.id]);
      return c.json({ success: true, layout: { ...layout, sections } });
    }
  }

  const mock = mockLayoutsList().find(l => l.page_id === pageId || l.id === pageId) || mockLayoutsList()[0];
  return c.json({ success: true, layout: mock });
});

// ── POST /api/builder/layout (Save Page Layout Draft) ───────────────────────────
builderApp.post('/layout', async (c) => {
  const { page_id, name, sections, theme_settings } = await c.req.json();
  if (!page_id || !name) return c.json({ success: false, message: 'Page ID and layout name required' }, 400);

  const layoutId = `layout_${Date.now()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO page_layouts (id, page_id, name, status, theme_settings, sections_json, updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(page_id) DO UPDATE SET name=excluded.name, sections_json=excluded.sections_json, updated_at=excluded.updated_at',
      [layoutId, page_id, name, 'Draft', JSON.stringify(theme_settings || {}), JSON.stringify(sections || []), now]
    );
  }

  return c.json({
    success: true,
    message: `Layout draft for "${name}" saved successfully`,
    layout_id: layoutId
  });
});

// ── POST /api/builder/publish (Publish Layout Live) ────────────────────────────
builderApp.post('/publish', async (c) => {
  const { page_id } = await c.req.json();
  const now = new Date().toISOString();

  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE page_layouts SET status = "Published", updated_at = ? WHERE page_id = ?', [now, page_id]);
    await executeRun(c.env.DB, 'UPDATE cms_pages SET status = "Published", updated_at = ? WHERE id = ?', [now, page_id]);
  }

  return c.json({ success: true, message: 'Visual layout published live to production PWA!' });
});

// ── GET /api/builder/templates (Pre-Built Builder Templates) ──────────────────
builderApp.get('/templates', async (c) => {
  return c.json({
    success: true,
    templates: [
      { id: 'tpl1', name: 'Ayurvedic Wellness Home 2026', category: 'Homepage', preview_img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', sections_count: 6 },
      { id: 'tpl2', name: 'Flash Sale & Festival Promo', category: 'Landing Page', preview_img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80', sections_count: 4 },
      { id: 'tpl3', name: 'Doctor Consultation & Clinic', category: 'Services', preview_img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80', sections_count: 5 },
    ]
  });
});

function mockLayoutsList() {
  return [
    {
      id: 'layout_home', page_id: 'pg1', name: 'Homepage Main Layout', status: 'Published',
      theme_settings: { primary_color: '#15803d', accent_color: '#d97706', container_width: '1280px' },
      sections: [
        { id: 'sec_hero', widget_type: 'Hero Banner', title: '100% Authentic Ayurvedic Wellness', subtitle: 'Formulated by Senior Ayurvedic Vaidyas', cta_text: 'Explore Herbs & Oils', bg_color: '#f0fdf4' },
        { id: 'sec_features', widget_type: 'Feature Badges', items: ['AYUSH Certified', 'Zero Chemicals', 'Free Shipping over ₹499'] },
        { id: 'sec_prods', widget_type: 'Featured Products Carousel', category_filter: 'Herbs', limit: 8 },
        { id: 'sec_testimonials', widget_type: 'Verified Reviews', title: 'What Our Customers Say' }
      ]
    }
  ];
}

export default builderApp;
