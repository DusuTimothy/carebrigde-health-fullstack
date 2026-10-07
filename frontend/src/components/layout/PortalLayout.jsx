import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, LifeBuoy, Settings, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import { useDB } from '../../lib/db.js';
import { usePageMeta } from '../../lib/seo.js';
import Avatar from '../ui/Avatar.jsx';
import { LogoMark } from './PublicHeader.jsx';
import { useClickOutside } from './hooks.js';
import cn from '../../lib/cn.js';

const SLUG_LABEL = {
  notifications: 'Notifications',
  settings: 'Settings',
  help: 'Help & support',
  book: 'Book an appointment',
  appointments: 'Appointments',
  messages: 'Messages',
  prescriptions: 'Prescriptions',
  pharmacy: 'Pharmacy store',
  labs: 'Lab results',
  billing: 'Billing & payments',
  profile: 'Profile',
  visits: 'Visit history',
  schedule: 'Schedule',
  orders: 'Orders',
  'online-orders': 'Online orders',
  results: 'Results',
  queue: 'Queue',
  vitals: 'Vitals',
  fulfill: 'Fulfillment',
  checkins: 'Check-ins',
  staff: 'Staff',
  reports: 'Reports',
  patients: 'Patient wards',
  dashboard: 'Dashboard',
};

export const ROLE_META = {
  patient: { label: 'Patient', icon: 'person' },
  provider: { label: 'Clinician', icon: 'stethoscope' },
  nurse: { label: 'Nurse', icon: 'nurse' },
  pharmacist: { label: 'Pharmacist', icon: 'pill' },
  lab_tech: { label: 'Lab Technician', icon: 'flask' },
  admin: { label: 'Administrator', icon: 'shield' },
  front_desk: { label: 'Front Desk', icon: 'clipboard' },
};

function PortalNav() {
  const { role } = useAuth();
  return (
    <nav aria-label="Portal navigation" className="flex flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar lg:static lg:flex">
      {(role?.nav ?? []).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-white/15 text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NotificationsBell() {
  const { user } = useAuth();
  const [db, dbActions] = useDB();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const navigate = useNavigate();

  const mine = (db.notifications ?? []).filter((n) => n.userId === user?.id);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${unread} unread)`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-primary-900 bg-danger-solid" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[210] w-80 rounded-xl border border-line bg-surface-raised p-1.5 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unread > 0 && (
              <button
                className="text-xs font-medium text-accent hover:underline"
                onClick={() => {
                  dbActions.markAllNotificationsRead({ userId: user?.id });
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {mine.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-muted">No notifications yet.</p>}
            {mine.map((n) => (
              <button
                key={n.id}
                className={cn(
                  'flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left',
                  n.read ? 'hover:bg-neutral-100' : 'bg-accent-soft hover:bg-primary-100'
                )}
                onClick={() => {
                  if (!n.read) dbActions.markNotificationRead({ userId: user?.id, id: n.id });
                  setOpen(false);
                  if (n.link) navigate(n.link);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                </span>
                <span className="text-xs text-ink-secondary">{n.body}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const navigate = useNavigate();

  if (!user) return null;
  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-white/10"
      >
        <Avatar name={displayName} size="sm" tone="teal" src={user?.imageUrl} />
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</span>
          <span className="text-[11px] text-white/60 capitalize">{role?.label}</span>
        </span>
        <ChevronDown aria-hidden className="hidden h-3.5 w-3.5 text-white/60 md:block" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[210] w-60 rounded-xl border border-line bg-surface-raised p-1.5 shadow-lg animate-fade-in"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">{displayName}</p>
            <p className="text-xs text-ink-muted">{user.email}</p>
          </div>
          <button role="menuitem" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent" onClick={() => { setOpen(false); navigate('/portal/notifications'); }}>
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent" onClick={() => { setOpen(false); navigate('/portal/settings'); }}>
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent" onClick={() => { setOpen(false); navigate('/portal/help'); }}>
            <LifeBuoy className="h-4 w-4" /> Help & support
          </button>
          <div className="my-1 border-t border-line" />
          <button role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger-ink hover:bg-danger-soft" onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Authenticated portal shell. The role switcher is determined by login, not
 * user-selectable — the header simply reflects the current session's role.
 */
export default function PortalLayout() {
  const { user, role } = useAuth();
  const location = useLocation();
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const pageTitle = SLUG_LABEL[slug] ?? role?.label ?? 'Portal';
  usePageMeta({ title: pageTitle, description: `${pageTitle} — ${role?.label ?? 'Carebridge'} portal` });

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="sticky top-0 z-[100] bg-navy-radial">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center gap-4 px-4 lg:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 hover:opacity-90" aria-label="Carebridge Health — back to public site">
            <LogoMark size="sm" />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-bold text-white">Portal</span>
              <span className="text-[11px] text-white/60">Carebridge Health</span>
            </span>
          </Link>
          <Link to="/" className="hidden shrink-0 items-center gap-1 text-xs text-white/55 hover:text-white lg:inline-flex">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Back to site
          </Link>

          <PortalNav />

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <span className="mr-1 hidden items-center gap-1 rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-200 xl:inline-flex">
              <ShieldCheck className="h-3 w-3" /> {role?.label}
            </span>
            <NotificationsBell />
            <UserMenu />
          </div>
        </div>
      </div>

      <main id="main" className="flex-1 pb-12 pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}