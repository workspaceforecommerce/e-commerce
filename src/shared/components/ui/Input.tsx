import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 text-xs">
        {label && <label className="block text-slate-700 font-semibold mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-2.5 text-slate-400">{icon}</div>}
          <input
            ref={ref}
            className={`w-full bg-white text-slate-900 text-xs rounded-xl py-2.5 px-3 border transition-all focus:outline-none ${
              icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                : 'border-slate-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
