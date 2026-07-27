import { Hono } from 'hono';
import { Env, queryFirst } from '../db';

const couponsApp = new Hono<{ Bindings: Env }>();

couponsApp.post('/apply', async (c) => {
  const { code, cartTotal } = await c.req.json();

  if (!code) {
    return c.json({ success: false, message: 'Coupon code is required' }, 400);
  }

  const normalizedCode = code.trim().toUpperCase();

  if (!c.env?.DB) {
    // Fallback static validation
    const fallbackCoupons: Record<string, any> = {
      'WELCOME100': { code: 'WELCOME100', discount_type: 'flat', discount_value: 100, min_order_amount: 499, max_discount_amount: 100 },
      'MONK15': { code: 'MONK15', discount_type: 'percentage', discount_value: 15, min_order_amount: 799, max_discount_amount: 250 },
      'DETOX20': { code: 'DETOX20', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, max_discount_amount: 300 }
    };

    const coupon = fallbackCoupons[normalizedCode];
    if (!coupon) {
      return c.json({ success: false, message: 'Invalid coupon code' }, 404);
    }

    if (cartTotal < coupon.min_order_amount) {
      return c.json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`
      }, 400);
    }

    let discount = 0;
    if (coupon.discount_type === 'flat') {
      discount = coupon.discount_value;
    } else {
      discount = Math.min((cartTotal * coupon.discount_value) / 100, coupon.max_discount_amount || Infinity);
    }

    return c.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        calculatedDiscount: discount
      }
    });
  }

  const coupon = await queryFirst(
    c.env.DB,
    'SELECT * FROM coupons WHERE code = ? AND status = "active"',
    [normalizedCode]
  );

  if (!coupon) {
    return c.json({ success: false, message: 'Invalid or expired coupon code' }, 404);
  }

  if (cartTotal < coupon.min_order_amount) {
    return c.json({
      success: false,
      message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`
    }, 400);
  }

  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value;
  } else {
    discount = Math.min((cartTotal * coupon.discount_value) / 100, coupon.max_discount_amount || Infinity);
  }

  return c.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      calculatedDiscount: Math.round(discount * 100) / 100
    }
  });
});

export default couponsApp;
