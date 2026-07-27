import app from '../api/index';

export async function runMvcApiTests() {
  console.log('🧪 Starting MVC API Controller & Service Integration Tests...');

  const routesToTest = [
    '/',
    '/api/health',
    '/api/products',
    '/api/products/categories',
    '/api/orders',
    '/api/reviews',
    '/api/coupons',
    '/api/brands',
    '/api/payments/gateways',
    '/api/shipping/shipments',
    '/api/returns',
    '/api/invoices',
    '/api/notifications/logs',
    '/api/customers',
    '/api/staff',
    '/api/tickets',
    '/api/loyalty/members',
    '/api/analytics/customers',
    '/api/analytics/segments'
  ];

  let passed = 0;
  let failed = 0;

  for (const path of routesToTest) {
    try {
      const res = await app.request(path);
      if (res.status === 200) {
        const body: any = await res.json();
        if (body.success !== false) {
          passed++;
        } else {
          console.error(`❌ Controller path ${path} returned success: false`);
          failed++;
        }
      } else {
        console.error(`❌ Controller path ${path} failed with HTTP status ${res.status}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`❌ Exception testing ${path}:`, err.message);
      failed++;
    }
  }

  console.log(`\n✅ Test Summary: ${passed} passed, ${failed} failed out of ${routesToTest.length} MVC API controller routes.`);
  return { passed, failed, total: routesToTest.length };
}
