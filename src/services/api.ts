/**
 * MVC API Controller Service Wrapper
 * Connects React Views cleanly to Hono Cloudflare Worker API Controllers
 */

export const ApiService = {
  // ── 1. Catalog & Products ──────────────────────────────────────────
  async getProducts() {
    const res: any = await fetch('/api/products').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.data?.products || [] : [];
  },

  async getCategories() {
    const res: any = await fetch('/api/products/categories').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.data?.categories || [] : [];
  },

  async getBrands() {
    const res: any = await fetch('/api/brands').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.brands || [] : [];
  },

  async getReviews() {
    const res: any = await fetch('/api/reviews').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.data?.reviews || [] : [];
  },

  // ── 2. Orders & Checkout ───────────────────────────────────────────
  async getOrders() {
    const res: any = await fetch('/api/orders').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.data?.orders || [] : [];
  },

  async getOrderTrack(orderNumber: string) {
    const res: any = await fetch(`/api/orders/track?number=${encodeURIComponent(orderNumber)}`).then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.data?.order : null;
  },

  async createOrder(payload: any) {
    return fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  },

  // ── 3. Payments & Gateways ──────────────────────────────────────────
  async getPaymentGateways() {
    const res: any = await fetch('/api/payments/gateways').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.gateways || [] : [];
  },

  async getTransactions() {
    const res: any = await fetch('/api/payments/transactions').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.transactions || [] : [];
  },

  // ── 4. Shipping & Courier Logistics ──────────────────────────────
  async getShipments() {
    const res: any = await fetch('/api/shipping/shipments').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.shipments || [] : [];
  },

  async getCourierProviders() {
    const res: any = await fetch('/api/shipping/couriers').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.couriers || [] : [];
  },

  // ── 5. Returns & RMA Management ─────────────────────────────────────
  async getReturns() {
    const res: any = await fetch('/api/returns').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.returns || [] : [];
  },

  // ── 6. Invoices & Notifications ───────────────────────────────────
  async getInvoices() {
    const res: any = await fetch('/api/invoices').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.invoices || [] : [];
  },

  async getNotificationLogs() {
    const res: any = await fetch('/api/notifications/logs').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.logs || [] : [];
  },

  // ── 7. Customer CRM ───────────────────────────────────────────────
  async getCustomers() {
    const res: any = await fetch('/api/customers').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.customers || [] : [];
  },

  // ── 8. Staff & RBAC Permissions ───────────────────────────────────
  async getStaff() {
    const res: any = await fetch('/api/staff').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.staff || [] : [];
  },

  async getRoles() {
    const res: any = await fetch('/api/staff/roles').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.roles || [] : [];
  },

  // ── 9. Support & Help Desk ─────────────────────────────────────────
  async getTickets() {
    const res: any = await fetch('/api/tickets').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.tickets || [] : [];
  },

  // ── 10. Loyalty, Wallet & Referrals ──────────────────────────────
  async getLoyaltyMembers() {
    const res: any = await fetch('/api/loyalty/members').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.members || [] : [];
  },

  // ── 11. Customer Analytics & Segmentation ─────────────────────────
  async getCustomerAnalytics() {
    const res: any = await fetch('/api/analytics/customers').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.metrics : null;
  },

  async getCustomerSegments() {
    const res: any = await fetch('/api/analytics/segments').then(r => r.json()).catch(() => ({ success: false }));
    return res.success ? res.segments || [] : [];
  }
};
