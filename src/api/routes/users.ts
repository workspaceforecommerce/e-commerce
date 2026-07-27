import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const usersApp = new Hono<{ Bindings: Env }>();

// 1. Roles & Permissions Management
usersApp.get('/roles', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, roles: getFallbackRoles() });
  const roles = await queryAll(c.env.DB, 'SELECT * FROM roles ORDER BY id ASC');
  return c.json({ success: true, roles });
});

usersApp.post('/roles', async (c) => {
  const { name, description } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'INSERT INTO roles (name, description) VALUES (?, ?)', [name, description]);
  }
  return c.json({ success: true, message: `Role "${name}" created successfully` });
});

usersApp.put('/roles/:id', async (c) => {
  const id = c.req.param('id');
  const { name, description } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE roles SET name = ?, description = ? WHERE id = ?', [name, description, id]);
  }
  return c.json({ success: true, message: `Role #${id} updated successfully` });
});

usersApp.delete('/roles/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'DELETE FROM roles WHERE id = ?', [id]);
  }
  return c.json({ success: true, message: `Role #${id} deleted` });
});

// 2. User Accounts Management (RBAC)
usersApp.get('/users', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, users: getFallbackUsers() });
  const users = await queryAll(
    c.env.DB,
    'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.id DESC'
  );
  return c.json({ success: true, users });
});

usersApp.post('/users', async (c) => {
  const { role_id, first_name, last_name, email, phone, status = 'active' } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      'INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [role_id, first_name, last_name || '', email, phone || '', 'default_hash_2026', status]
    );
  }
  return c.json({ success: true, message: `User "${first_name} ${last_name}" created successfully` });
});

usersApp.put('/users/:id', async (c) => {
  const id = c.req.param('id');
  const { role_id, first_name, last_name, phone, status } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(
      c.env.DB,
      `UPDATE users SET
        role_id = COALESCE(?, role_id),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [role_id || null, first_name || null, last_name || null, phone || null, status || null, id]
    );
  }
  return c.json({ success: true, message: `User #${id} updated successfully` });
});

usersApp.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE users SET status = "banned", deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }
  return c.json({ success: true, message: `User #${id} deactivated` });
});

// 3. User Login Logs & Sessions
usersApp.get('/login-logs', async (c) => {
  if (!c.env?.DB) return c.json({ success: true, logs: getFallbackLoginLogs() });
  const logs = await queryAll(
    c.env.DB,
    'SELECT * FROM api_logs WHERE service_name = "AuthService" ORDER BY id DESC LIMIT 50'
  );
  return c.json({ success: true, logs });
});

export default usersApp;

function getFallbackRoles() {
  return [
    { id: 1, name: 'Super Admin', description: 'Full Unrestricted Platform Access' },
    { id: 2, name: 'Admin', description: 'Store Administration & Fulfillment Management' },
    { id: 3, name: 'Customer', description: 'E-Commerce Shopper Account' },
    { id: 4, name: 'Inventory Manager', description: 'Stock & Product Catalog Controller' },
    { id: 5, name: 'Order Manager', description: 'Fulfillment & Logistics Controller' },
    { id: 6, name: 'Marketing Manager', description: 'Coupons, Banners & Push Campaigns' },
    { id: 7, name: 'Customer Support', description: 'Order Tracking & Support Escalations' }
  ];
}

function getFallbackUsers() {
  return [
    { id: 1, first_name: 'Super', last_name: 'Admin', email: 'admin@healthymonks.com', phone: '+91 9812345678', role_name: 'Super Admin', status: 'active', created_at: '2026-07-27' },
    { id: 2, first_name: 'Aarav', last_name: 'Sharma', email: 'aarav@example.com', phone: '+91 9876543210', role_name: 'Customer', status: 'active', created_at: '2026-07-26' },
    { id: 3, first_name: 'Vikram', last_name: 'Singh', email: 'inventory@healthymonks.com', phone: '+91 9811122233', role_name: 'Inventory Manager', status: 'active', created_at: '2026-07-25' }
  ];
}

function getFallbackLoginLogs() {
  return [
    { id: 1, service_name: 'AuthService', event_type: 'UserLogin', recipient: 'admin@healthymonks.com', payload: '{"ip": "103.21.244.1", "device": "Chrome Windows"}', response_status: 'SUCCESS', created_at: '2026-07-27 12:00:00' },
    { id: 2, service_name: 'AuthService', event_type: 'UserLogin', recipient: 'aarav@example.com', payload: '{"ip": "49.207.200.5", "device": "PWA Android"}', response_status: 'SUCCESS', created_at: '2026-07-27 11:30:00' }
  ];
}
