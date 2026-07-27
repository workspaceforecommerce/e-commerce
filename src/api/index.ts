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

export default app;

