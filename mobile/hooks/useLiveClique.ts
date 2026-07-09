import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import { haversineMeters, bearingDeg, relativeBearing, smoothBearing, type LatLng } from '@/lib/geo';
import { EVENT_END_HOUR, type Clique, type CliqueMember } from '@/data/clique';

export type LiveStatus = 'connecting' | 'live' | 'demo' | 'denied';

type PeerFix = { lat: number; lng: number; acc: number; ts: number };

const ACCURACY_GATE_METERS = 30;
const STALE_MS = 15000;
const FOUND_ENTER_METERS = 8;
const FOUND_EXIT_METERS = 12;
const RETRACK_DISTANCE_M = 2;
const RETRACK_INTERVAL_MS = 5000;

export function useLiveClique(clique: Clique | undefined) {
  const { session } = useAuth();
  const [status, setStatus] = useState<LiveStatus>(isSupabaseConfigured ? 'connecting' : 'demo');
  const [sharing, setSharing] = useState(true);
  const [members, setMembers] = useState<CliqueMember[]>(clique?.members ?? []);

  // Latest readings live in refs, not state — re-rendering only happens via
  // the 1s derivation loop below, not on every raw GPS/compass sample.
  const myFix = useRef<LatLng & { acc: number }>({ lat: 0, lng: 0, acc: 9999 });
  const haveFix = useRef(false);
  const myHeading = useRef(0);
  const peers = useRef<Map<string, PeerFix>>(new Map());
  const smoothedBearings = useRef<Map<string, number>>(new Map());
  const foundState = useRef<Map<string, boolean>>(new Map());

  const stopSharing = useCallback(() => setSharing(false), []);

  useFocusEffect(
    useCallback(() => {
      if (!clique) return;

      // Demo mode (no Supabase configured) or the user stopped sharing
      // this session — keep today's seed values so the screens always render.
      if (!isSupabaseConfigured || !supabase || !session) {
        setStatus('demo');
        setMembers(clique.members);
        return;
      }
      if (!sharing) {
        setStatus('demo');
        setMembers(clique.members);
        return;
      }

      let cancelled = false;
      let positionSub: Location.LocationSubscription | null = null;
      let headingSub: Location.LocationSubscription | null = null;
      let derivationInterval: ReturnType<typeof setInterval> | null = null;
      let channel: RealtimeChannel | null = null;
      let lastTrackAt = 0;
      let lastTrackPos: LatLng | null = null;

      setStatus('connecting');

      async function start() {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (permStatus !== 'granted') {
          setStatus('denied');
          setMembers(clique!.members);
          return;
        }

        const db = supabase!;
        const userId = session!.user.id;
        channel = db.channel(`clique:${clique!.id}`, { config: { presence: { key: userId } } });
        const activeChannel = channel;

        activeChannel.on('presence', { event: 'sync' }, () => {
          if (cancelled) return;
          const state = activeChannel.presenceState<PeerFix>();
          const next = new Map<string, PeerFix>();
          Object.entries(state).forEach(([key, presences]) => {
            // Plot others only — the center dot is the viewer, and a stale
            // duplicate of your own key (e.g. after a reconnect) must never
            // show up as a "peer".
            if (key === userId) return;
            const latest = presences[presences.length - 1];
            if (latest) next.set(key, { lat: latest.lat, lng: latest.lng, acc: latest.acc, ts: latest.ts });
          });
          peers.current = next;
        });

        activeChannel.subscribe((subStatus) => {
          if (cancelled) return;
          if (subStatus === 'SUBSCRIBED') {
            setStatus('live');
            if (haveFix.current) {
              activeChannel.track({ ...myFix.current, ts: Date.now() }).catch(() => {});
            }
          }
        });

        positionSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 2500, distanceInterval: 2 },
          (loc) => {
            if (cancelled) return;
            const { latitude, longitude, accuracy } = loc.coords;
            // Gate on accuracy — a bad fix (indoors/urban canyon) must not
            // update positions; keep the last good fix and let staleness
            // dimming handle prolonged loss instead of teleporting people.
            if (accuracy != null && accuracy > ACCURACY_GATE_METERS) return;

            myFix.current = { lat: latitude, lng: longitude, acc: accuracy ?? 999 };
            haveFix.current = true;

            const now = Date.now();
            const moved = lastTrackPos
              ? haversineMeters(lastTrackPos, { lat: latitude, lng: longitude })
              : Infinity;
            if (moved > RETRACK_DISTANCE_M || now - lastTrackAt > RETRACK_INTERVAL_MS) {
              lastTrackAt = now;
              lastTrackPos = { lat: latitude, lng: longitude };
              activeChannel.track({ ...myFix.current, ts: now }).catch(() => {});
            }
          }
        );

        // watchHeadingAsync doesn't exist on web — heading stays 0 there
        // (radar valid, rotation-relative arrow approximate).
        if (Platform.OS !== 'web') {
          headingSub = await Location.watchHeadingAsync((h) => {
            if (cancelled) return;
            // trueHeading is -1 when unavailable (no magnetometer
            // calibration) — never feed -1 into the math.
            const heading = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
            if (heading >= 0) myHeading.current = heading;
          });
        }

        derivationInterval = setInterval(() => {
          if (cancelled) return;
          const now = Date.now();
          const me = haveFix.current ? myFix.current : null;

          const nextMembers: CliqueMember[] = clique!.members.map((seedMember) => {
            const peer = peers.current.get(seedMember.slug);
            if (!me || !peer) {
              // Not sharing yet (or we aren't) — keep seed values, dimmed.
              return { ...seedMember, stale: true };
            }

            const stale = now - peer.ts > STALE_MS;
            const distanceMeters = Math.round(haversineMeters(me, peer));
            const absoluteBearing = bearingDeg(me, peer);
            const relative = relativeBearing(absoluteBearing, myHeading.current);
            const prevSmoothed = smoothedBearings.current.get(seedMember.slug) ?? null;
            const nextSmoothed = smoothBearing(prevSmoothed, relative);
            smoothedBearings.current.set(seedMember.slug, nextSmoothed);

            // Hysteresis, not a threshold — GPS noise at 8m oscillates a
            // plain <=8 check several times a second (haptic spam,
            // strobing UI). Enter at <=8m, exit only above 12m.
            const wasFound = foundState.current.get(seedMember.slug) ?? false;
            const nowFound = wasFound ? distanceMeters <= FOUND_EXIT_METERS : distanceMeters <= FOUND_ENTER_METERS;
            foundState.current.set(seedMember.slug, nowFound);

            return { ...seedMember, distanceMeters, bearingDeg: nextSmoothed, found: nowFound, stale };
          });

          setMembers(nextMembers);

          if (new Date().getHours() >= EVENT_END_HOUR) {
            setSharing(false);
          }
        }, 1000);
      }

      start();

      return () => {
        cancelled = true;
        positionSub?.remove();
        headingSub?.remove();
        if (derivationInterval) clearInterval(derivationInterval);
        if (channel) {
          channel.untrack().catch(() => {});
          supabase?.removeChannel(channel);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clique?.id, session?.user.id, sharing])
  );

  return { members, sharing, stopSharing, status };
}
