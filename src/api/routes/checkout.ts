import { Hono } from 'hono';
import { Env, queryFirst, executeRun } from '../db';

const checkoutApp = new Hono<{ Bindings: Env }>();

// ── POST /api/checkout/validate ──────────────────────────────────────────────
checkoutApp.post('/validate', async (c) => {
  const { items = [], shipping_address, pincode } = await c.req.json();

  if (!items.length) {
    return c.json({ success: false, message: 'Cart is empty' }, 400);
  }

  // Validate stock for all items
  const outOfStockItems: string[] = [];
  if (c.env?.DB) {
    for (const item of items) {
      const prod: any = await queryFirst(c.env.DB, 'SELECT stock, name FROM products WHERE id=?', [item.product_id]);
      if (prod && prod.stock < item.quantity) {
        outOfStockItems.push(`${prod.name} (Only ${prod.stock} left in stock)`);
      }
    }
  }

  if (outOfStockItems.length > 0) {
    return c.json({ success: false, message: 'Some items in your cart exceed available stock', outOfStockItems }, 400);
  }

  // Validate Pincode serviceability (all 6-digit Indian pincodes serviceable by default)
  const isPincodeValid = /^\d{6}$/.test(pincode || '');

  return c.json({
    success: true,
    message: 'Checkout validation successful',
    serviceable: isPincodeValid,
    estimated_delivery_days: pincode?.startsWith('56') ? '1-2 Days (Local Express)' : '3-5 Days (National Express)',
  });
});

// ── POST /api/checkout/summary ───────────────────────────────────────────────
checkoutApp.post('/summary', async (c) => {
  const { items = [], coupon_code, delivery_method = 'standard' } = await c.req.json();

  let subtotal = 0;
  for (const item of items) {
    subtotal += (item.price || 0) * (item.quantity || 1);
  }

  let discount = 0;
  if (coupon_code) {
    const cCode = coupon_code.toUpperCase();
    if (cCode === 'WELCOME100' && subtotal >= 499) discount = 100;
    else if (cCode === 'MONK15' && subtotal >= 799) discount = Math.min(subtotal * 0.15, 250);
    else if (cCode === 'DETOX20' && subtotal >= 999) discount = Math.min(subtotal * 0.20, 300);
  }

  const shippingFee = delivery_method === 'express' ? 99 : (subtotal >= 499 || coupon_code === 'FREESHIP' ? 0 : 40);
  const taxEstimate = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  return c.json({
    success: true,
    summary: {
      subtotal,
      discount,
      shippingFee,
      taxEstimate,
      grandTotal,
      freeShippingUnlocked: subtotal >= 499,
    }
  });
});

export default checkoutApp;
