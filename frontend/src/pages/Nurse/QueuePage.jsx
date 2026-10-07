import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { timeAgo, formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function QueuePage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [editing, setEditing] = useState(null);
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');

  const queue = (db.checkins ?? []).sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt));
  const waiting = queue.filter((c) => c.status === 'waiting');
  const inRoom = queue.filter((c) => c.status === 'in_room');
  const completed = queue.filter((c) => c.status === 'completed');

  function moveInRoom(ci) {
    dbActions.checkIn({ actor: user?.id, id: ci.id, status: 'in_room' });
    setEditing(null);
    push('Patient roomed', `${ci.name} has been moved to ${ci.room}.`, 'success');
  }

  function saveVitals(ci) {
    dbActions.checkIn({ actor: user?.id, id: ci.id, status: 'in_room', vitals: { bp: bp || ci.vitals?.bp, hr: Number(hr) || ci.vitals?.hr, temp: temp || ci.vitals?.temp } });
    setEditing(null);
    setBp(''); setHr(''); setTemp('');
    push('Vitals recorded', `${ci.name}'s vitals have been updated.`, 'success');
  }

  function Section({ title, items, showMove = false, showVitals = false, badge = null }) {
    return (
      <Card flush>
        <CardHead
          title={title}
          sub={badge}
        />
        {items.length === 0 && <p className="px-5 py-6 text-sm text-ink-muted">Nothing in this view right now.</p>}
        <div className="divide-y divide-line">
          {items.map((ci) => {
            const prov = db.providers[ci.providerId];
            const provUser = prov ? db.users[prov.userId] : null;
            return (
              <div key={ci.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <Avatar name={ci.name} size="sm" tone={ci.status === 'in_room' ? 'primary' : 'teal'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{ci.name}</p>
                  <p className="text-xs text-ink-muted">
                    {ci.reason} · arrived {formatTime(ci.arrivedAt)} · {provUser ? `Dr. ${provUser.lastName}` : '—'} · {ci.room}
                  </p>
                  {ci.vitals && <p className="text-xs text-ink-muted">Vitals: {ci.vitals.bp} / HR {ci.vitals.hr} / {ci.vitals.temp}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  {showMove && (
                    <Button size="sm" onClick={() => moveInRoom(ci)}>
                      <Stethoscope className="h-4 w-4" /> Room patient
                    </Button>
                  )}
                  {showVitals && !ci.vitals && (
                    <Button size="sm" variant="outline" onClick={() => setEditing(ci.id)}>Enter vitals</Button>
                  )}
                </div>
                {editing === ci.id && showVitals && (
                  <div className="flex w-full flex-wrap gap-2 border-t border-line pt-3">
                    <Input label="BP" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="e.g. 122/78" className="w-36" />
                    <Input label="HR" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="e.g. 68" className="w-28" />
                    <Input label="Temp" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="e.g. 98.2°F" className="w-36" />
                    <Button className="self-end" onClick={() => saveVitals(ci)}>Save</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Patient queue</h1>
        <p className="text-sm text-ink-secondary">Rooming and triage for Carebridge Medical Centre, Ikeja.</p>
      </div>

      <div className="mt-6 space-y-6">
        <Section
          title="Checked in / waiting"
          items={waiting}
          showMove
          badge={<span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-ink">{waiting.length} waiting</span>}
        />
        <Section
          title="In exam room"
          items={inRoom}
          showVitals
          badge={<span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">{inRoom.length} in room</span>}
        />
        <Section title="Completed today" items={completed} />
      </div>
    </div>
  );
}

export default QueuePage;