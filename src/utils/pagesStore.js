import { nanoid } from 'nanoid/non-secure';

const seedPages = [
  { id: 'seed-admissions', title: 'Admissions & Triage', path: '/pages/admissions', summary: 'Guidelines for intake, triage, and patient onboarding.', audience: 'Nurses, Admin', body: 'Step-by-step triage flow, required vitals, consent, and insurance capture.' },
  { id: 'seed-pharmacy', title: 'Pharmacy Policies', path: '/pages/pharmacy-policies', summary: 'Medication dispensing rules, stock controls, and expiry handling.', audience: 'Pharmacy, Doctors', body: 'Labeling rules, double-check meds with tall-man lettering, cold-chain handling, and expiry pulls.' },
  { id: 'seed-visitor', title: 'Visitor Guidelines', path: '/pages/visitor-guidelines', summary: 'Visiting hours, PPE requirements, and safety protocols.', audience: 'Front desk, Security', body: 'Visiting hours 10am-6pm, N95 required in ICU, no flowers in oncology, badge visible at all times.' }
];

const STORAGE_KEY = 'cc_admin_pages';

const loadStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const persist = (pages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {
    /* ignore */
  }
};

export const getPages = () => {
  const stored = loadStored();
  const merged = [...seedPages, ...stored].reduce((acc, page) => {
    acc[page.id] = page;
    return acc;
  }, {});
  return Object.values(merged);
};

export const addPage = (page) => {
  const stored = loadStored();
  const newPage = { id: nanoid(), ...page };
  const next = [newPage, ...stored];
  persist(next);
  return newPage;
};

export const findPage = (id) => getPages().find((p) => p.id === id);
