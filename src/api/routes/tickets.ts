import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const ticketsApp = new Hono<{ Bindings: Env }>();

// ── GET /api/tickets (List Support Tickets) ───────────────────────────────────
ticketsApp.get('/', async (c) => {
  const status = c.req.query('status') || '';
  const priority = c.req.query('priority') || '';
  const category = c.req.query('category') || '';

  if (c.env?.DB) {
    let sql = 'SELECT * FROM support_tickets WHERE 1=1';
    const params: any[] = [];
    if (status) { sql += ' AND status=?'; params.push(status); }
    if (priority) { sql += ' AND priority=?'; params.push(priority); }
    if (category) { sql += ' AND category=?'; params.push(category); }
    sql += ' ORDER BY created_at DESC LIMIT 100';

    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, tickets: rows });
  }
  return c.json({ success: true, tickets: mockTicketsList() });
});

// ── GET /api/tickets/:id (Ticket Detail & Thread) ────────────────────────────
ticketsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const tck: any = await queryFirst(c.env.DB, 'SELECT * FROM support_tickets WHERE id=? OR ticket_number=?', [id, id]);
    if (!tck) return c.json({ success: false, message: 'Ticket not found' }, 404);

    const messages = await queryAll(c.env.DB, 'SELECT * FROM ticket_messages WHERE ticket_id=? ORDER BY created_at ASC', [tck.id]);
    return c.json({ success: true, ticket: { ...tck, messages } });
  }
  const mock = mockTicketsList().find(t => t.id === id || t.ticket_number === id) || mockTicketsList()[0];
  return c.json({ success: true, ticket: mock });
});

// ── POST /api/tickets (Create Ticket) ─────────────────────────────────────────
ticketsApp.post('/', async (c) => {
  const { customer_name, customer_email, customer_phone, order_number, category = 'General Inquiry', priority = 'Medium', subject, message } = await c.req.json();
  if (!customer_name || !customer_email || !subject || !message) {
    return c.json({ success: false, message: 'Name, email, subject, and message are required' }, 400);
  }

  const tckId = `tck_${Date.now()}`;
  const tckNum = `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO support_tickets (id, ticket_number, customer_name, customer_email, customer_phone, order_number, category, priority, status, subject) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [tckId, tckNum, customer_name, customer_email, customer_phone || '', order_number || '', category, priority, 'Open', subject]
    );

    await executeRun(c.env.DB,
      'INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, message, is_internal) VALUES (?,?,?,?,?,?)',
      [`msg_${Date.now()}`, tckId, 'Customer', customer_name, message, 0]
    );
  }

  return c.json({ success: true, message: `Ticket ${tckNum} created`, ticket: { id: tckId, ticket_number: tckNum } });
});

// ── PATCH /api/tickets/:id/status (Update Status/Priority/Assignee) ─────────
ticketsApp.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status, priority, assigned_agent } = await c.req.json();

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE support_tickets SET status=COALESCE(?,status), priority=COALESCE(?,priority), assigned_agent=COALESCE(?,assigned_agent), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [status, priority, assigned_agent, id]
    );
  }

  return c.json({ success: true, message: 'Ticket updated' });
});

// ── POST /api/tickets/:id/reply (Post Reply or Internal Staff Note) ─────────
ticketsApp.post('/:id/reply', async (c) => {
  const id = c.req.param('id');
  const { sender_name = 'Customer Support', sender_type = 'Agent', message, is_internal = false } = await c.req.json();
  if (!message) return c.json({ success: false, message: 'Message content required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, message, is_internal) VALUES (?,?,?,?,?,?)',
      [`msg_${Date.now()}`, id, sender_type, sender_name, message, is_internal ? 1 : 0]
    );

    if (!is_internal) {
      await executeRun(c.env.DB, 'UPDATE support_tickets SET status="In Progress", updated_at=CURRENT_TIMESTAMP WHERE id=?', [id]);
    }
  }

  return c.json({ success: true, message: is_internal ? 'Internal note saved' : 'Reply sent to customer' });
});

// ── POST /api/tickets/:id/ai-copilot (AI Support Copilot Suggestion) ─────────
ticketsApp.post('/:id/ai-copilot', async (c) => {
  const { subject, category, last_message } = await c.req.json();

  let aiSuggestion = `Dear Customer,\n\nThank you for reaching out regarding ${subject}. We have verified your request under ${category} and our logistics team is expediting resolution. Please allow 24 hours for tracking updates.\n\nWarm regards,\nHealthy Monks Support Team`;
  let aiSummary = `Customer reported issue under category "${category}". Priority recommended: High. AI suggests immediate dispatch check.`;

  return c.json({
    success: true,
    copilot: {
      suggested_reply: aiSuggestion,
      conversation_summary: aiSummary,
      sentiment: 'Neutral / Inquiring'
    }
  });
});

// ── GET /api/tickets/kb (Knowledge Base Articles) ──────────────────────────────
ticketsApp.get('/kb', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM knowledge_base ORDER BY views DESC');
    return c.json({ success: true, articles: rows });
  }
  return c.json({ success: true, articles: mockKbArticles() });
});

function mockTicketsList() {
  return [
    {
      id: 'tck1', ticket_number: 'TCK-2026-4891', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', customer_phone: '+91 9812345678', order_number: 'HM-ORD-482910', category: 'Shipping Issue', priority: 'High', status: 'In Progress', assigned_agent: 'Siddharth Nair', subject: 'Delay in Blue Dart Courier Delivery', created_at: '2026-07-27T10:15:00Z',
      messages: [
        { id: 'm1', sender_type: 'Customer', sender_name: 'Aarav Sharma', message: 'Hello, my order #HM-ORD-482910 was shipped yesterday but Blue Dart tracking shows no updates.', is_internal: 0, created_at: '2026-07-27T10:15:00Z' },
        { id: 'm2', sender_type: 'Agent', sender_name: 'Siddharth Nair', message: 'Namaste Aarav! I am checking with the Blue Dart dispatch hub now. Your parcel is in transit.', is_internal: 0, created_at: '2026-07-27T11:00:00Z' },
        { id: 'm3', sender_type: 'Agent', sender_name: 'Siddharth Nair', message: 'Internal Note: Spoke with Blue Dart hub supervisor. Delivery rescheduled for tomorrow 2 PM.', is_internal: 1, created_at: '2026-07-27T11:05:00Z' }
      ]
    },
    {
      id: 'tck2', ticket_number: 'TCK-2026-9021', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', customer_phone: '+91 9765432109', order_number: 'HM-ORD-839210', category: 'Return & Refund', priority: 'Urgent', status: 'Open', assigned_agent: 'Unassigned', subject: 'Damaged Jar Seal Received', created_at: '2026-07-27T12:40:00Z',
      messages: [
        { id: 'm4', sender_type: 'Customer', sender_name: 'Priya Mehta', message: 'The outer seal on my Chyawanprash 1kg jar was broken upon delivery. Requesting replacement.', is_internal: 0, created_at: '2026-07-27T12:40:00Z' }
      ]
    }
  ];
}

function mockKbArticles() {
  return [
    { id: 'kb1', category: 'Shipping & Delivery', title: 'How to track my order shipment?', content: 'You can track your order using the courier AWB number sent to your email or WhatsApp.', views: 1420 },
    { id: 'kb2', category: 'Returns & Refunds', title: 'What is the Healthy Monks return policy?', content: 'We offer a 7-day hassle-free return policy for damaged or defective Ayurvedic products.', views: 980 }
  ];
}

export default ticketsApp;
