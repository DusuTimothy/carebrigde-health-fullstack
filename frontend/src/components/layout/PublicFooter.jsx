import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Phone, Mail, Siren } from 'lucide-react';
import { LogoMark } from './PublicHeader.jsx';

const COLS = [
  {
    title: 'Find care',
    links: [
      { to: '/find-a-doctor', label: 'Find a doctor' },
      { to: '/find-a-location', label: 'Find a location' },
      { to: '/virtual-care', label: 'Virtual care' },
      { to: '/pharmacy', label: 'Buy drugs online' },
      { to: '/services', label: 'Medical services' },
      { to: '/clinical-trials', label: 'Clinical trials' },
    ],
  },
  {
    title: 'Patient resources',
    links: [
      { to: '/health-library', label: 'Health library' },
      { to: '/patient-stories', label: 'Patient stories' },
      { to: '/news-and-insights', label: 'News & insights' },
      { to: '/international', label: 'International services' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'About',
    links: [
      { to: '/about', label: 'About Carebridge' },
      { to: '/community-equity', label: 'Community & equity' },
      { to: '/departments', label: 'Departments index' },
      { to: '/donate', label: 'Donate' },
      { to: '/auth/login', label: 'Carebridge portal log in' },
    ],
  },
];

const SOCIALS = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'X (Twitter)' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Youtube, label: 'YouTube' },
  { icon: Linkedin, label: 'LinkedIn' },
];

export default function PublicFooter() {
  return (
    <footer className="mt-16 bg-brand-gradient-deep text-white/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Carebridge Health home" className="inline-flex items-center gap-2.5">
              <LogoMark />
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-tight text-white">Carebridge</span>
                <span className="text-[11px] text-white/60">Health</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Achieving the exceptional — asking difficult questions, making discoveries and
              providing calm, world-class care across the region.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/85 transition-colors hover:bg-gold hover:text-primary-900"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h4>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/75 hover:text-white hover:underline underline-offset-3">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Refer-a-patient strip */}
        <div className="mt-10 grid items-center gap-4 rounded-2xl bg-white/5 px-6 py-5 ring-1 ring-white/15 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-base font-semibold text-white">For health care professionals</p>
            <p className="text-sm text-white/70">Refer a patient for specialty care with our secure professional portal.</p>
          </div>
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-bold text-primary-900 transition-colors hover:bg-gold-300"
          >
            Refer a patient
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/55">
          <p>© 2026 Carebridge Health. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> +234 1 270 0100</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> patients@carebridge.ng</span>
            <span className="inline-flex items-center gap-1.5"><Siren className="h-3 w-3" /> Emergencies: 112</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <span>NDPA Notice</span>
            <span>Privacy Notice</span>
            <span>Nondiscrimination</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}