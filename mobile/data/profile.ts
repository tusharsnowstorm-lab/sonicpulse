// Mirrors user_profiles on the website (see src/app/api/profile/route.ts and
// ProfileSection.tsx) — same field names, same NID-masking rule. This is
// local component state for now; Phase 03/04 of the build guide swap it for
// a real Supabase session and PUT /api/profile call once auth is wired in.
export type IdType = 'nid' | 'passport' | 'birth_certificate';

export const ID_TYPE_OPTIONS: { value: IdType; label: string; short: string }[] = [
  { value: 'nid', label: 'NID', short: 'NID' },
  { value: 'passport', label: 'Passport', short: 'Passport' },
  { value: 'birth_certificate', label: 'Birth Cert.', short: 'Birth Certificate' },
];

// Matches the website's field — src/components/dashboard/ProfileSection.tsx.
export type Gender = 'male' | 'female' | 'non-binary';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
];

export type Profile = {
  fullName: string;
  phone: string;
  idType: IdType;
  idNumber: string;
  instagramHandle: string;
  otherSocial: string;
  gender: Gender;
  photoUri: string | null;
  idDocumentUri: string | null;
};

// Collected during onboarding — Phase 03/04 of the build guide swaps this
// for a real Supabase session started at first launch instead of a blank form.
export const emptyProfile: Profile = {
  fullName: '',
  phone: '',
  idType: 'nid',
  idNumber: '',
  instagramHandle: '',
  otherSocial: '',
  gender: 'male',
  photoUri: null,
  idDocumentUri: null,
};

export const initialProfile: Profile = {
  fullName: 'Tanvir Ahmed',
  phone: '+880 1712-345678',
  idType: 'nid',
  idNumber: '4829106673201',
  instagramHandle: 'tanvir.ahmed',
  otherSocial: '',
  gender: 'male',
  photoUri: null,
  idDocumentUri: null,
};

export function maskIdNumber(idNumber: string) {
  if (!idNumber) return '—';
  return `${idNumber.slice(0, 4)}${'•'.repeat(Math.max(idNumber.length - 4, 3))}`;
}
