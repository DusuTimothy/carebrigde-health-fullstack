import React, { useMemo, useState } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, X, Truck, Store, PackageCheck, ShieldCheck,
  ArrowRight, MapPin, Phone, ClipboardList, BadgeCheck, Pill as PillIcon,
} from 'lucide-react';
import { useDB } from '../../lib/db.js';
import { useAuth } from '../../lib/auth.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Textarea } from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { Card, CardHead } from '../../components/ui/Card.jsx';
import { StatusPill } from '../../components/shared/portal-common.jsx';
import { formatCurrency, formatDateTime, timeAgo } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import cn from '../../lib/cn.js';

const DELIVERY_FEE = 1500;
const PICKUP_POINT = 'Carebridge Pharmacy, 9 Allen Avenue, Ikeja, Lagos';

function PharmacyStorePage() {
  const [db, dbActions] = useDB();
  const { user } = useAuth();
  const { push } = useToast();

  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [placed, setPlaced] = useState(null);

  const catalog = db.drugCatalog ?? [];
  const profile = db.patients?.[user?.id];
  const [phone, setPhone] = useState(() => profile?.phone ?? '');
  const [address, setAddress] = useState(() =>
    profile?.address
      ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zip ?? ''}`.trim()
      : ''
  );
  const activeRx = useMemo(
    () => (db.prescriptions ?? []).filter((r) => r.patientUserId === user?.id && r.status === 'active'),
    [db.prescriptions, user]
  );
  const cart = db.pharmacyCarts?.[user?.id] ?? [];

  const categories = useMemo(() => ['All', ...new Set(catalog.map((d) => d.category))], [catalog]);

  const rxAllowed = (drug) => {
    if (!drug.requiresPrescription) return true;
    return activeRx.some((r) => {
      const rx = `${r.drug} ${r.strength}`.toLowerCase();
      return rx.includes(drug.name.toLowerCase()) && rx.includes(drug.strength.toLowerCase());
    });
  };

  const qtyFor = (drugId) => cart.find((i) => i.drugId === drugId)?.qty ?? 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((d) => {
      if (category !== 'All' && d.category !== category) return false;
      if (!q) return true;
      return [d.name, d.generic, d.form, d.strength, d.manufacturer, d.category].some((f) => f?.toLowerCase().includes(q));
    });
  }, [catalog, category, query]);

  const detailed = useMemo(
    () =>
      cart
        .map((i) => {
          const d = catalog.find((c) => c.id === i.drugId);
          return d ? { ...i, drug: d } : null;
        })
        .filter(Boolean),
    [cart, catalog]
  );
  const subtotal = detailed.reduce((n, i) => n + i.drug.price * i.qty, 0);
  const fee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  function addToCart(drug) {
    if (!rxAllowed(drug) || !drug.inStock) return;
    dbActions.addToCart({ actor: user?.id, drugId: drug.id, qty: 1 });
  }

  function setQty(drugId, qty) {
    dbActions.setCartItemQty({ actor: user?.id, drugId, qty });
  }

  function chooseDelivery(method) {
    setDeliveryMethod(method);
    if (method === 'delivery') {
      if (!address && profile?.address) {
        setAddress(`${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zip ?? ''}`.trim());
      }
      if (!phone) setPhone(profile?.phone ?? '');
    }
  }

  function placeOrder() {
    dbActions.placePharmacyOrder({
      actor: user?.id,
      delivery: { method: deliveryMethod, address, phone },
      note,
    });
    setPlaced({ total });
    setConfirming(false);
    setNote('');
    push('Order placed', 'Your pharmacy order has been received.', 'success');
  }

  const myOrders = (db.pharmacyOrders ?? []).filter((o) => o.patientUserId === user?.id);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pharmacy store</h1>
          <p className="mt-0.5 max-w-[54ch] text-sm text-ink-secondary">
            Buy medicines online from Carebridge Pharmacy — delivered to your door in Lagos or ready for pickup in Ikeja.
          </p>
        </div>
        <Button to="/">Back to site</Button>
      </div>

      {/* Trust strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: 'Licensed pharmacist review', sub: 'Every order is checked' },
          { icon: Truck, title: 'Delivery across Lagos', sub: 'Same-day in 1–3 hours' },
          { icon: Store, title: 'Pickup at Ikeja', sub: 'Ready in 30–60 minutes' },
          { icon: PackageCheck, title: 'Secure, NDPA-compliant', sub: 'Health data stays private' },
        ].map((t) => (
          <div key={t.title} className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <t.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
              <p className="truncate text-xs text-ink-muted">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        {/* Catalog */}
        <div className="min-w-0">
          <Card>
            <CardHead
              title="Medicines & health essentials"
              sub={`${filtered.length} item${filtered.length === 1 ? '' : 's'} available`}
              right={<Pill tone="brand">{cartCount} in cart</Pill>}
            />
            <div className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search medicines, brands, categories…"
                    className="w-full rounded-lg border border-line bg-surface-raised py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/25"
                  />
                </div>
                <div className="flex min-w-0 gap-1.5 overflow-x-auto no-scrollbar">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                      className={cn(
                        'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                        category === c ? 'border-accent bg-accent text-white' : 'border-line bg-neutral-50 text-ink-secondary hover:border-accent hover:text-accent'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-muted">No products match your search. Try a different term or category.</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((d) => {
                  const allowed = rxAllowed(d);
                  const qty = qtyFor(d.id);
                  return (
                    <div key={d.id} data-product={d.id} className="flex flex-col rounded-xl border border-line bg-surface-page p-4 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                          <PillIcon className="h-5 w-5" />
                        </div>
                        {d.requiresPrescription ? (
                          <Pill tone={allowed ? 'success' : 'warning'}>
                            {allowed ? 'Active Rx' : 'Prescription needed'}
                          </Pill>
                        ) : (
                          <Pill tone="neutral">OTC</Pill>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-bold text-ink">{d.name}</p>
                      <p className="text-xs text-ink-muted">
                        {d.form} · {d.strength} · {d.pack}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs text-ink-secondary">{d.desc}</p>
                      <p className="mt-2 text-lg font-bold text-ink">{formatCurrency(d.price)}</p>
                      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
                        {d.inStock ? (
                          qty === 0 ? (
                            <Button size="sm" variant="outline" className="flex-1" disabled={!allowed} onClick={() => addToCart(d)}>
                              <Plus className="h-4 w-4" /> Add to cart
                            </Button>
                          ) : (
                            <div className="flex flex-1 items-center justify-between rounded-lg border border-line bg-neutral-50 px-2 py-1.5">
                              <button aria-label={`Decrease quantity of ${d.name}`} onClick={() => setQty(d.id, qty - 1)} className="flex h-6 w-6 items-center justify-center rounded-md text-ink-secondary hover:bg-neutral-200 hover:text-ink">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-sm font-bold text-ink">{qty}</span>
                              <button aria-label={`Increase quantity of ${d.name}`} onClick={() => setQty(d.id, Math.min(qty + 1, 9))} className="flex h-6 w-6 items-center justify-center rounded-md text-ink-secondary hover:bg-neutral-200 hover:text-ink">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )
                        ) : (
                          <p className="flex-1 text-center text-xs font-semibold text-danger-ink">Out of stock</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* My orders */}
          <Card className="mt-6">
            <CardHead title="My orders" sub={`${myOrders.length} order${myOrders.length === 1 ? '' : 's'}`} right={<ClipboardList className="h-4 w-4 text-accent" />} />
            {myOrders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-ink-muted">You haven't placed any pharmacy orders yet.</p>
            )}
            {myOrders.map((o) => (
              <div key={o.id} className="border-b border-line px-5 py-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Order {o.id.toUpperCase()} <span className="font-normal text-ink-muted">· {formatDateTime(o.placedAt)}</span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                      {o.delivery?.method === 'delivery' ? (
                        <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery to {o.delivery?.address}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5" /> Pickup at {PICKUP_POINT}</span>
                      )}
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.items.length} item{o.items.length === 1 ? '' : 's'}</span>
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-3 grid gap-x-8 gap-y-1 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-ink-secondary sm:grid-cols-2">
                  {o.items.map((i) => (
                    <span key={i.drugId}>
                      <strong className="text-ink">{i.qty}×</strong> {i.drug} <span className="text-ink-muted">({i.strength})</span> — {formatCurrency(i.lineTotal)}
                    </span>
                  ))}
                  <span className="sm:text-right">
                    Total <strong className="text-ink">{formatCurrency(o.total)}</strong>
                    {o.deliveryFee > 0 ? <span className="text-ink-muted"> incl. delivery</span> : null}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Cart */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHead title="Your cart" sub={cartCount === 0 ? 'Empty' : `${cartCount} item${cartCount === 1 ? '' : 's'}`} right={<ShoppingCart className="h-4 w-4 text-accent" />} />
            {detailed.length === 0 && (
              <div className="px-5 py-10 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-ink-muted" />
                <p className="mt-2 text-sm text-ink-muted">Add medicines from the catalog to begin.</p>
              </div>
            )}
            {detailed.length > 0 && (
              <div className="space-y-3 p-5">
                {detailed.map((i) => (
                  <div key={i.drugId} className="flex items-center gap-3 rounded-xl border border-line bg-neutral-50 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{i.drug.name}</p>
                      <p className="text-xs text-ink-muted">{i.drug.strength} · {formatCurrency(i.drug.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button aria-label={`Increase quantity of ${i.drug.name}`} onClick={() => setQty(i.drugId, i.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface-raised text-ink-secondary hover:text-ink">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-ink">{i.qty}</span>
                      <button aria-label={`Decrease quantity of ${i.drug.name}`} onClick={() => setQty(i.drugId, i.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface-raised text-ink-secondary hover:text-ink">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="w-20 text-right text-sm font-bold text-ink">{formatCurrency(i.drug.price * i.qty)}</p>
                    <button aria-label={`Remove ${i.drug.name} from cart`} onClick={() => dbActions.removeFromCart({ actor: user?.id, drugId: i.drugId })} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-danger-soft hover:text-danger-ink">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Delivery method */}
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">How would you like to receive it?</p>
                  <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors', deliveryMethod === 'delivery' ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent')}>
                    <input type="radio" name="delivery" checked={deliveryMethod === 'delivery'} onChange={() => chooseDelivery('delivery')} className="mt-0.5 h-4 w-4 accent-accent" />
                    <span className="flex-1">
                      <span className="flex items-center justify-between text-sm font-semibold text-ink">
                        Home delivery <span className="text-xs font-bold text-ink-secondary">{formatCurrency(DELIVERY_FEE)}</span>
                      </span>
                      <span className="block text-xs text-ink-muted">Doorstep delivery across Lagos in 1–3 hours.</span>
                    </span>
                  </label>
                  <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors', deliveryMethod === 'pickup' ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent')}>
                    <input type="radio" name="delivery" checked={deliveryMethod === 'pickup'} onChange={() => chooseDelivery('pickup')} className="mt-0.5 h-4 w-4 accent-accent" />
                    <span className="flex-1">
                      <span className="flex items-center justify-between text-sm font-semibold text-ink">
                        Store pickup <span className="text-xs font-bold text-success-ink">Free</span>
                      </span>
                      <span className="block text-xs text-ink-muted">Ready in 30–60 minutes at {PICKUP_POINT}.</span>
                    </span>
                  </label>

                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-3 rounded-xl border border-line p-3">
                      <Input label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" icon={Phone} />
                      <Textarea label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city, state" />
                    </div>
                  )}
                  {deliveryMethod === 'pickup' && (
                    <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <MapPin className="h-3.5 w-3.5 text-accent" /> We'll text you when your order is ready to collect.
                    </p>
                  )}

                  <Input label="Order note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call before delivery" />
                </div>

                {/* Totals */}
                <div className="space-y-1.5 border-t border-line pt-3 text-sm">
                  <p className="flex justify-between text-ink-secondary"><span>Subtotal</span><span className="font-semibold text-ink">{formatCurrency(subtotal)}</span></p>
                  <p className="flex justify-between text-ink-secondary"><span>Delivery</span><span className="font-semibold text-ink">{fee ? formatCurrency(fee) : 'Free'}</span></p>
                  <p className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink"><span>Total</span><span>{formatCurrency(total)}</span></p>
                </div>

                <Button block onClick={() => setConfirming(true)} disabled={!address && deliveryMethod === 'delivery'}>
                  <PackageCheck className="h-4 w-4" /> Place order
                </Button>
                <p className="text-center text-[11px] text-ink-muted">Prescription items are verified against your active prescriptions before dispensing.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm your order"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button onClick={placeOrder}><ArrowRight className="h-4 w-4" /> Place order · {formatCurrency(total)}</Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-ink-secondary">Review the items below before confirming. {fee > 0 ? 'A delivery fee applies.' : 'Pickup is free at the Ikeja pharmacy.'}</p>
          <div className="rounded-xl border border-line bg-neutral-50 px-3 py-2">
            {detailed.map((i) => (
              <p key={i.drugId} className="flex justify-between py-1 text-ink">
                <span><strong>{i.qty}×</strong> {i.drug.name} <span className="text-ink-muted">({i.drug.strength})</span></span>
                <span className="font-semibold">{formatCurrency(i.drug.price * i.qty)}</span>
              </p>
            ))}
            <div className="my-1 border-t border-line" />
            <p className="flex justify-between py-0.5 text-ink-secondary"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></p>
            <p className="flex justify-between py-0.5 text-ink-secondary"><span>Delivery</span><span>{fee ? formatCurrency(fee) : 'Free'}</span></p>
            <p className="flex justify-between py-1 text-base font-bold text-ink"><span>Total</span><span>{formatCurrency(total)}</span></p>
          </div>
          <p className="flex items-start gap-2 text-xs text-ink-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {deliveryMethod === 'delivery'
              ? <>Delivered to {address || '—'} · {phone}</>
              : <>Pickup at {PICKUP_POINT}</>}
          </p>
        </div>
      </Modal>

      {/* Success modal */}
      <Modal
        open={Boolean(placed)}
        onClose={() => setPlaced(null)}
        title="Order placed"
        footer={<Button onClick={() => setPlaced(null)}><BadgeCheck className="h-4 w-4" /> Done</Button>}
      >
        <div className="space-y-3 text-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-ink">
            <PackageCheck className="h-6 w-6" />
          </div>
          <p className="text-ink-secondary">
            Your order <strong className="text-ink">{myOrders[0] ? myOrders[0].id.toUpperCase() : ''}</strong> has been sent to Carebridge Pharmacy. A pharmacist will review it and{' '}
            {deliveryMethod === 'delivery' ? 'schedule delivery to your address.' : 'have it ready for pickup in 30–60 minutes.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill tone="success" dot>Placed</Pill>
            <Pill tone="brand">Pharmacist review</Pill>
            <Pill tone="neutral">{deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</Pill>
          </div>
          <p className="text-xs text-ink-muted">
            {timeAgo(new Date())} · Track this order on the Pharmacist's online orders queue in the demo. Refresh to reset data.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default PharmacyStorePage;