import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 shadow-2xs';

  const variantStyles = {
    primary: 'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-800',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900',
    outline: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 shadow-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-700',
    success: 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
