import { USER_IDS } from './20261006010001-seed-users.js';
import { DEPARTMENT_IDS } from './20261006010002-seed-departments.js';
import { DOCTOR_IDS } from './20261006010003-seed-doctors.js';
import { WARD_IDS } from './20261006010005-seed-wards-beds.js';
import { PRODUCT_IDS } from './20261006010006-seed-product-catalog.js';

const now = new Date();

const PALETTES = [
  { bg: '#0f766e', fg: '#ffffff' },
  { bg: '#2563eb', fg: '#ffffff' },
  { bg: '#7c3aed', fg: '#ffffff' },
  { bg: '#db2777', fg: '#ffffff' },
  { bg: '#ea580c', fg: '#ffffff' },
  { bg: '#059669', fg: '#ffffff' },
  { bg: '#0891b2', fg: '#ffffff' },
  { bg: '#4f46e5', fg: '#ffffff' },
];

function svgDataUrl(label) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  const palette = PALETTES[hash % PALETTES.length];
  const initials = label
    .replace(/Dr\.?\s+|Front Desk|System|Lab|Accounts|Nurse|Pharmacy|Officer|Technician|Staff|Consultant|\bspecialist\b/gi, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" style="stop-color:${palette.bg};stop-opacity:1"/>` +
    `<stop offset="1" style="stop-color:${palette.bg}cc"/>` +
    `</linearGradient></defs>` +
    `<rect width="200" height="200" rx="40" fill="url(#g)"/>` +
    `<text x="100" y="116" font-family="system-ui, sans-serif" font-size="64" font-weight="700" fill="${palette.fg}" text-anchor="middle">${initials || 'CB'}</text>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function svgProductIcon(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const palette = PALETTES[(hash + 3) % PALETTES.length];
  const glyph = name.charAt(0).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">` +
    `<rect width="400" height="300" rx="24" fill="#f8fafc"/>` +
    `<rect x="120" y="40" width="160" height="190" rx="20" fill="${palette.bg}33" stroke="${palette.bg}" stroke-width="6"/>` +
    `<circle cx="200" cy="110" r="34" fill="${palette.bg}"/>` +
    `<text x="200" y="126" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="${palette.fg}" text-anchor="middle">${glyph}</text>` +
    `<text x="200" y="206" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="${palette.bg}" text-anchor="middle">Carebridge</text>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const IMAGE_UUID = (n) => `a1000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
let seq = 1;

const images = [];
const add = (entityType, entityId, label, isSvg = true) => {
  images.push({
    id: IMAGE_UUID(seq++),
    entityType,
    entityId,
    dataUrl: isSvg ? svgDataUrl(label) : svgProductIcon(label),
    mimeType: 'image/svg+xml',
    filename: null,
    isPrimary: true,
    createdAt: now,
    updatedAt: now,
  });
};

// Staff + patient avatars
images.push({ id: IMAGE_UUID(seq++), entityType: 'user', entityId: USER_IDS.admin, dataUrl: svgDataUrl('System Administrator'), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
for (const [key, label] of Object.entries({
  amelia: 'Dr. Amelia Hart', james: 'Dr. James Okoro', sophia: 'Dr. Sophia Nguyen', daniel: 'Dr. Daniel Mensah',
  priya: 'Dr. Priya Sharma', lucas: 'Dr. Lucas Meyer',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'user', entityId: USER_IDS[key], dataUrl: svgDataUrl(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}
for (const [key, label] of Object.entries({
  nurse: 'Nurse Grace Boateng', reception: 'Front Desk', pharmacist: 'Pharmacy', lab: 'Lab Technician', accountant: 'Accounts',
  patientAmy: 'Amy Williams', patientBen: 'Ben Carter', patientClara: 'Clara Adams', patientDavid: 'David Kim', patientEve: 'Eve Johnson', patientFred: 'Fred Mensah',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'user', entityId: USER_IDS[key], dataUrl: svgDataUrl(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}

// Doctor profile photos
for (const [key, label] of Object.entries({
  amelia: 'Dr. Amelia Hart', james: 'Dr. James Okoro', sophia: 'Dr. Sophia Nguyen', daniel: 'Dr. Daniel Mensah',
  priya: 'Dr. Priya Sharma', lucas: 'Dr. Lucas Meyer',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'doctor', entityId: DOCTOR_IDS[key], dataUrl: svgDataUrl(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}

// Departments
for (const [key, label] of Object.entries({
  cardiology: 'Cardiology', surgery: 'Surgery', pediatrics: 'Pediatrics', internalMedicine: 'Internal Medicine', emergency: 'Emergency', neurology: 'Neurology',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'department', entityId: DEPARTMENT_IDS[key], dataUrl: svgDataUrl(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}

// Wards
for (const [key, label] of Object.entries({
  emergency: 'Emergency', medical: 'Medical', surgical: 'Surgical', pediatric: 'Pediatric', maternity: 'Maternity', private: 'Private', icu: 'ICU',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'ward', entityId: WARD_IDS[key], dataUrl: svgDataUrl(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}

// Product packshots
for (const [key, label] of Object.entries({
  amoxicillin: 'Amoxicillin', metformin: 'Metformin', lisinopril: 'Lisinopril', salbutamol: 'Salbutamol Inhaler', omeprazole: 'Omeprazole',
  paracetamol: 'Paracetamol', ibuprofen: 'Ibuprofen', ors: 'ORS', cetirizine: 'Cetirizine', vitaminC: 'Vitamin C', vitaminD: 'Vitamin D3',
  multivitamin: 'Multivitamin', bpMonitor: 'BP Monitor', glucometer: 'Glucometer', thermometer: 'Thermometer', pulseOximeter: 'Pulse Oximeter',
  plasters: 'Plasters', firstAidKit: 'First Aid Kit', handSanitizer: 'Hand Sanitizer', faceMask: 'Face Masks', babyDiapers: 'Baby Diapers',
  toothpaste: 'Toothpaste',
})) {
  images.push({ id: IMAGE_UUID(seq++), entityType: 'product', entityId: PRODUCT_IDS[key], dataUrl: svgProductIcon(label), mimeType: 'image/svg+xml', filename: null, isPrimary: true, createdAt: now, updatedAt: now });
}

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('images', images);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('images', { id: images.map((img) => img.id) });
  },
};