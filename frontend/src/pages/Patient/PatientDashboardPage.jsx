import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Video, MapPin, ChevronRight, ArrowRight, Stethoscope, Pill as PillIcon, FlaskConical, Receipt } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead, CardFooter } from '../../components/ui/Card.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { SummaryCard, ListRow } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime, formatDayName, timeAgo, formatCurrency } from '../../lib/format.js';

function PatientDashboardPage() {
  const [db] = useDB();
  const { user } = useAuth();

  const profile = db.patients[user?.id];
  const myAppts = useMemo(
    () => db.appointments.filter((a) => a.patientUserId === user?.id).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [db.appointments, user]
  );
  const upcoming = myAppts.filter((a) => a.status !== 'cancelled' && new Date(a.date) >= startOfToday()).slice(0, 3);
  const past = myAppts.filter((a) => new Date(a.date) < startOfToday()).length;

  const myThreads = (db.threads ?? []).filter((t) => t.participants.includes(user?.id));
  const unreadMessages = myThreads.reduce((n, t) => n + (t.unreadCount || 0), 0);

  const myResults = (db.labResults ?? []).filter((r) => r.patientUserId === user?.id).sort((a, b) => new Date(b.resultedAt ?? b.orderedAt) - new Date(a.resultedAt ?? a.orderedAt));
  const latestResult = myResults[0];

  const openInvoices = (db.invoices ?? []).filter((i) => i.patientUserId === user?.id && i.status !== 'paid');
  const openTotal = openInvoices.reduce((n, i) => n + i.patientResponsibility, 0);

  const rx = (db.prescriptions ?? []).filter((r) => r.patientUserId === user?.id && r.status === 'active');
  const activeCount = rx.length;
  const refillPending = rx.filter((r) => r.refillStatus === 'pending').length;

  const cartCount = (db.pharmacyCarts?.[user?.id] ?? []).reduce((n, i) => n + i.qty, 0);

  return (
    <div>
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Hi, {user?.firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {upcoming.length > 0 ? (
              <>
                You have <strong className="text-accent">{upcoming.length} upcoming visit{upcoming.length > 1 ? 's' : ''}</strong>. Next: {providerOf(upcoming[0])} on {formatDate(upcoming[0].date)}.
              </>
            ) : (
              'No visits booked yet — pick a time that works for you.'
            )}
          </p>
        </div>
        <Button to="/portal/patient/book">
          <CalendarPlus className="h-4 w-4" /> Book a visit
        </Button>
      </div>

      {/* Pharmacy promo */}
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-navy-radial p-5 text-white">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
          <PillIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">Buy drugs online</p>
          <p className="text-sm text-white/75">
            {cartCount > 0
              ? `${cartCount} item${cartCount > 1 ? 's' : ''} in your pharmacy cart — finish checkout or keep browsing.`
              : 'Order medicines for same-day delivery in Lagos or pickup at the Ikeja pharmacy.'}
          </p>
        </div>
        <Button to="/portal/patient/pharmacy" variant="inverse" size="sm">
          {cartCount > 0 ? 'View cart' : 'Shop now'} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={CalendarPlus} label="Visits" value={String(upcoming.length)} hint={`${past} completed`} tone="blue" to="/portal/patient/appointments" />
        <SummaryCard icon={Stethoscope} label="Messages" value={String(unreadMessages)} hint={unreadMessages ? 'unread' : 'all caught up'} tone="teal" to="/portal/patient/messages" />
        <SummaryCard icon={FlaskConical} label="Results" value={String(myResults.length)} hint="labs available" tone="gray" to="/portal/patient/labs" />
        <SummaryCard icon={Receipt} label="Balance" value={formatCurrency(openTotal)} hint={`${openInvoices.length} open invoice${openInvoices.length === 1 ? '' : 's'}`} tone="amber" to="/portal/patient/billing" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <Card flush>
            <CardHead
              title="Upcoming appointments"
              sub={upcoming.length ? 'Your next scheduled visits' : 'Nothing scheduled'}
              right={<Link to="/portal/patient/appointments" className="text-sm font-semibold text-accent hover:text-accent-deep">View all</Link>}
            />
            {upcoming.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-ink-muted">When you book, your visits will show up here.</p>
                <Button to="/portal/patient/book" variant="outline" size="sm" className="mt-4">Book your first visit</Button>
              </div>
            )}
            {upcoming.map((a) => {
              const pv = db.providers[a.providerId];
              const u = pv ? db.users[pv.userId] : null;
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                  <div className="flex min-w-14 flex-col items-center rounded-xl bg-accent-soft py-2 px-3">
                    <span className="text-[11px] font-semibold uppercase text-accent">{formatDayName(a.date).slice(0, 3)}</span>
                    <span className="text-xl font-bold text-accent">{new Date(a.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      {a.type === 'video' ? <Video className="h-3.5 w-3.5 text-accent" /> : <MapPin className="h-3.5 w-3.5 text-accent" />}
                      {a.type === 'video' ? 'Video visit' : pv?.location}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-secondary">
                      {u ? `Dr. ${u.firstName} ${u.lastName}` : 'Carebridge clinician'} · {formatTime(a.date)} · {a.reason || 'Follow-up'}
                    </p>
                  </div>
                  <Link to={`/portal/patient/appointments/${a.id}`} className="inline-flex items-center gap-0.5 text-sm font-semibold text-accent hover:text-accent-deep">
                    View <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
            {upcoming.length > 0 && (
              <CardFooter>
                <div className="flex items-center justify-between text-sm text-ink-secondary">
                  <span>Need a sooner slot? Same-week visits open up often.</span>
                  <Link to="/portal/patient/book" className="font-semibold text-accent hover:text-accent-deep">Book now →</Link>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Active prescriptions */}
          <Card className="mt-6">
            <CardHead
              title="Active prescriptions"
              right={<Link to="/portal/patient/prescriptions" className="text-sm font-semibold text-accent hover:text-accent-deep">Manage</Link>}
            />
            <div className="flex flex-wrap gap-3">
              {rx.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-line bg-neutral-50 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                    <PillIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.drug} {r.strength}</p>
                    <p className="text-xs text-ink-muted">{r.refillsRemaining} refill{r.refillsRemaining === 1 ? '' : 's'} remaining</p>
                  </div>
                </div>
              ))}
              {rx.length === 0 && <p className="text-sm text-ink-muted">No active prescriptions.</p>}
              {refillPending > 0 && (
                <div className="flex items-center rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning-ink">
                  {refillPending} refill request{refillPending === 1 ? '' : 's'} in review
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {latestResult && (
            <Card>
              <CardHead title="Latest lab result" sub={formatDate(latestResult.resultedAt ?? latestResult.orderedAt)} />
              <div className="flex items-center gap-3">
                <Avatar name={latestResult.name} size="md" tone="teal" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{latestResult.name}</p>
                  <p className="text-xs text-ink-muted">{latestResult.components?.some((c) => c.status !== 'normal') ? 'Some values out of range' : 'Values in normal range'}</p>
                </div>
                <span className="ml-auto">
                  <Pill tone={latestResult.components?.some((c) => c.status !== 'normal') ? 'warning' : 'success'} dot>
                    {latestResult.components?.some((c) => c.status !== 'normal') ? 'Review' : 'Normal'}
                  </Pill>
                </span>
              </div>
              <Link to="/portal/patient/labs" className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-accent hover:text-accent-deep">
                Review results <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          )}

          <Card flush>
            <CardHead title="Recent messages" sub={`${unreadMessages} unread`} right={<Link to="/portal/patient/messages" className="text-sm font-semibold text-accent">All</Link>} />
            {myThreads.slice(0, 3).map((t) => {
              const other = db.users[t.participants.find((p) => p !== user?.id)];
              const last = t.messages[t.messages.length - 1];
              return (
                <ListRow
                  key={t.id}
                  icon={undefined}
                  title={t.subject}
                  sub={`${last ? `${other?.firstName ?? ''}: ${last.body}` : ''}`}
                  right={<span className="text-xs text-ink-muted">{timeAgo(last?.at ?? t.messages[0]?.at)}</span>}
                  to={`/portal/patient/messages?thread=${t.id}`}
                />
              );
            })}
            {myThreads.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-muted">No messages yet.</p>}
          </Card>

          <div className="rounded-2xl bg-primary-900 p-5 text-white">
            <h3 className="font-semibold text-white">Need care sooner than planned?</h3>
            <p className="mt-1 text-sm text-white/75">Join the virtual queue for immediate care — typical wait under 10 minutes.</p>
            <Button to="/portal/patient/book?guest=1&mode=video" variant="inverse" size="sm" className="mt-3">Join the virtual queue</Button>
          </div>
        </div>
      </div>
    </div>
  );

  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function providerOf(a) {
    const pv = db.providers[a.providerId];
    const u = pv ? db.users[pv.userId] : null;
    return u ? `Dr. ${u.firstName} ${u.lastName}` : 'your clinician';
  }
}

export default PatientDashboardPage;