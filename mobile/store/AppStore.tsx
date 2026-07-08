import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { emptyProfile, type Profile } from '@/data/profile';
import {
  seedCliques,
  seedInvites,
  pendingCliqueDefinitions,
  type Clique,
  type CliqueInvite,
} from '@/data/clique';
import { CURRENT_USER_ID, getUserById } from '@/data/users';
import { isSupabaseConfigured } from '@/lib/supabase';

export type RegistrationStatus = 'none' | 'pending' | 'approved';
export type Registration = {
  status: RegistrationStatus;
  shuttle: boolean;
  paid: boolean;
  // Real reference code once a remote registration exists; absent in demo
  // mode, where tickets.tsx falls back to its own placeholder constant.
  referenceCode?: string;
};

export type ReservationStatus = 'none' | 'pending' | 'approved';
export type Reservation = {
  status: ReservationStatus;
  paid: boolean;
};

const APPROVAL_DELAY_MS = 3500;

type AppStoreValue = {
  // Onboarding / profile
  profile: Profile;
  hasOnboarded: boolean;
  completeOnboarding: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;

  // Ticket registration, keyed by eventId
  registrations: Record<string, Registration>;
  registerForEvent: (eventId: string) => void;
  toggleShuttle: (eventId: string) => void;
  payTicket: (eventId: string) => void;

  // Accommodation reservation, keyed by eventId — its own lifecycle,
  // entirely separate from the ticket above.
  reservations: Record<string, Reservation>;
  reserveAccommodation: (eventId: string) => void;
  payReservation: (eventId: string) => void;

  // Cliques
  cliques: Clique[];
  invites: CliqueInvite[];
  createClique: (name: string, invitedUserIds: string[], heroImage: ImageSourcePropType | null) => void;
  sendInvite: (cliqueId: string, userId: string) => void;
  isInvited: (cliqueId: string, userId: string) => boolean;
  removeMember: (cliqueId: string, userId: string) => void;
  leaveClique: (cliqueId: string) => void;
  respondInvite: (inviteId: string, accept: boolean) => void;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

function emptyRegistration(): Registration {
  return { status: 'none', shuttle: false, paid: false };
}

function emptyReservation(): Reservation {
  return { status: 'none', paid: false };
}

// Today's seeded, in-memory behavior — used whenever Supabase isn't
// configured (demo mode, CI, the web export) so those keep working exactly
// as before. Byte-for-byte the pre-backend-wiring AppStoreProvider body.
function useLocalStore(): AppStoreValue {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [reservations, setReservations] = useState<Record<string, Reservation>>({});
  const [cliques, setCliques] = useState<Clique[]>(seedCliques);
  const [invites, setInvites] = useState<CliqueInvite[]>(seedInvites);
  const [sentInvites, setSentInvites] = useState<{ cliqueId: string; userId: string }[]>([]);

  function completeOnboarding(next: Profile) {
    setProfile(next);
    setHasOnboarded(true);
  }

  function updateProfile(next: Profile) {
    setProfile(next);
  }

  function registerForEvent(eventId: string) {
    setRegistrations((r) => ({ ...r, [eventId]: { ...emptyRegistration(), status: 'pending' } }));
    // CI/Playwright flows depend on this auto-approval timer to reach the
    // payment screen (see repo history: /tmp/flow4.js). Only the remote
    // path (useRemoteStore) drops it in favor of real admin review.
    setTimeout(() => {
      setRegistrations((r) => {
        const current = r[eventId];
        if (!current || current.status !== 'pending') return r;
        return { ...r, [eventId]: { ...current, status: 'approved' } };
      });
    }, APPROVAL_DELAY_MS);
  }

  function toggleShuttle(eventId: string) {
    setRegistrations((r) => {
      const current = r[eventId] ?? emptyRegistration();
      return { ...r, [eventId]: { ...current, shuttle: !current.shuttle } };
    });
  }

  function payTicket(eventId: string) {
    setRegistrations((r) => {
      const current = r[eventId];
      if (!current) return r;
      return { ...r, [eventId]: { ...current, paid: true } };
    });
  }

  function reserveAccommodation(eventId: string) {
    setReservations((r) => ({ ...r, [eventId]: { ...emptyReservation(), status: 'pending' } }));
    setTimeout(() => {
      setReservations((r) => {
        const current = r[eventId];
        if (!current || current.status !== 'pending') return r;
        return { ...r, [eventId]: { ...current, status: 'approved' } };
      });
    }, APPROVAL_DELAY_MS);
  }

  function payReservation(eventId: string) {
    setReservations((r) => {
      const current = r[eventId];
      if (!current) return r;
      return { ...r, [eventId]: { ...current, paid: true } };
    });
  }

  function createClique(name: string, invitedUserIds: string[], heroImage: ImageSourcePropType | null) {
    const id = `clique-${Date.now()}`;
    setCliques((c) => [...c, { id, name, creatorId: CURRENT_USER_ID, heroImage, members: [] }]);
    invitedUserIds.forEach((userId) => sendInvite(id, userId, name));
  }

  function sendInvite(cliqueId: string, userId: string, cliqueNameOverride?: string) {
    setSentInvites((s) => [...s, { cliqueId, userId }]);
    const clique = cliques.find((c) => c.id === cliqueId);
    const user = getUserById(userId);
    if (!user) return;
    setInvites((i) => [
      ...i,
      {
        id: `invite-${Date.now()}-${userId}`,
        cliqueId,
        cliqueName: cliqueNameOverride ?? clique?.name ?? '',
        inviterId: CURRENT_USER_ID,
        inviterName: 'You',
        inviteeId: userId,
      },
    ]);
  }

  function isInvited(cliqueId: string, userId: string) {
    return sentInvites.some((s) => s.cliqueId === cliqueId && s.userId === userId);
  }

  function removeMember(cliqueId: string, userId: string) {
    setCliques((c) =>
      c.map((clique) =>
        clique.id === cliqueId ? { ...clique, members: clique.members.filter((m) => m.slug !== userId) } : clique
      )
    );
  }

  function leaveClique(cliqueId: string) {
    setCliques((c) => c.filter((clique) => clique.id !== cliqueId));
  }

  function respondInvite(inviteId: string, accept: boolean) {
    setInvites((i) => i.filter((inv) => inv.id !== inviteId));
    if (!accept) return;
    const invite = invites.find((inv) => inv.id === inviteId);
    if (!invite) return;
    const fullClique = pendingCliqueDefinitions[invite.cliqueId];
    if (fullClique) {
      setCliques((c) => (c.some((existing) => existing.id === fullClique.id) ? c : [...c, fullClique]));
    }
  }

  return {
    profile,
    hasOnboarded,
    completeOnboarding,
    updateProfile,
    registrations,
    registerForEvent,
    toggleShuttle,
    payTicket,
    reservations,
    reserveAccommodation,
    payReservation,
    cliques,
    invites,
    createClique,
    sendInvite,
    isInvited,
    removeMember,
    leaveClique,
    respondInvite,
  };
}

// Step-2 checkpoint skeleton — same shape as useLocalStore, filled in over
// the following steps with real mobile/lib/api.ts-backed reads/writes.
// Profile/onboarding stays local React state here too: PLAN-mobile-auth's
// app/index.tsx and onboarding screen already own syncing that to Supabase
// directly via their own completeOnboarding()/updateProfile() calls.
function useRemoteStore(): AppStoreValue {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [reservations, setReservations] = useState<Record<string, Reservation>>({});
  const [cliques, setCliques] = useState<Clique[]>([]);
  const [invites, setInvites] = useState<CliqueInvite[]>([]);

  function completeOnboarding(next: Profile) {
    setProfile(next);
    setHasOnboarded(true);
  }

  function updateProfile(next: Profile) {
    setProfile(next);
  }

  function registerForEvent(_eventId: string) {}
  function toggleShuttle(_eventId: string) {}
  function payTicket(_eventId: string) {}
  function reserveAccommodation(_eventId: string) {}
  function payReservation(_eventId: string) {}
  function createClique(_name: string, _invitedUserIds: string[], _heroImage: ImageSourcePropType | null) {}
  function sendInvite(_cliqueId: string, _userId: string) {}
  function isInvited(_cliqueId: string, _userId: string) {
    return false;
  }
  function removeMember(_cliqueId: string, _userId: string) {}
  function leaveClique(_cliqueId: string) {}
  function respondInvite(_inviteId: string, _accept: boolean) {}

  return {
    profile,
    hasOnboarded,
    completeOnboarding,
    updateProfile,
    registrations,
    registerForEvent,
    toggleShuttle,
    payTicket,
    reservations,
    reserveAccommodation,
    payReservation,
    cliques,
    invites,
    createClique,
    sendInvite,
    isInvited,
    removeMember,
    leaveClique,
    respondInvite,
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // isSupabaseConfigured is a module-level constant resolved once from
  // process.env at bundle time (mobile/lib/supabase.ts) — it never changes
  // for the lifetime of the app, so this branch is stable across every
  // render and calling one hook or the other here does not violate the
  // rules of hooks in practice.
  const value = isSupabaseConfigured ? useRemoteStore() : useLocalStore();
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

export function getRegistration(registrations: Record<string, Registration>, eventId: string): Registration {
  return registrations[eventId] ?? emptyRegistration();
}

export function getReservation(reservations: Record<string, Reservation>, eventId: string): Reservation {
  return reservations[eventId] ?? emptyReservation();
}
