import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Menu, X, HeartPulse, Search, Siren } from 'lucide-react';
import { useClickOutside, useFocusTrap } from './hooks.js';
import { useToast } from '../ui/Toast.jsx';
import cn from '../../lib/cn.js';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
  { code: 'pcm', label: 'Pidgin English' },
  { code: 'fr', label: 'France' },
];

const NAV = [
  {
    id: 'find-care',
    label: 'Find Care',
    to: '/find-a-doctor',
    items: [
      { to: '/find-a-doctor', label: 'Find a doctor', desc: 'Search our clinician directory' },
      { to: '/find-a-location', label: 'Find a location', desc: 'Clinics and hospitals near you' },
      { to: '/pharmacy', label: 'Buy drugs online', desc: 'Order medicines from Carebridge Pharmacy' },
      { to: '/virtual-care', label: 'Virtual care', desc: 'Video visits and E-visits' },
      { to: '/services', label: 'Medical services', desc: 'Every specialty we offer' },
      { to: '/clinical-trials', label: 'Clinical trials', desc: 'Research studies enrolling now' },
    ],
  },
  {
    id: 'patient-resources',
    label: 'Patient Resources',
    to: '/about',
    items: [
      { to: '/health-library', label: 'Health library', desc: 'Plain-language health topics' },
      { to: '/patient-stories', label: 'Patient stories', desc: 'Real journeys, real people' },
      { to: '/international', label: 'International services', desc: 'Care for patients traveling to us' },
      { to: '/contact', label: 'Contact us', desc: 'Phone and email directories' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    to: '/find-a-location',
  },
  {
    id: 'discover',
    label: 'Discover',
    to: '/about',
    items: [
      { to: '/about', label: 'About Carebridge', desc: 'Mission, statistics and rankings' },
      { to: '/news-and-insights', label: 'News & insights', desc: 'Latest stories and research' },
      { to: '/community-equity', label: 'Community & equity', desc: 'Our commitment to access' },
      { to: '/departments', label: 'Departments index', desc: 'Browse all clinical departments' },
      { to: '/donate', label: 'Donate', desc: 'Support our mission' },
    ],
  },
];

const EXPLORE_LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/find-a-location', label: 'Our hospitals & clinics' },
  { to: '/departments', label: 'Departments' },
  { to: '/news-and-insights', label: 'News & insights' },
  { to: '/community-equity', label: 'Community & equity' },
];

const QUICKLINKS = [
  { label: 'Find a Doctor', to: '/find-a-doctor' },
  { label: 'Find a Location', to: '/find-a-location' },
  { label: 'Medical Services', to: '/services' },
  { label: 'Buy Drugs Online', to: '/pharmacy' },
  { label: 'Clinical Trials', to: '/clinical-trials' },
  { label: 'Virtual Care', to: '/virtual-care' },
  { label: 'Health Library', to: '/health-library' },
];

/* Full-screen search overlay — modeled on the reference header search, complete
   with the serif "Search" headline and quick-link pills. */
function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  function go(e) {
    e.preventDefault();
    onClose();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  }

  if (!open) return null;
  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search Carebridge Health"
      className="fixed inset-0 z-[300] overflow-y-auto bg-primary-900/80"
    >
      <div className="flex min-h-full items-start justify-center px-4 pb-16 pt-[10vh]">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-3xl bg-surface-raised p-8 shadow-2xl sm:p-10">
            <button
              onClick={onClose}
              aria-label="Close search"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted hover:bg-neutral-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">Search</h2>
            <form onSubmit={go} className="mt-7 flex gap-2">
              <input
                autoFocus
                role="searchbox"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctors, locations, services, topics…"
                className="min-w-0 flex-1 rounded-lg border border-line px-4 py-3.5 text-base shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
              />
              <button type="submit" className="rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-primary-900 transition-colors hover:bg-gold-300">
                Search
              </button>
            </form>
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Quick links</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICKLINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={onClose}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo({ sub = 'Health', inverse = false }) {
  return (
    <Link to="/" aria-label="Carebridge Health home" className="flex shrink-0 items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-md">
        <HeartPulse className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn('font-bold text-lg tracking-tight', inverse ? 'text-white' : 'text-primary-700')}>
          Carebridge
        </span>
        <span className={cn('text-[11px] font-medium', inverse ? 'text-white/65' : 'text-ink-muted')}>{sub}</span>
      </span>
    </Link>
  );
}

function TranslationWidget({ inverse = false, compact = false }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const ref = useClickOutside(() => setOpen(false));
  const { push } = useToast();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:opacity-80',
          inverse ? 'text-white/85 hover:text-white' : 'text-ink-secondary hover:text-accent'
        )}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        {!compact && <span>{LANGUAGES.find((l) => l.code === lang)?.label}</span>}
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[210] w-52 rounded-xl border border-line bg-surface-raised p-1.5 shadow-lg animate-fade-in"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={lang === l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
                document.documentElement.lang = l.code;
                if (l.code !== 'en') {
                  push(
                    'Translation preview',
                    `Site strings would render in ${l.label}. Full translation is a server-side step — this demo simulates the picker.`,
                    'info'
                  );
                }
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm',
                lang === l.code ? 'bg-accent-soft text-accent font-semibold' : 'text-ink hover:bg-neutral-100'
              )}
            >
              <span>{l.label}</span>
              {lang === l.code && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 'lg' }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-lg bg-accent text-white',
        size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'
      )}
    >
      <HeartPulse className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
    </span>
  );
}

/* Compact "Explore" dropdown for the utility bar — keeps the top strip sparse. */
function ExploreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:text-white"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        Explore
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-[210] w-56 rounded-xl border border-line bg-surface-raised p-1.5 shadow-lg animate-fade-in"
        >
          {EXPLORE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PublicHeader() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const ref = useClickOutside(() => setOpenMenu(null));

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Emergency strip */}
      <div className="bg-danger">
        <div className="mx-auto flex min-h-8 w-full max-w-6xl items-center gap-2 px-4 text-xs font-bold text-white md:px-6">
          <Siren className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            Medical emergency? Dial{' '}
            <a href="tel:112" className="underline underline-offset-2 hover:opacity-80">
              112
            </a>{' '}
            or go to the nearest emergency department.
          </span>
        </div>
      </div>
      {/* Utility bar */}
      <div className="bg-primary-900 text-white/80">
        <div className="mx-auto flex min-h-9 w-full max-w-6xl items-center justify-between gap-4 px-4 text-xs md:px-6">
          <div className="flex shrink-0 items-center gap-5">
            <ExploreDropdown />
            <Link to="/services" className="hidden whitespace-nowrap font-semibold text-gold-200 hover:text-gold-100 hover:underline underline-offset-3 md:inline-flex">
              Refer a patient
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <TranslationWidget inverse compact />
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-white hover:underline underline-offset-3"
            >
              <Search className="h-3.5 w-3.5" aria-hidden /> <span className="hidden sm:inline">Search</span>
            </button>
            <Link to="/donate" className="hidden items-center gap-1 hover:text-white hover:underline underline-offset-3 md:inline-flex">
              Donate
            </Link>
            <Link to="/contact" className="hidden items-center gap-1 hover:text-white hover:underline underline-offset-3 md:inline-flex">
              Contact us
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1 font-semibold text-gold-200 hover:text-white hover:underline underline-offset-3"
            >
              Portal log in
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-[100] border-b border-line bg-surface-raised">
        <div className="mx-auto flex min-h-[72px] w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <Logo />
          <div ref={ref} className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <div key={item.id} className="relative">
                {item.items ? (
                  <>
                    <button
                      aria-expanded={openMenu === item.id}
                      onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-semibold',
                        openMenu === item.id
                          ? 'bg-accent-soft text-accent'
                          : 'text-primary-700 hover:bg-neutral-100 hover:text-accent'
                      )}
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    {openMenu === item.id && (
                      <div className="absolute left-0 top-[calc(100%+4px)] z-[210] w-72 rounded-xl border border-line bg-surface-raised p-2 shadow-lg animate-fade-in">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setOpenMenu(null)}
                            className="mb-0.5 flex flex-col rounded-lg px-3 py-2.5 last:mb-0 hover:bg-accent-soft"
                          >
                            <span className="text-sm font-semibold text-ink">{sub.label}</span>
                            {sub.desc && <span className="mt-0.5 text-xs text-ink-muted">{sub.desc}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex rounded-lg px-3 py-2 text-lg font-semibold',
                        isActive ? 'bg-accent-soft text-accent' : 'text-primary-700 hover:bg-neutral-100 hover:text-accent'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <Link
              to="/portal/patient/book?guest=1"
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold px-5 text-sm font-bold text-primary-900 shadow-sm transition-colors hover:bg-gold-300"
            >
              <span className="sm:hidden">Book</span>
              <span className="hidden sm:inline">Book an appointment</span>
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary-700 hover:bg-neutral-100 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-line px-4 py-4 lg:hidden">
            {NAV.map((item) => (
              <div key={item.id} className="py-0.5">
                <span className="block px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {item.label}
                </span>
                <div className="flex flex-col gap-0.5">
                  {(item.items ?? [{ to: item.to, label: item.label }]).map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-ink hover:bg-neutral-100 hover:text-accent"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-ink"
            >
              <Search className="h-4 w-4" /> Search Carebridge Health
            </button>
            <Link
              to="/portal/patient/book?guest=1"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center rounded-lg bg-gold px-5 text-sm font-bold text-primary-900"
            >
              Book an appointment
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}

export default PublicHeader;