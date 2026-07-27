import React from 'react';
import { Inbox, Search, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are currently no items matching your request.',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="wp-card rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-6 bg-white animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-emerald-700 border border-slate-200 shadow-2xs">
        {icon || <Inbox className="w-7 h-7" />}
      </div>

      <div className="space-y-1">
        <h3 className="font-heading text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
