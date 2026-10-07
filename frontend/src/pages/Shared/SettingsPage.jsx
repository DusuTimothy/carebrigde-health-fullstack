import React, { useState } from 'react';
import { RotateCcw, Smartphone, Bell, Globe2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { Checkbox } from '../../components/ui/Input.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-neutral-300'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

function SettingRow({ icon: Icon, title, sub, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line last:border-0 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-ink-secondary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink-muted">{sub}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { user, resetDemo } = useAuth();
  const { push } = useToast();
  const [prefs, setPrefs] = useState({
    push: true,
    emailLabs: true,
    emailBilling: true,
    smsReminders: true,
    marketing: false,
    textSize: 'md',
    language: 'English',
    twoFactor: true,
  });

  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
          <p className="text-sm text-ink-secondary">Preferences for {user?.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            resetDemo();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </Button>
      </div>

      <Card flush className="mt-6">
        <CardHead title="Security" sub="Keeping your account protected" />
        <SettingRow icon={ShieldCheck} title="Two-step verification" sub="Extra protection when you sign in on a new device.">
          <Switch checked={prefs.twoFactor} onChange={set('twoFactor')} label="Two-step verification" />
        </SettingRow>
        <SettingRow icon={Smartphone} title="Trusted devices" sub="Manage devices that can access your portal.">
          <Button size="sm" variant="outline" onClick={() => push('Device list', 'This demo would show active sessions and signed-out devices.', 'info')}>Manage</Button>
        </SettingRow>
      </Card>

      <Card flush className="mt-6">
        <CardHead title="Notifications" sub="Choose how Carebridge reaches you" />
        <SettingRow icon={Bell} title="Push notifications" sub="Real-time alerts in this portal.">
          <Switch checked={prefs.push} onChange={set('push')} label="Push notifications" />
        </SettingRow>
        <SettingRow icon={Bell} title="Lab results available" sub="Email me when results are ready to review.">
          <Switch checked={prefs.emailLabs} onChange={set('emailLabs')} label="Email lab results" />
        </SettingRow>
        <SettingRow icon={Bell} title="Billing statements" sub="Email when a new statement is ready.">
          <Switch checked={prefs.emailBilling} onChange={set('emailBilling')} label="Email billing statements" />
        </SettingRow>
        <SettingRow icon={Smartphone} title="Appointment reminders" sub="SMS reminder 2 days and 2 hours before visits.">
          <Switch checked={prefs.smsReminders} onChange={set('smsReminders')} label="SMS appointment reminders" />
        </SettingRow>
      </Card>

      <Card flush className="mt-6">
        <CardHead title="Preferences" sub="Make the portal work the way you do" />
        <SettingRow icon={Globe2} title="Preferred language" sub="We translate the portal and can arrange interpretation.">
          <div className="flex gap-1 rounded-lg border border-line p-0.5">
            {['English', 'Yoruba', 'Hausa', 'Igbo'].map((l) => (
              <button
                key={l}
                onClick={() => setPrefs((p) => ({ ...p, language: l }))}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${prefs.language === l ? 'bg-accent text-white' : 'text-ink-secondary hover:bg-neutral-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow icon={ShieldCheck} title="Data sharing" sub="Help us improve care with de-identified research data.">
          <Checkbox
            checked={prefs.marketing}
            onChange={(e) => set('marketing')(e.target.checked)}
            label="Allow de-identified data sharing"
          />
        </SettingRow>
      </Card>

      <p className="mt-6 text-xs text-ink-muted">
        Changing a notification setting takes effect immediately in this demo. In production it would update your contact preferences with our notification provider.
      </p>
    </div>
  );
}

export default SettingsPage;