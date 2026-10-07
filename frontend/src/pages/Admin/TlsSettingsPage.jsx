import React, { useEffect, useState } from 'react';
import { Download, Lock, Server, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const inputCls =
  'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25';
const textAreaCls = `${inputCls} font-mono text-xs leading-5`;

export default function TlsSettingsPage() {
  const { push } = useToast();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({ name: '', commonName: '', caCert: '', serverCert: '', serverKey: '' });

  async function load() {
    try {
      const res = await apiRequest('/api/tls');
      setConfigs(res.data || []);
    } catch (error) {
      push('Failed to load TLS config', error.message, 'danger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const active = configs.find((c) => c.active) || null;

  const set = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  async function save() {
    if (!form.caCert.trim() || !form.serverCert.trim() || !form.serverKey.trim()) {
      push('Missing key material', 'Paste the CA, server certificate and server key (all in PEM format).', 'danger');
      return;
    }
    setBusy(true);
    try {
      await apiRequest('/api/tls', {
        method: 'PUT',
        body: JSON.stringify({ ...form, active: true }),
      });
      push('TLS key material saved', 'Restart the server to serve HTTPS with this certificate.', 'success');
      setForm({ name: '', commonName: '', caCert: '', serverCert: '', serverKey: '' });
      await load();
    } catch (error) {
      push('Validation failed', error.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    try {
      await apiRequest('/api/tls/generate', { method: 'POST' });
      push('New CA generated', 'Fresh CA + server certificate stored and activated. Restart the server to serve it.', 'success');
      await load();
    } catch (error) {
      push('Generation failed', error.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this TLS config? If it is the active one, HTTPS keeps using it until restart.')) return;
    setBusy(true);
    try {
      await apiRequest(`/api/tls/${id}`, { method: 'DELETE' });
      await load();
    } catch (error) {
      push('Delete failed', error.message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">TLS &amp; Certificate Authority</h1>
          <p className="text-sm text-ink-secondary">
            The active CA and server certificate/key are stored in the database and used to serve HTTPS for
            machine-to-machine integration.
          </p>
        </div>
        <a href="/api/tls/ca" target="_blank" rel="noreferrer">
          <Button variant="outline"><Download className="h-4 w-4" /> Download CA certificate</Button>
        </a>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-muted">Loading TLS configuration…</p>
      ) : (
        <>
          <Card className="mt-4 p-5">
            <CardHead
              title="Active configuration"
              sub={active ? undefined : 'No active config yet — one will be generated on the next boot.'}
              right={active?.certThumbprint ? <span className="font-mono text-[11px] text-ink-muted">{active.certThumbprint.slice(0, 29)}…</span> : undefined}
            />
            {active ? (
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-ink-muted">Name</p>
                  <p className="text-ink">{active.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Common name</p>
                  <p className="text-ink">{active.commonName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">CA fingerprint</p>
                  <p className="font-mono text-xs text-ink">{active.caThumbprint || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Server cert fingerprint</p>
                  <p className="font-mono text-xs text-ink">{active.certThumbprint || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Expires</p>
                  <p className="text-ink">{active.expiresAt ? new Date(active.expiresAt).toLocaleDateString() : '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-deep" />
                  <p className="text-xs text-ink-muted">
                    {active.serverKeyPresent ? 'Private key present (encrypted at rest)' : 'No private key stored'}
                  </p>
                </div>
                <p className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-ink-muted">
                  <Server className="h-4 w-4 shrink-0" /> HTTPS listener on <span className="font-semibold">https://localhost:5443</span>. Trust the CA from GET /api/tls/ca to connect.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">No active configuration.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={generate} loading={busy}><RefreshCw className="h-4 w-4" /> Generate new local CA</Button>
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <CardHead
              title="Import key material"
              sub="Paste an existing CA + server certificate + private key in PEM format. The private key is encrypted before it is stored."
            />
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-secondary">Name (label)</span>
                  <input value={form.name} onChange={set('name')} className={inputCls} placeholder="e.g. Production CA" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-secondary">Common name</span>
                  <input value={form.commonName} onChange={set('commonName')} className={inputCls} placeholder="e.g. api.carebridge.local" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">CA certificate (PEM)</span>
                <textarea value={form.caCert} onChange={set('caCert')} rows={5} className={textAreaCls} placeholder="-----BEGIN CERTIFICATE-----" />
                {touched.caCert && !form.caCert.trim() && <span className="mt-1 block text-xs text-danger-ink">Required.</span>}
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Server certificate (PEM)</span>
                <textarea value={form.serverCert} onChange={set('serverCert')} rows={5} className={textAreaCls} placeholder="-----BEGIN CERTIFICATE-----" />
                {touched.serverCert && !form.serverCert.trim() && <span className="mt-1 block text-xs text-danger-ink">Required.</span>}
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">
                  Server private key (PEM) <span className="font-normal text-ink-muted">— encrypted with AES-256-GCM before storage</span>
                </span>
                <textarea value={form.serverKey} onChange={set('serverKey')} rows={5} className={textAreaCls} placeholder="-----BEGIN PRIVATE KEY-----" />
                {touched.serverKey && !form.serverKey.trim() && <span className="mt-1 block text-xs text-danger-ink">Required.</span>}
              </label>
              <div className="flex justify-end">
                <Button onClick={save} loading={busy}><ShieldCheck className="h-4 w-4" /> Save &amp; activate</Button>
              </div>
            </div>
          </Card>

          {configs.length > 0 && (
            <Card className="mt-4 p-5">
              <CardHead title="History" sub="Older configs are kept for rotation and audit." />
              <div className="mt-3 divide-y divide-line">
                {configs.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {c.name || 'Untitled'} {c.active && <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">active</span>}
                      </p>
                      <p className="truncate font-mono text-[11px] text-ink-muted">
                        {c.commonName || '—'} · {c.caThumbprint ? c.caThumbprint.slice(0, 29) : ''}…
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {c.serverKeyPresent && <Lock className="h-3.5 w-3.5 text-teal-deep" />}
                      <Button size="sm" variant="danger" disabled={busy} onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}