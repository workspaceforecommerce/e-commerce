import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  subtitle,
  breadcrumbs = [{ label: 'Dashboard' }, { label: title }],
  actions,
  children,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb Bar */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        {breadcrumbs.map((bc, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={i === breadcrumbs.length - 1 ? 'font-bold text-emerald-800' : ''}>
              {bc.label}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Header Banner */}
      <div className="wp-card p-6 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Main Page Slot */}
      <div>{children}</div>
    </div>
  );
};
