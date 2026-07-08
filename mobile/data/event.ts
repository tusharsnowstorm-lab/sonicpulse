// Mirrors src/data on the website — one hardcoded event, no events table yet.
// See build guide Phase 02: this earns a real backend table the day a second
// festival needs one. Structured as a list from the start (Phase 05) so a
// second festival is a new entry, not a rewrite.
export const sonicPulse = {
  id: 'sonic-pulse',
  name: 'SONIC PULSE',
  dateDisplay: '25 SEP 2026',
  location: 'Dhaka',
  hours: '16:30–09:00',
  tagline: "Dhaka's longest night",
  heroImages: [require('@/assets/images/hero-poster.webp'), require('@/assets/images/poster-2.webp')],
  headliners: [
    { name: 'Izhaqo', genre: 'Hip-Hop / Electronic', setTime: '20:30–22:00' },
    { name: 'Psytaraa', genre: 'Electronic / Fusion', setTime: '01:00–02:30' },
    { name: 'Drip', genre: 'Trap / Electronic', setTime: '02:30–04:00' },
  ],
  ticketTier: 'Phase 1 — Early Bird',
  ticketPrice: 4500,
  shuttlePrice: 800,
  offersAccommodation: true,
  accommodationTier: 'Shared accommodation',
  accommodationPrice: 2500, // placeholder — no real pricing/tier structure exists yet
};

export const events = [sonicPulse];
