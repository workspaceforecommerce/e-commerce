import React from 'react';

export type StatusVariant =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Delivered'
  | 'Shipped'
  | 'Cancelled'
  | 'Returned'
  | 'Paid'
  | 'Failed'
  | 'Draft'
  | 'Published'
  | 'active'
  | 'inactive'
  | 'low_stock';

interface BadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const getVariantStyles = (st: string) => {
    switch (st.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'delivered':
      case 'published':
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'processing':
      case 'shipped':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low_stock':
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-400 font-bold';
      case 'cancelled':
      case 'returned':
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all ${getVariantStyles(
        status
      )} ${className}`}
    >
      {label || status}
    </span>
  );
};
