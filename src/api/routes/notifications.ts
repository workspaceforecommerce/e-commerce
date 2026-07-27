import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const notificationsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/notifications/logs (Audit Logs) ──────────────────────────────────
notificationsApp.get('/logs', async (c) => {
  const channel = c.req.query('channel') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM api_logs WHERE 1=1';
    const params: any[] = [];
    if (channel) { sql += ' AND service_name=?'; params.push(channel); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, logs: rows });
  }
  return c.json({ success: true, logs: mockNotificationLogs() });
});

// ── GET /api/notifications/templates ─────────────────────────────────────────
notificationsApp.get('/templates', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM notification_templates ORDER BY event_name ASC');
    return c.json({ success: true, templates: rows });
  }
  return c.json({ success: true, templates: mockTemplatesList() });
});

// ── PUT /api/notifications/templates/:id ──────────────────────────────────────
notificationsApp.put('/templates/:id', async (c) => {
  const id = c.req.param('id');
  const { subject, body } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB, 'UPDATE notification_templates SET subject=?, body=? WHERE id=?', [subject, body, id]);
  }
  return c.json({ success: true, message: 'Notification template updated' });
});

// ── POST /api/notifications/send (Trigger Event) ──────────────────────────────
notificationsApp.post('/send', async (c) => {
  const { channel = 'Email', recipient, event_name = 'OrderConfirmation', payload = {} } = await c.req.json();
  if (!recipient) return c.json({ success: false, message: 'Recipient email/phone required' }, 400);

  const logId = `log_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO api_logs (service_name, event_type, recipient, payload) VALUES (?,?,?,?)',
      [channel, event_name, recipient, JSON.stringify(payload)]
    );
  }

  return c.json({
    success: true,
    message: `${channel} notification for ${event_name} dispatched to ${recipient}`,
    log_id: logId
  });
});

function mockNotificationLogs() {
  return [
    { id: 'nl1', service_name: 'Email', event_type: 'OrderConfirmation', recipient: 'aarav@example.com', payload: '{"order_number":"HM-ORD-482910","total":698}', created_at: '2026-07-27T14:30:05Z' },
    { id: 'nl2', service_name: 'WhatsApp', event_type: 'OrderConfirmation', recipient: '+91 9812345678', payload: '{"order_number":"HM-ORD-482910","status":"Confirmed"}', created_at: '2026-07-27T14:30:06Z' },
    { id: 'nl3', service_name: 'SMS', event_type: 'OutForDelivery', recipient: '+91 9765432109', payload: '{"order_number":"HM-ORD-839210","courier":"Blue Dart"}', created_at: '2026-07-26T18:00:00Z' },
    { id: 'nl4', service_name: 'PushNotification', event_type: 'RefundCompleted', recipient: 'priya@gmail.com', payload: '{"rma":"RMA-448102","amount":899}', created_at: '2026-07-26T14:21:00Z' },
  ];
}

function mockTemplatesList() {
  return [
    { id: 'tmpl1', event_name: 'OrderConfirmation', channel: 'Email', subject: 'Order Confirmation - Healthy Monks #{{order_number}}', body: 'Dear {{customer_name}}, thank you for your order! Your total is ₹{{total_amount}}.' },
    { id: 'tmpl2', event_name: 'OrderShipped', channel: 'WhatsApp', subject: 'Package Shipped', body: 'Namaste {{customer_name}}! Your parcel for #{{order_number}} is shipped via {{courier_name}} (AWB: {{awb_number}}).' },
    { id: 'tmpl3', event_name: 'RefundCompleted', channel: 'SMS', subject: 'Refund Processed', body: 'HM Alert: ₹{{refund_amount}} refunded for order #{{order_number}}. Credited to original source.' },
  ];
}

export default notificationsApp;
