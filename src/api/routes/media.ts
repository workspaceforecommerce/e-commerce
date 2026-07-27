import { Hono } from 'hono';
import { queryAll, queryFirst, executeRun } from '../db';

const mediaApp = new Hono<{ Bindings: { DB: D1Database; CLOUDINARY_CLOUD_NAME: string; CLOUDINARY_API_KEY: string; CLOUDINARY_API_SECRET: string } }>();

// ─── GET /media  (list all media, optional folder/type/q filters) ─────────────
mediaApp.get('/', async (c) => {
  const folder = c.req.query('folder') || '';
  const type = c.req.query('type') || '';
  const q = c.req.query('q') || '';
  const sort = c.req.query('sort') || 'created_at';
  const view = c.req.query('deleted') === '1';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params: any[] = [];
    if (view) { sql += ' AND deleted_at IS NOT NULL'; } else { sql += ' AND deleted_at IS NULL'; }
    if (folder) { sql += ' AND folder_id = ?'; params.push(folder); }
    if (type) { sql += ' AND mime_type LIKE ?'; params.push(`${type}/%`); }
    if (q) { sql += ' AND (original_name LIKE ? OR alt_text LIKE ? OR tags LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    sql += ` ORDER BY ${sort === 'name' ? 'original_name' : sort === 'size' ? 'file_size' : 'created_at'} DESC LIMIT 200`;
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, media: rows });
  }
  return c.json({ success: true, media: getMockMedia() });
});

// ─── GET /media/folders ──────────────────────────────────────────────────────
mediaApp.get('/folders', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM media_folders ORDER BY name ASC');
    return c.json({ success: true, folders: rows });
  }
  return c.json({ success: true, folders: getMockFolders() });
});

// ─── POST /media/folders ─────────────────────────────────────────────────────
mediaApp.post('/folders', async (c) => {
  const { name, parent_id } = await c.req.json();
  if (!name) return c.json({ success: false, message: 'Folder name required' }, 400);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'INSERT INTO media_folders (name, slug, parent_id) VALUES (?, ?, ?)', [name, slug, parent_id || null]);
    return c.json({ success: true, message: `Folder "${name}" created` });
  }
  return c.json({ success: true, message: `Folder "${name}" created`, folder: { id: Date.now(), name, slug } });
});

// ─── POST /media  (save metadata after Cloudinary upload) ────────────────────
mediaApp.post('/', async (c) => {
  const body = await c.req.json();
  const { url, public_id, original_name, mime_type, file_size, width, height, folder_id, alt_text, caption } = body;
  if (!url || !public_id) return c.json({ success: false, message: 'url and public_id are required' }, 400);

  const id = `media_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO media (id, url, public_id, original_name, mime_type, file_size, width, height, folder_id, alt_text, caption) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, url, public_id, original_name || 'untitled', mime_type || 'image/jpeg', file_size || 0, width || 0, height || 0, folder_id || null, alt_text || '', caption || '']
    );
  }
  const record = { id, url, public_id, original_name, mime_type, file_size, width, height, folder_id, alt_text, caption, created_at: new Date().toISOString(), is_favorite: 0, deleted_at: null };
  return c.json({ success: true, message: 'Media saved', media: record });
});

// ─── PATCH /media/:id  (update alt, caption, tags, name, folder) ─────────────
mediaApp.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const { alt_text, caption, original_name, tags, folder_id, is_favorite } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'UPDATE media SET alt_text=COALESCE(?,alt_text), caption=COALESCE(?,caption), original_name=COALESCE(?,original_name), tags=COALESCE(?,tags), folder_id=COALESCE(?,folder_id), is_favorite=COALESCE(?,is_favorite) WHERE id=?',
      [alt_text, caption, original_name, tags, folder_id, is_favorite, id]
    );
  }
  return c.json({ success: true, message: 'Media updated' });
});

// ─── DELETE /media/:id  (soft delete → recycle bin) ─────────────────────────
mediaApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE media SET deleted_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
  }
  return c.json({ success: true, message: 'Moved to recycle bin' });
});

// ─── POST /media/:id/restore ─────────────────────────────────────────────────
mediaApp.post('/:id/restore', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE media SET deleted_at=NULL WHERE id=?', [id]);
  }
  return c.json({ success: true, message: 'Media restored' });
});

// ─── Mock data ───────────────────────────────────────────────────────────────
function getMockMedia() {
  return [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', public_id: 'healthy_monks/ashwagandha-powder', original_name: 'ashwagandha-powder.jpg', mime_type: 'image/jpeg', file_size: 128400, width: 800, height: 600, folder_id: 'f1', alt_text: 'KSM-66 Ashwagandha Root Powder', caption: 'Premium grade adaptogen', tags: 'ashwagandha,powder,herb', is_favorite: 1, created_at: '2026-07-20T10:00:00Z', deleted_at: null },
    { id: 'm2', url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', public_id: 'healthy_monks/tulsi-tea', original_name: 'tulsi-green-tea.jpg', mime_type: 'image/jpeg', file_size: 96200, width: 800, height: 600, folder_id: 'f1', alt_text: 'Himalayan Tulsi Green Tea', caption: 'Certified organic', tags: 'tulsi,tea,green', is_favorite: 0, created_at: '2026-07-21T10:00:00Z', deleted_at: null },
    { id: 'm3', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', public_id: 'healthy_monks/moringa-powder', original_name: 'moringa-leaf-powder.jpg', mime_type: 'image/jpeg', file_size: 114300, width: 800, height: 600, folder_id: 'f2', alt_text: 'Organic Moringa Leaf Powder', caption: 'Rich in antioxidants', tags: 'moringa,superfood,green', is_favorite: 0, created_at: '2026-07-22T10:00:00Z', deleted_at: null },
    { id: 'm4', url: 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=400', public_id: 'healthy_monks/amla-powder', original_name: 'amla-vitamin-c.jpg', mime_type: 'image/jpeg', file_size: 88100, width: 800, height: 600, folder_id: 'f2', alt_text: 'Amla Indian Gooseberry Powder', caption: 'Natural Vitamin C source', tags: 'amla,vitamin-c,immunity', is_favorite: 1, created_at: '2026-07-23T10:00:00Z', deleted_at: null },
    { id: 'm5', url: 'https://images.unsplash.com/photo-1596543805442-2ad43b978248?w=400', public_id: 'healthy_monks/shilajit-resin', original_name: 'shilajit-pure-resin.jpg', mime_type: 'image/jpeg', file_size: 102500, width: 800, height: 600, folder_id: 'f1', alt_text: 'Pure Himalayan Shilajit Resin', caption: 'Gold grade fulvic acid', tags: 'shilajit,resin,mineral', is_favorite: 0, created_at: '2026-07-24T10:00:00Z', deleted_at: null },
    { id: 'm6', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', public_id: 'healthy_monks/banner-hero', original_name: 'homepage-hero-banner.jpg', mime_type: 'image/jpeg', file_size: 246000, width: 1920, height: 640, folder_id: 'f3', alt_text: 'Healthy Monks Homepage Hero Banner', caption: 'Main store banner', tags: 'banner,hero,cms', is_favorite: 0, created_at: '2026-07-25T10:00:00Z', deleted_at: null },
  ];
}

function getMockFolders() {
  return [
    { id: 'f1', name: 'Products', slug: 'products', parent_id: null, media_count: 3 },
    { id: 'f2', name: 'Superfoods', slug: 'superfoods', parent_id: 'f1', media_count: 2 },
    { id: 'f3', name: 'Banners & CMS', slug: 'banners-cms', parent_id: null, media_count: 1 },
    { id: 'f4', name: 'Blog Images', slug: 'blog-images', parent_id: null, media_count: 0 },
  ];
}

export default mediaApp;
