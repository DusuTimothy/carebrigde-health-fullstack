import React from 'react';
import { Link } from 'react-router-dom';
import cn from '../../lib/cn.js';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-strong active:bg-accent-deep',
  secondary: 'bg-teal text-teal-deep hover:bg-secondary-500 hover:text-white active:bg-secondary-600',
  outline: 'border border-line-strong bg-transparent text-ink hover:border-accent hover:text-accent hover:bg-accent-soft',
  ghost: 'bg-transparent text-accent hover:bg-accent-soft',
  inverse: 'bg-white text-accent hover:bg-primary-50 active:bg-primary-100',
  gold: 'bg-gold text-primary-900 hover:bg-gold-300 active:bg-gold-400',
  outlineInverse: 'border border-white/70 text-white hover:bg-white/15',
  danger: 'bg-danger text-white hover:bg-[#A93232]',
};

const sizes = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/35 disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Button or Link styled as a button (pass `to` to render a router Link).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  to,
  className,
  type,
  children,
  ...props
}) {
  const cls = cn(base, variants[variant], sizes[size], block && 'w-full', className);
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? 'button'} className={cls} {...props}>
      {children}
    </button>
  );
}