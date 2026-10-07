import React from 'react';
import Inbox from '../../components/shared/Inbox.jsx';

export default function ProviderMessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Messages</h1>
      <p className="mt-1 text-sm text-ink-secondary">Secure messages with patients and your care team.</p>
      <div className="mt-6">
        <Inbox emptySub="Messages with your patients appear here." newThreadToUserId="u-patient" newThreadPreText="A message from your clinician —" />
      </div>
    </div>
  );
}