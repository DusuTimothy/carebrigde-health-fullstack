import React from 'react';
import cn from '../../lib/cn.js';
import { initials } from '../../lib/format.js';

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg' };

export default function Avatar({ name, size = 'md', tone = 'primary', className, src }) {
  const tones = {
    primary: 'bg-accent-soft text-accent',
    teal: 'bg-teal-soft text-teal-deep',
    neutral: 'bg-neutral-200 text-ink-secondary',
  };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn('inline-block shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold uppercase',
        sizes[size],
        tones[tone],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}