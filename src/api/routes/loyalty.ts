import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const loyaltyApp = new Hono<{ Bindings: Env }>();

// ── GET /api/loyalty (List Loyalty Accounts) ──────────────────────────────────
loyaltyApp.get('/', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM loyalty_accounts ORDER BY points_balance DESC LIMIT 100');
    return c.json({ success: true, accounts: rows });
  }
  return c.json({ success: true, accounts: mockLoyaltyAccounts() });
});

// ── GET /api/loyalty/customer/:id (Customer Loyalty & Wallet Details) ────────
loyaltyApp.get('/customer/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    const loyalty: any = await queryFirst(c.env.DB, 'SELECT * FROM loyalty_accounts WHERE customer_id=?', [id]);
    const wallet: any = await queryFirst(c.env.DB, 'SELECT * FROM wallet_accounts WHERE customer_id=?', [id]);
    const transactions = await queryAll(c.env.DB, 'SELECT * FROM loyalty_transactions WHERE customer_id=? ORDER BY created_at DESC', [id]);

    return c.json({ success: true, loyalty, wallet, transactions });
  }
  const mockLoyalty = mockLoyaltyAccounts().find(a => a.customer_id === id) || mockLoyaltyAccounts()[0];
  const mockWallet = mockWalletAccounts().find(w => w.customer_id === id) || mockWalletAccounts()[0];
  return c.json({ success: true, loyalty: mockLoyalty, wallet: mockWallet, transactions: mockTransactions() });
});

// ── POST /api/loyalty/award (Manual Points Award / Adjustment) ────────────────
loyaltyApp.post('/award', async (c) => {
  const { customer_id, points, reason = 'Admin Bonus' } = await c.req.json();
  if (!customer_id || !points) return c.json({ success: false, message: 'Customer ID and points required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE loyalty_accounts SET points_balance = points_balance + ?, points_earned = points_earned + ? WHERE customer_id = ?',
      [points, points > 0 ? points : 0, customer_id]
    );

    await executeRun(c.env.DB,
      'INSERT INTO loyalty_transactions (id, customer_id, points, type, description) VALUES (?,?,?,?,?)',
      [`lt_${Date.now()}`, customer_id, points, points > 0 ? 'EARNED' : 'DEDUCTED', reason]
    );
  }

  return c.json({ success: true, message: `${points} points ${points > 0 ? 'awarded' : 'deducted'}` });
});

// ── GET /api/loyalty/wallet (Digital Wallet Balances & Ledger) ────────────────
loyaltyApp.get('/wallet', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM wallet_accounts ORDER BY balance DESC LIMIT 100');
    return c.json({ success: true, wallets: rows });
  }
  return c.json({ success: true, wallets: mockWalletAccounts() });
});

// ── POST /api/loyalty/wallet/credit (Credit Wallet Balance) ──────────────────
loyaltyApp.post('/wallet/credit', async (c) => {
  const { customer_id, amount, description = 'Admin Credit / Cashback' } = await c.req.json();
  if (!customer_id || !amount) return c.json({ success: false, message: 'Customer ID and amount required' }, 400);

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE wallet_accounts SET balance = balance + ? WHERE customer_id = ?',
      [amount, customer_id]
    );

    await executeRun(c.env.DB,
      'INSERT INTO wallet_transactions (id, customer_id, amount, type, description) VALUES (?,?,?,?,?)',
      [`wt_${Date.now()}`, customer_id, amount, 'CREDIT', description]
    );
  }

  return c.json({ success: true, message: `₹${amount} credited to customer wallet.` });
});

// ── GET /api/loyalty/referrals (Referral Program Tracking) ───────────────────
loyaltyApp.get('/referrals', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM referrals ORDER BY created_at DESC LIMIT 100');
    return c.json({ success: true, referrals: rows });
  }
  return c.json({ success: true, referrals: mockReferralsList() });
});

// ── POST /api/loyalty/rewards/redeem (Redeem Points for Coupon) ─────────────
loyaltyApp.post('/rewards/redeem', async (c) => {
  const { customer_id, reward_id, points_cost } = await c.req.json();
  if (!customer_id || !points_cost) return c.json({ success: false, message: 'Customer ID and points cost required' }, 400);

  const couponCode = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'UPDATE loyalty_accounts SET points_balance = points_balance - ? WHERE customer_id = ? AND points_balance >= ?',
      [points_cost, customer_id, points_cost]
    );

    await executeRun(c.env.DB,
      'INSERT INTO loyalty_transactions (id, customer_id, points, type, description) VALUES (?,?,?,?,?)',
      [`lt_${Date.now()}`, customer_id, -points_cost, 'REDEEMED', `Redeemed for ${couponCode}`]
    );
  }

  return c.json({ success: true, message: `Successfully redeemed! Coupon code: ${couponCode}`, coupon_code: couponCode });
});

function mockLoyaltyAccounts() {
  return [
    { id: 'la1', customer_id: 'cust1', customer_name: 'Aarav Sharma', email: 'aarav@example.com', tier: 'VIP', points_balance: 2450, points_earned: 3200, points_spent: 750, created_at: '2025-11-10T10:00:00Z' },
    { id: 'la2', customer_id: 'cust2', customer_name: 'Priya Mehta', email: 'priya@gmail.com', tier: 'Gold', points_balance: 1820, points_earned: 2200, points_spent: 380, created_at: '2025-08-14T12:30:00Z' },
    { id: 'la3', customer_id: 'cust3', customer_name: 'Vikram Singh', email: 'vikram@yahoo.com', tier: 'Bronze', points_balance: 500, points_earned: 500, points_spent: 0, created_at: '2026-07-20T09:15:00Z' },
  ];
}

function mockWalletAccounts() {
  return [
    { id: 'wa1', customer_id: 'cust1', customer_name: 'Aarav Sharma', balance: 450, total_credited: 1250, total_debited: 800, updated_at: '2026-07-27T14:30:00Z' },
    { id: 'wa2', customer_id: 'cust2', customer_name: 'Priya Mehta', balance: 899, total_credited: 899, total_debited: 0, updated_at: '2026-07-26T14:21:00Z' },
  ];
}

function mockTransactions() {
  return [
    { id: 'lt1', points: 500, type: 'EARNED', description: 'Registration Bonus Points', created_at: '2025-11-10T10:00:00Z' },
    { id: 'lt2', points: 1950, type: 'EARNED', description: 'Order #HM-ORD-482910 Purchase Points', created_at: '2026-07-27T14:30:00Z' }
  ];
}

function mockReferralsList() {
  return [
    { id: 'ref1', referrer_name: 'Aarav Sharma', referrer_code: 'AARAV-HM20', referred_name: 'Karan Patel', referred_email: 'karan@gmail.com', status: 'Completed', reward_points: 500, created_at: '2026-07-20T11:00:00Z' },
    { id: 'ref2', referrer_name: 'Priya Mehta', referrer_code: 'PRIYA-HM15', referred_name: 'Neha Verma', referred_email: 'neha@yahoo.com', status: 'Pending Order', reward_points: 0, created_at: '2026-07-25T15:30:00Z' },
  ];
}

export default loyaltyApp;
