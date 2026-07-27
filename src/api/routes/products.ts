import { Hono } from 'hono';
import { Env, queryAll, queryFirst } from '../db';

const productsApp = new Hono<{ Bindings: Env }>();

// Get all active categories
productsApp.get('/categories', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, categories: getFallbackCategories() });
  const categories = await queryAll(c.env.DB, 'SELECT * FROM categories WHERE status = "active" ORDER BY name ASC');
  return c.json({ success: true, categories });
});

// Get products list with filtering (category_id, featured, bestseller, search)
productsApp.get('/products', async (c) => {
  const categoryId = c.req.query('category_id');
  const featured = c.req.query('featured');
  const bestseller = c.req.query('bestseller');
  const trending = c.req.query('trending');
  const search = c.req.query('q');

  if (!c.env?.DB) {
    let prods = getFallbackProducts();
    if (categoryId) prods = prods.filter(p => p.category_id === Number(categoryId));
    if (featured === '1') prods = prods.filter(p => p.is_featured === 1);
    if (bestseller === '1') prods = prods.filter(p => p.is_bestseller === 1);
    if (trending === '1') prods = prods.filter(p => p.is_trending === 1);
    if (search) prods = prods.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    return c.json({ success: true, products: prods });
  }

  let sql = 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = "active"';
  const params: any[] = [];

  if (categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(Number(categoryId));
  }
  if (featured === '1') {
    sql += ' AND p.is_featured = 1';
  }
  if (bestseller === '1') {
    sql += ' AND p.is_bestseller = 1';
  }
  if (trending === '1') {
    sql += ' AND p.is_trending = 1';
  }
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.short_description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY p.id DESC';
  const products = await queryAll(c.env.DB, sql, params);

  // Parse images JSON for each product
  const formatted = products.map(p => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
  }));

  return c.json({ success: true, products: formatted });
});

// Get single product detail by slug with variants & approved reviews
productsApp.get('/products/:slug', async (c) => {
  const slug = c.req.param('slug');

  if (!c.env?.DB) {
    const product = getFallbackProducts().find(p => p.slug === slug);
    if (!product) return c.json({ success: false, message: 'Product not found' }, 404);
    const variants = getFallbackVariants().filter(v => v.product_id === product.id);
    const reviews = getFallbackReviews().filter(r => r.product_id === product.id);
    return c.json({ success: true, product: { ...product, variants, reviews } });
  }

  const product = await queryFirst(
    c.env.DB,
    'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.status = "active"',
    [slug]
  );

  if (!product) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }

  product.images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

  const variants = await queryAll(
    c.env.DB,
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC',
    [product.id]
  );

  const reviews = await queryAll(
    c.env.DB,
    'SELECT * FROM reviews WHERE product_id = ? AND status = "approved" ORDER BY created_at DESC',
    [product.id]
  );

  return c.json({
    success: true,
    product: {
      ...product,
      variants,
      reviews
    }
  });
});

export default productsApp;

// Fallbacks for local offline mode if D1 is not initialized
function getFallbackCategories() {
  return [
    { id: 1, name: 'Immunity Boosters', slug: 'immunity-boosters', description: 'Natural herbs for immunity', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', status: 'active' },
    { id: 2, name: 'Organic Teas & Infusions', slug: 'organic-teas', description: 'Herbal teas for detox & wellness', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', status: 'active' },
    { id: 3, name: 'Ayurvedic Churna & Powders', slug: 'ayurvedic-powders', description: 'Pure ground root powders', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80', status: 'active' },
    { id: 4, name: 'Superfoods & Seeds', slug: 'superfoods-seeds', description: 'Chia, flax & raw seeds', image_url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', status: 'active' }
  ];
}

function getFallbackProducts() {
  return [
    {
      id: 1, category_id: 1, category_name: 'Immunity Boosters', title: 'Organic Ashwagandha Root Powder', slug: 'organic-ashwagandha-powder', sku: 'HM-ASH-001',
      short_description: 'Rejuvenating stress-relief herbal formula',
      full_description: 'Pure KSM-66 grade Ashwagandha root powder to support stamina, calm the mind, and restore vitality naturally.',
      base_price: 499, discount_price: 399, stock_quantity: 150,
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'],
      is_featured: 1, is_bestseller: 1, is_trending: 1, status: 'active'
    },
    {
      id: 2, category_id: 1, category_name: 'Immunity Boosters', title: 'Chyawanprash Awaleha (Special Formula)', slug: 'chyawanprash-awaleha-special', sku: 'HM-CHY-002',
      short_description: 'Traditional 45+ herb Amla immunity tonic',
      full_description: 'Enriched with raw forest honey, Amla, saffron, and pure cow ghee. Boosts seasonal resistance and daily vigor.',
      base_price: 699, discount_price: 599, stock_quantity: 85,
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
      is_featured: 1, is_bestseller: 1, is_trending: 0, status: 'active'
    },
    {
      id: 3, category_id: 2, category_name: 'Organic Teas & Infusions', title: 'Himalayan Tulsi Green Tea', slug: 'himalayan-tulsi-green-tea', sku: 'HM-TEA-003',
      short_description: 'Antioxidant rich whole leaf green tea with 3 varieties of Tulsi',
      full_description: 'Handpicked high-altitude green tea blended with Rama, Krishna, and Vana Tulsi for deep detox and throat wellness.',
      base_price: 349, discount_price: 279, stock_quantity: 200,
      images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'],
      is_featured: 1, is_bestseller: 0, is_trending: 1, status: 'active'
    },
    {
      id: 4, category_id: 3, category_name: 'Ayurvedic Churna & Powders', title: 'Raw Organic Triphala Powder', slug: 'raw-organic-triphala-powder', sku: 'HM-TRI-004',
      short_description: 'Balanced digestive & gut cleansing formula',
      full_description: 'Combination of Amla, Haritaki, and Bibhitaki for gentle colon cleaning, digestive regularity, and skin radiance.',
      base_price: 399, discount_price: 299, stock_quantity: 120,
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'],
      is_featured: 0, is_bestseller: 1, is_trending: 1, status: 'active'
    },
    {
      id: 5, category_id: 4, category_name: 'Superfoods & Seeds', title: 'Raw Organic Chia Seeds', slug: 'raw-organic-chia-seeds', sku: 'HM-CHI-005',
      short_description: 'High Omega-3 & Fiber plant protein',
      full_description: 'Premium white and black chia seeds loaded with dietary fiber, calcium, and plant protein for smoothie bowls.',
      base_price: 299, discount_price: 219, stock_quantity: 300,
      images: ['https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'],
      is_featured: 1, is_bestseller: 0, is_trending: 0, status: 'active'
    }
  ];
}

function getFallbackVariants() {
  return [
    { id: 1, product_id: 1, variant_name: '250g Jar', sku: 'HM-ASH-001-250G', price: 399, stock_quantity: 100 },
    { id: 2, product_id: 1, variant_name: '500g Value Pack', sku: 'HM-ASH-001-500G', price: 699, stock_quantity: 50 },
    { id: 3, product_id: 2, variant_name: '500g Glass Jar', sku: 'HM-CHY-002-500G', price: 599, stock_quantity: 50 },
    { id: 4, product_id: 2, variant_name: '1kg Family Bucket', sku: 'HM-CHY-002-1KG', price: 1099, stock_quantity: 35 },
    { id: 5, product_id: 3, variant_name: '100g Tin Box', sku: 'HM-TEA-003-100G', price: 279, stock_quantity: 120 },
    { id: 6, product_id: 3, variant_name: '250g Refill Pouch', sku: 'HM-TEA-003-250G', price: 549, stock_quantity: 80 }
  ];
}

function getFallbackReviews() {
  return [
    { id: 1, product_id: 1, customer_name: 'Rohan Verma', rating: 5, comment: 'Remarkable quality Ashwagandha! Improved my sleep quality and energy levels within 10 days.', is_verified_purchase: 1, status: 'approved', created_at: '2026-07-20' },
    { id: 2, product_id: 2, customer_name: 'Priya S.', rating: 5, comment: 'Tastes like authentic grandma chyawanprash! Real saffron aroma and pure honey texture.', is_verified_purchase: 1, status: 'approved', created_at: '2026-07-21' },
    { id: 3, product_id: 3, customer_name: 'Ananya Sen', rating: 4, comment: 'Very refreshing Tulsi flavor. I drink two cups daily while working.', is_verified_purchase: 1, status: 'approved', created_at: '2026-07-22' }
  ];
}
