import { Hono } from 'hono';
import { Env, queryAll, queryFirst, executeRun } from '../db';

const brandsApp = new Hono<{ Bindings: Env }>();

// ── BRANDS ───────────────────────────────────────────────────────────────────

brandsApp.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const status = c.req.query('status') || '';
  const featured = c.req.query('featured') || '';
  const sort = c.req.query('sort') || 'name';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM brands WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (q) { sql += ' AND (name LIKE ? OR slug LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (featured === '1') { sql += ' AND is_featured = 1'; }
    sql += ` ORDER BY ${sort === 'products' ? 'product_count' : sort === 'created' ? 'created_at' : 'name'} ASC`;
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, brands: rows });
  }
  return c.json({ success: true, brands: mockBrands() });
});

brandsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const brand = await queryFirst(c.env.DB, 'SELECT * FROM brands WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!brand) return c.json({ success: false, message: 'Brand not found' }, 404);
    return c.json({ success: true, brand });
  }
  return c.json({ success: true, brand: mockBrands().find(b => b.id === id) });
});

brandsApp.post('/', async (c) => {
  const body = await c.req.json();
  const { name, slug, description, logo_url, banner_url, website, country, status = 'active', is_featured = 0, meta_title, meta_description, meta_keywords } = body;
  if (!name) return c.json({ success: false, message: 'Brand name is required' }, 400);
  const id = `brand_${Date.now()}`;
  const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO brands (id, name, slug, description, logo_url, banner_url, website, country, status, is_featured, meta_title, meta_description, meta_keywords) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, autoSlug, description||'', logo_url||'', banner_url||'', website||'', country||'', status, is_featured, meta_title||name, meta_description||description||'', meta_keywords||'']
    );
  }
  return c.json({ success: true, message: `Brand "${name}" created`, brand: { id, name, slug: autoSlug } });
});

brandsApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, slug, description, logo_url, banner_url, website, country, status, is_featured, meta_title, meta_description, meta_keywords } = body;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE brands SET name=COALESCE(?,name), slug=COALESCE(?,slug), description=COALESCE(?,description), logo_url=COALESCE(?,logo_url), banner_url=COALESCE(?,banner_url), website=COALESCE(?,website), country=COALESCE(?,country), status=COALESCE(?,status), is_featured=COALESCE(?,is_featured), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description), meta_keywords=COALESCE(?,meta_keywords), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name,slug,description,logo_url,banner_url,website,country,status,is_featured,meta_title,meta_description,meta_keywords,id]
    );
  }
  return c.json({ success: true, message: 'Brand updated' });
});

brandsApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE brands SET deleted_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
  }
  return c.json({ success: true, message: 'Brand deleted' });
});

brandsApp.post('/:id/restore', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE brands SET deleted_at=NULL WHERE id=?', [id]);
  }
  return c.json({ success: true, message: 'Brand restored' });
});

brandsApp.post('/:id/duplicate', async (c) => {
  const id = c.req.param('id');
  let brand: any = null;
  if (c.env?.DB) {
    brand = await queryFirst(c.env.DB, 'SELECT * FROM brands WHERE id=?', [id]);
  }
  if (!brand) return c.json({ success: false, message: 'Brand not found' }, 404);
  const newId = `brand_${Date.now()}`;
  const newSlug = `${brand.slug}-copy-${Date.now().toString().slice(-4)}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO brands (id, name, slug, description, logo_url, banner_url, website, country, status, meta_title, meta_description) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [newId, `${brand.name} (Copy)`, newSlug, brand.description, brand.logo_url, brand.banner_url, brand.website, brand.country, 'draft', brand.meta_title, brand.meta_description]
    );
  }
  return c.json({ success: true, message: 'Brand duplicated', id: newId });
});

// ── MANUFACTURERS ─────────────────────────────────────────────────────────────

const mfgApp = new Hono<{ Bindings: Env }>();

mfgApp.get('/', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM manufacturers WHERE deleted_at IS NULL ORDER BY name ASC');
    return c.json({ success: true, manufacturers: rows });
  }
  return c.json({ success: true, manufacturers: mockManufacturers() });
});

mfgApp.post('/', async (c) => {
  const { name, contact_name, email, phone, website, country, address, logo_url, description, status = 'active' } = await c.req.json();
  if (!name) return c.json({ success: false, message: 'Manufacturer name is required' }, 400);
  const id = `mfg_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO manufacturers (id, name, contact_name, email, phone, website, country, address, logo_url, description, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, contact_name||'', email||'', phone||'', website||'', country||'', address||'', logo_url||'', description||'', status]
    );
  }
  return c.json({ success: true, message: `Manufacturer "${name}" created`, manufacturer: { id, name } });
});

mfgApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  if (c.env?.DB) {
    const { name, contact_name, email, phone, website, country, address, logo_url, description, status } = body;
    await executeRun(c.env.DB,
      'UPDATE manufacturers SET name=COALESCE(?,name), contact_name=COALESCE(?,contact_name), email=COALESCE(?,email), phone=COALESCE(?,phone), website=COALESCE(?,website), country=COALESCE(?,country), address=COALESCE(?,address), logo_url=COALESCE(?,logo_url), description=COALESCE(?,description), status=COALESCE(?,status) WHERE id=?',
      [name,contact_name,email,phone,website,country,address,logo_url,description,status,id]
    );
  }
  return c.json({ success: true, message: 'Manufacturer updated' });
});

mfgApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'UPDATE manufacturers SET deleted_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
  return c.json({ success: true, message: 'Manufacturer deleted' });
});

// ── COLLECTIONS ───────────────────────────────────────────────────────────────

const collectionsApp = new Hono<{ Bindings: Env }>();

collectionsApp.get('/', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY display_order ASC, name ASC');
    return c.json({ success: true, collections: rows });
  }
  return c.json({ success: true, collections: mockCollections() });
});

collectionsApp.post('/', async (c) => {
  const body = await c.req.json();
  const { name, slug, type = 'manual', description, thumbnail_url, banner_url, status = 'active', is_featured = 0, display_order = 0, rules, publish_at, expires_at, meta_title, meta_description } = body;
  if (!name) return c.json({ success: false, message: 'Collection name is required' }, 400);
  const id = `col_${Date.now()}`;
  const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO collections (id, name, slug, type, description, thumbnail_url, banner_url, status, is_featured, display_order, rules, publish_at, expires_at, meta_title, meta_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, autoSlug, type, description||'', thumbnail_url||'', banner_url||'', status, is_featured, display_order, JSON.stringify(rules||[]), publish_at||null, expires_at||null, meta_title||name, meta_description||'']
    );
  }
  return c.json({ success: true, message: `Collection "${name}" created`, collection: { id, name, slug: autoSlug } });
});

collectionsApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, slug, type, description, thumbnail_url, banner_url, status, is_featured, display_order, rules, publish_at, expires_at, meta_title, meta_description } = body;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE collections SET name=COALESCE(?,name), slug=COALESCE(?,slug), type=COALESCE(?,type), description=COALESCE(?,description), thumbnail_url=COALESCE(?,thumbnail_url), banner_url=COALESCE(?,banner_url), status=COALESCE(?,status), is_featured=COALESCE(?,is_featured), display_order=COALESCE(?,display_order), rules=COALESCE(?,rules), publish_at=COALESCE(?,publish_at), expires_at=COALESCE(?,expires_at), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name,slug,type,description,thumbnail_url,banner_url,status,is_featured,display_order,rules?JSON.stringify(rules):null,publish_at,expires_at,meta_title,meta_description,id]
    );
  }
  return c.json({ success: true, message: 'Collection updated' });
});

collectionsApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) await executeRun(c.env.DB, 'UPDATE collections SET deleted_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
  return c.json({ success: true, message: 'Collection deleted' });
});

collectionsApp.post('/:id/products', async (c) => {
  const collectionId = c.req.param('id');
  const { product_ids } = await c.req.json();
  if (c.env?.DB) {
    for (const pid of product_ids || []) {
      await executeRun(c.env.DB, 'INSERT OR IGNORE INTO collection_products (collection_id, product_id) VALUES (?,?)', [collectionId, pid]).catch(() => {});
    }
  }
  return c.json({ success: true, message: `${product_ids?.length || 0} products added to collection` });
});

// ── Mock data ─────────────────────────────────────────────────────────────────

function mockBrands() {
  return [
    { id: 'b1', name: 'Himalaya Herbals', slug: 'himalaya-herbals', description: 'India\'s leading herbal healthcare brand since 1930', logo_url: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=80&h=80&fit=crop', banner_url: '', website: 'https://himalayawellness.in', country: 'India', status: 'active', is_featured: 1, product_count: 12, meta_title: 'Himalaya Herbals Products', meta_description: 'Shop authentic Himalaya Herbals products', created_at: '2026-01-10T10:00:00Z' },
    { id: 'b2', name: 'Organic India', slug: 'organic-india', description: 'Pure & certified organic ayurvedic products', logo_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=80&h=80&fit=crop', banner_url: '', website: 'https://organicindia.com', country: 'India', status: 'active', is_featured: 1, product_count: 8, meta_title: 'Organic India Products', meta_description: 'Certified organic ayurveda from Organic India', created_at: '2026-01-15T10:00:00Z' },
    { id: 'b3', name: 'Patanjali Ayurved', slug: 'patanjali-ayurved', description: 'Natural and ayurvedic products by Baba Ramdev', logo_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&h=80&fit=crop', banner_url: '', website: 'https://patanjaliayurved.net', country: 'India', status: 'active', is_featured: 0, product_count: 15, meta_title: 'Patanjali Products', meta_description: 'Authentic Patanjali Ayurvedic products', created_at: '2026-02-01T10:00:00Z' },
    { id: 'b4', name: 'Healthy Monks', slug: 'healthy-monks', description: 'Our signature in-house wellness collection', logo_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=80&h=80&fit=crop', banner_url: '', website: 'https://healthymonks.in', country: 'India', status: 'active', is_featured: 1, product_count: 6, meta_title: 'Healthy Monks Brand', meta_description: 'Premium Healthy Monks branded wellness products', created_at: '2026-02-15T10:00:00Z' },
  ];
}

function mockManufacturers() {
  return [
    { id: 'mfg1', name: 'Arya Vaidya Pharmacy', contact_name: 'Dr. Suresh Sharma', email: 'contact@avp.in', phone: '+91 422 435 8258', website: 'https://avpayurveda.com', country: 'India', address: 'Coimbatore, Tamil Nadu, India', logo_url: '', description: 'Founded 1943. One of the oldest Ayurvedic pharmacies.', status: 'active', product_count: 4, created_at: '2026-01-10T10:00:00Z' },
    { id: 'mfg2', name: 'Dabur India Ltd.', contact_name: 'Rahul Garg', email: 'consumer@dabur.com', phone: '+91 11 2323 9200', website: 'https://dabur.com', country: 'India', address: 'Ghaziabad, Uttar Pradesh, India', logo_url: '', description: 'India\'s leading FMCG & Ayurveda Company.', status: 'active', product_count: 7, created_at: '2026-01-20T10:00:00Z' },
    { id: 'mfg3', name: 'Nagarjuna Herbal', contact_name: 'Priya Nair', email: 'info@nagarjunaherbal.com', phone: '+91 484 266 9400', website: 'https://nagarjunaherbal.com', country: 'India', address: 'Kochi, Kerala, India', logo_url: '', description: 'Classical Ayurvedic formulations from Kerala.', status: 'active', product_count: 3, created_at: '2026-02-01T10:00:00Z' },
  ];
}

function mockCollections() {
  return [
    { id: 'col1', name: 'New Arrivals', slug: 'new-arrivals', type: 'automatic', description: 'Freshly added products to our catalogue', thumbnail_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 1, product_count: 8, rules: JSON.stringify([{ field: 'created_at', operator: 'within_days', value: '30' }]), publish_at: null, expires_at: null, meta_title: 'New Arrivals – Healthy Monks', meta_description: 'Shop our latest arrivals in wellness', created_at: '2026-07-01T10:00:00Z' },
    { id: 'col2', name: 'Best Sellers', slug: 'best-sellers', type: 'automatic', description: 'Our most popular wellness products', thumbnail_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 2, product_count: 12, rules: JSON.stringify([{ field: 'sales_count', operator: 'greater_than', value: '100' }]), publish_at: null, expires_at: null, meta_title: 'Best Sellers – Healthy Monks', meta_description: 'Shop our bestselling ayurvedic products', created_at: '2026-07-01T10:00:00Z' },
    { id: 'col3', name: 'Immunity Boosters', slug: 'immunity-boosters', type: 'manual', description: 'Curated superfoods to strengthen your immune system', thumbnail_url: 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 3, product_count: 6, rules: '[]', publish_at: null, expires_at: null, meta_title: 'Immunity Boosters Collection', meta_description: 'Best immunity-boosting superfoods and herbs', created_at: '2026-07-05T10:00:00Z' },
    { id: 'col4', name: 'Flash Sale', slug: 'flash-sale', type: 'manual', description: '⚡ Limited time deals — up to 40% off!', thumbnail_url: 'https://images.unsplash.com/photo-1596543805442-2ad43b978248?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 4, product_count: 5, rules: '[]', publish_at: '2026-07-27T00:00:00Z', expires_at: '2026-07-31T23:59:59Z', meta_title: 'Flash Sale – Up to 40% Off', meta_description: 'Limited time discounts on top wellness products', created_at: '2026-07-25T10:00:00Z' },
    { id: 'col5', name: 'Premium Adaptogens', slug: 'premium-adaptogens', type: 'manual', description: 'Elite adaptogenic herbs for stress & energy', thumbnail_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', banner_url: '', status: 'active', is_featured: 0, display_order: 5, product_count: 4, rules: '[]', publish_at: null, expires_at: null, meta_title: 'Premium Adaptogens Collection', meta_description: 'Shop premium adaptogens for peak performance', created_at: '2026-07-10T10:00:00Z' },
  ];
}

export { brandsApp, mfgApp, collectionsApp };
