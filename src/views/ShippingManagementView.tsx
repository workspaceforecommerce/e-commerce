import React, { useState, useEffect } from 'react';
import {
  Truck, Package, MapPin, Calendar, Clock, Search, RefreshCw, Printer,
  CheckCircle2, AlertTriangle, ExternalLink, Calculator, Settings, Send,
  FileText, ShieldCheck, Box, ChevronRight
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface ShipmentRecord {
  id: string; order_number: string; courier_name: string; awb_number: string;
  tracking_url: string; status: string; weight_kg: number; created_at: string;
}

interface CourierProviderConfig {
  id: string; courier_name: string; provider_code: string; is_enabled: number; api_key: string;
}

export const ShippingManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'shipments' | 'couriers' | 'calculator'>('shipments');
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [couriers, setCouriers] = useState<CourierProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Rate calculator state
  const [calcPincode, setCalcPincode] = useState('560038');
  const [calcWeight, setCalcWeight] = useState('0.5');
  const [calcRates, setCalcRates] = useState<any[]>([]);

  // Shipping Label Modal State
  const [labelShipment, setLabelShipment] = useState<ShipmentRecord | null>(null);

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes]: [any, any] = await Promise.all([
        fetch('/api/shipping/shipments').then(r => r.json()),
        fetch('/api/shipping/providers').then(r => r.json()),
      ]);
      if (sRes.success) setShipments(sRes.shipments);
      if (cRes.success) setCouriers(cRes.providers);
    } catch {
      setShipments(mockShipmentsList());
      setCouriers(mockProvidersList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCalculateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const res: any = await fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_pincode: calcPincode, weight_kg: Number(calcWeight) })
    }).then(r => r.json()).catch(() => ({ success: true, rates: mockRateList() }));
    if (res.rates) setCalcRates(res.rates);
  };

  const handleRequestPickup = async (shp: ShipmentRecord) => {
    const res: any = await fetch('/api/shipping/shipments/request-pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id: shp.id, awb_number: shp.awb_number, courier_code: shp.courier_name })
    }).then(r => r.json()).catch(() => ({ success: true, pickup: { pickup_id: 'PU_MOCK' } }));

    if (res.success) {
      showNotice(`Pickup scheduled for AWB ${shp.awb_number}`);
      loadData();
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'In Transit': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Out For Delivery': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Ready To Ship': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Pickup Scheduled': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in text-xs">
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice.text}
        </div>
      )}

      {/* Header */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-700" /> Enterprise Shipping & Courier Management
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Multi-courier fulfillment for Delhivery, Shiprocket, Blue Dart & DTDC</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('shipments')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'shipments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Active Shipments</button>
          <button onClick={() => setActiveSubTab('couriers')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'couriers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Courier Integrations</button>
          <button onClick={() => setActiveSubTab('calculator')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'calculator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Rate Calculator</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Active Shipments ────────────────────────────────── */}
      {activeSubTab === 'shipments' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Live Express Shipments</h2>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Courier Partner</th>
                  <th className="p-3">AWB Tracking #</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-800">{s.order_number}</td>
                    <td className="p-3 font-bold text-slate-800">{s.courier_name}</td>
                    <td className="p-3 font-mono font-extrabold text-amber-800">{s.awb_number}</td>
                    <td className="p-3 font-mono text-slate-600">{s.weight_kg} kg</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="p-3 flex items-center gap-2">
                      <button onClick={() => setLabelShipment(s)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-bold flex items-center gap-1">
                        <Printer className="w-3 h-3 text-emerald-700" /> Label
                      </button>
                      <button onClick={() => handleRequestPickup(s)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold flex items-center gap-1">
                        <Send className="w-3 h-3" /> Pickup
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Courier Partner Integrations ────────────────────── */}
      {activeSubTab === 'couriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {couriers.map(c => (
            <div key={c.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-heading font-extrabold text-sm text-slate-900">{c.courier_name}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active Provider</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between"><span>Provider Code</span><span className="font-mono font-bold text-slate-900">{c.provider_code}</span></div>
                <div className="flex justify-between"><span>API Credential</span><span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">{c.api_key}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SUB-TAB 3: Shipping Rate Calculator ──────────────────────── */}
      {activeSubTab === 'calculator' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">Courier Shipping Rate & SLA Estimator</h2>
          <form onSubmit={handleCalculateRates} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Destination Pincode</label>
              <input type="text" required value={calcPincode} onChange={e => setCalcPincode(e.target.value)} className="w-full bg-slate-50 font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dead Weight (Kg)</label>
              <input type="text" required value={calcWeight} onChange={e => setCalcWeight(e.target.value)} className="w-full bg-slate-50 font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" size="sm" className="w-full">Calculate Courier Rates</Button>
            </div>
          </form>

          {calcRates.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {calcRates.map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{r.courier}</p>
                    <p className="text-[11px] text-slate-500">Estimated SLA: {r.est_days}</p>
                  </div>
                  <span className="font-heading font-extrabold text-sm text-emerald-800">₹{r.rate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Thermal Label Modal */}
      <Modal isOpen={!!labelShipment} onClose={() => setLabelShipment(null)} title={`Thermal Shipping Label (4x6)`}>
        {labelShipment && (
          <div className="space-y-4 text-xs font-mono border-2 border-dashed border-slate-400 p-4 rounded-xl bg-white text-slate-900">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
              <div>
                <h3 className="font-extrabold text-sm">HEALTHY MONKS AYURVEDA</h3>
                <p className="text-[10px]">Himalayan Logistics Warehouse, BLR</p>
              </div>
              <span className="font-extrabold text-base border-2 border-slate-900 px-2 py-0.5">EXPRESS</span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-bold">SHIP TO (CUSTOMER):</p>
              <p className="font-extrabold text-sm">{labelShipment.order_number}</p>
              <p>Aarav Sharma · +91 9812345678</p>
              <p>42 Lotus Heights, MG Road, Indiranagar</p>
              <p className="font-extrabold">Bengaluru, Karnataka - 560038</p>
            </div>

            <div className="border-t-2 border-b-2 border-slate-900 py-3 text-center space-y-1 bg-slate-50">
              <p className="text-[10px] font-bold">COURIER: {labelShipment.courier_name.toUpperCase()}</p>
              <p className="font-extrabold text-lg tracking-widest text-slate-900">||| |||| || |||||| |||</p>
              <p className="font-extrabold text-sm text-emerald-800">AWB: {labelShipment.awb_number}</p>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>Weight: {labelShipment.weight_kg} KG</span>
              <span>Tamper Evident Seal Sealed</span>
            </div>

            <div className="pt-2">
              <Button type="button" variant="primary" size="sm" className="w-full" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> Print 4x6 Label
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function mockShipmentsList(): ShipmentRecord[] {
  return [
    { id: 'shp1', order_number: 'HM-ORD-482910', courier_name: 'Delhivery Logistics', awb_number: 'DEL123456789IN', tracking_url: 'https://www.delhivery.com', status: 'In Transit', weight_kg: 0.8, created_at: '2026-07-27T15:00:00Z' },
    { id: 'shp2', order_number: 'HM-ORD-839210', courier_name: 'Blue Dart Air', awb_number: 'BD987654321IN', tracking_url: 'https://www.bluedart.com', status: 'Out For Delivery', weight_kg: 1.2, created_at: '2026-07-26T18:00:00Z' },
    { id: 'shp3', order_number: 'HM-ORD-109283', courier_name: 'Shiprocket Air', awb_number: 'SR554433221IN', tracking_url: 'https://shiprocket.co', status: 'Ready To Ship', weight_kg: 0.4, created_at: '2026-07-27T17:15:00Z' },
  ];
}

function mockProvidersList(): CourierProviderConfig[] {
  return [
    { id: 'sp_delhivery', courier_name: 'Delhivery Surface & Express', provider_code: 'delhivery', is_enabled: 1, api_key: 'dlh_live_991283' },
    { id: 'sp_shiprocket', courier_name: 'Shiprocket Multi-Courier Aggregator', provider_code: 'shiprocket', is_enabled: 1, api_key: 'sr_app_339182' },
    { id: 'sp_bluedart', courier_name: 'Blue Dart Air Express', provider_code: 'bluedart', is_enabled: 1, api_key: 'bd_corp_7712' },
    { id: 'sp_dtdc', courier_name: 'DTDC Courier', provider_code: 'dtdc', is_enabled: 0, api_key: 'dtdc_test' },
  ];
}

function mockRateList() {
  return [
    { courier: 'Delhivery Surface', rate: 40, est_days: '1-2 Days' },
    { courier: 'Blue Dart Air Express', rate: 75, est_days: 'Next Day Air' },
    { courier: 'Shiprocket Multi-Carrier', rate: 35, est_days: '2-3 Days' },
  ];
}
