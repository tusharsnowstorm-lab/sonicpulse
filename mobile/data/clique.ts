import type { ImageSourcePropType } from 'react-native';
import { cliquePalette } from '@/theme';
import { CURRENT_USER_ID } from '@/data/users';

export type CliqueMember = {
  slug: string; // matches an AppUser id
  name: string;
  initial: string;
  color: string;
  distanceMeters: number;
  bearingDeg: number; // degrees clockwise from north, relative to the viewer
  // Both absent in demo mode / seeds — mobile/hooks/useLiveClique.ts sets
  // them from live GPS. `found` defaults to the old distanceMeters<=
  // FOUND_DISTANCE_METERS check when absent so demo mode is untouched.
  found?: boolean;
  // No live presence yet (member hasn't opened wya? or hasn't shared a fix
  // in >15s) — render dimmed via Radar's existing dimmedSlugs prop.
  stale?: boolean;
};

export type Clique = {
  id: string;
  name: string;
  creatorId: string;
  // A photo the creator uploads, or null — a mosaic of member colors/initials
  // renders instead. Phase 06 of the build guide: client-side render, not a
  // generated file, so it always matches current membership.
  heroImage: ImageSourcePropType | null;
  // Every participant except the current viewer — the radar/facepile never
  // need to plot yourself, only the friends you're tracking.
  members: CliqueMember[];
};

// Placeholder data for scaffolding the UI — Phase 07 of the build guide
// replaces distanceMeters/bearingDeg with live values computed from GPS +
// compass heading over a Supabase Realtime Presence channel.
export const seedCliques: Clique[] = [
  {
    id: 'night-owls',
    name: 'Night Owls',
    creatorId: CURRENT_USER_ID,
    heroImage: null,
    members: [
      { slug: 'rafi', name: 'Rafi', initial: 'R', color: cliquePalette[0], distanceMeters: 6, bearingDeg: 205 },
      { slug: 'meem', name: 'Meem', initial: 'M', color: cliquePalette[3], distanceMeters: 64, bearingDeg: 35 },
      { slug: 'adib', name: 'Adib', initial: 'A', color: cliquePalette[1], distanceMeters: 98, bearingDeg: 130 },
      { slug: 'nusrat', name: 'Nusrat', initial: 'N', color: cliquePalette[5], distanceMeters: 140, bearingDeg: 300 },
    ],
  },
  {
    id: 'bassline-bandits',
    name: 'Bassline Bandits',
    creatorId: 'tania',
    heroImage: require('@/assets/images/poster-2.webp'),
    members: [
      { slug: 'tania', name: 'Tania Rahman', initial: 'T', color: cliquePalette[2], distanceMeters: 40, bearingDeg: 80 },
      { slug: 'shoumik', name: 'Shoumik Islam', initial: 'S', color: cliquePalette[4], distanceMeters: 22, bearingDeg: 300 },
      { slug: 'nabila', name: 'Nabila Chowdhury', initial: 'N', color: cliquePalette[0], distanceMeters: 71, bearingDeg: 15 },
      { slug: 'farhan', name: 'Farhan Kabir', initial: 'F', color: cliquePalette[1], distanceMeters: 130, bearingDeg: 200 },
    ],
  },
];

// A pending invitation, addressed to the current user, seeded so the
// accept/decline flow has something real to demonstrate. In the real
// backend this is a row in clique_invites with status 'pending'.
export type CliqueInvite = {
  id: string;
  cliqueId: string;
  cliqueName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
};

export const seedInvites: CliqueInvite[] = [
  {
    id: 'invite-seed-1',
    cliqueId: 'late-checkout',
    cliqueName: 'Late Checkout',
    inviterId: 'tanzim',
    inviterName: 'Tanzim Hossain',
    inviteeId: CURRENT_USER_ID,
  },
];

// The full clique behind a still-pending invite — only added to the
// viewer's own clique list once they accept.
export const pendingCliqueDefinitions: Record<string, Clique> = {
  'late-checkout': {
    id: 'late-checkout',
    name: 'Late Checkout',
    creatorId: 'tanzim',
    heroImage: null,
    members: [
      { slug: 'tanzim', name: 'Tanzim Hossain', initial: 'T', color: cliquePalette[3], distanceMeters: 210, bearingDeg: 90 },
      { slug: 'nabila', name: 'Nabila Chowdhury', initial: 'N', color: cliquePalette[5], distanceMeters: 185, bearingDeg: 260 },
    ],
  },
};

export const FOUND_DISTANCE_METERS = 8;

// Local time (24h) at which wya? live-sharing auto-stops. The event itself
// runs 16:30-09:00 overnight; useLiveClique checks this every second.
export const EVENT_END_HOUR = 9;

export function getMemberBySlug(clique: Clique | undefined, slug: string | undefined) {
  return clique?.members.find((m) => m.slug === slug);
}
