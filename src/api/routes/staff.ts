import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const staffApp = new Hono<{ Bindings: Env }>();

// ── GET /api/staff (List Staff Users) ─────────────────────────────────────────
staffApp.get('/', async (c) => {
  const dept = c.req.query('department') || '';
  const role = c.req.query('role') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM staff_users WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (dept) { sql += ' AND department=?'; params.push(dept); }
    if (role) { sql += ' AND role_name=?'; params.push(role); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, staff: rows });
  }
  return c.json({ success: true, staff: mockStaffList() });
});

// ── POST /api/staff (Create Staff User) ──────────────────────────────────────
staffApp.post('/', async (c) => {
  const { name, email, phone, role_name = 'Store Manager', department = 'Management', employee_id } = await c.req.json();
  if (!name || !email) return c.json({ success: false, message: 'Name and email required' }, 400);

  const staffId = `stf_${Date.now()}`;
  const empId = employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO staff_users (id, employee_id, name, email, phone, role_name, department, status) VALUES (?,?,?,?,?,?,?,?)',
      [staffId, empId, name, email, phone || '', role_name, department, 'Active']
    );

    // Audit Log
    await executeRun(c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?,?,?,?)',
      ['RBAC', 'CreateStaff', email, JSON.stringify({ name, role: role_name, emp_id: empId })]
    ).catch(() => {});
  }

  return c.json({ success: true, message: `Staff account created (${empId}).`, staff: { id: staffId, name, email, employee_id: empId } });
});

// ── PUT /api/staff/:id (Update Staff User) ────────────────────────────────────
staffApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const { name, phone, role_name, department, status } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE staff_users SET name=COALESCE(?,name), phone=COALESCE(?,phone), role_name=COALESCE(?,role_name), department=COALESCE(?,department), status=COALESCE(?,status), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name, phone, role_name, department, status, id]
    );

    await executeRun(c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?,?,?,?)',
      ['RBAC', 'UpdateStaff', id, JSON.stringify({ name, role_name, status })]
    ).catch(() => {});
  }

  return c.json({ success: true, message: 'Staff user updated.' });
});

// ── GET /api/staff/roles (List Roles) ─────────────────────────────────────────
staffApp.get('/roles', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM roles ORDER BY is_system DESC, name ASC');
    return c.json({ success: true, roles: rows });
  }
  return c.json({ success: true, roles: mockRolesList() });
});

// ── PUT /api/staff/roles/:id/permissions (Update Matrix) ────────────────────
staffApp.put('/roles/:id/permissions', async (c) => {
  const id = c.req.param('id');
  const { permissions } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE roles SET permissions=? WHERE id=?',
      [JSON.stringify(permissions), id]
    );

    await executeRun(c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?,?,?,?)',
      ['RBAC', 'UpdateRolePermissions', id, JSON.stringify({ permissions_count: Object.keys(permissions || {}).length })]
    ).catch(() => {});
  }

  return c.json({ success: true, message: 'Role permission matrix updated.' });
});

// ── GET /api/staff/audit-logs (RBAC Audit Logs) ──────────────────────────────
staffApp.get('/audit-logs', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, "SELECT * FROM api_logs WHERE service_name='RBAC' ORDER BY created_at DESC LIMIT 100");
    return c.json({ success: true, logs: rows });
  }
  return c.json({ success: true, logs: mockAuditLogs() });
});

function mockStaffList() {
  return [
    { id: 'stf1', employee_id: 'EMP-1001', name: 'Mohd Nomaan Talib', email: 'mohdnomaantalib@gmail.com', phone: '+91 9812345678', role_name: 'Super Admin', department: 'Management', status: 'Active', last_login: '2026-07-27T21:40:00Z', created_at: '2025-01-01T00:00:00Z' },
    { id: 'stf2', employee_id: 'EMP-1002', name: 'Rajesh Kumar', email: 'rajesh@healthymonks.com', phone: '+91 9712345679', role_name: 'Store Manager', department: 'Management', status: 'Active', last_login: '2026-07-27T18:20:00Z', created_at: '2025-03-15T10:00:00Z' },
    { id: 'stf3', employee_id: 'EMP-1003', name: 'Ananya Roy', email: 'ananya@healthymonks.com', phone: '+91 9612345670', role_name: 'Warehouse Manager', department: 'Warehouse', status: 'Active', last_login: '2026-07-26T14:10:00Z', created_at: '2025-05-20T11:30:00Z' },
    { id: 'stf4', employee_id: 'EMP-1004', name: 'Siddharth Nair', email: 'siddharth@healthymonks.com', phone: '+91 9512345671', role_name: 'Customer Support', department: 'Support', status: 'Active', last_login: '2026-07-27T11:00:00Z', created_at: '2025-08-01T09:00:00Z' },
  ];
}

function mockRolesList() {
  return [
    { id: 'r1', name: 'Super Admin', is_system: 1, description: 'Unrestricted full system control & RBAC delegation', users_count: 1, permissions: { Products: ['view', 'create', 'edit', 'delete', 'export'], Orders: ['view', 'create', 'edit', 'delete', 'export'], Customers: ['view', 'create', 'edit', 'delete'] } },
    { id: 'r2', name: 'Store Manager', is_system: 1, description: 'Manages catalog, orders, coupons & basic customer records', users_count: 3, permissions: { Products: ['view', 'create', 'edit'], Orders: ['view', 'edit', 'export'], Customers: ['view', 'edit'] } },
    { id: 'r3', name: 'Warehouse Manager', is_system: 1, description: 'Fulfills shipments, generates AWBs & manages inventory stock', users_count: 2, permissions: { Orders: ['view', 'edit'], Inventory: ['view', 'edit'], Shipping: ['view', 'create', 'edit'] } },
    { id: 'r4', name: 'Customer Support', is_system: 1, description: 'Handles customer 360 view, RMA returns & order tracking', users_count: 5, permissions: { Orders: ['view'], Customers: ['view'], Returns: ['view', 'edit'] } },
    { id: 'r5', name: 'Finance', is_system: 1, description: 'Manages payment gateways, tax invoices & refund processing', users_count: 2, permissions: { Payments: ['view', 'edit'], Invoices: ['view', 'create', 'export'] } },
  ];
}

function mockAuditLogs() {
  return [
    { id: 'al1', service_name: 'RBAC', event_type: 'LoginSuccess', recipient: 'mohdnomaantalib@gmail.com', payload: '{"ip":"49.37.12.9","device":"Chrome macOS"}', created_at: '2026-07-27T21:40:00Z' },
    { id: 'al2', service_name: 'RBAC', event_type: 'UpdateRolePermissions', recipient: 'r2', payload: '{"role":"Store Manager","updated_modules":["Products","Orders"]}', created_at: '2026-07-26T15:30:00Z' },
    { id: 'al3', service_name: 'RBAC', event_type: 'CreateStaff', recipient: 'ananya@healthymonks.com', payload: '{"employee_id":"EMP-1003","role":"Warehouse Manager"}', created_at: '2025-05-20T11:30:00Z' },
  ];
}

export default staffApp;
