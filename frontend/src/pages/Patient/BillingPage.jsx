import React, { useMemo, useState } from 'react';
import { Download, CreditCard, Receipt, Plus } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import Table from '../../components/ui/Table.jsx';
import Modal from '../../components/ui/Modal.jsx';
import CardForm from '../../components/ui/CardForm.jsx';
import { SummaryCard, StatusPill } from '../../components/shared/portal-common.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';

function BillingPage() {
  const [db, dbActions] = useDB();
  const { user, requireReAuth } = useAuth();
  const { push } = useToast();
  const [payTarget, setPayTarget] = useState(null);
  const [addingCard, setAddingCard] = useState(false);

  const profile = db.patients[user?.id];
  const savedCards = profile?.paymentMethods ?? [];
  const invoices = useMemo(
    () => (db.invoices ?? []).filter((i) => i.patientUserId === user?.id).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [db.invoices, user]
  );

  const open = invoices.filter((i) => i.status !== 'paid');
  const openTotal = open.reduce((n, i) => n + i.patientResponsibility, 0);

  async function startPay(inv) {
    const ok = await requireReAuth(`Pay ${formatCurrency(inv.patientResponsibility)} to ${inv.provider}`);
    if (ok) setPayTarget(inv);
  }

  function onPayTokenise(token) {
    /* Card tokenised. requireReAuth gates the actual charge with a fresh OTP. */
    requireReAuth(`Charge ${formatCurrency(payTarget.patientResponsibility)} to ${token.brand} •••• ${token.last4}`).then((ok) => {
      if (!ok) return;
      dbActions.payInvoice({ userId: user?.id, invoiceId: payTarget.id, token });
      if (token.save) {
        dbActions.savePaymentMethod({
          userId: user?.id,
          method: {
            id: `pm-${Date.now()}`,
            brand: token.brand,
            last4: token.last4,
            expMonth: token.expMonth,
            expYear: token.expYear,
            cardholder: token.cardholder,
            addedAt: new Date().toISOString(),
          },
        });
      }
      setPayTarget(null);
      push('Payment processed', `${formatCurrency(payTarget.patientResponsibility)} charged to ${token.brand} •••• ${token.last4}.`, 'success');
    });
  }

  function onAddCardTokenise(token) {
    dbActions.savePaymentMethod({
      userId: user?.id,
      method: {
        id: `pm-${Date.now()}`,
        brand: token.brand,
        last4: token.last4,
        expMonth: token.expMonth,
        expYear: token.expYear,
        cardholder: token.cardholder,
        addedAt: new Date().toISOString(),
      },
    });
    setAddingCard(false);
    push('Card saved', `${token.brand} ending in ${token.last4} is now on file.`, 'success');
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Billing & payments</h1>
          <p className="text-sm text-ink-secondary">Statements, insurance details and secure card payments.</p>
        </div>
        <button
          onClick={() => push('Statement downloaded', 'This demo would export a monthly statement PDF.', 'info')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-sm font-semibold text-ink-secondary hover:border-accent hover:text-accent"
        >
          <Download className="h-4 w-4" /> Download statement
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SummaryCard icon={CreditCard} label="Amount due" value={formatCurrency(openTotal)} hint={`${open.length} unpaid invoice${open.length === 1 ? '' : 's'}`} tone="amber" />
        <SummaryCard icon={Receipt} label="Insurance" value={profile?.insurance?.provider ?? '—'} hint={`${profile?.insurance?.plan ?? ''} · copay ${formatCurrency(profile?.insurance?.copay ?? 0)}`} tone="teal" />
        <SummaryCard icon={Receipt} label="Out-of-pocket max" value={formatCurrency(profile?.insurance?.outOfPocketMax ?? 0)} hint={`${formatCurrency(profile?.insurance?.deductibleMet ?? 0)} of deductible met`} tone="blue" />
      </div>

      <Card className="mt-6">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">Payment methods</h2>
            <Button size="sm" variant="outline" onClick={() => setAddingCard(true)}>
              <Plus className="h-4 w-4" /> Add card
            </Button>
          </div>
          {savedCards.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-neutral-50 px-4 py-6 text-center text-sm text-ink-muted">
              No cards on file. Add a card to pay invoices online.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {savedCards.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-neutral-50 px-4 py-3">
                  <span className="flex h-9 w-14 items-center justify-center rounded-md bg-primary-900 text-[10px] font-bold uppercase tracking-wide text-white">
                    {c.brand}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{c.brand} ending {c.last4}</p>
                    <p className="text-xs text-ink-muted">
                      Expires {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)} · {c.cardholder}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="mt-6">
        <Table
          columns={[
            { key: 'date', header: 'Date', render: (i) => <span className="whitespace-nowrap text-ink-secondary">{formatDate(i.date)}</span> },
            { key: 'description', header: 'Description', render: (i) => (
              <div>
                <p className="font-medium text-ink">{i.description}</p>
                <p className="text-xs text-ink-muted">{i.provider}</p>
              </div>
            ) },
            { key: 'amount', header: 'Billed', render: (i) => <span className="whitespace-nowrap text-ink-secondary">{formatCurrency(i.amount)}</span> },
            { key: 'insurance', header: 'Insurance covered', render: (i) => <span className="whitespace-nowrap text-success-ink">{formatCurrency(i.insuranceCovered)}</span> },
            { key: 'due', header: 'You owe', render: (i) => <span className="whitespace-nowrap font-bold text-ink">{formatCurrency(i.patientResponsibility)}</span> },
            { key: 'status', header: 'Status', render: (i) => <StatusPill status={i.status} /> },
            { key: 'actions', header: '', className: 'text-right', render: (i) =>
              i.status !== 'paid' ? (
                <Button size="sm" onClick={() => startPay(i)}>Pay with card</Button>
              ) : (
                <span className="text-xs text-ink-muted">Paid {i.paidAt ? formatDate(i.paidAt) : ''}</span>
              ) },
          ]}
          rows={invoices}
          empty="No statements yet."
        />
      </div>

      <Modal open={Boolean(payTarget)} onClose={() => setPayTarget(null)} title="Pay your balance">
        {payTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4 text-sm text-ink-secondary">
              <p className="font-semibold text-ink">{payTarget.description}</p>
              <p className="mt-1 text-ink-muted">{payTarget.provider}</p>
              <p className="mt-2 flex justify-between"><span>Total billed</span><span>{formatCurrency(payTarget.amount)}</span></p>
              <p className="flex justify-between"><span>Insurance covered</span><span className="text-success-ink">−{formatCurrency(payTarget.insuranceCovered)}</span></p>
              <p className="mt-1 flex justify-between border-t border-line pt-2 font-bold text-ink"><span>You pay</span><span>{formatCurrency(payTarget.patientResponsibility)}</span></p>
            </div>
            <CardForm
              amount={payTarget.patientResponsibility}
              defaultName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
              submitLabel="Pay"
              onTokenise={onPayTokenise}
              onCancel={() => setPayTarget(null)}
            />
            <p className="text-xs text-ink-muted">After you submit, we'll send a one-time code to your email to confirm the charge.</p>
          </div>
        )}
      </Modal>

      <Modal open={addingCard} onClose={() => setAddingCard(false)} title="Add a card">
        <CardForm
          submitLabel="Save card"
          defaultName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
          onTokenise={onAddCardTokenise}
          onCancel={() => setAddingCard(false)}
        />
      </Modal>
    </div>
  );
}

export default BillingPage;