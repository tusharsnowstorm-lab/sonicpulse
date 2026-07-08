// Every Supabase query the app makes lives here — mobile/store/AppStore.tsx's
// remote path is the only caller. Mirrors src/app/api/admin/influencers/route.ts's
// reference-code convention (charset, SP- prefix, 8 chars) so app and website
// tickets are indistinguishable to the gate scanner.
import { supabase } from '@/lib/supabase';
import { cliquePalette } from '@/theme';
import type { Clique, CliqueMember, CliqueInvite } from '@/data/clique';
import type { AppUser } from '@/data/users';
import type { InfluencerProfile } from '@/data/profile';
import type { Registration, Reservation } from '@/store/AppStore';

function client() {
  if (!supabase) throw new Error('lib/api called without a configured Supabase client');
  return supabase;
}

// Env name only — never commit values. The deployed website origin; the
// mobile app has no shared cookie jar with it, so payment routes are
// called with the Supabase access token as a bearer header instead.
function siteUrl() {
  const url = process.env.EXPO_PUBLIC_SITE_URL;
  if (!url) throw new Error('EXPO_PUBLIC_SITE_URL is not set — cannot reach the website payment API');
  return url;
}

const REF_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateReferenceCode(): string {
  let code = 'SP-';
  for (let i = 0; i < 8; i++) code += REF_CODE_CHARS[Math.floor(Math.random() * REF_CODE_CHARS.length)];
  return code;
}

function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}

// Deterministic per-id placeholder so the radar/facepile have something
// stable to render for real members before PLAN-wya-live wires up live
// GPS/compass — stable across refetches, unlike Math.random().
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function fetchNameMap(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (userIds.length === 0) return map;
  const { data, error } = await client().from('user_profiles').select('user_id, full_name').in('user_id', userIds);
  if (error) throw error;
  (data ?? []).forEach((row) => {
    if (row.full_name) map.set(row.user_id, row.full_name);
  });
  return map;
}

// ---- Cliques + invites (reads) --------------------------------------------

export async function fetchMyCliques(userId: string): Promise<Clique[]> {
  const db = client();

  const { data: myMemberships, error: membershipErr } = await db
    .from('clique_members')
    .select('clique_id')
    .eq('user_id', userId);
  if (membershipErr) throw membershipErr;
  const memberCliqueIds = (myMemberships ?? []).map((m) => m.clique_id);

  const orParts = [`creator_id.eq.${userId}`];
  if (memberCliqueIds.length > 0) orParts.push(`id.in.(${memberCliqueIds.join(',')})`);

  const { data: cliqueRows, error: cliquesErr } = await db
    .from('cliques')
    .select('id, name, creator_id, hero_photo_path')
    .or(orParts.join(','));
  if (cliquesErr) throw cliquesErr;
  if (!cliqueRows || cliqueRows.length === 0) return [];

  const cliqueIds = cliqueRows.map((c) => c.id);
  const { data: memberRows, error: membersErr } = await db
    .from('clique_members')
    .select('clique_id, user_id, color_hex')
    .in('clique_id', cliqueIds);
  if (membersErr) throw membersErr;

  // clique.members holds every participant except the viewer (see
  // data/clique.ts) — the viewer's own row is DB bookkeeping only.
  const otherUserIds = Array.from(new Set((memberRows ?? []).map((m) => m.user_id).filter((id) => id !== userId)));
  const nameMap = await fetchNameMap(otherUserIds);

  return cliqueRows.map((row) => {
    const members: CliqueMember[] = (memberRows ?? [])
      .filter((m) => m.clique_id === row.id && m.user_id !== userId)
      .map((m) => {
        const name = nameMap.get(m.user_id) ?? 'Member';
        return {
          slug: m.user_id,
          name,
          initial: initialOf(name),
          color: m.color_hex,
          distanceMeters: 20 + (hashCode(m.user_id) % 140),
          bearingDeg: hashCode(`${m.user_id}b`) % 360,
        };
      });
    return {
      id: row.id,
      name: row.name,
      // 'me' is the sentinel the screens already compare against
      // (data/users.ts's CURRENT_USER_ID) — substituting it here means
      // cliques/index.tsx's creatorId checks work unmodified.
      creatorId: row.creator_id === userId ? 'me' : row.creator_id,
      heroImage: null, // hero photo storage wiring is out of this plan's scope
      members,
    };
  });
}

export async function fetchMyInvites(userId: string): Promise<CliqueInvite[]> {
  const db = client();
  const { data, error } = await db
    .from('clique_invites')
    .select('id, clique_id, inviter_id, cliques(name)')
    .eq('invitee_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  const rows = (data ?? []) as {
    id: string;
    clique_id: string;
    inviter_id: string;
    cliques: { name: string } | { name: string }[] | null;
  }[];

  const inviterIds = Array.from(new Set(rows.map((r) => r.inviter_id)));
  const nameMap = await fetchNameMap(inviterIds);

  return rows.map((row) => {
    const cliqueRef = Array.isArray(row.cliques) ? row.cliques[0] : row.cliques;
    return {
      id: row.id,
      cliqueId: row.clique_id,
      cliqueName: cliqueRef?.name ?? '',
      inviterId: row.inviter_id,
      inviterName: nameMap.get(row.inviter_id) ?? 'Someone',
      inviteeId: 'me',
    };
  });
}

// ---- Cliques + invites (writes) --------------------------------------------

export async function createCliqueRemote(userId: string, name: string): Promise<string> {
  const db = client();
  const { data: cliqueRow, error: insertErr } = await db
    .from('cliques')
    .insert({ name, creator_id: userId })
    .select('id')
    .single();
  if (insertErr) throw insertErr;

  // Creator seeds their own membership row (the RLS insert policy allows
  // this specifically so is_clique_member() sees the creator immediately).
  const { error: memberErr } = await db
    .from('clique_members')
    .insert({ clique_id: cliqueRow.id, user_id: userId, color_hex: cliquePalette[0] });
  if (memberErr) throw memberErr;

  return cliqueRow.id as string;
}

export async function sendInviteRemote(cliqueId: string, inviterId: string, inviteeId: string): Promise<void> {
  const db = client();
  const { error } = await db
    .from('clique_invites')
    .insert({ clique_id: cliqueId, inviter_id: inviterId, invitee_id: inviteeId });
  // The partial unique index (one pending invite per clique+invitee) makes
  // re-inviting a no-op rather than a real failure.
  if (error && error.code !== '23505') throw error;
}

export async function respondInviteRemote(
  inviteId: string,
  userId: string,
  cliqueId: string,
  accept: boolean
): Promise<void> {
  const db = client();
  const { error: updateErr } = await db
    .from('clique_invites')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', inviteId);
  if (updateErr) throw updateErr;
  if (!accept) return;

  // Two simultaneous accepts can race this count and pick the same palette
  // index — acceptable (colors may repeat past six anyway); not worth a lock.
  const { count, error: countErr } = await db
    .from('clique_members')
    .select('*', { count: 'exact', head: true })
    .eq('clique_id', cliqueId);
  if (countErr) throw countErr;

  const { error: joinErr } = await db
    .from('clique_members')
    .insert({ clique_id: cliqueId, user_id: userId, color_hex: cliquePalette[(count ?? 0) % cliquePalette.length] });
  if (joinErr) throw joinErr;
}

export async function removeMemberRemote(cliqueId: string, memberUserId: string): Promise<void> {
  const db = client();
  const { error } = await db.from('clique_members').delete().eq('clique_id', cliqueId).eq('user_id', memberUserId);
  if (error) throw error;
}

export async function leaveCliqueRemote(cliqueId: string, userId: string): Promise<void> {
  const db = client();
  const { error } = await db.from('clique_members').delete().eq('clique_id', cliqueId).eq('user_id', userId);
  if (error) throw error;
}

// ---- Registration / reservation (reads) -----------------------------------

export type RemoteRegistration = { registration: Registration; ticketId: string | null };

export async function fetchMyRegistration(userId: string): Promise<RemoteRegistration> {
  const db = client();
  const { data, error } = await db
    .from('user_tickets')
    .select('id, status, includes_shuttle, reference_code, ticket_tier')
    .eq('user_id', userId)
    .in('ticket_tier', ['phase1', 'influencer'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return { registration: { status: 'none', shuttle: false, paid: false }, ticketId: null };

  // A user can hold both a paid phase1 ticket and an influencer-approved
  // one for the same event (PLAN-influencer-segment's "double-ticket"
  // edge case). Registration is a single object per event here — narrower
  // than that plan's ideal "Tickets tab lists both" — so prefer the
  // influencer ticket when both exist.
  const row = rows.find((r) => r.ticket_tier === 'influencer') ?? rows[0];
  const isInfluencer = row.ticket_tier === 'influencer';

  let paid = isInfluencer; // influencer tickets never go through checkout
  if (!isInfluencer) {
    const { data: successfulPayment } = await db
      .from('payments')
      .select('id')
      .eq('ticket_id', row.id)
      .eq('status', 'success')
      .maybeSingle();
    paid = !!successfulPayment;
  }

  return {
    registration: {
      status: row.status === 'approved' ? 'approved' : row.status === 'pending' ? 'pending' : 'none',
      shuttle: row.includes_shuttle,
      paid,
      referenceCode: row.reference_code,
      ticketTier: row.ticket_tier,
    },
    ticketId: row.id,
  };
}

export type SubmitRegistrationResult =
  | { ok: true; ticketId: string; referenceCode: string }
  | { ok: false; reason: 'missing-nid' };

// user_tickets.nid_file_path is NOT NULL — refuse rather than insert '' to
// sneak past it (the admin actually opens these files at the gate).
export async function submitRegistration(userId: string, email: string): Promise<SubmitRegistrationResult> {
  const db = client();
  const { data: prof, error: profErr } = await db
    .from('user_profiles')
    .select('full_name, phone, nid_number, nid_file_path')
    .eq('user_id', userId)
    .maybeSingle();
  if (profErr) throw profErr;
  if (!prof?.nid_file_path || !prof.full_name || !prof.phone || !prof.nid_number) {
    return { ok: false, reason: 'missing-nid' };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const referenceCode = generateReferenceCode();
    const { data, error } = await db
      .from('user_tickets')
      .insert({
        user_id: userId,
        user_email: email,
        full_name: prof.full_name,
        phone: prof.phone,
        nid_number: prof.nid_number,
        nid_file_path: prof.nid_file_path,
        ticket_tier: 'phase1',
        status: 'pending',
        reference_code: referenceCode,
      })
      .select('id, reference_code')
      .single();
    if (!error) return { ok: true, ticketId: data.id, referenceCode: data.reference_code };
    if (error.code !== '23505') throw error;
    // Unique violation on reference_code — retry once with a fresh code.
  }
  throw new Error('Failed to generate a unique reference code after retry');
}

export async function setShuttle(ticketId: string, value: boolean): Promise<void> {
  const db = client();
  // Absolute boolean, not a DB-side NOT — an optimistic toggle racing a
  // slow network must not flip the wrong way.
  const { error } = await db.from('user_tickets').update({ includes_shuttle: value }).eq('id', ticketId);
  if (error) throw error;
}

export function subscribeToMyTickets(userId: string, onChange: () => void): () => void {
  const db = client();
  const channel = db
    .channel('me-tickets')
    .on(
      // '*' (not just UPDATE) so an influencer-approved application —
      // which INSERTs a brand new user_tickets row rather than updating an
      // existing one — also triggers a refetch.
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_tickets', filter: `user_id=eq.${userId}` },
      onChange
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
}

export type RemoteReservation = { reservation: Reservation; reservationId: string | null };

export async function fetchMyReservation(userId: string, eventId: string): Promise<RemoteReservation> {
  const db = client();
  const { data, error } = await db
    .from('accommodation_reservations')
    .select('id, status')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { reservation: { status: 'none', paid: false }, reservationId: null };

  const { data: successfulPayment } = await db
    .from('payments')
    .select('id')
    .eq('reservation_id', data.id)
    .eq('status', 'success')
    .maybeSingle();

  return {
    reservation: {
      status: data.status === 'approved' ? 'approved' : data.status === 'pending' ? 'pending' : 'none',
      paid: !!successfulPayment,
    },
    reservationId: data.id,
  };
}

export async function submitReservation(
  userId: string,
  eventId: string,
  tier: string,
  price: number
): Promise<{ reservationId: string }> {
  const db = client();

  // unique(event_id, user_id) makes double-reserving impossible at the DB
  // level; treat an existing row as success instead of surfacing an error,
  // since the optimistic caller has no way to know one already exists.
  const existing = await fetchMyReservation(userId, eventId);
  if (existing.reservationId) return { reservationId: existing.reservationId };

  for (let attempt = 0; attempt < 2; attempt++) {
    const referenceCode = generateReferenceCode();
    const { data, error } = await db
      .from('accommodation_reservations')
      .insert({ event_id: eventId, user_id: userId, tier, price, reference_code: referenceCode })
      .select('id')
      .single();
    if (!error) return { reservationId: data.id };
    if (error.code === '23505') {
      const again = await fetchMyReservation(userId, eventId);
      if (again.reservationId) return { reservationId: again.reservationId };
      continue; // reference_code collision — retry with a fresh one
    }
    throw error;
  }
  throw new Error('Failed to create a reservation after retry');
}

export function subscribeToMyReservations(userId: string, onChange: () => void): () => void {
  const db = client();
  const channel = db
    .channel('me-reservations')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'accommodation_reservations', filter: `user_id=eq.${userId}` },
      onChange
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
}

// ---- Payments (website API, bearer-token authed) --------------------------

export async function createPaymentSession(
  accessToken: string,
  kind: 'ticket' | 'reservation',
  provider: 'bkash' | 'sslcommerz'
): Promise<{ url: string; paymentId: string }> {
  const res = await fetch(`${siteUrl()}/api/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ kind, provider }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `createPaymentSession failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchPaymentStatus(accessToken: string, paymentId: string): Promise<string> {
  const res = await fetch(`${siteUrl()}/api/payments/status?id=${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`fetchPaymentStatus failed: ${res.status}`);
  const data = await res.json();
  return data.status as string;
}

// ---- Influencer segment ----------------------------------------------------

export async function fetchInfluencerProfile(userId: string): Promise<InfluencerProfile | null> {
  const db = client();
  const { data, error } = await db
    .from('influencer_profiles')
    .select('primary_platform, tiktok_handle, youtube_channel, follower_count, content_type')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    primaryPlatform: data.primary_platform,
    tiktokHandle: data.tiktok_handle ?? '',
    youtubeChannel: data.youtube_channel ?? '',
    followerCount: data.follower_count,
    contentType: data.content_type,
  };
}

export async function saveInfluencerProfileRemote(userId: string, profile: InfluencerProfile): Promise<void> {
  const db = client();
  const { error } = await db.from('influencer_profiles').upsert(
    {
      user_id: userId,
      primary_platform: profile.primaryPlatform,
      tiktok_handle: profile.tiktokHandle || null,
      youtube_channel: profile.youtubeChannel || null,
      follower_count: profile.followerCount,
      content_type: profile.contentType,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

export async function fetchMyPromotionApplications(userId: string): Promise<Record<string, 'pending' | 'approved' | 'rejected'>> {
  const db = client();
  const { data, error } = await db.from('promotion_applications').select('event_id, status').eq('user_id', userId);
  if (error) throw error;
  const result: Record<string, 'pending' | 'approved' | 'rejected'> = {};
  (data ?? []).forEach((row) => {
    result[row.event_id] = row.status;
  });
  return result;
}

export async function applyToPromoteRemote(userId: string, eventId: string): Promise<'pending' | 'already-applied'> {
  const db = client();
  const { error } = await db.from('promotion_applications').insert({ user_id: userId, event_id: eventId });
  // unique(user_id, event_id) makes double-applying a 23505, not a real
  // failure — the button should just settle into its PENDING state.
  if (error && error.code !== '23505') throw error;
  return error ? 'already-applied' : 'pending';
}

// ---- Directory search (read) ------------------------------------------------

// query='' matches every profile with a name (ilike '%%' matches all rows) —
// used both for real searches and to warm mobile/data/users.ts's local cache.
export async function searchUsersRemote(query: string, excludeIds: string[]): Promise<AppUser[]> {
  const db = client();
  const pattern = `%${query.trim()}%`;
  const { data, error } = await db
    .from('user_profiles')
    .select('user_id, full_name, instagram_handle')
    .or(`full_name.ilike.${pattern},instagram_handle.ilike.${pattern}`)
    .limit(200);
  if (error) throw error;
  return (data ?? [])
    .filter((row) => row.full_name && !excludeIds.includes(row.user_id))
    .map((row) => ({
      id: row.user_id,
      name: row.full_name as string,
      handle: row.instagram_handle ?? '',
      initial: initialOf(row.full_name as string),
    }));
}
