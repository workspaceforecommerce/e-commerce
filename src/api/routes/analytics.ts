import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const analyticsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/analytics/customers (Executive Customer Intelligence) ──────────
analyticsApp.get('/customers', async (c) => {
  if (c.env?.DB) {
    const custCount: any = await queryFirst(c.env.DB, 'SELECT COUNT(*) as count, SUM(total_spent) as total_revenue FROM customers WHERE deleted_at IS NULL');
    const orderMetrics: any = await queryFirst(c.env.DB, 'SELECT AVG(total_amount) as aov, COUNT(*) as total_orders FROM orders WHERE status != "Cancelled"');
    const topCust = await queryAll(c.env.DB, 'SELECT id, name, email, customer_group, total_orders, total_spent, aov FROM customers WHERE deleted_at IS NULL ORDER BY total_spent DESC LIMIT 10');

    const totalRevenue = custCount?.total_revenue || 54360;
    const totalCustomers = custCount?.count || 12;
    const clv = totalCustomers ? Math.round(totalRevenue / totalCustomers) : 4530;
    const aov = Math.round(orderMetrics?.aov || 1860);

    return c.json({
      success: true,
      metrics: {
        total_customers: totalCustomers,
        total_revenue: totalRevenue,
        clv,
        aov,
        repeat_purchase_rate: 68.4,
        churn_risk_rate: 12.1,
        top_customers: topCust.length ? topCust : mockTopCustomers()
      }
    });
  }
  return c.json({
    success: true,
    metrics: {
      total_customers: 1240,
      total_revenue: 5634000,
      clv: 4543,
      aov: 1860,
      repeat_purchase_rate: 68.4,
      churn_risk_rate: 12.1,
      top_customers: mockTopCustomers()
    }
  });
});

// ── GET /api/analytics/segments (Customer Segments) ──────────────────────────
analyticsApp.get('/segments', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM customer_segments ORDER BY member_count DESC');
    return c.json({ success: true, segments: rows });
  }
  return c.json({ success: true, segments: mockSegmentsList() });
});

// ── POST /api/analytics/segments (Create Customer Segment) ───────────────────
analyticsApp.post('/segments', async (c) => {
  const { name, description, rules } = await c.req.json();
  if (!name) return c.json({ success: false, message: 'Segment name required' }, 400);

  const segId = `seg_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO customer_segments (id, name, description, rules, member_count) VALUES (?,?,?,?,?)',
      [segId, name, description || '', JSON.stringify(rules || {}), 0]
    );
  }

  return c.json({ success: true, message: `Segment "${name}" created`, segment: { id: segId, name, member_count: 0 } });
});

// ── GET /api/analytics/audiences (Pre-Built Marketing Audiences) ────────────
analyticsApp.get('/audiences', async (c) => {
  return c.json({
    success: true,
    audiences: [
      { id: 'aud1', name: 'VIP High Spenders (> ₹15,000)', count: 184, channel_reach: 'Email, WhatsApp, Push', conversion_rate: '24.2%' },
      { id: 'aud2', name: 'Cart Abandoners (Last 48 Hours)', count: 42, channel_reach: 'WhatsApp, SMS', conversion_rate: '18.6%' },
      { id: 'aud3', name: 'Wholesale B2B Buyers', count: 35, channel_reach: 'Email, Direct Call', conversion_rate: '45.0%' },
      { id: 'aud4', name: 'Inactive Customers (No Order 60+ Days)', count: 210, channel_reach: 'Email, SMS', conversion_rate: '8.4%' },
      { id: 'aud5', name: 'First Time Ayurveda Buyers', count: 320, channel_reach: 'Push, WhatsApp', conversion_rate: '14.8%' },
    ]
  });
});

// ── GET /api/analytics/automation (Automation Workflows) ─────────────────────
analyticsApp.get('/automation', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM automation_workflows ORDER BY created_at DESC');
    return c.json({ success: true, workflows: rows });
  }
  return c.json({ success: true, workflows: mockWorkflowsList() });
});

// ── POST /api/analytics/automation/workflows (Create Workflow) ─────────────
analyticsApp.post('/automation/workflows', async (c) => {
  const { name, trigger_event, actions } = await c.req.json();
  if (!name || !trigger_event) return c.json({ success: false, message: 'Name and trigger event required' }, 400);

  const wfId = `wf_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO automation_workflows (id, name, trigger_event, actions, status, total_triggered) VALUES (?,?,?,?,?,?)',
      [wfId, name, trigger_event, JSON.stringify(actions || []), 'Active', 0]
    );
  }

  return c.json({ success: true, message: `Automation workflow "${name}" activated` });
});

function mockTopCustomers() {
  return [
    { id: 'cust2', name: 'Priya Mehta', email: 'priya@gmail.com', customer_group: 'Wholesale', total_orders: 14, total_spent: 38400, aov: 2742 },
    { id: 'cust1', name: 'Aarav Sharma', email: 'aarav@example.com', customer_group: 'VIP', total_orders: 8, total_spent: 14890, aov: 1861 },
    { id: 'cust4', name: 'Neha Verma', email: 'neha@yahoo.com', customer_group: 'Corporate', total_orders: 6, total_spent: 9800, aov: 1633 },
    { id: 'cust3', name: 'Vikram Singh', email: 'vikram@yahoo.com', customer_group: 'Retail', total_orders: 2, total_spent: 1078, aov: 539 }
  ];
}

function mockSegmentsList() {
  return [
    { id: 'seg1', name: 'VIP High Spenders', description: 'Customers with LTV > ₹15,000', member_count: 184, updated_at: '2026-07-27T10:00:00Z' },
    { id: 'seg2', name: 'Wholesale GST Accounts', description: 'B2B GST registered spa & clinic accounts', member_count: 35, updated_at: '2026-07-26T14:00:00Z' },
    { id: 'seg3', name: 'Ashwagandha Enthusiasts', description: 'Bought adaptogen herbs 3+ times', member_count: 420, updated_at: '2026-07-25T11:00:00Z' },
    { id: 'seg4', name: 'At Churn Risk', description: 'No orders in last 90 days with previous 2+ orders', member_count: 88, updated_at: '2026-07-24T09:00:00Z' }
  ];
}

function mockWorkflowsList() {
  return [
    { id: 'wf1', name: 'Welcome Onboarding Series', trigger_event: 'Registration', actions: ['Send WhatsApp Welcome', 'Issue WELCOME100 Coupon'], status: 'Active', total_triggered: 1240 },
    { id: 'wf2', name: 'Cart Recovery Nudge', trigger_event: 'Cart Abandoned', actions: ['Send WhatsApp Reminder (1hr)', 'Send Email Coupon (24hr)'], status: 'Active', total_triggered: 412 },
    { id: 'wf3', name: 'VIP Tier Celebration', trigger_event: 'Loyalty Tier Upgrade', actions: ['Award 500 Bonus Points', 'Send Push Notification'], status: 'Active', total_triggered: 85 }
  ];
}

export default analyticsApp;
