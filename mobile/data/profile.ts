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

// Mirrors src/app/influencers/page.tsx's PLATFORMS/FOLLOWER_RANGES/
// CONTENT_TYPES — the five follower buckets replace the website form's old
// three-tier scheme for new submissions, but src/app/admin/AdminClient.tsx
// deliberately still recognizes the legacy keys for applications already
// on file (never delete those labels there).
export type InfluencerPlatform = 'instagram' | 'tiktok' | 'youtube' | 'other';

export const INFLUENCER_PLATFORM_OPTIONS: { value: InfluencerPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'other', label: 'Other' },
];

export type FollowerBucket = 'under_1k' | '1k_5k' | '5k_10k' | '10k_15k' | '15k_plus';

export const FOLLOWER_BUCKET_OPTIONS: { value: FollowerBucket; label: string }[] = [
  { value: 'under_1k', label: 'Under 1,000' },
  { value: '1k_5k', label: '1,000–5,000' },
  { value: '5k_10k', label: '5,000–10,000' },
  { value: '10k_15k', label: '10,000–15,000' },
  { value: '15k_plus', label: '15,000+' },
];

export type ContentType = 'music_nightlife' | 'lifestyle' | 'fashion_beauty' | 'entertainment' | 'general';

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'music_nightlife', label: 'Music / Nightlife' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fashion_beauty', label: 'Fashion & Beauty' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'general', label: 'General Content' },
];

// Name/phone/ID/Instagram all come from the onboarding profile above — this
// is only the influencer-specific extra fields.
export type InfluencerProfile = {
  primaryPlatform: InfluencerPlatform;
  tiktokHandle: string;
  youtubeChannel: string;
  followerCount: FollowerBucket;
  contentType: ContentType;
};

export const emptyInfluencerProfile: InfluencerProfile = {
  primaryPlatform: 'instagram',
  tiktokHandle: '',
  youtubeChannel: '',
  followerCount: 'under_1k',
  contentType: 'general',
};
