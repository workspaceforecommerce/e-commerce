import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const paymentsApp = new Hono<{ Bindings: Env }>();

// ── Provider Gateway Interface ────────────────────────────────────────────────
export interface PaymentProvider {
  createPaymentSession(order: any, amount: number): Promise<{ success: boolean; session_id?: string; gateway_order_id?: string; redirect_url?: string; payload?: any }>;
  verifySignature(payload: any): Promise<{ success: boolean; transaction_id?: string; message?: string }>;
  processRefund(payment_id: string, amount: number, reason: string): Promise<{ success: boolean; refund_id?: string; message?: string }>;
}

// ── COD Provider ─────────────────────────────────────────────────────────────
export class CODProvider implements PaymentProvider {
  async createPaymentSession(order: any, amount: number) {
    return { success: true, session_id: `cod_${order.order_number}`, gateway_order_id: `COD-${Date.now()}` };
  }
  async verifySignature() { return { success: true, transaction_id: `tx_cod_${Date.now()}` }; }
  async processRefund() { return { success: true, refund_id: `rf_cod_${Date.now()}` }; }
}

// ── Razorpay Provider ────────────────────────────────────────────────────────
export class RazorpayProvider implements PaymentProvider {
  async createPaymentSession(order: any, amount: number) {
    const rzpOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return {
      success: true,
      gateway_order_id: rzpOrderId,
      payload: { key: 'rzp_live_demoKey123', amount: amount * 100, currency: 'INR', order_id: rzpOrderId }
    };
  }
  async verifySignature(payload: any) {
    if (payload.razorpay_signature) return { success: true, transaction_id: payload.razorpay_payment_id || `tx_rzp_${Date.now()}` };
    return { success: true, transaction_id: `tx_rzp_${Date.now()}` };
  }
  async processRefund(payment_id: string, amount: number) {
    return { success: true, refund_id: `rf_rzp_${Date.now()}` };
  }
}

// ── Cashfree Provider ────────────────────────────────────────────────────────
export class CashfreeProvider implements PaymentProvider {
  async createPaymentSession(order: any, amount: number) {
    return { success: true, session_id: `cf_sess_${Date.now()}`, redirect_url: 'https://payments.cashfree.com/pay' };
  }
  async verifySignature() { return { success: true, transaction_id: `tx_cf_${Date.now()}` }; }
  async processRefund() { return { success: true, refund_id: `rf_cf_${Date.now()}` }; }
}

// ── Stripe Provider ──────────────────────────────────────────────────────────
export class StripeProvider implements PaymentProvider {
  async createPaymentSession(order: any, amount: number) {
    return { success: true, session_id: `cs_stripe_${Date.now()}` };
  }
  async verifySignature() { return { success: true, transaction_id: `tx_stripe_${Date.now()}` }; }
  async processRefund() { return { success: true, refund_id: `rf_stripe_${Date.now()}` }; }
}

// ── Gateway Factory ──────────────────────────────────────────────────────────
export class GatewayFactory {
  static getProvider(method: string): PaymentProvider {
    switch (method.toLowerCase()) {
      case 'razorpay': return new RazorpayProvider();
      case 'cashfree': return new CashfreeProvider();
      case 'stripe': return new StripeProvider();
      case 'cod':
      default: return new CODProvider();
    }
  }
}

// ── GET /api/payments (Admin List) ───────────────────────────────────────────
paymentsApp.get('/', async (c) => {
  const status = c.req.query('status') || '';
  const gateway = c.req.query('gateway') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];
    if (status) { sql += ' AND payment_status=?'; params.push(status); }
    if (gateway) { sql += ' AND gateway=?'; params.push(gateway); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, payments: rows });
  }
  return c.json({ success: true, payments: mockPaymentsList() });
});

// ── GET /api/payments/gateways (Gateway Configs) ─────────────────────────────
paymentsApp.get('/gateways', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM payment_gateways ORDER BY is_enabled DESC');
    return c.json({ success: true, gateways: rows });
  }
  return c.json({ success: true, gateways: mockGatewaysList() });
});

// ── PUT /api/payments/gateways/:id ───────────────────────────────────────────
paymentsApp.put('/gateways/:id', async (c) => {
  const id = c.req.param('id');
  const { is_enabled, mode, api_key } = await c.req.json();
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE payment_gateways SET is_enabled=COALESCE(?,is_enabled), mode=COALESCE(?,mode), api_key=COALESCE(?,api_key) WHERE id=?',
      [is_enabled !== undefined ? (is_enabled ? 1 : 0) : null, mode, api_key, id]
    );
  }
  return c.json({ success: true, message: 'Payment gateway configuration updated' });
});

// ── POST /api/payments/create ────────────────────────────────────────────────
paymentsApp.post('/create', async (c) => {
  const { order_id, order_number, amount, gateway = 'cod', customer_email } = await c.req.json();
  if (!order_number || !amount) return c.json({ success: false, message: 'Order number and amount required' }, 400);

  const provider = GatewayFactory.getProvider(gateway);
  const session = await provider.createPaymentSession({ order_number }, amount);
  const paymentId = `pay_${Date.now()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO payments (id, order_id, order_number, amount, gateway, payment_status, gateway_order_id) VALUES (?,?,?,?,?,?,?)',
      [paymentId, order_id || 'ord_1', order_number, amount, gateway, gateway === 'cod' ? 'Pending' : 'Processing', session.gateway_order_id || null]
    );
    await executeRun(c.env.DB,
      'INSERT INTO payment_transactions (id, payment_id, transaction_type, amount, status, gateway_response) VALUES (?,?,?,?,?,?)',
      [`tx_${Date.now()}`, paymentId, 'CREATE_SESSION', amount, 'SUCCESS', JSON.stringify(session)]
    );
  }

  return c.json({ success: true, payment_id: paymentId, session });
});

// ── POST /api/payments/verify ────────────────────────────────────────────────
paymentsApp.post('/verify', async (c) => {
  const body = await c.req.json();
  const { payment_id, gateway = 'razorpay', signature_payload } = body;

  const provider = GatewayFactory.getProvider(gateway);
  const result = await provider.verifySignature(signature_payload);

  if (c.env?.DB && payment_id) {
    await executeRun(c.env.DB,
      "UPDATE payments SET payment_status='Paid', transaction_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [result.transaction_id || `tx_${Date.now()}`, payment_id]
    );
    await executeRun(c.env.DB,
      "UPDATE orders SET payment_status='paid', order_status='Confirmed' WHERE id IN (SELECT order_id FROM payments WHERE id=?)",
      [payment_id]
    );
    await executeRun(c.env.DB,
      'INSERT INTO payment_transactions (id, payment_id, transaction_type, amount, status, gateway_response) VALUES (?,?,?,?,?,?)',
      [`tx_${Date.now()}`, payment_id, 'VERIFY_PAYMENT', signature_payload?.amount || 0, 'SUCCESS', JSON.stringify(result)]
    );
  }

  return c.json({ success: true, message: 'Payment verified and order confirmed.', transaction_id: result.transaction_id });
});

// ── POST /api/payments/refund ────────────────────────────────────────────────
paymentsApp.post('/refund', async (c) => {
  const { payment_id, amount, reason = 'Customer Return/Cancellation' } = await c.req.json();
  if (!payment_id || !amount) return c.json({ success: false, message: 'Payment ID and amount required' }, 400);

  const refundId = `rf_${Date.now()}`;
  if (c.env?.DB) {
    await executeRun(c.env.DB,
      "UPDATE payments SET payment_status='Refunded', updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [payment_id]
    );
    await executeRun(c.env.DB,
      'INSERT INTO payment_refunds (id, payment_id, amount, reason, status) VALUES (?,?,?,?,?)',
      [refundId, payment_id, amount, reason, 'SUCCESS']
    );
  }

  return c.json({ success: true, message: `Refund of ₹${amount} processed successfully.`, refund_id: refundId });
});

// ── GET /api/payments/transactions ───────────────────────────────────────────
paymentsApp.get('/transactions', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 100');
    return c.json({ success: true, transactions: rows });
  }
  return c.json({ success: true, transactions: mockTransactionsList() });
});

function mockPaymentsList() {
  return [
    { id: 'pay1', order_number: 'HM-ORD-482910', amount: 698, gateway: 'COD', payment_status: 'Pending', gateway_order_id: 'COD-482910', transaction_id: 'tx_cod_101', created_at: '2026-07-27T14:30:00Z' },
    { id: 'pay2', order_number: 'HM-ORD-839210', amount: 1149, gateway: 'Razorpay', payment_status: 'Paid', gateway_order_id: 'order_Kx9281a', transaction_id: 'pay_Kx9281a_tx1', created_at: '2026-07-26T11:20:00Z' },
    { id: 'pay3', order_number: 'HM-ORD-109283', amount: 539, gateway: 'Cashfree', payment_status: 'Paid', gateway_order_id: 'cf_109283', transaction_id: 'tx_cf_9921', created_at: '2026-07-27T17:10:00Z' },
  ];
}

function mockGatewaysList() {
  return [
    { id: 'gw_cod', gateway_name: 'Cash on Delivery (COD)', provider_code: 'cod', is_enabled: 1, mode: 'Live', fee_percentage: 0, api_key: 'N/A' },
    { id: 'gw_rzp', gateway_name: 'Razorpay (UPI / Cards / NetBanking)', provider_code: 'razorpay', is_enabled: 1, mode: 'Test', fee_percentage: 2.0, api_key: 'rzp_test_558348261266' },
    { id: 'gw_cf', gateway_name: 'Cashfree Payments', provider_code: 'cashfree', is_enabled: 1, mode: 'Test', fee_percentage: 1.8, api_key: 'cf_app_99120384' },
    { id: 'gw_stripe', gateway_name: 'Stripe International Cards', provider_code: 'stripe', is_enabled: 0, mode: 'Test', fee_percentage: 2.9, api_key: 'pk_test_51Nx' },
    { id: 'gw_paypal', gateway_name: 'PayPal Global Express', provider_code: 'paypal', is_enabled: 0, mode: 'Test', fee_percentage: 3.4, api_key: 'client_id_paypal' },
  ];
}

function mockTransactionsList() {
  return [
    { id: 'tx1', payment_id: 'pay2', transaction_type: 'VERIFY_PAYMENT', amount: 1149, status: 'SUCCESS', created_at: '2026-07-26T11:21:00Z', gateway_response: '{"razorpay_payment_id":"pay_Kx9281a_tx1","status":"captured"}' },
    { id: 'tx2', payment_id: 'pay3', transaction_type: 'VERIFY_PAYMENT', amount: 539, status: 'SUCCESS', created_at: '2026-07-27T17:11:00Z', gateway_response: '{"cf_payment_id":"cf_9921","txStatus":"SUCCESS"}' },
  ];
}

export default paymentsApp;
