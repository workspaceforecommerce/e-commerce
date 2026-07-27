import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const campaignsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/campaigns (List Marketing Campaigns) ─────────────────────────────
campaignsApp.get('/', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM marketing_campaigns ORDER BY start_date DESC');
    return c.json({ success: true, campaigns: rows.length ? rows : mockCampaignsList() });
  }
  return c.json({ success: true, campaigns: mockCampaignsList() });
});

// ── POST /api/campaigns (Create Campaign) ─────────────────────────────────────
campaignsApp.post('/', async (c) => {
  const { name, campaign_type, target_audience, start_date, end_date, discount_code } = await c.req.json();
  if (!name) return c.json({ success: false, message: 'Campaign name required' }, 400);

  const campId = `camp_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO marketing_campaigns (id, name, campaign_type, target_audience, start_date, end_date, discount_code, status, impressions, conversions) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [campId, name, campaign_type || 'Flash Sale', target_audience || 'All Customers', start_date || new Date().toISOString(), end_date || '', discount_code || '', 'Active', 0, 0]
    );
  }

  return c.json({ success: true, message: `Campaign "${name}" created & activated` });
});

// ── GET /api/campaigns/banners (List Store Banners) ───────────────────────────
campaignsApp.get('/banners', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM banners ORDER BY id DESC');
    return c.json({ success: true, banners: rows.length ? rows : mockBannersList() });
  }
  return c.json({ success: true, banners: mockBannersList() });
});

// ── POST /api/campaigns/banners (Add Banner) ─────────────────────────────────
campaignsApp.post('/banners', async (c) => {
  const { title, subtitle, image_url, link_url, section } = await c.req.json();
  if (!title || !image_url) return c.json({ success: false, message: 'Title and image URL required' }, 400);

  const bannerId = `ban_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO banners (id, title, subtitle, image_url, link_url, section, is_active) VALUES (?,?,?,?,?,?,?)',
      [bannerId, title, subtitle || '', image_url, link_url || '/shop', section || 'Hero Slider', 1]
    );
  }

  return c.json({ success: true, message: 'Banner added to store slider' });
});

// ── GET /api/campaigns/popups (List Store Popups) ────────────────────────────
campaignsApp.get('/popups', async (c) => {
  return c.json({
    success: true,
    popups: [
      { id: 'pop1', name: 'Welcome 10% Off Newsletter Popup', type: 'Newsletter', trigger_rule: 'Time on Page 5s', coupon_code: 'WELCOME10', status: 'Active', conversion_rate: '14.2%' },
      { id: 'pop2', name: 'Exit Intent Cart Recovery', type: 'Exit Intent', trigger_rule: 'Cursor leaves viewport', coupon_code: 'DONTGO5', status: 'Active', conversion_rate: '18.6%' },
      { id: 'pop3', name: 'Monsoon Wellness Festival Coupon', type: 'Discount', trigger_rule: 'Scroll 50%', coupon_code: 'MONSOON20', status: 'Scheduled', conversion_rate: '0.0%' }
    ]
  });
});

// ── GET /api/campaigns/announcements (Announcement Bars) ──────────────────────
campaignsApp.get('/announcements', async (c) => {
  return c.json({
    success: true,
    announcements: [
      { id: 'ann1', message: '🌿 FREE Express Shipping on all orders above ₹499 | Use Code: HEALTHY100', cta_text: 'Shop Now', cta_url: '/shop', bg_color: '#15803d', status: 'Active' },
      { id: 'ann2', message: '✨ Monsoon Immunity Special: Flat 20% Off Ashwagandha Gold Capsules!', cta_text: 'Claim Offer', cta_url: '/shop?cat=herbs', bg_color: '#d97706', status: 'Scheduled' }
    ]
  });
});

// ── GET /api/campaigns/analytics (Campaign Performance Attribution) ─────────
campaignsApp.get('/analytics', async (c) => {
  return c.json({
    success: true,
    metrics: {
      total_active_campaigns: 4,
      total_impressions: 48290,
      total_clicks: 6410,
      ctr: '13.2%',
      total_campaign_revenue: 412900,
      top_campaign: 'Monsoon Ayurvedic Festival 2026'
    }
  });
});

function mockCampaignsList() {
  return [
    { id: 'camp1', name: 'Monsoon Ayurvedic Festival 2026', campaign_type: 'Festival Sale', target_audience: 'All Customers', start_date: '2026-07-20T00:00:00Z', end_date: '2026-08-10T23:59:59Z', discount_code: 'MONSOON20', status: 'Active', impressions: 24500, conversions: 840 },
    { id: 'camp2', name: 'VIP High Spender Private Flash Sale', campaign_type: 'Flash Sale', target_audience: 'VIP High Spenders', start_date: '2026-07-25T00:00:00Z', end_date: '2026-07-31T23:59:59Z', discount_code: 'VIPFLASH30', status: 'Active', impressions: 12400, conversions: 410 },
    { id: 'camp3', name: 'Freedom Day Mega Clearance', campaign_type: 'Clearance Sale', target_audience: 'All Customers', start_date: '2026-08-14T00:00:00Z', end_date: '2026-08-16T23:59:59Z', discount_code: 'FREEDOM50', status: 'Scheduled', impressions: 0, conversions: 0 }
  ];
}

function mockBannersList() {
  return [
    { id: 'ban1', title: 'Authentic Himalayan Shilajit Resin', subtitle: '100% Raw & Fulvic Acid Rich for Pure Vitality', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', link_url: '/shop?cat=herbs', section: 'Hero Slider', is_active: 1 },
    { id: 'ban2', title: 'Kumkumadi Radiance Face Serum', subtitle: 'Kashmiri Saffron & 26 Ayurvedic Botanicals', image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', link_url: '/shop?cat=oils', section: 'Category Banner', is_active: 1 }
  ];
}

export default campaignsApp;
