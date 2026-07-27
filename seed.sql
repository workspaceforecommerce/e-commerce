-- Healthy Monks Seed Data

-- 1. Initial Users (Passwords: 'admin123' and 'user123')
INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
(1, 'Admin Monk', 'admin@healthymonks.com', '+91 9876543210', 'scrypt_hashed_admin_pass', 'admin', 'active'),
(2, 'Sub Admin', 'subadmin@healthymonks.com', '+91 9876543211', 'scrypt_hashed_subadmin_pass', 'sub_admin', 'active'),
(3, 'Aarav Sharma', 'aarav@example.com', '+91 9812345678', 'scrypt_hashed_customer_pass', 'customer', 'active');

-- 2. Categories
INSERT INTO categories (id, parent_id, name, slug, description, image_url, status) VALUES
(1, NULL, 'Immunity Boosters', 'immunity-boosters', 'Natural herbs and extracts for strong immunity', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'active'),
(2, NULL, 'Organic Teas & Infusions', 'organic-teas', 'Herbal teas brewed for energy, sleep, and detox', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', 'active'),
(3, NULL, 'Ayurvedic Churna & Powders', 'ayurvedic-powders', 'Pure ground root powders and traditional blends', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80', 'active'),
(4, NULL, 'Superfoods & Seeds', 'superfoods-seeds', 'Nutrient-rich chia, flax, pumpkin, and raw seeds', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 'active');

-- 3. Products
INSERT INTO products (id, category_id, title, slug, sku, short_description, full_description, base_price, discount_price, stock_quantity, images, is_featured, is_bestseller, is_trending, status, meta_title, meta_description) VALUES
(1, 1, 'Organic Ashwagandha Root Powder', 'organic-ashwagandha-powder', 'HM-ASH-001', 'Rejuvenating stress-relief herbal formula', 'Pure KSM-66 grade Ashwagandha root powder to support stamina, calm the mind, and restore vitality naturally.', 499.00, 399.00, 150, '["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"]', 1, 1, 1, 'active', 'Organic Ashwagandha Root Powder - Healthy Monks', 'Buy 100% pure organic Ashwagandha powder online for anxiety and energy boost.'),

(2, 1, 'Chyawanprash Awaleha (Special Formula)', 'chyawanprash-awaleha-special', 'HM-CHY-002', 'Traditional 45+ herb Amla immunity tonic', 'Enriched with raw forest honey, Amla, saffron, and pure cow ghee. Boosts seasonal resistance and daily vigor.', 699.00, 599.00, 85, '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"]', 1, 1, 0, 'active', 'Ayurvedic Chyawanprash Awaleha - Healthy Monks', 'Pure handmade Amla Chyawanprash with raw honey and saffron.'),

(3, 2, 'Himalayan Tulsi Green Tea', 'himalayan-tulsi-green-tea', 'HM-TEA-003', 'Antioxidant rich whole leaf green tea with 3 varieties of Tulsi', 'Handpicked high-altitude green tea blended with Rama, Krishna, and Vana Tulsi for deep detox and throat wellness.', 349.00, 279.00, 200, '["https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"]', 1, 0, 1, 'active', 'Himalayan Tulsi Green Tea - Healthy Monks', 'Detoxifying whole leaf green tea with 3 holy basil varieties.'),

(4, 3, 'Raw Organic Triphala Powder', 'raw-organic-triphala-powder', 'HM-TRI-004', 'Balanced digestive & gut cleansing formula', 'Combination of Amla, Haritaki, and Bibhitaki for gentle colon cleaning, digestive regularity, and skin radiance.', 399.00, 299.00, 120, '["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"]', 0, 1, 1, 'active', 'Organic Triphala Powder - Gut Health & Detox', 'Buy organic Triphala powder for digestive health and gentle cleansing.'),

(5, 4, 'Raw Organic Chia Seeds', 'raw-organic-chia-seeds', 'HM-CHI-005', 'High Omega-3 & Fiber plant protein', 'Premium white and black chia seeds loaded with dietary fiber, calcium, and plant protein for smoothie bowls.', 299.00, 219.00, 300, '["https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80"]', 1, 0, 0, 'active', 'Organic Chia Seeds - Healthy Monks', 'Nutrient dense raw chia seeds for weight management & heart health.');

-- 4. Product Variants
INSERT INTO product_variants (id, product_id, variant_name, sku, price, stock_quantity, attributes) VALUES
(1, 1, '250g Jar', 'HM-ASH-001-250G', 399.00, 100, '{"weight": "250g"}'),
(2, 1, '500g Value Pack', 'HM-ASH-001-500G', 699.00, 50, '{"weight": "500g"}'),
(3, 2, '500g Glass Jar', 'HM-CHY-002-500G', 599.00, 50, '{"weight": "500g"}'),
(4, 2, '1kg Family Bucket', 'HM-CHY-002-1KG', 1099.00, 35, '{"weight": "1kg"}'),
(5, 3, '100g Tin Box', 'HM-TEA-003-100G', 279.00, 120, '{"weight": "100g"}'),
(6, 3, '250g Refill Pouch', 'HM-TEA-003-250G', 549.00, 80, '{"weight": "250g"}');

-- 5. Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, expiry_date, status) VALUES
(1, 'WELCOME100', 'flat', 100.00, 499.00, 100.00, 500, 12, '2026-12-31', 'active'),
(2, 'MONK15', 'percentage', 15.00, 799.00, 250.00, 200, 45, '2026-12-31', 'active'),
(3, 'DETOX20', 'percentage', 20.00, 999.00, 300.00, 100, 8, '2026-12-31', 'active');

-- 6. Couriers
INSERT INTO couriers (id, name, tracking_url_template, status) VALUES
(1, 'BlueDart Express', 'https://www.bluedart.com/tracking?track={tracking_number}', 'active'),
(2, 'Delhivery Logistics', 'https://www.delhivery.com/track/package/{tracking_number}', 'active'),
(3, 'DTDC Express', 'https://www.dtdc.in/tracking/shipment/{tracking_number}', 'active');

-- 7. Initial Orders
INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, city, pincode, payment_method, payment_status, order_status, subtotal, discount_amount, coupon_code, shipping_fee, total_amount, courier_id, tracking_number, cod_confirmed, invoice_number, notes) VALUES
(1, 'HM-ORD-1001', 3, 'Aarav Sharma', 'aarav@example.com', '+91 9812345678', '42 Lotus Heights, MG Road', 'Bengaluru', '560001', 'cod', 'pending', 'Processing', 678.00, 100.00, 'WELCOME100', 40.00, 618.00, 2, 'DEL123456789IN', 1, 'INV-2026-0001', 'Please deliver after 5 PM'),
(2, 'HM-ORD-1002', 3, 'Aarav Sharma', 'aarav@example.com', '+91 9812345678', '42 Lotus Heights, MG Road', 'Bengaluru', '560001', 'prepaid', 'paid', 'Delivered', 599.00, 0.00, NULL, 0.00, 599.00, 1, 'BD987654321IN', 1, 'INV-2026-0002', 'Leave with security guard');

-- 8. Order Items
INSERT INTO order_items (id, order_id, product_id, variant_id, product_title, variant_name, price, quantity, total_price) VALUES
(1, 1, 1, 1, 'Organic Ashwagandha Root Powder', '250g Jar', 399.00, 1, 399.00),
(2, 1, 3, 5, 'Himalayan Tulsi Green Tea', '100g Tin Box', 279.00, 1, 279.00),
(3, 2, 2, 3, 'Chyawanprash Awaleha (Special Formula)', '500g Glass Jar', 599.00, 1, 599.00);

-- 9. Banners
INSERT INTO banners (id, title, subtitle, image_url, link_url, section, status, sort_order) VALUES
(1, '100% Pure Organic Ayurvedic Wellness', 'Authentic Herbal Supplements & Immunity Boosters Handcrafted with Care', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', '/category/immunity-boosters', 'home_slider', 'active', 1),
(2, 'High Altitude Himalayan Green Tea', 'Fresh Whole Leaves Enriched with 3 Sacred Tulsi Varieties', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80', '/product/himalayan-tulsi-green-tea', 'home_slider', 'active', 2),
(3, 'Flat ₹100 Off On Your First Order', 'Use Code: WELCOME100 at Checkout', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1200&q=80', '/category/superfoods-seeds', 'offer_banner', 'active', 3);

-- 10. Reviews & Testimonials
INSERT INTO reviews (id, product_id, customer_name, rating, comment, is_verified_purchase, status) VALUES
(1, 1, 'Rohan Verma', 5, 'Remarkable quality Ashwagandha! Improved my sleep quality and energy levels within 10 days.', 1, 'approved'),
(2, 2, 'Priya S.', 5, 'Tastes like authentic grandma chyawanprash! Real saffron aroma and pure honey texture.', 1, 'approved'),
(3, 3, 'Ananya Sen', 4, 'Very refreshing Tulsi flavor. I drink two cups daily while working.', 1, 'approved');

-- 11. CMS Settings
INSERT INTO cms_settings (id, site_name, tagline, contact_phone, contact_email, address, whatsapp_number, google_maps_url, social_links, meta_title, meta_description) VALUES
(1, 'Healthy Monks', 'Pure Wellness & Organic Nutrition', '+91 9876543210', 'support@healthymonks.com', '123 Herbal Valley, Wellness City, India', '919876543210', 'https://maps.google.com', '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com"}', 'Healthy Monks - Organic Health & Ayurvedic Wellness Store', 'Shop 100% natural, organic ayurvedic herbs, health supplements, immunity boosters, and organic teas.');

-- 12. Initial API Logs
INSERT INTO api_logs (id, service_name, event_type, recipient, payload, response_status) VALUES
(1, 'SMS', 'OTP', '+91 9812345678', '{"otp": "482910"}', 'SUCCESS'),
(2, 'WhatsApp', 'OrderConfirmation', '+91 9812345678', '{"order_number": "HM-ORD-1001", "total": 618.00}', 'SUCCESS'),
(3, 'Courier', 'ShippingAlert', '+91 9812345678', '{"tracking_number": "DEL123456789IN", "courier": "Delhivery"}', 'SUCCESS');
