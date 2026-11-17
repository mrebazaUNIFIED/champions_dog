'use client';

import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600',
  secondary: 'border border-surface-300 bg-surface-0 text-ink-700 hover:border-surface-300 hover:bg-surface-50',
  ghost: 'text-ink-500 hover:bg-surface-100 hover:text-ink-900',
  danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
};

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  );
}
