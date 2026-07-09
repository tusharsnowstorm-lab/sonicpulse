// Pure math, no imports from React/Expo — see scripts/geo.test.ts.
export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function normalizeDeg(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

// 0-360, clockwise from true north.
export function bearingDeg(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return normalizeDeg(toDeg(Math.atan2(y, x)));
}

export function relativeBearing(absolute: number, heading: number): number {
  return normalizeDeg(absolute - heading);
}

// Vector mean, not arithmetic mean — averaging (350+10)/2 gives 180, which
// points backwards exactly when a friend is due north. Convert to unit
// vectors, average, atan2 back.
export function circularMeanDeg(samples: number[]): number {
  if (samples.length === 0) return 0;
  let sumSin = 0;
  let sumCos = 0;
  for (const deg of samples) {
    const rad = toRad(deg);
    sumSin += Math.sin(rad);
    sumCos += Math.cos(rad);
  }
  return normalizeDeg(toDeg(Math.atan2(sumSin / samples.length, sumCos / samples.length)));
}

// EMA on the unit circle — same vector-averaging reasoning as
// circularMeanDeg, weighted toward `next` by `alpha` instead of equal-weight.
export function smoothBearing(prev: number | null, next: number, alpha = 0.35): number {
  if (prev === null) return normalizeDeg(next);
  const prevRad = toRad(prev);
  const nextRad = toRad(next);
  const x = (1 - alpha) * Math.cos(prevRad) + alpha * Math.cos(nextRad);
  const y = (1 - alpha) * Math.sin(prevRad) + alpha * Math.sin(nextRad);
  return normalizeDeg(toDeg(Math.atan2(y, x)));
}
