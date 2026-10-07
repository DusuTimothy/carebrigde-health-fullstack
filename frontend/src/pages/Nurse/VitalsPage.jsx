import React, { useState } from 'react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function VitalsPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [editing, setEditing] = useState(null);
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');

  const inRoom = (db.checkins ?? []).filter((c) => c.status === 'in_room');

  function saveVitals(ci) {
    dbActions.checkIn({
      actor: user?.id, id: ci.id, status: ci.status,
      vitals: { bp: bp || ci.vitals?.bp, hr: Number(hr) || ci.vitals?.hr, temp: temp || ci.vitals?.temp, weight: weight || ci.vitals?.weight },
    });
    setEditing(null); setBp(''); setHr(''); setTemp(''); setWeight('');
    push('Vitals recorded', `${ci.name}'s vitals updated for today.`, 'success');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Vitals</h1>
        <p className="text-sm text-ink-secondary">Enter triage vitals for patients currently in rooms.</p>
      </div>

      <Card flush className="mt-6">
        <CardHead
          title="Patients in rooms"
          sub={`${inRoom.length} patient${inRoom.length === 1 ? '' : 's'} needing vitals`}
        />
        {inRoom.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-ink-muted">No patients in rooms right now — check the Queue page.</div>
        )}
        <div className="divide-y divide-line">
          {inRoom.map((ci) => {
            const prov = db.providers[ci.providerId];
            const provUser = prov ? db.users[prov.userId] : null;
            return (
              <div key={ci.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <Avatar name={ci.name} size="sm" tone="primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{ci.name}</p>
                  <p className="text-xs text-ink-muted">{ci.reason} · arrived {formatTime(ci.arrivedAt)} · Dr. {provUser?.lastName ?? '—'}</p>
                  {ci.vitals && editing !== ci.id && (
                    <p className="mt-1 text-xs text-ink-muted">Current: {ci.vitals.bp} / HR {ci.vitals.hr} / {ci.vitals.temp} {ci.vitals.weight ? `/ ${ci.vitals.weight}` : ''}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing(editing === ci.id ? null : ci.id)}>
                  {editing === ci.id ? 'Cancel' : ci.vitals ? 'Update vitals' : 'Enter vitals'}
                </Button>
                {editing === ci.id && (
                  <div className="flex w-full flex-wrap gap-2 border-t border-line pt-3">
                    <Input label="Blood pressure" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="122/78" className="w-40" />
                    <Input label="Heart rate" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="68" className="w-28" />
                    <Input label="Temperature" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="98.2°F" className="w-36" />
                    <Input label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="168 lbs" className="w-36" />
                    <Button className="self-end" onClick={() => saveVitals(ci)}>Save vitals</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default VitalsPage;