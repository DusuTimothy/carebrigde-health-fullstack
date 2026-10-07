import React, { useState } from 'react';
import { ShieldCheck, Phone, KeyRound, Languages } from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Select } from '../../components/ui/Input.jsx';
import { Card, CardBody, CardHead } from '../../components/ui/Card.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate, formatCurrency } from '../../lib/format.js';

function ProfilePage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const profile = db.patients[user?.id];
  const [form, setForm] = useState({
    email: user?.email ?? '',
    phone: profile?.phone ?? '',
    preferredName: user?.firstName ?? '',
    emergencyName: profile?.emergencyContact?.name ?? '',
    emergencyPhone: profile?.emergencyContact?.phone ?? '',
  });
  const [language, setLanguage] = useState('en');

  function set(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function save(e) {
    e.preventDefault();
    dbActions.updateProfile({ userId: user?.id, ...form, language });
    push('Profile saved', 'Your information is updated.', 'success');
  }

  function setUp(p) {
    return (e) => setForm((f) => ({ ...f, [p]: e.target.value }));
  }

  const field = 'rounded-xl border border-line bg-neutral-50/60 px-2 py-1.5 text-sm text-ink-muted';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHead title="Personal information" sub="Used across your care and billing. Only your care team can see it." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" value={form.preferredName} onChange={set('preferredName')} required />
            <Input label="Last name" value={user?.lastName ?? ''} disabled />
            <Input label="Date of birth" value={profile?.dob ? formatDate(profile.dob) : ''} disabled />
            <Input label="Phone" value={form.phone} onChange={set('phone')} required />
            <div className="sm:col-span-2">
              <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="Emergency contact" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" value={form.emergencyName} onChange={setUp('emergencyName')} />
            <Input label="Phone" value={form.emergencyPhone} onChange={setUp('emergencyPhone')} />
          </CardBody>
        </Card>

        <Card>
          <CardHead
            title={
              <span className="flex items-center gap-2">
                <Languages className="h-4 w-4" /> Language preferences
              </span>
            }
            sub="We can arrange interpretation at your appointments."
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Select label="Preference" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="yo">Yoruba</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
              <option value="pcm">Pidgin English</option>
              <option value="fr">French</option>
            </Select>
            <div>
              <p className="mb-1.5 block text-sm font-semibold text-ink">Interpreter needed</p>
              <p className="text-xs text-ink-muted">In-person, phone and video interpreters are free of charge.</p>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className="space-y-6">
        <Card>
          <CardHead title="Insurance" />
          <CardBody className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-ink-muted">Provider</span><span className="font-semibold text-ink">{profile?.insurance?.provider ?? '—'}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Plan</span><span className="font-semibold text-ink">{profile?.insurance?.plan ?? '—'}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Member ID</span><span className="font-semibold text-ink">{profile?.insurance?.memberId ?? '—'}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Copay (PCP)</span><span className="font-semibold text-ink">{formatCurrency(profile?.insurance?.copay ?? 0)}</span></p>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="Account & privacy" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-ink" />
              <p className="text-ink-secondary">Your health data is encrypted and never sold. Access is logged and audited.</p>
            </div>
            <div className={field}>Carebridge portal ID · <span className="text-ink">{user?.id}</span></div>
            <div className={field}>Member since · <span className="text-ink">{profile?.memberSince ? formatDate(profile.memberSince) : '—'}</span></div>
            <button type="button" className="inline-flex items-center gap-1.5 text-accent hover:underline">
              <KeyRound className="h-4 w-4" /> Change password
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 text-accent hover:underline">
              <Phone className="h-4 w-4" /> Manage 2-step verification
            </button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;