import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`pitch-card p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-display text-base font-semibold text-ink-900 ${className}`}>{children}</h3>;
}
