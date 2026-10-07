import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Video, CalendarDays, Clock } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatDate, formatTime, formatDayName } from '../../lib/format.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

function AppointmentDetailPage() {
  const { id } = useParams();
  const [db] = useDB();
  const { user } = useAuth();
  const appt = (db.appointments ?? []).find((a) => a.id === id && a.patientUserId === user?.id);

  if (!appt) {
    return (
      <EmptyState
        title="Appointment not found"
        description="This visit may belong to another account, or the link may be out of date."
        action={<Button to="/portal/patient/appointments">Back to appointments</Button>}
      />
    );
  }

  const pv = db.providers[appt.providerId];
  const u = pv ? db.users[pv.userId] : null;
  const clinicianName = u ? `Dr. ${u.firstName} ${u.lastName}` : 'Carebridge clinician';
  const isUpcoming = new Date(appt.date) >= new Date();

  return (
    <div>
      <Link to="/portal/patient/appointments" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep">
        <ArrowLeft className="h-4 w-4" /> All appointments
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={clinicianName} size="lg" tone="teal" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink">{appt.reason || 'Visit'}</h1>
              <StatusPill status={appt.status} />
            </div>
            <p className="mt-0.5 text-sm text-ink-secondary">{clinicianName} · {pv?.specialtyName ?? 'Carebridge'}</p>
          </div>
        </div>
        {isUpcoming && (
          <div className="flex gap-2">
            <Button to="/portal/patient/book" variant="outline" size="sm">Reschedule</Button>
            <Button variant="outline" size="sm" tone="danger" className="!text-danger-ink !border-danger-border hover:!bg-danger-soft">Cancel visit</Button>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHead title="Visit details" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-accent" /><span className="text-ink-muted">Date</span><span className="ml-auto font-semibold text-ink">{formatDayName(appt.date)}, {formatDate(appt.date)}</span></div>
            <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-accent" /><span className="text-ink-muted">Time</span><span className="ml-auto font-semibold text-ink">{formatTime(appt.date)} · {appt.durationMin} min</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /><span className="text-ink-muted">Location</span><span className="ml-auto font-semibold text-ink">{appt.type === 'video' ? 'Video visit' : pv?.location}</span></div>
            <div className="flex items-center gap-3"><Video className="h-4 w-4 text-accent" /><span className="text-ink-muted">Type</span><span className="ml-auto font-semibold text-ink">{appt.type === 'video' ? 'Video' : 'In-person'}</span></div>
            <div className="border-t border-line pt-3">
              <p className="text-ink-muted">Reason for visit</p>
              <p className="mt-1 leading-relaxed text-ink-secondary">{appt.reason}</p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHead title="Your clinician" />
            <CardBody>
              <div className="flex items-center gap-3">
                <Avatar name={clinicianName} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{clinicianName}</p>
                  <p className="text-xs text-ink-muted">{u?.email}</p>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-ink-secondary">
                {pv?.bio ?? 'Your care team will be ready when you arrive — or you can message them anytime.'}
              </p>
            </CardBody>
          </Card>

          {appt.type === 'video' && isUpcoming && (
            <div className="rounded-2xl bg-primary-900 p-5 text-white">
              <h3 className="flex items-center gap-2 font-semibold text-white"><Video className="h-4 w-4 text-teal" /> Video visit link</h3>
              <p className="mt-1 text-sm text-white/75">The secure link becomes active 10 minutes before your visit. Test your camera and mic early.</p>
              <Button variant="inverse" size="sm" className="mt-3" disabled>Join (opens at visit time)</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailPage;