// Directory of app accounts, searchable for clique invites — the same
// lookup WYA's own search reuses. In the real backend this is a query
// against auth.users / user_profiles, not a static list.
export type AppUser = {
  id: string;
  name: string;
  handle: string;
  initial: string;
};

// The signed-in user for this local build — Phase 03/04 of the build guide
// swaps this for a real Supabase session.
export const CURRENT_USER_ID = 'me';

export const otherAppUsers: AppUser[] = [
  { id: 'rafi', name: 'Rafi', handle: 'rafi.k', initial: 'R' },
  { id: 'meem', name: 'Meem', handle: 'meem.h', initial: 'M' },
  { id: 'adib', name: 'Adib', handle: 'adib.r', initial: 'A' },
  { id: 'nusrat', name: 'Nusrat', handle: 'nusrat.a', initial: 'N' },
  { id: 'tania', name: 'Tania Rahman', handle: 'tania.r', initial: 'T' },
  { id: 'shoumik', name: 'Shoumik Islam', handle: 'shoumik.i', initial: 'S' },
  { id: 'nabila', name: 'Nabila Chowdhury', handle: 'nabila.c', initial: 'N' },
  { id: 'farhan', name: 'Farhan Kabir', handle: 'farhan.k', initial: 'F' },
  { id: 'tanzim', name: 'Tanzim Hossain', handle: 'tanzimh', initial: 'T' },
];

export function getUserById(id: string) {
  return otherAppUsers.find((u) => u.id === id);
}

// Populated once by the remote store (mobile/store/AppStore.tsx) from
// lib/api.ts's searchUsersRemote — searchUsers stays a synchronous call so
// the screens that use it (cliques/new.tsx, cliques/invite.tsx) never need
// to become async or handle loading states.
let remoteDirectory: AppUser[] = [];

export function setRemoteDirectory(users: AppUser[]) {
  remoteDirectory = users;
}

export function searchUsers(query: string, excludeIds: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const pool = isRemoteDirectoryActive() ? remoteDirectory : otherAppUsers;
  return pool.filter(
    (u) =>
      !excludeIds.includes(u.id) &&
      (u.name.toLowerCase().includes(normalized) || u.handle.toLowerCase().includes(normalized))
  );
}

// Once the remote store has populated the directory at least once, prefer
// it over the static demo list even if it's momentarily empty (e.g. no
// other accounts exist yet on a fresh project) — otherwise a slow first
// fetch would search demo names for a real session.
let remoteDirectoryLoaded = false;
export function markRemoteDirectoryLoaded() {
  remoteDirectoryLoaded = true;
}
function isRemoteDirectoryActive() {
  return remoteDirectoryLoaded;
}
