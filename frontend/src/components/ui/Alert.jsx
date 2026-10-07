import React from 'react';
import cn from '../../lib/cn.js';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle2,
};

const tones = {
  info: 'bg-info-soft text-info-ink border-info-border',
  warning: 'bg-warning-soft text-warning-ink border-warning-border',
  danger: 'bg-danger-soft text-danger-ink border-danger-border',
  success: 'bg-success-soft text-success-ink border-success-border',
};

export default function Alert({ tone = 'info', title, children, className }) {
  const Icon = icons[tone];
  return (
    <div role="alert" className={cn('flex gap-3 rounded-lg border p-4 text-sm', tones[tone], className)}>
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  );
}