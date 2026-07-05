'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({ label, error, options, placeholder, value, onChange, disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  // 检测空间，决定向上还是向下弹出
  const calcDirection = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < 240 && rect.top > spaceBelow);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      calcDirection();
    }
  }, [open, calcDirection]);

  // 键盘导航
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const allVals = placeholder ? ['', ...options.map(o => String(o.value))] : options.map(o => String(o.value));
        const curIdx = allVals.indexOf(value || '');
        let nextIdx = e.key === 'ArrowDown' ? curIdx + 1 : curIdx - 1;
        if (nextIdx < 0) nextIdx = allVals.length - 1;
        if (nextIdx >= allVals.length) nextIdx = 0;
        onChange?.({ target: { value: allVals[nextIdx] } });
      }
      if (e.key === 'Enter') { setOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, value, options, placeholder, onChange]);

  const handleSelect = (val: string | number) => {
    onChange?.({ target: { value: String(val) } });
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <button
        type="button"
        ref={btnRef}
        disabled={disabled}
        onClick={() => { if (!disabled) { calcDirection(); setOpen(!open); } }}
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--status-danger)' : open ? 'var(--border-focus)' : 'var(--border-primary)'}`,
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          position: 'relative',
          zIndex: open ? 10001 : undefined,
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder || '请选择'}</span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 ml-2 transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute w-full rounded-md py-1 max-h-60 overflow-y-auto"
          style={{
            [dropUp ? 'bottom' : 'top']: '100%',
            [dropUp ? 'marginBottom' : 'marginTop']: '4px',
            left: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10000,
          }}
        >
          {placeholder && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: !value ? 'var(--bg-hover)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !value ? 'var(--bg-hover)' : 'transparent'; }}
            >
              {placeholder}
              {!value && <Check className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between"
              style={{
                color: 'var(--text-primary)',
                backgroundColor: String(opt.value) === String(value) ? 'var(--brand-light)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = String(opt.value) === String(value) ? 'var(--brand-light)' : 'transparent';
              }}
            >
              {opt.label}
              {String(opt.value) === String(value) && (
                <Check className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>{error}</p>}
    </div>
  );
}
