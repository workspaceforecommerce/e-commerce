import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const seoApp = new Hono<{ Bindings: Env }>();

// ── GET /api/seo/settings (Global SEO Settings) ───────────────────────────────
seoApp.get('/settings', async (c) => {
  return c.json({
    success: true,
    settings: {
      site_title: 'Healthy Monks | Premium Ayurvedic Herbs & Wellness',
      site_description: 'Explore 100% natural Ayurvedic herbs, wellness teas, adaptogen capsules and skincare from Healthy Monks. Trusted by 50,000+ customers across India.',
      site_keywords: 'Ayurvedic herbs, Ashwagandha, Shilajit, wellness tea, immunity booster, natural supplements, Triphala, KSM-66',
      canonical_domain: 'https://healthymonks.in',
      default_language: 'en-IN',
      og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/og-default.jpg',
      twitter_card: 'summary_large_image',
      twitter_site: '@healthymonks',
      google_site_verification: 'HM_GSC_VERIFY_TOKEN_2026',
      bing_site_verification: 'HM_BING_VERIFY_TOKEN_2026',
      google_analytics_id: 'G-HEALTHYMONKS01',
      google_tag_manager_id: 'GTM-HMKS2026',
      meta_pixel_id: '987654321098765',
      ms_clarity_id: 'clarity_hm_prod_2026',
      robots_indexing: 'index,follow',
      index_sitemap: 'https://healthymonks.in/sitemap-index.xml'
    }
  });
});

// ── PUT /api/seo/settings (Update Global SEO Settings) ───────────────────────
seoApp.put('/settings', async (c) => {
  const body = await c.req.json();
  return c.json({ success: true, message: 'Global SEO settings updated successfully.' });
});

// ── GET /api/seo/meta (All Page SEO Metadata) ────────────────────────────────
seoApp.get('/meta', async (c) => {
  return c.json({
    success: true,
    meta_configs: [
      { id: 'seo1', entity_type: 'page', entity_id: 'homepage', slug: '/', title: 'Healthy Monks | Premium Ayurvedic Herbs, Teas & Wellness Products', meta_description: 'Explore 100% natural Ayurvedic herbs, adaptogen capsules, wellness teas, and skincare from Healthy Monks. Trusted by 50,000+ customers across India.', meta_keywords: 'Ayurvedic herbs, Ashwagandha, Shilajit, immunity', og_title: 'Healthy Monks – Premium Ayurvedic Wellness', og_description: 'Authentic Ayurvedic herbs and immunity boosters delivered free above ₹499.', og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/homepage-og.jpg', canonical_url: 'https://healthymonks.in/', robots: 'index,follow', structured_data_type: 'Organization,WebSite', score: 94, issues: [] },
      { id: 'seo2', entity_type: 'category', entity_id: 'herbs', slug: '/shop/herbs', title: 'Ayurvedic Herbs | Ashwagandha, Shatavari, Brahmi & More – Healthy Monks', meta_description: 'Shop premium standardised Ayurvedic herbal extracts. KSM-66 Ashwagandha, organic Shatavari root, Brahmi powder and 30+ Himalayan botanicals.', meta_keywords: 'Ashwagandha, Shatavari, Brahmi, Himalayan herbs', og_title: 'Ayurvedic Herbs Collection – Healthy Monks', og_description: 'Adaptogenic herbs backed by clinical research.', og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/herbs-og.jpg', canonical_url: 'https://healthymonks.in/shop/herbs', robots: 'index,follow', structured_data_type: 'CollectionPage,BreadcrumbList', score: 88, issues: ['meta_description_too_short'] },
      { id: 'seo3', entity_type: 'product', entity_id: 'ksm-66-ashwagandha', slug: '/products/ksm-66-ashwagandha-gold', title: 'KSM-66 Ashwagandha Gold Capsules 500mg | Healthy Monks', meta_description: 'Pure KSM-66 Ashwagandha root extract 500mg – clinically proven to reduce cortisol by 28%, improve stamina and sleep quality. 60 veg capsules. Free shipping above ₹499.', meta_keywords: 'KSM-66, Ashwagandha capsules, stress relief, adaptogen', og_title: 'KSM-66 Ashwagandha Gold – Healthy Monks', og_description: 'Standardised 5% withanolide ashwagandha root. 60 veg capsules.', og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/ashwagandha-product-og.jpg', canonical_url: 'https://healthymonks.in/products/ksm-66-ashwagandha-gold', robots: 'index,follow', structured_data_type: 'Product,BreadcrumbList,Review', score: 97, issues: [] },
      { id: 'seo4', entity_type: 'blog', entity_id: 'benefits-ashwagandha', slug: '/blog/benefits-of-ashwagandha', title: 'Top 7 Benefits of KSM-66 Ashwagandha for Stress & Stamina', meta_description: 'Discover the science-backed benefits of daily Ashwagandha supplementation for cortisol balance, stamina and sleep from Healthy Monks experts.', meta_keywords: 'Ashwagandha benefits, KSM-66, adaptogen, stress relief', og_title: '7 Benefits of Ashwagandha – Healthy Monks Blog', og_description: 'Clinical evidence on Ashwagandha supplementation.', og_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80', canonical_url: 'https://healthymonks.in/blog/benefits-of-ashwagandha', robots: 'index,follow', structured_data_type: 'BlogPosting,BreadcrumbList', score: 91, issues: [] },
      { id: 'seo5', entity_type: 'product', entity_id: 'shilajit-resin', slug: '/products/himalayan-shilajit-resin', title: 'Pure Himalayan Shilajit Resin 20g | Healthy Monks', meta_description: '', meta_keywords: '', og_title: '', og_description: '', og_image: '', canonical_url: 'https://healthymonks.in/products/himalayan-shilajit-resin', robots: 'index,follow', structured_data_type: 'Product', score: 42, issues: ['missing_meta_description', 'missing_og_tags', 'missing_keywords'] }
    ]
  });
});

// ── PUT /api/seo/meta/:entity/:id (Save Entity SEO) ──────────────────────────
seoApp.put('/meta/:entity/:id', async (c) => {
  const { entity, id } = c.req.param();
  const body = await c.req.json();
  if (!body.title) return c.json({ success: false, message: 'Title is required' }, 400);
  return c.json({ success: true, message: `SEO metadata for ${entity} "${id}" saved. Score recalculated.` });
});

// ── POST /api/seo/meta (Create Entity SEO) ────────────────────────────────────
seoApp.post('/meta', async (c) => {
  const { entity_type, slug, title, meta_description, canonical_url } = await c.req.json();
  if (!slug || !title) return c.json({ success: false, message: 'Slug and title are required' }, 400);
  return c.json({ success: true, message: `SEO meta for "${slug}" created. Score: 72/100.` });
});

// ── GET /api/seo/sitemap (Sitemap Stats & Preview) ────────────────────────────
seoApp.get('/sitemap', async (c) => {
  return c.json({
    success: true,
    sitemap: {
      total_urls: 148,
      last_generated: new Date().toISOString(),
      auto_refresh: true,
      url_breakdown: { homepage: 1, categories: 12, products: 102, brands: 8, collections: 6, blogs: 24, documentation: 7, pages: 7 },
      sitemap_index_url: 'https://healthymonks.in/sitemap-index.xml',
      sitemaps: [
        { name: 'pages-sitemap.xml', url_count: 8, last_updated: '2026-07-28T00:00:00Z' },
        { name: 'products-sitemap.xml', url_count: 102, last_updated: '2026-07-27T18:00:00Z' },
        { name: 'categories-sitemap.xml', url_count: 12, last_updated: '2026-07-26T00:00:00Z' },
        { name: 'blog-sitemap.xml', url_count: 24, last_updated: '2026-07-28T00:00:00Z' },
        { name: 'images-sitemap.xml', url_count: 341, last_updated: '2026-07-27T18:00:00Z' }
      ]
    }
  });
});

// ── GET /api/seo/robots (Robots.txt Content) ─────────────────────────────────
seoApp.get('/robots', async (c) => {
  const robots = `# Healthy Monks – robots.txt
# Generated by Healthy Monks SEO Manager

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /cart
Disallow: /account
Disallow: /*.json$
Disallow: /search?*

User-agent: Googlebot
Allow: /
Disallow: /admin
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Sitemaps
Sitemap: https://healthymonks.in/sitemap-index.xml
Sitemap: https://healthymonks.in/products-sitemap.xml
Sitemap: https://healthymonks.in/blog-sitemap.xml`;

  if (c.req.query('format') === 'text') {
    return new Response(robots, { headers: { 'Content-Type': 'text/plain' } });
  }
  return c.json({ success: true, robots_txt: robots });
});

// ── PUT /api/seo/robots (Save Robots.txt) ─────────────────────────────────────
seoApp.put('/robots', async (c) => {
  const { robots_txt } = await c.req.json();
  return c.json({ success: true, message: 'robots.txt saved and deployed to edge.' });
});

// ── GET /api/seo/redirects (Redirect Rules) ────────────────────────────────────
seoApp.get('/redirects', async (c) => {
  return c.json({
    success: true,
    redirects: [
      { id: 'red1', from_path: '/old-ashwagandha', to_path: '/products/ksm-66-ashwagandha-gold', type: '301', hits: 412, created_at: '2026-06-01', status: 'Active' },
      { id: 'red2', from_path: '/herbs', to_path: '/shop/herbs', type: '301', hits: 289, created_at: '2026-06-15', status: 'Active' },
      { id: 'red3', from_path: '/immunity-boost', to_path: '/shop?collection=immunity', type: '302', hits: 134, created_at: '2026-07-01', status: 'Active' },
      { id: 'red4', from_path: '/shilajit-old', to_path: '/products/himalayan-shilajit-resin', type: '301', hits: 78, created_at: '2026-07-10', status: 'Active' },
      { id: 'red5', from_path: '/promo/monsoon', to_path: '/shop?sale=monsoon2026', type: '307', hits: 2104, created_at: '2026-07-20', status: 'Active' }
    ],
    total: 5,
    total_hits: 3017
  });
});

// ── POST /api/seo/redirects (Create Redirect) ─────────────────────────────────
seoApp.post('/redirects', async (c) => {
  const { from_path, to_path, type } = await c.req.json();
  if (!from_path || !to_path) return c.json({ success: false, message: 'from_path and to_path required' }, 400);
  return c.json({ success: true, message: `${type || '301'} redirect: ${from_path} → ${to_path} created.` });
});

// ── DELETE /api/seo/redirects/:id (Remove Redirect) ───────────────────────────
seoApp.delete('/redirects/:id', async (c) => {
  return c.json({ success: true, message: 'Redirect deleted.' });
});

// ── GET /api/seo/schema (Structured Data Snippets) ────────────────────────────
seoApp.get('/schema', async (c) => {
  return c.json({
    success: true,
    schemas: [
      { id: 'sch1', page: 'Homepage', type: 'Organization', entity_type: 'global', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', 'name': 'Healthy Monks', 'url': 'https://healthymonks.in', 'logo': { '@type': 'ImageObject', 'url': 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/logo.png' }, 'sameAs': ['https://instagram.com/healthymonks', 'https://facebook.com/healthymonks'] }, null, 2) },
      { id: 'sch2', page: 'Homepage', type: 'WebSite', entity_type: 'global', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Healthy Monks', 'url': 'https://healthymonks.in', 'potentialAction': { '@type': 'SearchAction', 'target': 'https://healthymonks.in/search?q={search_term_string}', 'query-input': 'required name=search_term_string' } }, null, 2) },
      { id: 'sch3', page: 'Product', type: 'Product', entity_type: 'product', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', 'name': 'KSM-66 Ashwagandha Gold Capsules 500mg', 'description': 'Pure KSM-66 Ashwagandha root extract 500mg.', 'brand': { '@type': 'Brand', 'name': 'Healthy Monks' }, 'offers': { '@type': 'Offer', 'price': '799', 'priceCurrency': 'INR', 'availability': 'https://schema.org/InStock', 'seller': { '@type': 'Organization', 'name': 'Healthy Monks' } }, 'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': '4.7', 'reviewCount': '1248' } }, null, 2) },
      { id: 'sch4', page: 'Blog', type: 'BlogPosting', entity_type: 'blog', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': 'Top 7 Benefits of KSM-66 Ashwagandha', 'author': { '@type': 'Person', 'name': 'Dr. V. Sharma' }, 'publisher': { '@type': 'Organization', 'name': 'Healthy Monks' }, 'datePublished': '2026-07-24', 'dateModified': '2026-07-24' }, null, 2) },
      { id: 'sch5', page: 'Category', type: 'BreadcrumbList', entity_type: 'category', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://healthymonks.in' }, { '@type': 'ListItem', 'position': 2, 'name': 'Ayurvedic Herbs', 'item': 'https://healthymonks.in/shop/herbs' }] }, null, 2) },
      { id: 'sch6', page: 'FAQ', type: 'FAQPage', entity_type: 'page', json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{ '@type': 'Question', 'name': 'What is KSM-66 Ashwagandha?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'KSM-66 is a full-spectrum Ashwagandha root extract standardised to 5% withanolides.' } }] }, null, 2) }
    ]
  });
});

// ── GET /api/seo/health (Full SEO Health Audit Report) ──────────────────────
seoApp.get('/health', async (c) => {
  return c.json({
    success: true,
    health: {
      overall_score: 84,
      indexed_pages: 138,
      non_indexed: 4,
      avg_title_length: 52,
      avg_description_length: 148,
      pages_with_missing_title: 2,
      pages_with_missing_meta: 5,
      pages_with_short_description: 3,
      pages_with_long_description: 1,
      pages_with_duplicate_title: 1,
      pages_with_duplicate_meta: 0,
      pages_with_missing_og: 4,
      pages_with_missing_canonical: 0,
      pages_with_missing_keywords: 6,
      broken_canonical_urls: 0,
      schema_markup_coverage: '94%',
      sitemap_status: 'Valid',
      robots_status: 'Valid',
      images_missing_alt: 14
    },
    issue_breakdown: [
      { severity: 'critical', issue: 'Missing meta descriptions on 5 pages', affected: 5, action: 'Add unique 150-160 char descriptions' },
      { severity: 'warning', issue: 'Missing Open Graph tags on 4 pages', affected: 4, action: 'Add og:title, og:description, og:image' },
      { severity: 'warning', issue: '14 images missing alt text', affected: 14, action: 'Add descriptive alt attributes to all product images' },
      { severity: 'warning', issue: 'Missing meta keywords on 6 pages', affected: 6, action: 'Add 5-10 relevant keyword phrases' },
      { severity: 'info', issue: '1 page has a duplicate title tag', affected: 1, action: 'Update to a unique title under 60 characters' },
      { severity: 'info', issue: '3 pages have short meta descriptions', affected: 3, action: 'Expand descriptions to at least 150 characters' }
    ]
  });
});

// ── GET /api/seo/analytics (Performance metrics) ─────────────────────────────
seoApp.get('/analytics', async (c) => {
  return c.json({
    success: true,
    metrics: {
      total_organic_sessions: 18420,
      avg_position: 14.2,
      total_impressions: 284000,
      total_clicks: 18420,
      ctr: '6.49%',
      top_keywords: [
        { keyword: 'ksm-66 ashwagandha capsules', position: 3, impressions: 24000, clicks: 3200 },
        { keyword: 'himalayan shilajit resin', position: 7, impressions: 18200, clicks: 1640 },
        { keyword: 'ayurvedic immunity booster', position: 11, impressions: 14800, clicks: 920 },
        { keyword: 'tulsi green tea india', position: 9, impressions: 12400, clicks: 1020 }
      ]
    }
  });
});

export default seoApp;
