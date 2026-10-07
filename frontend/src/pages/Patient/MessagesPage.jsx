import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, Paperclip } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { timeAgo, formatDateTime } from '../../lib/format.js';
import cn from '../../lib/cn.js';

function MessagesPage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeThreadId = params.get('thread');
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const myThreads = useMemo(
    () =>
      (db.threads ?? [])
        .filter((t) => (t.participants ?? []).includes(user?.id))
        .sort((a, b) => new Date(b.messages[b.messages.length - 1].at) - new Date(a.messages[a.messages.length - 1].at)),
    [db.threads, user]
  );

  const active = myThreads.find((t) => t.id === activeThreadId) ?? myThreads[0];

  useEffect(() => {
    if (active) {
      dbActions.markThreadRead({ userId: user?.id, threadId: active.id });
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function send(e) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    dbActions.sendMessage({ userId: user?.id, threadId: active.id, body: draft.trim() });
    setDraft('');
  }

  const otherId = active?.participants.find((p) => p !== user?.id);
  const other = otherId ? db.users[otherId] : null;
  const otherName = other ? `${other.firstName} ${other.lastName}` : 'Carebridge team';

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Thread list */}
      <Card flush className="hidden h-[calc(100vh-12rem)] overflow-hidden lg:block">
        <CardHead title="Messages" sub={`${myThreads.filter((t) => t.unreadCount > 0).length} unread`} />
        <button
          onClick={() => dbActions.newThread({ fromUserId: user?.id, toUserId: Object.values(db.providers ?? {})[0]?.userId, subject: 'New message', body: 'Hello — I have a question.' })}
          className="mx-3 my-2 w-[calc(100%-1.5rem)] rounded-lg border border-dashed border-line-strong py-2 text-sm font-semibold text-ink-muted hover:border-accent hover:text-accent"
        >
          + Start a new message
        </button>
        <div className="h-px bg-line" />
        <div className="overflow-y-auto">
          {myThreads.map((t) => {
            const o = db.users[t.participants.find((p) => p !== user?.id)];
            const last = t.messages[t.messages.length - 1];
            const unread = t.unreadCount > 0;
            return (
              <button
                key={t.id}
                onClick={() => {
                  dbActions.markThreadRead({ userId: user?.id, threadId: t.id });
                  setParams({ thread: t.id });
                }}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-line px-4 py-3.5 text-left transition-colors',
                  active?.id === t.id ? 'bg-accent-soft' : 'hover:bg-neutral-50'
                )}
              >
                <Avatar name={o ? `${o.firstName} ${o.lastName}` : 'CB'} size="sm" tone={active?.id === t.id ? 'primary' : 'teal'} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{o ? `Dr. ${o.lastName}` : 'Carebridge'}</span>
                    <span className="shrink-0 text-[10px] text-ink-muted">{timeAgo(last.at)}</span>
                  </span>
                  <span className="block truncate text-sm text-ink-secondary">{t.subject}</span>
                  <span className="block truncate text-xs text-ink-muted">{last.body}</span>
                </span>
                {unread && <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Conversation */}
      {active ? (
        <Card flush className="flex h-[calc(100vh-12rem)] flex-col">
          <CardHead
            title={active.subject}
            sub={`Conversation with ${otherName}`}
            right={
              <Link to="/portal/patient/appointments" className="text-xs font-semibold text-accent hover:underline">
                Book a visit if this needs to be in person
              </Link>
            }
          />
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-2xl space-y-4">
              {active.messages.map((m) => {
                const mine = m.from === user?.id;
                return (
                  <div key={m.id} className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
                    <Avatar name={mine ? `${user.firstName} ${user.lastName}` : otherName} size="sm" tone={mine ? 'primary' : 'teal'} />
                    <div className={cn('max-w-[78%] rounded-2xl px-4 py-2.5', mine ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-neutral-100 text-ink')}>
                      <p className="text-sm leading-relaxed">{m.body}</p>
                      <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-ink-muted')}>{formatDateTime(m.at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>
          <form onSubmit={send} className="border-t border-line p-4">
            <div className="flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your message — it's encrypted and part of your medical record."
                rows={2}
                className="min-h-11 flex-1"
              />
              <Button type="submit" className="shrink-0 self-start" disabled={!draft.trim()}>
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-muted">
              <Paperclip className="h-3 w-3" /> Attachments available in the full portal version.
            </p>
          </form>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No messages yet"
            message="When your care team messages you, the thread will appear here."
          />
        </Card>
      )}
    </div>
  );
}

export default MessagesPage;