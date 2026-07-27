import { describe, it, expect } from 'vitest';
import productsApp from '../api/routes/products';
import couponsApp from '../api/routes/coupons';
import cloudinaryApp from '../api/routes/cloudinary';

describe('Healthy Monks API & PWA System Tests', () => {
  it('should return products list from fallback/D1 engine', async () => {
    const res = await productsApp.request('/products');
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
    expect(data.products[0]).toHaveProperty('title');
  });

  it('should validate promo coupons correctly with flat discount', async () => {
    const res = await couponsApp.request('/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME100', cartTotal: 599 }),
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.coupon.calculatedDiscount).toBe(100);
  });

  it('should reject coupon if minimum order requirement is not met', async () => {
    const res = await couponsApp.request('/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME100', cartTotal: 200 }),
    });
    expect(res.status).toBe(400);
    const data: any = await res.json();
    expect(data.success).toBe(false);
  });

  it('should generate secure Cloudinary signed upload parameters', async () => {
    const res = await cloudinaryApp.request('/signature', { method: 'POST' });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.cloudName).toBe('hfx4iebd');
    expect(data).toHaveProperty('signature');
    expect(data).toHaveProperty('timestamp');
  });
});
