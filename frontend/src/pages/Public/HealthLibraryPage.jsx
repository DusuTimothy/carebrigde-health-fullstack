import React, { useMemo, useState } from 'react';
import { useDB } from '../../lib/db.js';
import { PageHero, SearchBox, LazyBg } from '../../components/ui/Page.jsx';
import Pill from '../../components/ui/Pill.jsx';
import { Pagination } from '../../components/ui/Stepper.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';

const PAGE_SIZE = 8;
const MODAL_BODY = {
  'High blood pressure (hypertension)': 'Blood pressure is the force of blood against artery walls. Persistent readings of 130/80 or higher put extra strain on the heart. Lifestyle change — DASH diet, sodium reduction, movement — is the first step; some people also need medication. Home monitoring is valuable, and a single high reading is rarely an emergency.',
  'Type 2 diabetes': 'Type 2 diabetes means your body no longer uses insulin efficiently. HbA1c reflects average blood sugar over ~3 months; under 5.7% is normal, 5.7–6.4% is prediabetes, 6.5%+ is diabetes. Diet, activity and medication work together to keep levels in range and protect your heart, eyes and kidneys.',
  'Seasonal allergies (allergic rhinitis)': 'Allergies happen when your immune system overreacts to harmless particles like pollen. Symptoms — sneezing, congestion, itchy eyes — can be managed with oral antihistamines, nasal steroid sprays and simple habits like showering after outdoor time and closing windows during peak pollen hours.',
  'Asthma in adults': 'Asthma narrows airways, causing wheeze, cough and shortness of breath. Triggers vary — allergens, cold air, exercise, smoke. Treatment pairs a daily controller inhaler (anti-inflammatory) with a rescue inhaler for flares. An action plan tells you exactly what to do when symptoms worsen.',
  'Low back pain': 'Most low back pain is mechanical and improves within 6 weeks. Staying gently active beats bed rest — walking, stretching and core strength help. Imaging is only needed for red flags: weakness, loss of bladder control, or pain after major trauma.',
  'Anxiety and stress': 'Stress is a normal response to pressure. When worry becomes constant, hard to control, and interferes with sleep, work or relationships, it may be an anxiety disorder. Evidence-based options include CBT, mindfulness and, when appropriate, medication. Help often starts with a primary care conversation.',
  'High cholesterol': 'Cholesterol travels through blood in particles: LDL (“bad”) deposits in arteries, HDL (“good”) helps remove it. Balance matters more than a single number. Diet, exercise and statins bring levels down; the target depends on your overall risk, not just lipids.',
  'The flu vs. a common cold': 'Flu hits fast — fever, body aches, exhaustion — and can be serious. Colds are gradual and mild. Most healthy adults recover with rest and fluids; call your clinic for flu symptoms if you are pregnant, over 65, or have a chronic condition.',
  'Prenatal vitamins and pregnancy nutrition': 'Key nutrients during pregnancy include folic acid (for neural tube development), iron, calcium and vitamin D. A prenatal vitamin covers daily needs; eat a varied diet and avoid raw or undercooked proteins. Your OB team can personalize targets.',
  'Shingles': 'Shingles is a painful rash from reactivating the chickenpox virus, usually in people 50+. The vaccine is recommended for adults and sharply reduces risk and severity. Early antiviral treatment shortens symptoms, so contact your clinic at the first sign of a one-sided rash.',
  'Migraine': 'Migraine is much more than a bad headache — neurological changes cause throbbing, nausea and light sensitivity. Tracking triggers, managing stress, and preventive medication help most people. Certain patterns (new weakness, vision change) warrant urgent evaluation.',
  'Skin cancer prevention': 'The ABCDE rule helps spot melanoma: Asymmetry, irregular Borders, mixed Colors, Diameter >6 mm, and Evolution over time. Use SPF 30+ daily — even on cloudy days — reapply every two hours, and see dermatology for any changing or new mole.',
};

export default function HealthLibraryPage() {
  const [db] = useDB();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const categories = useMemo(
    () => ['all', ...new Set(db.healthLibrary.map((a) => a.category))],
    [db.healthLibrary]
  );

  const filtered = useMemo(() => {
    let list = db.healthLibrary;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(needle) || a.summary.toLowerCase().includes(needle));
    }
    if (category !== 'all') list = list.filter((a) => a.category === category);
    return list;
  }, [db.healthLibrary, q, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHero
        title="Health library"
        lead="Plain-language guides to common conditions, treatments and preventive care — written and reviewed by our clinicians."
        crumbs={[{ label: 'Patient resources' }, { label: 'Health library' }]}
        image="/images/health/doctor-tablet.jpg"
      >
        <div className="mt-8">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} onSubmit={() => setPage(1)} placeholder="Search topics — e.g. blood pressure" />
        </div>
      </PageHero>

      <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill key={c} tone={category === c ? 'brand' : 'neutral'} className="cursor-pointer" onClick={() => { setCategory(c); setPage(1); }}>
              {c === 'all' ? 'All topics' : c}
            </Pill>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageRows.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-line bg-surface-raised text-left transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
            >
              <LazyBg image={a.img || '/images/health/doctor-tablet.jpg'} className="media-tile media-edge relative h-32" />
              <div className="flex flex-col gap-2 px-5 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-accent">{a.category}</span>
                  <span className="text-xs text-ink-muted">{a.readTime} read</span>
                </div>
                <h3 className="text-base font-semibold leading-snug text-ink group-hover:text-accent">{a.title}</h3>
                <p className="text-sm text-ink-secondary">{a.summary}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-6">
            <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} pageSize={PAGE_SIZE} />
          </div>
        )}
      </section>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            <Button to={`/portal/patient/book?guest=1`}>Talk to a clinician</Button>
          </>
        }
      >
        {open && (
          <div className="prose-sm text-ink-secondary">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{open.category} · {open.readTime} read</p>
            <p className="leading-relaxed text-sm">
              {MODAL_BODY[open.title] ?? open.summary}
            </p>
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              This content is for general education and does not replace advice from your care team.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}