'use client';

import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary-container text-on-primary-container hover:bg-primary-fixed hover:shadow-[0_0_16px_rgba(0,245,155,0.4)]',
  secondary: 'border border-outline-variant bg-transparent text-on-surface hover:border-outline-variant hover:bg-surface-container-high',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  danger: 'bg-secondary-container text-white hover:bg-secondary-container/85',
};

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'font-display inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  );
}
