import { Hono } from 'hono';
import { Env, executeRun, queryAll, queryFirst } from '../db';

const shippingApp = new Hono<{ Bindings: Env }>();

// ── Courier Provider Interface ────────────────────────────────────────────────
export interface CourierProvider {
  createShipment(order: any): Promise<{ success: boolean; awb_number?: string; tracking_url?: string; courier_name?: string }>;
  getLiveTracking(awb_number: string): Promise<{ success: boolean; status?: string; checkpoints?: any[] }>;
  requestPickup(awb_number: string): Promise<{ success: boolean; pickup_id?: string; scheduled_date?: string }>;
}

// ── Delhivery Provider ───────────────────────────────────────────────────────
export class DelhiveryProvider implements CourierProvider {
  async createShipment(order: any) {
    const awb = `DEL${Math.floor(100000000 + Math.random() * 900000000)}IN`;
    return {
      success: true,
      awb_number: awb,
      tracking_url: `https://www.delhivery.com/track/package/${awb}`,
      courier_name: 'Delhivery Surface / Express'
    };
  }
  async getLiveTracking(awb: string) {
    return {
      success: true,
      status: 'In Transit',
      checkpoints: [
        { status: 'Manifested', location: 'Himalayan Hub, Bengaluru', timestamp: new Date().toISOString() },
        { status: 'In Transit', location: 'Delhivery Sorting Center, Hosur', timestamp: new Date().toISOString() }
      ]
    };
  }
  async requestPickup(awb: string) {
    return { success: true, pickup_id: `PU_DEL_${Date.now()}`, scheduled_date: new Date(Date.now() + 86400000).toISOString() };
  }
}

// ── Shiprocket Provider ──────────────────────────────────────────────────────
export class ShiprocketProvider implements CourierProvider {
  async createShipment(order: any) {
    const awb = `SR${Math.floor(100000000 + Math.random() * 900000000)}IN`;
    return {
      success: true,
      awb_number: awb,
      tracking_url: `https://shiprocket.co/tracking/${awb}`,
      courier_name: 'Shiprocket Air Courier'
    };
  }
  async getLiveTracking() { return { success: true, status: 'Picked Up', checkpoints: [] }; }
  async requestPickup() { return { success: true, pickup_id: `PU_SR_${Date.now()}` }; }
}

// ── Blue Dart Provider ──────────────────────────────────────────────────────
export class BlueDartProvider implements CourierProvider {
  async createShipment(order: any) {
    const awb = `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`;
    return {
      success: true,
      awb_number: awb,
      tracking_url: `https://www.bluedart.com/tracking`,
      courier_name: 'Blue Dart Air Express'
    };
  }
  async getLiveTracking() { return { success: true, status: 'Out For Delivery', checkpoints: [] }; }
  async requestPickup() { return { success: true, pickup_id: `PU_BD_${Date.now()}` }; }
}

// ── Courier Provider Factory ──────────────────────────────────────────────────
export class CourierProviderFactory {
  static getProvider(courier: string): CourierProvider {
    switch (courier.toLowerCase()) {
      case 'shiprocket': return new ShiprocketProvider();
      case 'bluedart': return new BlueDartProvider();
      case 'delhivery':
      default: return new DelhiveryProvider();
    }
  }
}

// ── GET /api/shipping/shipments ───────────────────────────────────────────────
shippingApp.get('/shipments', async (c) => {
  const status = c.req.query('status') || '';
  if (c.env?.DB) {
    let sql = 'SELECT * FROM shipments WHERE 1=1';
    const params: any[] = [];
    if (status) { sql += ' AND status=?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = await queryAll(c.env.DB, sql, params);
    return c.json({ success: true, shipments: rows });
  }
  return c.json({ success: true, shipments: mockShipmentsList() });
});

// ── POST /api/shipping/shipments (Create Shipment & AWB) ─────────────────────
shippingApp.post('/shipments', async (c) => {
  const { order_id, order_number, courier_code = 'delhivery', weight = 0.5, dimensions } = await c.req.json();
  if (!order_number) return c.json({ success: false, message: 'Order number required' }, 400);

  const provider = CourierProviderFactory.getProvider(courier_code);
  const shipmentResult = await provider.createShipment({ order_number });
  const shipmentId = `shp_${Date.now()}`;

  if (c.env?.DB) {
    await executeRun(c.env.DB,
      'INSERT INTO shipments (id, order_id, order_number, courier_name, awb_number, tracking_url, status, weight_kg) VALUES (?,?,?,?,?,?,?,?)',
      [shipmentId, order_id || 'ord_1', order_number, shipmentResult.courier_name || courier_code, shipmentResult.awb_number, shipmentResult.tracking_url, 'Ready To Ship', weight]
    );

    // Update order courier info and status
    await executeRun(c.env.DB,
      "UPDATE orders SET courier_name=?, tracking_number=?, order_status='Packed' WHERE order_number=?",
      [shipmentResult.courier_name || courier_code, shipmentResult.awb_number, order_number]
    );

    // Log timeline
    await executeRun(c.env.DB,
      'INSERT INTO order_status_history (id, order_id, status, comment) VALUES (?,?,?,?)',
      [`h_${Date.now()}`, order_id || 'ord_1', 'Packed', `Shipment created & AWB ${shipmentResult.awb_number} generated via ${shipmentResult.courier_name}`]
    ).catch(() => {});
  }

  return c.json({
    success: true,
    message: `Shipment created with AWB ${shipmentResult.awb_number}`,
    shipment: { id: shipmentId, awb_number: shipmentResult.awb_number, courier_name: shipmentResult.courier_name, tracking_url: shipmentResult.tracking_url }
  });
});

// ── POST /api/shipping/shipments/request-pickup ──────────────────────────────
shippingApp.post('/shipments/request-pickup', async (c) => {
  const { shipment_id, awb_number, courier_code = 'delhivery' } = await c.req.json();
  const provider = CourierProviderFactory.getProvider(courier_code);
  const pickup = await provider.requestPickup(awb_number);

  if (c.env?.DB && shipment_id) {
    await executeRun(c.env.DB, "UPDATE shipments SET status='Pickup Scheduled' WHERE id=?", [shipment_id]);
  }

  return c.json({ success: true, message: `Courier pickup scheduled (Pickup ID: ${pickup.pickup_id})`, pickup });
});

// ── GET /api/shipping/providers ──────────────────────────────────────────────
shippingApp.get('/providers', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM shipping_providers ORDER BY is_enabled DESC');
    return c.json({ success: true, providers: rows });
  }
  return c.json({ success: true, providers: mockProvidersList() });
});

// ── POST /api/shipping/rates (Calculate Shipping Rate) ──────────────────────
shippingApp.post('/rates', async (c) => {
  const { destination_pincode, weight_kg = 0.5 } = await c.req.json();
  const isLocal = destination_pincode?.startsWith('56');
  const rates = [
    { courier: 'Delhivery Surface', rate: isLocal ? 40 : 60, est_days: isLocal ? '1-2 Days' : '3-4 Days' },
    { courier: 'Blue Dart Air Express', rate: isLocal ? 75 : 120, est_days: 'Next Day Air' },
    { courier: 'Shiprocket Multi-Carrier', rate: isLocal ? 35 : 55, est_days: '2-3 Days' },
  ];
  return c.json({ success: true, rates });
});

function mockShipmentsList() {
  return [
    { id: 'shp1', order_number: 'HM-ORD-482910', courier_name: 'Delhivery Logistics', awb_number: 'DEL123456789IN', tracking_url: 'https://www.delhivery.com', status: 'In Transit', weight_kg: 0.8, created_at: '2026-07-27T15:00:00Z' },
    { id: 'shp2', order_number: 'HM-ORD-839210', courier_name: 'Blue Dart Air', awb_number: 'BD987654321IN', tracking_url: 'https://www.bluedart.com', status: 'Out For Delivery', weight_kg: 1.2, created_at: '2026-07-26T18:00:00Z' },
    { id: 'shp3', order_number: 'HM-ORD-109283', courier_name: 'Shiprocket Air', awb_number: 'SR554433221IN', tracking_url: 'https://shiprocket.co', status: 'Ready To Ship', weight_kg: 0.4, created_at: '2026-07-27T17:15:00Z' },
  ];
}

function mockProvidersList() {
  return [
    { id: 'sp_delhivery', courier_name: 'Delhivery Surface & Express', provider_code: 'delhivery', is_enabled: 1, api_key: 'dlh_live_991283' },
    { id: 'sp_shiprocket', courier_name: 'Shiprocket Multi-Courier Aggregator', provider_code: 'shiprocket', is_enabled: 1, api_key: 'sr_app_339182' },
    { id: 'sp_bluedart', courier_name: 'Blue Dart Air Express', provider_code: 'bluedart', is_enabled: 1, api_key: 'bd_corp_7712' },
    { id: 'sp_dtdc', courier_name: 'DTDC Courier', provider_code: 'dtdc', is_enabled: 0, api_key: 'dtdc_test' },
  ];
}

export default shippingApp;
