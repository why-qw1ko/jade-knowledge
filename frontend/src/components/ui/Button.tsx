'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  hoverStyle?: React.CSSProperties;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, hoverStyle, children, disabled, style, ...props }, ref) => {
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all',
          'focus:outline-none',
          'active:scale-[0.97] disabled:active:scale-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizes[size],
          className
        )}
        style={{ ...getVariantStyle(variant), ...style }}
        disabled={disabled || loading}
        onMouseEnter={(e) => { Object.assign(e.currentTarget.style, getDefaultHoverStyle(variant), hoverStyle || {}); }}
        onMouseLeave={(e) => { Object.assign(e.currentTarget.style, getVariantStyle(variant), style || {}); }}
        {...props}
      >
        {loading && (
          <span className="inline-flex items-center gap-0.5 mr-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full animate-bounce"
                style={{ backgroundColor: 'currentColor', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
        {children}
      </button>
    );
  }
);

function getVariantStyle(variant: string): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: 'var(--brand-primary)',
        color: '#ffffff',
        boxShadow: 'var(--shadow-sm)',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
      };
    case 'danger':
      return {
        backgroundColor: 'var(--status-danger)',
        color: '#ffffff',
      };
    default:
      return {};
  }
}

function getDefaultHoverStyle(variant: string): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return { backgroundColor: 'var(--brand-hover)' };
    case 'secondary':
      return { backgroundColor: 'var(--bg-hover)' };
    case 'ghost':
      return { backgroundColor: 'var(--bg-hover)' };
    case 'danger':
      return { backgroundColor: '#dc2626' };
    default:
      return {};
  }
}

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
