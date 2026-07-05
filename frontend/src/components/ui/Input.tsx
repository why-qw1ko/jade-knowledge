'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md px-3 py-2 text-sm transition-colors focus:outline-none app-input',
            error && 'app-input-error',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
