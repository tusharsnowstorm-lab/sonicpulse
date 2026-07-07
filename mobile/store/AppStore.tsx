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

export type RegistrationStatus = 'none' | 'pending' | 'approved';
export type Registration = {
  status: RegistrationStatus;
  shuttle: boolean;
  paid: boolean;
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

export function AppStoreProvider({ children }: { children: ReactNode }) {
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
    // Phase 04 of the build guide: real admin review replaces this timer —
    // it exists here only so the approved-and-pay states are reachable
    // without a backend to approve anything.
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

  const value = useMemo<AppStoreValue>(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, hasOnboarded, registrations, reservations, cliques, invites, sentInvites]
  );

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
