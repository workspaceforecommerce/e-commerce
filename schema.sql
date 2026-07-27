-- Healthy Monks D1 Database Schema
-- Compatible with Cloudflare D1 (SQLite)

DROP TABLE IF EXISTS api_logs;
DROP TABLE IF EXISTS cms_settings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS abandoned_carts;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS couriers;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'sub_admin', 'customer'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories & Sub-Categories Table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER DEFAULT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Products Table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    base_price REAL NOT NULL,
    discount_price REAL DEFAULT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    images JSON NOT NULL DEFAULT '[]', -- JSON array of image URLs
    is_featured INTEGER NOT NULL DEFAULT 0, -- 1 for featured, 0 otherwise
    is_bestseller INTEGER NOT NULL DEFAULT 0,
    is_trending INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    meta_title TEXT,
    meta_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Product Variants Table
CREATE TABLE product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    variant_name TEXT NOT NULL, -- e.g., '500g', '1kg', 'Pack of 2'
    sku TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes JSON DEFAULT '{}', -- e.g., {"weight": "500g", "flavour": "Tulsi"}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Promo Coupons Table
CREATE TABLE coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- 'flat', 'percentage'
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_discount_amount REAL DEFAULT NULL,
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    expiry_date DATETIME,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Couriers Table
CREATE TABLE couriers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tracking_url_template TEXT NOT NULL, -- e.g. 'https://track.courier.com/shipment/{tracking_number}'
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    user_id INTEGER DEFAULT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'cod', 'prepaid', 'upi', 'card'
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    order_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    coupon_code TEXT DEFAULT NULL,
    shipping_fee REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    courier_id INTEGER DEFAULT NULL,
    tracking_number TEXT DEFAULT NULL,
    cod_confirmed INTEGER DEFAULT 0,
    invoice_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE SET NULL
);

-- 8. Order Items Table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variant_id INTEGER DEFAULT NULL,
    product_title TEXT NOT NULL,
    variant_name TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 9. Abandoned Carts / Unpaid Orders Table
CREATE TABLE abandoned_carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    cart_data JSON NOT NULL,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Banners Table (CMS Panel)
CREATE TABLE banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    section TEXT NOT NULL DEFAULT 'home_slider', -- 'home_slider', 'offer_banner', 'category_banner'
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER DEFAULT 0
);

-- 11. Product Reviews & Testimonials Table
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER DEFAULT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    is_verified_purchase INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. CMS Settings Table
CREATE TABLE cms_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT DEFAULT 'Healthy Monks',
    tagline TEXT DEFAULT 'Pure Wellness & Organic Nutrition',
    contact_phone TEXT DEFAULT '+91 9876543210',
    contact_email TEXT DEFAULT 'support@healthymonks.com',
    address TEXT DEFAULT '123 Herbal Valley, Wellness City, India',
    whatsapp_number TEXT DEFAULT '919876543210',
    google_maps_url TEXT,
    social_links JSON DEFAULT '{}',
    meta_title TEXT DEFAULT 'Healthy Monks - Organic Health & Ayurvedic Wellness Store',
    meta_description TEXT DEFAULT 'Shop 100% natural, organic ayurvedic herbs, health supplements, immunity boosters, and organic teas.',
    robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /'
);

-- 13. API Logs Table (SMS, WhatsApp, Delivery, Push)
CREATE TABLE api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL, -- 'SMS', 'WhatsApp', 'Courier', 'WebPush'
    event_type TEXT NOT NULL, -- 'OTP', 'OrderConfirmation', 'ShippingAlert', 'AbandonedCartReminder'
    recipient TEXT NOT NULL,
    payload TEXT,
    response_status TEXT NOT NULL DEFAULT 'SUCCESS',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_variants_product ON product_variants(product_id);
