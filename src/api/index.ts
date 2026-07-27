import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './db';
import productsApp from './routes/products';
import couponsApp from './routes/coupons';
import ordersApp from './routes/orders';
import adminApp from './routes/admin';
import cloudinaryApp from './routes/cloudinary';
import authApp from './routes/auth';
import usersApp from './routes/users';
import dashboardApp from './routes/dashboard';
import { variantApp } from './routes/variants';
import mediaApp from './routes/media';
import { brandsApp, mfgApp, collectionsApp } from './routes/brands';
import reviewsApp from './routes/reviews';
import cartApp from './routes/cart';
import wishlistApp from './routes/wishlist';
import addressesApp from './routes/addresses';
import checkoutApp from './routes/checkout';
import paymentsApp from './routes/payments';
import shippingApp from './routes/shipping';
import returnsApp from './routes/returns';
import invoicesApp from './routes/invoices';
import notificationsApp from './routes/notifications';
import customersApp from './routes/customers';
import staffApp from './routes/staff';
import ticketsApp from './routes/tickets';
import loyaltyApp from './routes/loyalty';
import analyticsApp from './routes/analytics';
import cmsApp from './routes/cms';

const app = new Hono<{ Bindings: Env }>();

// Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
});

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Root Engine Endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    name: 'Healthy Monks Enterprise E-Commerce API Engine',
    version: '1.0.0',
    status: 'online',
    database: 'Cloudflare D1 SQL (Healthy Monks D1 Database)',
    cloudinary: 'Configured (Cloud: hfx4iebd)',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      customers: '/api/customers',
      staff: '/api/staff',
      tickets: '/api/tickets',
      loyalty: '/api/loyalty',
      analytics: '/api/analytics',
      payments: '/api/payments',
      shipping: '/api/shipping',
      returns: '/api/returns',
      invoices: '/api/invoices',
      notifications: '/api/notifications'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (c) => {
  return c.json({
    success: true,
    message: 'Healthy Monks E-Commerce REST API Engine',
    health: '/api/health'
  });
});

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'online',
    app: 'Healthy Monks Security-Hardened PWA Engine',
    database: 'Cloudflare D1 SQL (Prepared Statements)',
    cloudinary: 'Configured (Cloud: hfx4iebd)',
    ssl: 'Enforced (HSTS enabled)',
    timestamp: new Date().toISOString()
  });
});

// Register API Domain Modules
app.route('/api/dashboard', dashboardApp);
app.route('/api/auth', authApp);
app.route('/api/users', usersApp);
app.route('/api/products', productsApp);
app.route('/api/variants', variantApp);
app.route('/api/coupons', couponsApp);
app.route('/api/orders', ordersApp);
app.route('/api/admin', adminApp);
app.route('/api/cloudinary', cloudinaryApp);
app.route('/api/media', mediaApp);
app.route('/api/brands', brandsApp);
app.route('/api/manufacturers', mfgApp);
app.route('/api/collections', collectionsApp);
app.route('/api/reviews', reviewsApp);
app.route('/api/cart', cartApp);
app.route('/api/wishlist', wishlistApp);
app.route('/api/addresses', addressesApp);
app.route('/api/checkout', checkoutApp);
app.route('/api/payments', paymentsApp);
app.route('/api/shipping', shippingApp);
app.route('/api/returns', returnsApp);
app.route('/api/invoices', invoicesApp);
app.route('/api/notifications', notificationsApp);
app.route('/api/customers', customersApp);
app.route('/api/staff', staffApp);
app.route('/api/tickets', ticketsApp);
app.route('/api/loyalty', loyaltyApp);
app.route('/api/analytics', analyticsApp);
app.route('/api/cms', cmsApp);

export default app;
