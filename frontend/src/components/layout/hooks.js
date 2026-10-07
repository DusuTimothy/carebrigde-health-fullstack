import React, { useEffect, useRef } from 'react';

/* Hook: calls `onOutside` when a click happens outside the ref'd node. */
export function useClickOutside(onOutside) {
  const ref = useRef(null);
  const cbRef = useRef(onOutside);
  cbRef.current = onOutside;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cbRef.current?.();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  return ref;
}

/* Hook: locks body scroll while `active`. */
export function useBodyLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/* Hook: traps Tab/Shift+Tab focus inside `ref` while `active`, focusing the
   first focusable element on open and restoring focus on unmount. */
export function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const prev = document.activeElement;

    const focusables = () =>
      Array.from(
        el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((n) => !n.hasAttribute('disabled') && n.getAttribute('aria-hidden') !== 'true');
    const first = () => focusables()[0];
    const last = () => focusables()[focusables().length - 1];

    first()?.focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement);
      if (e.shiftKey && (current <= 0 || document.activeElement === el)) {
        e.preventDefault();
        last().focus();
      } else if (!e.shiftKey && (current === items.length - 1 || current === -1)) {
        e.preventDefault();
        first().focus();
      }
    }

    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      prev?.focus?.();
    };
  }, [active]);

  return ref;
}