import React, { useState } from 'react';
import { UserRound, ShieldCheck } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card } from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { formatTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

function StaffPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');

  const roster = (db.staffRoster ?? []).slice();
  const filtered = roster.filter((s) => filter === 'all' || s.role === filter);
  const onDuty = roster.filter((s) => s.onDuty).length;

  function toggleDuty(s) {
    dbActions.writeAudit({ actor: user?.id, action: 'UPDATE', target: s.name, detail: `On-duty ${!s.onDuty ? 'start' : 'end'}` });
    push('Schedule updated', `${s.name} is now ${!s.onDuty ? 'on' : 'off'} duty.`, 'success');
  }

  const roles = [...new Set(roster.map((s) => s.role))];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Staff</h1>
          <p className="text-sm text-ink-secondary">{roster.length} people · {onDuty} currently on duty.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {['all', ...roles].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              filter === r ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-secondary hover:bg-neutral-100'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((s) => (
          <Card key={s.id} className="p-0">
            <div className="flex items-center gap-4 px-5 py-4">
              <Avatar name={s.name} size="md" tone={s.onDuty ? 'primary' : 'neutral'} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  {s.name}
                  {s.onDuty && <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-teal-deep"><ShieldCheck className="h-3 w-3" /> on duty</span>}
                </p>
                <p className="text-xs text-ink-muted">{s.role} · {s.dept} · {s.shift} shift</p>
              </div>
              <Button size="sm" variant={s.onDuty ? 'outline' : 'primary'} onClick={() => toggleDuty(s)}>
                {s.onDuty ? 'End shift' : 'Start shift'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-1.5 rounded-lg bg-neutral-50 p-3 text-xs text-ink-muted">
        <UserRound className="h-4 w-4" /> In production this view reads from the HR directory and maps staff to their clinic. Shift changes here write to the demo audit log.
      </p>
    </div>
  );
}

export default StaffPage;