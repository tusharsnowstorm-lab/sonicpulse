// Run with: cd mobile && npx tsx scripts/geo.test.ts
// No test runner in this project by design — throws on the first failed
// assertion instead.
import { haversineMeters, bearingDeg, circularMeanDeg, smoothBearing } from '../lib/geo';

function assertClose(label: string, actual: number, expected: number, tolerance: number) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${label}: expected ${expected} (±${tolerance}), got ${actual} (diff ${diff})`);
  }
  console.log(`PASS ${label}: ${actual} ≈ ${expected} (±${tolerance})`);
}

// haversineMeters
const dhaka = { lat: 23.8103, lng: 90.4125 };
const chittagong = { lat: 22.3569, lng: 91.7832 };
// The plan's own estimate of "≈216km" was a rough eyeball; the correct
// great-circle distance for these coordinates is ~214km (cross-checked
// independently via a flat-earth approximation at this latitude — the two
// methods agree to within 150m, confirming the formula, not the estimate).
assertClose('haversine Dhaka->Chittagong', haversineMeters(dhaka, chittagong), 214000, 2000);
assertClose('haversine identical points', haversineMeters(dhaka, dhaka), 0, 0.001);
assertClose(
  'haversine ~111,195 m per degree latitude at the equator',
  haversineMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }),
  111195,
  100
);

// bearingDeg
assertClose('bearing due north', bearingDeg({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }), 0, 0.5);
assertClose('bearing due east', bearingDeg({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), 90, 0.5);

// circularMeanDeg — the #1 way this feature dies in the field: arithmetic
// mean of 350 and 10 gives 180 (backwards), not 0.
assertClose('circularMeanDeg([350, 10]) is 0, not 180', circularMeanDeg([350, 10]), 0, 0.01);

// smoothBearing — must move toward 0/360 across the wrap, never through 180.
const smoothed = smoothBearing(359, 1);
const movedTowardWrap = smoothed > 355 || smoothed < 5;
if (!movedTowardWrap) {
  throw new Error(`smoothBearing(359, 1) = ${smoothed}, expected near 0/360, not drifting through 180`);
}
console.log(`PASS smoothBearing(359, 1) = ${smoothed} (near 0/360, not through 180)`);

console.log('\nAll geo.ts assertions passed.');
