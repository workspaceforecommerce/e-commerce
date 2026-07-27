import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './db';
import productsApp from './routes/products';
import couponsApp from './routes/coupons';
import ordersApp from './routes/orders';
import adminApp from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors());

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'online',
    app: 'Healthy Monks PWA E-Commerce Engine',
    database: 'Cloudflare D1 SQL (ce356b20-7e8e-4ddc-8df3-bcf58441e306)',
    timestamp: new Date().toISOString()
  });
});

// Route Modules
app.route('/api', productsApp);
app.route('/api/coupons', couponsApp);
app.route('/api/orders', ordersApp);
app.route('/api/admin', adminApp);

export default app;
