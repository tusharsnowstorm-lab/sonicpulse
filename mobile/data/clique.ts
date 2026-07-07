import { cliquePalette } from '@/theme';

export type CliqueMember = {
  slug: string;
  name: string;
  initial: string;
  color: string;
  distanceMeters: number;
  bearingDeg: number; // degrees clockwise from north, relative to the viewer
};

// Placeholder data for scaffolding the UI — Phase 07 of the build guide
// replaces distanceMeters/bearingDeg with live values computed from GPS +
// compass heading over a Supabase Realtime Presence channel.
export const nightOwls = {
  id: 'night-owls',
  name: 'Night Owls',
  members: [
    { slug: 'rafi', name: 'Rafi', initial: 'R', color: cliquePalette[0], distanceMeters: 6, bearingDeg: 205 },
    { slug: 'meem', name: 'Meem', initial: 'M', color: cliquePalette[3], distanceMeters: 64, bearingDeg: 35 },
    { slug: 'adib', name: 'Adib', initial: 'A', color: cliquePalette[1], distanceMeters: 98, bearingDeg: 130 },
    { slug: 'nusrat', name: 'Nusrat', initial: 'N', color: cliquePalette[5], distanceMeters: 140, bearingDeg: 300 },
  ] satisfies CliqueMember[],
};

export const FOUND_DISTANCE_METERS = 8;

export function getMemberBySlug(slug: string | undefined) {
  return nightOwls.members.find((m) => m.slug === slug);
}
