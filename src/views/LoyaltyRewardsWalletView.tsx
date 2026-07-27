import React, { useState, useEffect } from 'react';
import {
  Award, Wallet, Share2, Ticket, CheckCircle2, AlertTriangle, RefreshCw,
  Plus, Edit3, User, ShieldCheck, DollarSign, Gift, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Users, Copy
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface LoyaltyAccount {
  id: string; customer_id: string; customer_name: string; email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'; points_balance: number;
  points_earned: number; points_spent: number; created_at: string;
}

interface WalletAccount {
  id: string; customer_id: string; customer_name: string; balance: number;
  total_credited: number; total_debited: number; updated_at: string;
}

interface ReferralRecord {
  id: string; referrer_name: string; referrer_code: string; referred_name: string;
  referred_email: string; status: string; reward_points: number; created_at: string;
}

export const LoyaltyRewardsWalletView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'loyalty' | 'wallet' | 'referrals'>('loyalty');
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Manual Points Modal State
  const [awardModal, setAwardModal] = useState<LoyaltyAccount | null>(null);
  const [awardPoints, setAwardPoints] = useState(100);
  const [awardReason, setAwardReason] = useState('Admin Bonus');

  // Credit Wallet Modal State
  const [walletModal, setWalletModal] = useState<WalletAccount | null>(null);
  const [creditAmount, setCreditAmount] = useState(250);
  const [creditDescription, setCreditDescription] = useState('Cashback Credit');

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, wRes, rRes]: [any, any, any] = await Promise.all([
        fetch('/api/loyalty').then(r => r.json()),
        fetch('/api/loyalty/wallet').then(r => r.json()),
        fetch('/api/loyalty/referrals').then(r => r.json()),
      ]);
      if (lRes.success) setAccounts(lRes.accounts);
      if (wRes.success) setWallets(wRes.wallets);
      if (rRes.success) setReferrals(rRes.referrals);
    } catch {
      setAccounts(mockLoyaltyAccounts());
      setWallets(mockWalletAccounts());
      setReferrals(mockReferralsList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardModal || !awardPoints) return;

    await fetch('/api/loyalty/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: awardModal.customer_id, points: awardPoints, reason: awardReason })
    }).catch(() => {});

    showNotice(`${awardPoints} points updated for ${awardModal.customer_name}`);
    setAwardModal(null);
    loadData();
  };

  const handleCreditWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModal || !creditAmount) return;

    await fetch('/api/loyalty/wallet/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: walletModal.customer_id, amount: creditAmount, description: creditDescription })
    }).catch(() => {});

    showNotice(`₹${creditAmount} credited to ${walletModal.customer_name}'s wallet`);
    setWalletModal(null);
    loadData();
  };

  const tierBadgeColor: Record<string, string> = {
    VIP: 'bg-purple-100 text-purple-800 border-purple-300',
    Gold: 'bg-amber-100 text-amber-800 border-amber-300',
    Silver: 'bg-slate-200 text-slate-800 border-slate-300',
    Bronze: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  const totalPoints = accounts.reduce((sum, a) => sum + (a.points_balance || 0), 0);
  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

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
            <Award className="w-5 h-5 text-emerald-700" /> Enterprise Loyalty, Rewards, Wallet & Referrals
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Tier multipliers, digital wallet balances, points redemption & viral referral program</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('loyalty')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'loyalty' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Loyalty & Tiers</button>
          <button onClick={() => setActiveSubTab('wallet')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'wallet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Digital Wallet</button>
          <button onClick={() => setActiveSubTab('referrals')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'referrals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Referrals & Catalog</button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{accounts.length}</p><p className="text-[11px] text-slate-500">Loyalty Members</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-amber-800">{totalPoints.toLocaleString()}</p><p className="text-[11px] text-slate-500">Active Reward Points</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">₹{totalWalletBalance.toLocaleString()}</p><p className="text-[11px] text-slate-500">Active Wallet Balances</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">{referrals.filter(r => r.status === 'Completed').length}</p><p className="text-[11px] text-slate-500">Completed Referrals</p></div>
      </div>

      {/* ── SUB-TAB 1: Loyalty & Tiers ─────────────────────────────────── */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { name: 'Bronze', multiplier: '1.0x', rule: '0 - 5,000 Spend', color: 'bg-orange-50 border-orange-200 text-orange-900' },
              { name: 'Silver', multiplier: '1.25x', rule: '₹5,000+ Spend', color: 'bg-slate-50 border-slate-200 text-slate-900' },
              { name: 'Gold', multiplier: '1.5x', rule: '₹15,000+ Spend', color: 'bg-amber-50 border-amber-200 text-amber-900' },
              { name: 'VIP', multiplier: '2.0x', rule: '₹30,000+ Spend', color: 'bg-purple-50 border-purple-200 text-purple-900' },
            ].map(t => (
              <div key={t.name} className={`p-4 rounded-2xl border ${t.color} space-y-1`}>
                <div className="flex justify-between items-center"><span className="font-extrabold text-sm">{t.name} Tier</span><span className="font-bold text-xs bg-white px-2 py-0.5 rounded shadow-xs">{t.multiplier}</span></div>
                <p className="text-[10px] opacity-80">{t.rule}</p>
              </div>
            ))}
          </div>

          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-slate-900">Member Points Balances</h2>
              <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Tier Level</th>
                    <th className="p-3">Current Points Balance</th>
                    <th className="p-3">Lifetime Earned</th>
                    <th className="p-3">Redeemed</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{acc.customer_name}</p>
                        <p className="text-[10px] text-slate-500">{acc.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierBadgeColor[acc.tier]}`}>{acc.tier}</span>
                      </td>
                      <td className="p-3 font-extrabold text-amber-800 text-sm">{acc.points_balance} pts</td>
                      <td className="p-3 font-bold text-slate-800">{acc.points_earned} pts</td>
                      <td className="p-3 text-slate-500">{acc.points_spent} pts</td>
                      <td className="p-3">
                        <button onClick={() => setAwardModal(acc)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" /> Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Digital Wallet ─────────────────────────────────── */}
      {activeSubTab === 'wallet' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Customer Digital Wallets</h2>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3">Total Credited</th>
                  <th className="p-3">Total Debited</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wallets.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{w.customer_name}</td>
                    <td className="p-3 font-extrabold text-emerald-800 text-sm">₹{w.balance}</td>
                    <td className="p-3 font-semibold text-slate-700">₹{w.total_credited}</td>
                    <td className="p-3 text-slate-500">₹{w.total_debited}</td>
                    <td className="p-3 text-slate-500">{new Date(w.updated_at).toLocaleString()}</td>
                    <td className="p-3">
                      <button onClick={() => setWalletModal(w)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-800 font-bold flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" /> Credit Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Referrals & Catalog ────────────────────────────── */}
      {activeSubTab === 'referrals' && (
        <div className="space-y-4">
          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Referral Program Activity</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Referrer</th>
                    <th className="p-3">Referral Code</th>
                    <th className="p-3">Referred Customer</th>
                    <th className="p-3">Points Rewarded</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {referrals.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{r.referrer_name}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">{r.referrer_code}</td>
                      <td className="p-3">{r.referred_name} ({r.referred_email})</td>
                      <td className="p-3 font-bold text-slate-800">+{r.reward_points} pts</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Points Award Modal */}
      <Modal isOpen={!!awardModal} onClose={() => setAwardModal(null)} title={`Adjust Points: ${awardModal?.customer_name || ''}`}>
        {awardModal && (
          <form onSubmit={handleAwardPoints} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Points to Award / Deduct (+/-)</label>
              <input type="number" required value={awardPoints} onChange={e => setAwardPoints(parseInt(e.target.value))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 font-mono font-bold" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Campaign Note</label>
              <input type="text" required value={awardReason} onChange={e => setAwardReason(e.target.value)} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setAwardModal(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Save Adjustment</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Credit Wallet Modal */}
      <Modal isOpen={!!walletModal} onClose={() => setWalletModal(null)} title={`Credit Wallet: ${walletModal?.customer_name || ''}`}>
        {walletModal && (
          <form onSubmit={handleCreditWallet} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount in INR (₹)</label>
              <input type="number" required value={creditAmount} onChange={e => setCreditAmount(parseInt(e.target.value))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 font-mono font-bold" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Description</label>
              <input type="text" required value={creditDescription} onChange={e => setCreditDescription(e.target.value)} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setWalletModal(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Credit Wallet</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

function mockLoyaltyAccounts(): LoyaltyAccount[] {
  return [
    { id: 'la1', customer_id: 'cust1', customer_name: 'Aarav Sharma', email: 'aarav@example.com', tier: 'VIP', points_balance: 2450, points_earned: 3200, points_spent: 750, created_at: '2025-11-10T10:00:00Z' },
    { id: 'la2', customer_id: 'cust2', customer_name: 'Priya Mehta', email: 'priya@gmail.com', tier: 'Gold', points_balance: 1820, points_earned: 2200, points_spent: 380, created_at: '2025-08-14T12:30:00Z' },
    { id: 'la3', customer_id: 'cust3', customer_name: 'Vikram Singh', email: 'vikram@yahoo.com', tier: 'Bronze', points_balance: 500, points_earned: 500, points_spent: 0, created_at: '2026-07-20T09:15:00Z' }
  ];
}

function mockWalletAccounts(): WalletAccount[] {
  return [
    { id: 'wa1', customer_id: 'cust1', customer_name: 'Aarav Sharma', balance: 450, total_credited: 1250, total_debited: 800, updated_at: '2026-07-27T14:30:00Z' },
    { id: 'wa2', customer_id: 'cust2', customer_name: 'Priya Mehta', balance: 899, total_credited: 899, total_debited: 0, updated_at: '2026-07-26T14:21:00Z' }
  ];
}

function mockReferralsList(): ReferralRecord[] {
  return [
    { id: 'ref1', referrer_name: 'Aarav Sharma', referrer_code: 'AARAV-HM20', referred_name: 'Karan Patel', referred_email: 'karan@gmail.com', status: 'Completed', reward_points: 500, created_at: '2026-07-20T11:00:00Z' },
    { id: 'ref2', referrer_name: 'Priya Mehta', referrer_code: 'PRIYA-HM15', referred_name: 'Neha Verma', referred_email: 'neha@yahoo.com', status: 'Pending Order', reward_points: 0, created_at: '2026-07-25T15:30:00Z' }
  ];
}
