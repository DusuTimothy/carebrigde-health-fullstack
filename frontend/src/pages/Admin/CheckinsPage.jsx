import React, { useState } from 'react';
import { ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function CheckinsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const queue = (db.checkins ?? []).sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt));

  function room(ci) {
    dbActions.checkIn({ actor: user?.id, id: ci.id, status: 'in_room' });
    push('Roomed', `${ci.name} moved to ${ci.room}.`, 'success');
  }
  function complete(ci) {
    dbActions.checkIn({ actor: user?.id, id: ci.id, status: 'completed' });
    push('Completed', `Visit for ${ci.name} marked complete.`, 'success');
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Check-in queue</h1>
        <p className="text-sm text-ink-secondary">Live view of arrivals across our Lagos and Abuja locations.</p>
      </div>

      <div className="mt-4 space-y-3">
        {queue.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No check-ins right now.</p>}
        {queue.map((ci) => {
          const prov = db.providers[ci.providerId];
          const provUser = prov ? db.users[prov.userId] : null;
          return (
            <Card key={ci.id} className="p-0">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <Avatar name={ci.name} size="md" tone={ci.status === 'completed' ? 'teal' : 'primary'} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{ci.name}</p>
                  <p className="text-xs text-ink-muted">
                    {ci.reason} · arrived {formatTime(ci.arrivedAt)} · {provUser ? `Dr. ${provUser.lastName}` : '—'} · {ci.room}
                  </p>
                  {ci.vitals && <p className="text-xs text-ink-muted">Vitals: {ci.vitals.bp} · HR {ci.vitals.hr} · {ci.vitals.temp}</p>}
                </div>
                <StatusPill status={ci.status} />
                <div className="flex shrink-0 gap-2">
                  {ci.status === 'waiting' && (
                    <Button size="sm" onClick={() => room(ci)}>
                      <ArrowRightCircle className="h-4 w-4" /> Room
                    </Button>
                  )}
                  {ci.status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => complete(ci)}>
                      <CheckCircle2 className="h-4 w-4" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CheckinsPage;