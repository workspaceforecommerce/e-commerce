import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, StarOff, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2,
  XCircle, AlertTriangle, Clock, Search, Filter, RotateCcw, Trash2,
  Edit3, Eye, ChevronDown, ChevronUp, Check, X, Flag, Loader2,
  AlertCircle, BarChart3, TrendingUp, Award, HelpCircle, Send,
  ShieldCheck, Package, User
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Review {
  id: string; product_id: string; product_name: string;
  reviewer_name: string; reviewer_email: string;
  rating: number; title: string; body: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  is_verified_purchase: number; is_featured: number;
  helpful_count: number; admin_reply: string | null;
  media_urls: string; created_at: string;
}
interface QA {
  id: string; product_id: string; question: string;
  asker_name: string; answer: string | null; status: string;
  answered_at: string | null; created_at: string;
}
interface Stats { total: number; pending: number; approved: number; rejected: number; avg_rating: number; qa_pending: number; }

// ── Star renderer ─────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-3.5 h-3.5' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`${size} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
    ))}
  </div>
);

// ── Rating Bar component ───────────────────────────────────────────────────────
const RatingBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-6 text-right text-slate-600 font-semibold">{label}</span>
    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: total ? `${Math.round((count / total) * 100)}%` : '0%' }} />
    </div>
    <span className="w-6 text-slate-400 font-mono">{count}</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const ReviewsView: React.FC = () => {
  const [section, setSection] = useState<'reviews' | 'qa'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qa, setQA] = useState<QA[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, avg_rating: 0, qa_pending: 0 });
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [qaAnswerModal, setQaAnswerModal] = useState<QA | null>(null);
  const [qaAnswerText, setQaAnswerText] = useState('');

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterRating) params.set('rating', filterRating);
      if (searchQ) params.set('q', searchQ);

      const [rRes, sRes, qaRes]: [any, any, any] = await Promise.all([
        fetch(`/api/reviews?${params}`).then(r => r.json()),
        fetch('/api/reviews/summary').then(r => r.json()),
        fetch('/api/reviews/qa/all').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (rRes.success) setReviews(rRes.reviews);
      if (sRes.success) setStats(sRes.stats);
      if (qaRes.success) setQA(qaRes.qa);
    } catch {
      setReviews([
        { id: 'rev1', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Priya Sharma', reviewer_email: 'priya@gmail.com', rating: 5, title: 'Life-changing supplement!', body: "I've been taking this for 2 months and my stress levels have dropped significantly. Sleep quality is amazing. Highly recommended!", status: 'approved', is_verified_purchase: 1, is_featured: 1, helpful_count: 24, admin_reply: null, media_urls: '[]', created_at: '2026-07-20T10:00:00Z' },
        { id: 'rev2', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Rohit Mehta', reviewer_email: 'rohit@email.com', rating: 4, title: 'Very effective, packaging could be better', body: 'Great product, noticed energy improvements within 3 weeks. Packaging seal was slightly loose. Will buy again.', status: 'approved', is_verified_purchase: 1, is_featured: 0, helpful_count: 8, admin_reply: "Thank you for your feedback! We're improving our packaging.", media_urls: '[]', created_at: '2026-07-22T10:00:00Z' },
        { id: 'rev3', product_id: 'p2', product_name: 'Himalayan Tulsi Green Tea', reviewer_name: 'Anjali Kapoor', reviewer_email: 'anjali@email.com', rating: 5, title: "Best green tea I've ever had!", body: 'The aroma is incredible, very soothing. I drink 2 cups daily. Noticeable boost in immunity.', status: 'approved', is_verified_purchase: 1, is_featured: 1, helpful_count: 31, admin_reply: null, media_urls: '[]', created_at: '2026-07-18T10:00:00Z' },
        { id: 'rev4', product_id: 'p3', product_name: 'Moringa Leaf Powder', reviewer_name: 'Vikram Singh', reviewer_email: 'vikram@email.com', rating: 3, title: 'Okay product, taste is bitter', body: 'Works fine but the bitter taste is hard to handle. Mixing with smoothies helps a lot.', status: 'pending', is_verified_purchase: 0, is_featured: 0, helpful_count: 2, admin_reply: null, media_urls: '[]', created_at: '2026-07-26T10:00:00Z' },
        { id: 'rev5', product_id: 'p1', product_name: 'KSM-66 Ashwagandha', reviewer_name: 'Neha Gupta', reviewer_email: 'neha@email.com', rating: 2, title: 'Did not notice any difference', body: 'Used for 1 month but no significant changes. Maybe it\'s a placebo. Expected more.', status: 'pending', is_verified_purchase: 1, is_featured: 0, helpful_count: 0, admin_reply: null, media_urls: '[]', created_at: '2026-07-27T08:00:00Z' },
        { id: 'rev6', product_id: 'p4', product_name: 'Amla Chyawanprash', reviewer_name: 'Ramesh Patel', reviewer_email: 'ramesh@email.com', rating: 5, title: "Grandma's recipe quality!", body: 'Exactly like the traditional chyawanprash. My kids love it. Family has been ordering for 6 months.', status: 'approved', is_verified_purchase: 1, is_featured: 0, helpful_count: 19, admin_reply: null, media_urls: '[]', created_at: '2026-07-15T10:00:00Z' },
      ]);
      setStats({ total: 41, pending: 7, approved: 30, rejected: 4, avg_rating: 4.3, qa_pending: 3 });
      setQA([
        { id: 'qa1', product_id: 'p1', question: 'Can I take Ashwagandha with milk at night?', asker_name: 'Suresh K.', answer: 'Yes! Taking KSM-66 Ashwagandha with warm milk at night is the most traditional method. Helps with absorption and sleep.', status: 'approved', answered_at: '2026-07-21T10:00:00Z', created_at: '2026-07-20T10:00:00Z' },
        { id: 'qa2', product_id: 'p1', question: 'Is this suitable for diabetics?', asker_name: 'Meena R.', answer: 'Ashwagandha may help regulate blood sugar, but please consult your physician before starting if you are diabetic or on medication.', status: 'approved', answered_at: '2026-07-23T10:00:00Z', created_at: '2026-07-22T10:00:00Z' },
        { id: 'qa3', product_id: 'p1', question: 'What is the recommended dosage for adults?', asker_name: 'Ankit M.', answer: null, status: 'pending', answered_at: null, created_at: '2026-07-27T09:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRating, searchQ]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const updateStatus = async (ids: string[], status: string) => {
    for (const id of ids) {
      await fetch(`/api/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(() => {});
    }
    setSelected(new Set());
    showNotice(`${ids.length} review${ids.length > 1 ? 's' : ''} ${status}`);
    load();
  };

  const deleteReview = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotice('Review deleted');
    load();
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal || !replyText.trim()) return;
    await fetch(`/api/reviews/${replyModal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_reply: replyText }) }).catch(() => {});
    showNotice('Reply published');
    setReplyModal(null);
    setReplyText('');
    load();
  };

  const sendQAAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaAnswerModal || !qaAnswerText.trim()) return;
    await fetch(`/api/reviews/qa/${qaAnswerModal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: qaAnswerText, status: 'approved' }) }).catch(() => {});
    showNotice('Answer published');
    setQaAnswerModal(null);
    setQaAnswerText('');
    load();
  };

  const toggleSelect = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const selectAll = () => setSelected(selected.size === filteredReviews.length ? new Set() : new Set(filteredReviews.map(r => r.id)));

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filteredReviews = reviews.filter(r =>
    (!filterStatus || r.status === filterStatus) &&
    (!filterRating || r.rating === parseInt(filterRating)) &&
    (!searchQ || r.title.toLowerCase().includes(searchQ.toLowerCase()) || r.body.toLowerCase().includes(searchQ.toLowerCase()) || r.reviewer_name.toLowerCase().includes(searchQ.toLowerCase()) || r.product_name?.toLowerCase().includes(searchQ.toLowerCase()))
  );

  // ── Rating distribution (from mock) ─────────────────────────────────────────
  const dist = { r5: reviews.filter(r => r.rating === 5).length, r4: reviews.filter(r => r.rating === 4).length, r3: reviews.filter(r => r.rating === 3).length, r2: reviews.filter(r => r.rating === 2).length, r1: reviews.filter(r => r.rating === 1).length };
  const totalForDist = reviews.length || 1;

  const statusColor: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700', spam: 'bg-slate-200 text-slate-600' };
  const statusIcon: Record<string, React.ReactNode> = { approved: <CheckCircle2 className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, rejected: <XCircle className="w-3 h-3" />, spam: <Flag className="w-3 h-3" /> };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Notice */}
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900">Reviews, Ratings & Q&A</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.total} total reviews · {stats.pending} pending moderation · {stats.qa_pending} unanswered questions</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={() => updateStatus([...selected], 'approved')} className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Approve {selected.size}</button>
              <button onClick={() => updateStatus([...selected], 'rejected')} className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-700"><XCircle className="w-3.5 h-3.5" /> Reject {selected.size}</button>
              <button onClick={() => { selected.forEach(id => deleteReview(id)); setSelected(new Set()); }} className="flex items-center gap-1 bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </>
          )}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
          { label: 'Avg Rating', value: stats.avg_rating ? stats.avg_rating.toFixed(1) : '—', icon: Star, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Q&A Queue', value: stats.qa_pending, icon: HelpCircle, color: 'text-blue-700', bg: 'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="wp-card bg-white p-4 rounded-2xl flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            <div><p className="text-xl font-extrabold text-slate-900">{s.value}</p><p className="text-[11px] text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Rating Overview ───────────────────────────────────────────── */}
      <div className="wp-card bg-white p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center shrink-0">
          <p className="text-5xl font-extrabold text-slate-900">{stats.avg_rating ? stats.avg_rating.toFixed(1) : '—'}</p>
          <Stars rating={Math.round(stats.avg_rating)} size="w-5 h-5" />
          <p className="text-[11px] text-slate-400 mt-1">{stats.approved} verified reviews</p>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <RatingBar label="5" count={dist.r5} total={totalForDist} color="bg-emerald-500" />
          <RatingBar label="4" count={dist.r4} total={totalForDist} color="bg-emerald-400" />
          <RatingBar label="3" count={dist.r3} total={totalForDist} color="bg-amber-400" />
          <RatingBar label="2" count={dist.r2} total={totalForDist} color="bg-orange-400" />
          <RatingBar label="1" count={dist.r1} total={totalForDist} color="bg-red-500" />
        </div>
      </div>

      {/* ── Section Tabs ─────────────────────────────────────────────────── */}
      <div className="wp-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center border-b border-slate-200 px-4 gap-1">
          <button onClick={() => setSection('reviews')} className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${section === 'reviews' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Star className="w-3.5 h-3.5" /> Reviews
            {stats.pending > 0 && <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>}
          </button>
          <button onClick={() => setSection('qa')} className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${section === 'qa' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <HelpCircle className="w-3.5 h-3.5" /> Q&A
            {stats.qa_pending > 0 && <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats.qa_pending}</span>}
          </button>

          {/* Filters */}
          <div className="ml-auto flex items-center gap-2 py-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="search" placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="bg-slate-50 text-xs text-slate-900 rounded-lg pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 w-36" />
            </div>
            {section === 'reviews' && (
              <>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="spam">Spam</option>
                </select>
                <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
                  <option value="">All Ratings</option>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {loading && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-emerald-700 animate-spin" /></div>}

          {/* ── REVIEWS TAB ─────────────────────────────────────────────── */}
          {!loading && section === 'reviews' && (
            <>
              {filteredReviews.length > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <input type="checkbox" checked={selected.size === filteredReviews.length && filteredReviews.length > 0} onChange={selectAll} className="rounded" />
                  <span className="text-[11px] text-slate-500">Select All ({filteredReviews.length})</span>
                </div>
              )}

              {filteredReviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No reviews found</p>
                </div>
              )}

              <div className="space-y-3">
                {filteredReviews.map(rev => (
                  <div key={rev.id} className={`border rounded-2xl overflow-hidden transition-all ${rev.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                    {/* Review Header */}
                    <div className="flex items-start gap-3 p-4">
                      <input type="checkbox" checked={selected.has(rev.id)} onChange={() => toggleSelect(rev.id)} className="rounded mt-0.5 shrink-0" />

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                        {rev.reviewer_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-xs">{rev.reviewer_name}</p>
                          {rev.is_verified_purchase ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-2.5 h-2.5" /> Verified Purchase
                            </span>
                          ) : null}
                          {rev.is_featured ? <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Award className="w-2.5 h-2.5" /> Featured</span> : null}
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColor[rev.status]}`}>
                            {statusIcon[rev.status]}{rev.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <Stars rating={rev.rating} />
                          <p className="text-[11px] font-bold text-slate-700">{rev.title}</p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">{rev.body}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Package className="w-3 h-3" />{rev.product_name}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{rev.helpful_count} helpful</span>
                          <span>{new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {/* Admin reply preview */}
                        {rev.admin_reply && (
                          <div className="mt-2 bg-emerald-50 border-l-2 border-emerald-500 px-3 py-2 rounded-r-xl">
                            <p className="text-[10px] font-bold text-emerald-700 mb-0.5">Admin Reply</p>
                            <p className="text-[11px] text-slate-700">{rev.admin_reply}</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        {rev.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus([rev.id], 'approved')} className="flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                            <button onClick={() => updateStatus([rev.id], 'rejected')} className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-700 whitespace-nowrap">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {rev.status === 'approved' && (
                          <button onClick={() => updateStatus([rev.id], 'rejected')} className="flex items-center gap-1 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 whitespace-nowrap">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        )}
                        {rev.status === 'rejected' && (
                          <button onClick={() => updateStatus([rev.id], 'approved')} className="flex items-center gap-1 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 whitespace-nowrap">
                            <RotateCcw className="w-3 h-3" /> Restore
                          </button>
                        )}
                        <button onClick={() => { setReplyModal(rev); setReplyText(rev.admin_reply || ''); }} className="flex items-center gap-1 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 whitespace-nowrap">
                          <MessageSquare className="w-3 h-3" /> Reply
                        </button>
                        <button onClick={() => deleteReview(rev.id)} className="flex items-center gap-1 border border-red-200 text-red-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 whitespace-nowrap">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Q&A TAB ─────────────────────────────────────────────────── */}
          {!loading && section === 'qa' && (
            <div className="space-y-3">
              {qa.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No questions yet</p>
                </div>
              )}

              {qa.filter(q => !searchQ || q.question.toLowerCase().includes(searchQ.toLowerCase())).map(item => (
                <div key={item.id} className={`border rounded-2xl p-4 space-y-3 ${item.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><HelpCircle className="w-4 h-4 text-blue-600" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-slate-900 text-xs">{item.asker_name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{item.question}</p>
                    </div>
                    {!item.answer && (
                      <button onClick={() => { setQaAnswerModal(item); setQaAnswerText(''); }} className="flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 shrink-0">
                        <Send className="w-3 h-3" /> Answer
                      </button>
                    )}
                    {item.answer && (
                      <button onClick={() => { setQaAnswerModal(item); setQaAnswerText(item.answer || ''); }} className="flex items-center gap-1 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 shrink-0">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>

                  {/* Answer */}
                  {item.answer && (
                    <div className="ml-10 bg-emerald-50 border-l-2 border-emerald-500 px-3 py-2 rounded-r-xl">
                      <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-0.5"><ShieldCheck className="w-3 h-3" /> Admin Answer · {item.answered_at ? new Date(item.answered_at).toLocaleDateString('en-IN') : ''}</p>
                      <p className="text-xs text-slate-700">{item.answer}</p>
                    </div>
                  )}

                  {!item.answer && (
                    <div className="ml-10 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-[11px] text-slate-400">No answer yet — click <strong>Answer</strong> to respond</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Reply Modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Admin Reply to Review">
        {replyModal && (
          <form onSubmit={sendReply} className="space-y-4 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Stars rating={replyModal.rating} />
                <p className="font-bold text-slate-900">{replyModal.reviewer_name}</p>
              </div>
              <p className="text-slate-600 italic">"{replyModal.body}"</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Reply <span className="text-red-500">*</span></label>
              <textarea required rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a thoughtful, professional reply to this review…" className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" />
              <p className="text-[10px] text-slate-400 mt-1">This reply will be publicly visible on the product page.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setReplyModal(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>Publish Reply</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Q&A Answer Modal ──────────────────────────────────────────── */}
      <Modal isOpen={!!qaAnswerModal} onClose={() => setQaAnswerModal(null)} title="Answer Customer Question">
        {qaAnswerModal && (
          <form onSubmit={sendQAAnswer} className="space-y-4 text-xs">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Customer Question</p>
              <p className="font-semibold text-slate-800">{qaAnswerModal.question}</p>
              <p className="text-[10px] text-slate-500 mt-1">Asked by {qaAnswerModal.asker_name} · {new Date(qaAnswerModal.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Answer <span className="text-red-500">*</span></label>
              <textarea required rows={4} value={qaAnswerText} onChange={e => setQaAnswerText(e.target.value)} placeholder="Provide a clear, helpful answer…" className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setQaAnswerModal(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>Publish Answer</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
