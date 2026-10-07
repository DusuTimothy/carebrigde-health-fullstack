const now = new Date();

const iso = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const SUB = (n) => (n > 9 ? '' : '0') + n;

const articles = [
  { category: 'news', title: 'Five daily habits that keep your heart healthy', date: iso(1), readTime: '4 min read', excerpt: 'Small, consistent choices — from movement snacking to sleep hygiene — add up to big cardiovascular protection.', url: '/news-and-insights' },
  { category: 'news', title: 'New machine-learning model improves early cancer detection', date: iso(3), readTime: '6 min read', excerpt: 'A Carebridge research team trained an AI model that flags subtle imaging patterns years earlier than standard review.', url: '/news-and-insights' },
  { category: 'news', title: 'Marathon runner returns to the course after knee surgery', date: iso(6), readTime: '5 min read', excerpt: 'Sports medicine and physical therapy got Amina back to racing just eight months after an ACL reconstruction.', url: '/news-and-insights' },
  { category: 'news', title: 'What your blood pressure numbers actually mean', date: iso(8), readTime: '3 min read', excerpt: 'A plain-language guide to systolic and diastolic readings — and when to call your care team.', url: '/news-and-insights' },
  { category: 'news', title: 'Weight-loss drug trial shows promise for fatty liver disease', date: iso(12), readTime: '7 min read', excerpt: 'Interim results from an early-phase study suggest meaningful improvement in liver fat among participants.', url: '/news-and-insights' },
  { category: 'news', title: 'A parent\u2019s guide to back-to-school immunizations', date: iso(15), readTime: '4 min read', excerpt: 'Which vaccines your child needs this year — and how to book a same-week well visit.', url: '/news-and-insights' },
  { category: 'news', title: 'After a stroke at 42, a patient relearns to walk with our rehab team', date: iso(18), readTime: '6 min read', excerpt: 'Early rehab intervention rewired a recovery that doctors predicted would take a year.', url: '/news-and-insights' },
  { category: 'news', title: 'Ask the doctors: Why do I wake up with a headache every morning?', date: iso(21), readTime: '3 min read', excerpt: 'Your clinicians answer a reader question about morning headaches — causes and when to worry.', url: '/news-and-insights' },
  { category: 'news', title: 'Sleep, stress and screen time: the new science of teen mental health', date: iso(25), readTime: '5 min read', excerpt: 'A behavioral health specialist shares what parents can actually do that moves the needle.', url: '/news-and-insights' },
  { category: 'news', title: 'Personalized breast-screening schedules outperform one-size-fits-all', date: iso(30), readTime: '6 min read', excerpt: 'Risk-based intervals could catch more cancers while reducing false positives by a fifth.', url: '/news-and-insights' },
  { category: 'health_library', title: 'High blood pressure (hypertension)', date: null, readTime: '5 min', excerpt: 'Learn what raises blood pressure, how it is measured, and the drug-free and medication options that bring it down.' },
  { category: 'health_library', title: 'Type 2 diabetes', date: null, readTime: '7 min', excerpt: 'Understanding blood sugar, what HbA1c means, and how diet, activity and medication work together.' },
  { category: 'health_library', title: 'Seasonal allergies (allergic rhinitis)', date: null, readTime: '4 min', excerpt: 'Why pollen season triggers sneezing and congestion — and which treatments help most.' },
  { category: 'health_library', title: 'Asthma in adults', date: null, readTime: '6 min', excerpt: 'Recognizing triggers, using inhalers correctly, and building an asthma action plan.' },
  { category: 'health_library', title: 'Low back pain', date: null, readTime: '6 min', excerpt: 'Most back pain improves with movement, not rest. Here is what works and when imaging is needed.' },
  { category: 'health_library', title: 'Anxiety and stress', date: null, readTime: '5 min', excerpt: 'Signs that everyday stress has become anxiety — and evidence-based ways to respond.' },
  { category: 'health_library', title: 'High cholesterol', date: null, readTime: '5 min', excerpt: 'What LDL, HDL and triglycerides mean, and how food, exercise and medication lower risk.' },
  { category: 'health_library', title: 'The flu vs. a common cold', date: null, readTime: '3 min', excerpt: 'Quick comparison of symptoms, when to stay home, and when to seek urgent care.' },
  { category: 'health_library', title: 'Prenatal vitamins and pregnancy nutrition', date: null, readTime: '4 min', excerpt: 'The nutrients that matter most before and during pregnancy and safe foods to prioritize.' },
  { category: 'health_library', title: 'Shingles', date: null, readTime: '4 min', excerpt: 'What the reactivation of the chickenpox virus looks like and why vaccination is recommended.' },
  { category: 'health_library', title: 'Migraine', date: null, readTime: '6 min', excerpt: 'Beyond tension headaches: migraine triggers, warning signs, and preventive treatments.' },
  { category: 'health_library', title: 'Skin cancer prevention', date: null, readTime: '5 min', excerpt: 'The ABCDEs of melanoma, sunscreen that actually works, and when to get a skin check.' },
];

const locations = [
  { name: 'Carebridge Medical Centre, Ikeja', type: 'Hospital', address: '1 Hospital Road, Ikeja GRA, Lagos', phone: '+234 1 270 0100', hours: 'Open 24 hours', services: ['Emergency', 'ICU', 'Inpatient'] },
  { name: 'Carebridge Victoria Island Medical Centre', type: 'Hospital', address: '12 Adeola Odeku Street, Victoria Island, Lagos', phone: '+234 1 460 8200', hours: 'Open 24 hours', services: ['Emergency', 'Inpatient'] },
  { name: 'Carebridge Yaba Clinic', type: 'Primary Care', address: '8 Herbert Macaulay Way, Yaba, Lagos', phone: '+234 1 740 5530', hours: 'Mon–Fri 8 am – 8 pm', services: ['Primary care', 'Lab draw'] },
  { name: 'Carebridge Wuse Clinic', type: 'Primary Care', address: 'Plot 22, Aminu Kano Crescent, Wuse II, Abuja', phone: '+234 9 460 9410', hours: 'Mon–Fri 8 am – 8 pm', services: ['Primary care'] },
  { name: 'Carebridge GRA Immediate Care', type: 'Immediate Care', address: '2 Aba Road, GRA Phase 2, Port Harcourt', phone: '+234 84 460 1200', hours: 'Mon–Fri 8 am – 8 pm · Sat–Sun 9 am – 6 pm', services: ['Urgent care', 'X-ray', 'IV hydration'] },
  { name: 'Carebridge Lekki Immediate Care', type: 'Immediate Care', address: 'Plot 34, Admiralty Way, Lekki Phase 1, Lagos', phone: '+234 1 460 2200', hours: 'Mon–Fri 8 am – 8 pm · Sat–Sun 9 am – 6 pm', services: ['Urgent care', 'X-ray'] },
  { name: 'Carebridge Bodija Specialty Centre', type: 'Specialty Care', address: '3 Awolowo Avenue, Bodija, Ibadan', phone: '+234 2 750 3320', hours: 'Mon–Fri 8 am – 8 pm', services: ['Orthopedics', 'Dermatology'] },
  { name: 'Carebridge Diagnostics Centre, Victoria Island', type: 'Imaging', address: '15 Akin Adesola Street, Victoria Island, Lagos', phone: '+234 1 460 9900', hours: 'Mon–Fri 7 am – 6 pm', services: ['MRI', 'CT', 'Ultrasound', 'X-ray'] },
  { name: 'Carebridge Pharmacy, Ikeja', type: 'Pharmacy', address: '9 Allen Avenue, Ikeja, Lagos', phone: '+234 1 270 4450', hours: 'Mon–Fri 8 am – 6 pm · Sat 9 am – 1 pm', services: ['Prescriptions', 'Counseling'] },
  { name: 'The BirthPlace at Carebridge VI', type: 'Specialty Care', address: 'Level 3, Carebridge Victoria Island Medical Centre, Lagos', phone: '+234 1 460 8280', hours: 'Open 24 hours', services: ['Maternity', 'NICU'] },
];

const clinicalTrials = [
  { title: 'Early Detection of Heart Failure Using Wearable Sensors', category: 'Heart & Vascular', status: 'recruiting', phase: 'Phase 2', locations: ['Carebridge Medical Centre, Ikeja'], summary: 'Study evaluating whether smartwatch sensor data can detect early warning signs of heart failure weeks before symptoms appear.', eligibility: 'Adults 40+ with a history of hypertension.' },
  { title: 'Targeted Immunotherapy for Metastatic Breast Cancer', category: 'Cancer Care', status: 'recruiting', phase: 'Phase 3', locations: ['Carebridge Medical Centre, Ikeja', 'Carebridge Wuse Clinic'], summary: 'Testing a novel combination immunotherapy against standard therapy in adults with HER2-negative metastatic breast cancer.', eligibility: 'Adults 18+ with confirmed metastatic breast cancer.' },
  { title: 'AI-Assisted Retinal Screening for Diabetic Retinopathy', category: 'Ophthalmology', status: 'recruiting', phase: 'Phase 1', locations: ['Carebridge Yaba Clinic'], summary: 'Validating an AI tool that reads retinal photographs to flag signs of diabetic eye disease during routine visits.', eligibility: 'Adults with type 2 diabetes.' },
  { title: 'Home-Based Strength Training for Chronic Back Pain', category: 'Orthopedics', status: 'recruiting', phase: 'Phase 2', locations: ['Carebridge GRA Clinic, Port Harcourt'], summary: 'Comparing two supervised home exercise programs for adults with chronic non-surgical low back pain.', eligibility: 'Adults 18-70 with back pain lasting 3+ months.' },
  { title: 'Mindfulness App for Pediatric Anxiety', category: 'Behavioral Health', status: 'not_recruiting', phase: 'Phase 3', locations: ['Carebridge Medical Centre, Ikeja'], summary: 'Evaluating a therapist-guided mindfulness app as a first-line treatment for anxiety in adolescents.', eligibility: 'Youth ages 12-17 with generalized anxiety disorder.' },
  { title: 'Personalized Dosing of Blood Pressure Medications', category: 'Heart & Vascular', status: 'recruiting', phase: 'Phase 4', locations: ['Carebridge Wuse Clinic', 'Carebridge Yaba Clinic'], summary: 'Using genetic markers to tailor antihypertensive dosing and reduce side effects.', eligibility: 'Adults 18+ starting therapy for hypertension.' },
];

const stories = [
  { name: 'Amina Yusuf, 39', title: 'Back on the road after ACL reconstruction', date: iso(12), tag: 'Orthopedics', quote: 'Sports medicine gave me a plan, a team, and the confidence that I would run again. Nine months later I crossed the finish line in Lagos.' },
  { name: 'Chuka Okeke, 58', title: 'A second chance after a heart transplant', date: iso(30), tag: 'Transplant', quote: 'From the first consult to discharge, everyone knew my name. Six months post-transplant I walked my daughter down the aisle.' },
  { name: 'Amara Osei, 7', title: 'Beating leukemia — with her family by her side', date: iso(20), tag: 'Cancer Care', quote: 'The pediatric team made the hardest year of our lives feel manageable. Amara rang the bell and she never looked back.' },
];

const departmentsCatalog = [
  'Anesthesiology', 'Audiology', 'Cardiology', 'Cardiothoracic Surgery', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
  'Family Medicine', 'Gastroenterology', 'Geriatrics', 'Hematology & Oncology', 'Infectious Disease', 'Laboratory Medicine',
  'Nephrology', 'Neurology', 'Neurosurgery', 'Obstetrics & Gynecology', 'Ophthalmology', 'Orthopedic Surgery',
  'Otolaryngology (ENT)', 'Pain Medicine', 'Pathology', 'Pediatrics', 'Physical Medicine & Rehab', 'Psychiatry', 'Pulmonology',
  'Radiation Oncology', 'Radiology', 'Rheumatology', 'Sleep Medicine', 'Sports Medicine', 'Transplant Services', 'Urology',
  'Vascular Surgery', 'Weight Management',
];

const siteContents = [
  {
    key: 'serviceLines',
    value: [
      { id: 'sl-cancer', icon: 'Ribbon', name: 'Cancer Care', desc: 'A full spectrum of prevention, diagnosis and treatment from our oncologic specialists.', link: '/services/cancer-care' },
      { id: 'sl-heart', icon: 'HeartPulse', name: 'Heart & Vascular', desc: 'Leading-edge cardiology and vascular surgery from prevention to transplant.', link: '/services/heart-vascular' },
      { id: 'sl-neuro', icon: 'Brain', name: 'Neuroscience', desc: 'Care for the brain and nervous system — from headache clinics to complex surgery.', link: '/services/neuroscience' },
      { id: 'sl-women', icon: 'Baby', name: "Women's Health", desc: 'Obstetrics, gynecology, breast care and pelvic health for every stage of life.', link: '/services/womens-health' },
      { id: 'sl-ortho', icon: 'Activity', name: 'Orthopedics & Sports Medicine', desc: 'Bone, joint and spine care that gets people — including pro athletes — back in motion.', link: '/services/orthopedics' },
      { id: 'sl-children', icon: 'Stethoscope', name: "Children's Care", desc: 'Pediatric specialists caring for kids from the NICU through young adulthood.', link: '/services/pediatric-care' },
      { id: 'sl-behavioral', icon: 'Scale', name: 'Behavioral Health', desc: 'Psychiatry and therapy for everything from everyday stress to complex conditions.', link: '/services/behavioral-health' },
      { id: 'sl-transplant', icon: 'HeartHandshake', name: 'Transplant', desc: "One of the country's most experienced transplant programs across 15 organ types.", link: '/services/transplant' },
      { id: 'sl-headneck', icon: 'Scan', name: 'Head & Neck Surgery', desc: 'Consultative and surgical care for conditions of the head, neck, ear, nose and throat across all ages.', link: '/services/head-neck-surgery' },
      { id: 'sl-psychiatry', icon: 'BrainCircuit', name: 'Psychiatry', desc: 'Specialized outpatient programs ranked among the best in the nation, for every age and condition.', link: '/services/psychiatry' },
    ],
  },
  {
    key: 'bookingSpecialties',
    value: [
      { id: 'spec-primary', name: 'Primary Care / General Practice', short: 'Primary care', feeMin: 15000, feeMax: 25000 },
      { id: 'spec-cardio', name: 'Cardiology', short: 'Cardiology', feeMin: 30000, feeMax: 50000 },
      { id: 'spec-derma', name: 'Dermatology', short: 'Dermatology', feeMin: 20000, feeMax: 35000 },
      { id: 'spec-pedia', name: 'Pediatrics', short: 'Pediatrics', feeMin: 15000, feeMax: 25000 },
      { id: 'spec-ortho', name: 'Orthopedics', short: 'Orthopedics', feeMin: 30000, feeMax: 60000 },
      { id: 'spec-neuro', name: 'Neurology', short: 'Neurology', feeMin: 35000, feeMax: 60000 },
      { id: 'spec-obgyn', name: "OB/GYN & Women's Health", short: 'OB/GYN', feeMin: 25000, feeMax: 45000 },
      { id: 'spec-behavioral', name: 'Behavioral Health', short: 'Behavioral health', feeMin: 20000, feeMax: 35000 },
      { id: 'spec-endocr', name: 'Endocrinology', short: 'Endocrinology', feeMin: 25000, feeMax: 40000 },
      { id: 'spec-urgent', name: 'Immediate Care', short: 'Urgent care', feeMin: 20000, feeMax: 30000 },
    ],
  },
  {
    key: 'community',
    value: {
      mission: 'Carebridge Health believes equitable care starts with access. We run free screening clinics, mobile care units, and partnerships across neighborhoods that face the greatest barriers to care.',
      programs: [
        { id: 'cg-1', name: 'Mobile Care Unit', desc: 'Free blood pressure, glucose and cholesterol screenings around the state.', participants: 4200 },
        { id: 'cg-2', name: 'Community Health Workers', desc: 'Trained navigators who connect neighbors to insurance, food and housing support.', participants: 1180 },
        { id: 'cg-3', name: 'Homeless Healthcare Collaborative', desc: 'Street medicine teams providing primary care and behavioral health to unsheltered neighbors.', participants: 960 },
        { id: 'cg-4', name: 'Translation & Health Literacy', desc: 'In-language classes and materials across 10 languages.', participants: 2300 },
      ],
    },
  },
  {
    key: 'facilities',
    value: [
      { id: 'fac-1', name: 'Carebridge Medical Centre, Ikeja', rooms: ['ER-1', 'ER-2', 'ER-3', 'ER-4', 'ICU-1', 'ICU-2'], bedsTotal: 120, bedsOccupied: 98 },
      { id: 'fac-2', name: 'Carebridge Wuse Clinic', rooms: ['Exam 1', 'Exam 2', 'Exam 3', 'Exam 4'], bedsTotal: 0, bedsOccupied: 0 },
      { id: 'fac-3', name: 'Carebridge Yaba Clinic', rooms: ['Exam 1', 'Exam 2', 'Exam 3'], bedsTotal: 0, bedsOccupied: 0 },
    ],
  },
  {
    key: 'labInstruments',
    value: [
      { id: 'sys-xl2', name: 'Chemistry Analyzer XL-2', utilization: 74, current: 'Lipid Panel ×3', queueCount: 6 },
      { id: 'sys-hemo', name: 'Hematology Analyzer HemoOne', utilization: 61, current: 'CBC ×2', queueCount: 4 },
      { id: 'sys-imm', name: 'Immunoassay P800', utilization: 38, current: 'TSH ×1', queueCount: 2 },
      { id: 'sys-borne', name: 'Specimen Transport Runner', utilization: 0, current: '—', queueCount: 0 },
    ],
  },
  {
    key: 'departmentsCatalog',
    value: departmentsCatalog.map((name, i) => ({ name, letter: name.charAt(0).toUpperCase(), sort: i })),
  },
  {
    key: 'contactChannels',
    value: {
      main: { phone: '+234 1 270 0100', emergency: '+234 1 270 0299', email: 'care@carebridge.ng', address: '1 Hospital Road, Ikeja GRA, Lagos' },
      hours: 'Open 24 hours',
    },
  },
];

const ARTICLE_UUID = (n) => `e1000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const LOC_UUID = (n) => `e2000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const TRIAL_UUID = (n) => `e3000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const STORY_UUID = (n) => `e4000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const SC_UUID = (n) => `e5000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const rows = {
  articles: articles.map((a, i) => ({ ...a, id: ARTICLE_UUID(i + 1), createdAt: now, updatedAt: now })),
  locations: locations.map((l, i) => ({ ...l, id: LOC_UUID(i + 1), createdAt: now, updatedAt: now })),
  clinicalTrials: clinicalTrials.map((t, i) => ({ ...t, id: TRIAL_UUID(i + 1), createdAt: now, updatedAt: now })),
  stories: stories.map((s, i) => ({ ...s, id: STORY_UUID(i + 1), createdAt: now, updatedAt: now })),
  siteContents: siteContents.map((c, i) => ({ ...c, id: SC_UUID(i + 1), createdAt: now, updatedAt: now })),
};

const jsonb = (queryInterface, value) =>
  queryInterface.sequelize.literal(`'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('articles', rows.articles);
    await queryInterface.bulkInsert(
      'locations',
      rows.locations.map((l) => ({ ...l, services: l.services ? jsonb(queryInterface, l.services) : null }))
    );
    await queryInterface.bulkInsert(
      'clinical_trials',
      rows.clinicalTrials.map((t) => ({ ...t, locations: t.locations ? jsonb(queryInterface, t.locations) : null }))
    );
    await queryInterface.bulkInsert('stories', rows.stories);
    await queryInterface.bulkInsert(
      'site_contents',
      rows.siteContents.map((c) => ({ ...c, value: jsonb(queryInterface, c.value) }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('site_contents', { id: rows.siteContents.map((r) => r.id) });
    await queryInterface.bulkDelete('stories', { id: rows.stories.map((r) => r.id) });
    await queryInterface.bulkDelete('clinical_trials', { id: rows.clinicalTrials.map((r) => r.id) });
    await queryInterface.bulkDelete('locations', { id: rows.locations.map((r) => r.id) });
    await queryInterface.bulkDelete('articles', { id: rows.articles.map((r) => r.id) });
  },
};