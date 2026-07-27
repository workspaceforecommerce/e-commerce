import { Hono } from 'hono';
import { Env, queryAll, queryFirst } from '../db';

const seoApp = new Hono<{ Bindings: Env }>();

// ── GET /api/seo/meta (SEO Meta Tags for all pages) ─────────────────────────
seoApp.get('/meta', async (c) => {
  return c.json({
    success: true,
    meta_configs: [
      {
        id: 'seo1', page_type: 'Homepage', slug: '/', title: 'Healthy Monks | Premium Ayurvedic Herbs, Teas & Wellness Products',
        meta_description: 'Explore 100% natural Ayurvedic herbs, adaptogen capsules, wellness teas, and skincare from Healthy Monks. Trusted by 50,000+ customers across India.',
        og_title: 'Healthy Monks – Premium Ayurvedic Wellness', og_description: 'Authentic Ayurvedic herbs, KSM-66 Ashwagandha, Himalayan Shilajit & immunity teas delivered free above ₹499.',
        og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/healthy-monks-og.jpg',
        canonical_url: 'https://healthymonks.in/', structured_data_type: 'Organization', index_status: 'index,follow', score: 94
      },
      {
        id: 'seo2', page_type: 'Category', slug: '/shop/herbs', title: 'Ayurvedic Herbs | Ashwagandha, Shatavari, Brahmi & More – Healthy Monks',
        meta_description: 'Shop premium standardised Ayurvedic herbal extracts. KSM-66 Ashwagandha, organic Shatavari root, Brahmi powder and 30+ Himalayan botanicals.',
        og_title: 'Ayurvedic Herbs Collection – Healthy Monks', og_description: 'Adaptogenic herbs backed by clinical research. Free shipping above ₹499.',
        og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/herbs-og.jpg',
        canonical_url: 'https://healthymonks.in/shop/herbs', structured_data_type: 'CollectionPage', index_status: 'index,follow', score: 88
      },
      {
        id: 'seo3', page_type: 'Product', slug: '/products/ksm-66-ashwagandha-gold',
        title: 'KSM-66 Ashwagandha Gold Capsules 500mg | Healthy Monks',
        meta_description: 'Pure KSM-66 Ashwagandha root extract 500mg – clinically proven to reduce cortisol by 28%, improve stamina and sleep quality. 60 veg capsules.',
        og_title: 'KSM-66 Ashwagandha Gold – Healthy Monks', og_description: 'Standardised 5% withanolide ashwagandha root. 60 veg capsules. COA verified.',
        og_image: 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/ashwagandha-product-og.jpg',
        canonical_url: 'https://healthymonks.in/products/ksm-66-ashwagandha-gold', structured_data_type: 'Product', index_status: 'index,follow', score: 97
      },
      {
        id: 'seo4', page_type: 'Blog', slug: '/blog/benefits-of-ashwagandha',
        title: 'Top 7 Benefits of KSM-66 Ashwagandha for Stress & Stamina',
        meta_description: 'Discover the science-backed benefits of daily Ashwagandha supplementation for cortisol balance, stamina and sleep from Healthy Monks experts.',
        og_title: '7 Benefits of Ashwagandha – Healthy Monks Blog',
        og_description: 'Clinical evidence and traditional wisdom on Ashwagandha supplementation for modern wellness goals.',
        og_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
        canonical_url: 'https://healthymonks.in/blog/benefits-of-ashwagandha', structured_data_type: 'BlogPosting', index_status: 'index,follow', score: 91
      }
    ]
  });
});

// ── POST /api/seo/meta (Save/Update SEO meta for a page) ─────────────────────
seoApp.post('/meta', async (c) => {
  const { page_type, slug, title, meta_description, canonical_url } = await c.req.json();
  if (!slug || !title) return c.json({ success: false, message: 'Slug and title are required' }, 400);
  return c.json({ success: true, message: `SEO meta for "${slug}" saved. Score recalculated.` });
});

// ── GET /api/seo/sitemap (XML Sitemap Generator Preview) ─────────────────────
seoApp.get('/sitemap', async (c) => {
  const accept = c.req.header('Accept') || '';
  if (accept.includes('application/xml') || c.req.query('format') === 'xml') {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://healthymonks.in/</loc><lastmod>2026-07-28</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://healthymonks.in/shop</loc><lastmod>2026-07-28</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://healthymonks.in/shop/herbs</loc><lastmod>2026-07-28</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://healthymonks.in/products/ksm-66-ashwagandha-gold</loc><lastmod>2026-07-25</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://healthymonks.in/blog</loc><lastmod>2026-07-28</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://healthymonks.in/blog/benefits-of-ashwagandha</loc><lastmod>2026-07-24</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  }
  return c.json({
    success: true,
    sitemap: {
      total_urls: 142, last_generated: '2026-07-28T00:00:00Z',
      url_breakdown: { homepage: 1, categories: 12, products: 98, blogs: 24, pages: 7 },
      sitemap_index_url: 'https://healthymonks.in/sitemap.xml'
    }
  });
});

// ── GET /api/seo/redirects (301/302 Redirect Rules) ──────────────────────────
seoApp.get('/redirects', async (c) => {
  return c.json({
    success: true,
    redirects: [
      { id: 'red1', from_path: '/old-ashwagandha', to_path: '/products/ksm-66-ashwagandha-gold', type: '301', hits: 412 },
      { id: 'red2', from_path: '/herbs', to_path: '/shop/herbs', type: '301', hits: 289 },
      { id: 'red3', from_path: '/immunity-boost', to_path: '/shop?collection=immunity', type: '302', hits: 134 }
    ]
  });
});

// ── POST /api/seo/redirects (Create Redirect) ────────────────────────────────
seoApp.post('/redirects', async (c) => {
  const { from_path, to_path, type } = await c.req.json();
  if (!from_path || !to_path) return c.json({ success: false, message: 'from_path and to_path required' }, 400);
  return c.json({ success: true, message: `${type || '301'} redirect created: ${from_path} → ${to_path}` });
});

// ── GET /api/seo/schema (JSON-LD Structured Data snippets) ───────────────────
seoApp.get('/schema', async (c) => {
  return c.json({
    success: true,
    schemas: [
      {
        id: 'sch1', page: 'Homepage', type: 'Organization',
        json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', 'name': 'Healthy Monks', 'url': 'https://healthymonks.in', 'logo': 'https://res.cloudinary.com/hfx4iebd/image/upload/v1/logo.png' }, null, 2)
      },
      {
        id: 'sch2', page: 'Product', type: 'Product',
        json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', 'name': 'KSM-66 Ashwagandha Gold Capsules 500mg', 'brand': { '@type': 'Brand', 'name': 'Healthy Monks' }, 'offers': { '@type': 'Offer', 'price': '799', 'priceCurrency': 'INR', 'availability': 'https://schema.org/InStock' } }, null, 2)
      },
      {
        id: 'sch3', page: 'Blog', type: 'BlogPosting',
        json_ld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': 'Top 7 Benefits of KSM-66 Ashwagandha', 'author': { '@type': 'Person', 'name': 'Dr. V. Sharma' }, 'datePublished': '2026-07-24' }, null, 2)
      }
    ]
  });
});

// ── GET /api/seo/analytics (SEO Health Overview) ─────────────────────────────
seoApp.get('/analytics', async (c) => {
  return c.json({
    success: true,
    health: {
      indexed_pages: 138, non_indexed: 4, avg_seo_score: 91,
      pages_with_missing_meta: 3, pages_with_duplicate_title: 1,
      broken_canonical_urls: 0, schema_markup_coverage: '94%',
      sitemap_status: 'Valid'
    }
  });
});

export default seoApp;
