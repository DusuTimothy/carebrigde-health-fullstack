import React, { useState } from 'react';
import { ClipboardCheck, UserPlus, X } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Input from '../../components/ui/Input.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function CheckinsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');

  const queue = (db.checkins ?? []).sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt));

  function room(ci) {
    dbActions.checkIn({ actor: user?.id, id: ci.id, status: 'in_room' });
    push('Roomed', `${ci.name} moved to ${ci.room}.`, 'success');
  }

  function addCheckIn() {
    if (!name.trim()) return;
    dbActions.writeAudit({ actor: user?.id, action: 'CREATE', target: 'Check-in', detail: `Walk-in ${name}` });
    push('Checked in', `${name} is now in the waiting room.`, 'success');
    setName(''); setReason(''); setAdding(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Check-ins</h1>
          <p className="text-sm text-ink-secondary">Manage arrivals and guide patients to exam rooms.</p>
        </div>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <UserPlus className="h-4 w-4" /> Walk-in check-in
          </Button>
        )}
      </div>

      {adding && (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Register a walk-in</h2>
            <button onClick={() => setAdding(false)} aria-label="Close walk-in form" className="text-ink-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dana Brooks" className="w-64" />
            <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Sore throat" className="w-64" />
            <Button onClick={addCheckIn} disabled={!name.trim()}>Check in</Button>
          </div>
        </Card>
      )}

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
                </div>
                <StatusPill status={ci.status} />
                {ci.status === 'waiting' && (
                  <Button size="sm" onClick={() => room(ci)}>
                    <ClipboardCheck className="h-4 w-4" /> Room patient
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CheckinsPage;