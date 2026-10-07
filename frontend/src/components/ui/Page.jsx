import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronRight, HeartPulse, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import cn from '../../lib/cn.js';
import { usePageMeta } from '../../lib/seo.js';

/* Defers the background-image paint until the element scrolls near the
   viewport (or IntersectionObserver is unavailable), then swaps it in. */
export function LazyBg({ image, className, children, ...rest }) {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setReady(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ backgroundImage: ready ? `url(${image})` : 'none' }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* Co-branded photographic art panel used inside interior heroes. */
function HeroArt({ image = '/images/health/doctor-team.jpg' }) {
  return (
    <div aria-hidden className="relative hidden w-full max-w-sm lg:block">
      <LazyBg
        image={image}
        className="media-art media-tile media-edge aspect-[4/3]"
      >
        <div className="absolute inset-0 flex items-start justify-between p-4">
          <span className="rounded-full border border-white/40 bg-primary-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            #1 in the region
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-[11px] font-semibold text-gold-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> 300+ locations
          </span>
        </div>
      </LazyBg>
      <div className="absolute -bottom-5 -left-8 flex items-center gap-3 rounded-xl border border-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink">#1 in the region</p>
          <p className="text-[11px] text-ink-muted">hospital patient care</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Page title hero used on interior pages (public + portal share this look).
 * `tone: 'dark'` paints the signature navy treatment over an optional photo.
 * Pass `image` to show a photograph under the navy gradient — the UCLA look.
 */
export function PageHero({ title, lead, crumbs = [], actions, children, tone = 'dark', art, image }) {
  const dark = tone === 'dark';
  usePageMeta({ title, description: lead });
  return (
    <section className={cn('relative overflow-hidden', dark ? 'bg-primary-900 text-white' : 'border-b border-line bg-accent-soft')}>
      {dark && image && (
        <LazyBg image={image} className="absolute inset-0 bg-cover bg-center" />
      )}
      {dark && (
        <div aria-hidden className="absolute inset-0 bg-navy-radial opacity-[0.92]" style={{ backgroundImage: 'linear-gradient(110deg, rgba(5,19,39,0.96) 20%, rgba(18,54,92,0.82) 55%, rgba(18,54,92,0.62) 100%)' }} />
      )}
      {dark && (
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:44px_44px]" />
      )}
      <div className={cn('relative mx-auto w-full max-w-6xl px-4 md:px-6', dark ? 'py-12 md:py-16' : 'py-10')}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 text-sm">
            <ol className={cn('flex flex-wrap items-center gap-1', dark ? 'text-white/65' : 'text-ink-muted')}>
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5" />}
                  {c.to ? (
                    <Link to={c.to} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className={dark ? 'text-white font-medium' : 'text-ink-secondary'}>
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex flex-wrap items-center justify-between gap-10">
          <div className={cn(dark && 'flex-1')}>
            <h1
              className={cn(
                'font-display tracking-tight',
                dark ? 'text-4xl font-medium leading-[1.05] md:text-5xl' : 'text-3xl font-bold text-ink md:text-4xl'
              )}
            >
              {title}
            </h1>
            {lead && (
              <p className={cn('mt-4 max-w-[56ch] text-base leading-relaxed md:text-lg', dark ? 'text-white/85' : 'text-ink-secondary')}>
                {lead}
              </p>
            )}
            {actions && <div className={cn('mt-6 flex flex-wrap gap-3')}>{actions}</div>}
          </div>
          {dark && (art ?? <HeroArt image={image ?? undefined} />)}
        </div>
        {children}
      </div>
      {dark && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      )}
    </section>
  );
}

/** Large search box used across directories. */
export function SearchBox({ onSubmit, value, onChange, placeholder, label = 'Search', buttonText = 'Search' }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="relative w-full"
    >
      <label htmlFor="site-search" className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
      <input
        id="site-search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-raised py-3 pl-11 pr-28 text-base text-ink placeholder:text-ink-muted shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        {buttonText}
      </button>
    </form>
  );
}