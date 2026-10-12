import React, { useId, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Input from './Input.jsx';
import cn from '../../lib/cn.js';
import { passwordInputType, passwordToggleLabel } from '../../lib/password.js';

/**
 * Password field with an independent, accessible show/hide control. The toggle
 * is rendered inside the input wrapper (via Input's `trailing` slot) so it
 * stays vertically centred over the field and never submits the form.
 */
export default function PasswordInput({
  label = 'Password',
  value,
  onChange,
  hint,
  icon = Lock,
  className,
  id,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Input
      id={inputId}
      label={label}
      type={passwordInputType(visible)}
      icon={icon}
      hint={hint}
      className={cn('pr-12', className)}
      value={value}
      onChange={onChange}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={passwordToggleLabel(visible, label)}
          aria-pressed={visible}
          aria-controls={inputId}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          {visible ? (
            <EyeOff aria-hidden className="h-4 w-4" />
          ) : (
            <Eye aria-hidden className="h-4 w-4" />
          )}
        </button>
      }
      {...props}
    />
  );
}
