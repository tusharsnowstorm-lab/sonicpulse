export type Act = {
  id: string
  name: string
  time: string
  tag: string
  hook: string
  bio: string
  poster: string | null
  bioCard: string | null
  href?: string
  placeholder?: boolean
}

/** Slider order — matches the owner-approved mockup, not strict chronology. */
export const acts: Act[] = [
  {
    id: 'psytaraa',
    name: 'Psytaraa',
    time: '3:00 – 4:30 AM',
    tag: 'Peak',
    hook: 'There can be no pulse without him',
    bio: "As the chief architect of Bangladesh's underground, his peak-time techno and psytrance textures don't just move a crowd — they pull it into another dimension entirely.",
    poster: '/images/artists/psytaraa-poster.webp',
    bioCard: '/images/artists/psytaraa-bio.webp',
  },
  {
    id: 'vampbetch',
    name: 'Vampbetch',
    time: '10:00 – 11:30 PM',
    tag: 'Night',
    hook: 'The one and only',
    bio: "Sound exists in a space between the unknown and the euphoric. Progressive house, acid techno and tech house woven into sets that are dark, dynamic and deeply immersive. She doesn't just perform for a crowd — she absorbs them whole, leaving behind nothing but the frequency.",
    poster: '/images/artists/vampbetch-poster.webp',
    bioCard: '/images/artists/vampbetch-bio.webp',
  },
  {
    id: 'izhaqo',
    name: 'Izhaqo',
    time: '8:30 – 10:00 PM',
    tag: 'Night',
    hook: 'None other than',
    bio: 'His sound exists at the intersection of memory and movement. Two worlds — the Middle East and the Bay of Bengal — compressed into leftfield grooves, braindance textures and bass-driven rhythms that build the way tides do. Gradually. Inevitably. Until the room has no choice but to surrender.',
    poster: '/images/artists/izhaqo-poster.webp',
    bioCard: '/images/artists/izhaqo-bio.webp',
  },
  {
    id: 'drip',
    name: 'Drip',
    time: '6:30 – 8:00 AM',
    tag: 'Sunrise',
    hook: 'He built the room he plays to',
    bio: 'Before Drip played his first set, he had already shaped the culture around it. Community first, performance second — in that order, always. Underground house, deep tech and minimal selections built from the same authenticity that created some of Dhaka\'s most beloved underground spaces. What he plays is an extension of what he built.',
    poster: '/images/artists/drip-poster.webp',
    bioCard: '/images/artists/drip-bio.webp',
  },
  {
    id: 'rii',
    name: 'Rii',
    time: '8:00 – 9:30 AM',
    tag: 'Closing',
    hook: 'Some DJs read the room. She scores it',
    bio: 'A violinist before she was a DJ, her ear was trained on melody, dynamics and emotion long before she ever touched a deck. That foundation bleeds into everything — hypnotic techno, progressive textures and deep organic house that feel less like sets and more like compositions. The pulse has never been played quite like this.',
    poster: '/images/artists/rii-poster.webp',
    bioCard: '/images/artists/rii-bio.webp',
  },
  {
    id: 'fly-on-the-wall',
    name: 'Fly on the Wall',
    time: '7:00 – 8:30 PM',
    tag: 'Dusk',
    hook: 'The early current',
    bio: 'Lives in the space just below the surface. Melodic house, indie dance and trance woven into journeys that drift between deep grooves and hypnosis — music that makes you lose track of time without losing the groove. Designed to pull you somewhere between zoning in and zoning out entirely. The pulse found something fluid.',
    poster: '/images/artists/fly-on-the-wall-poster.webp',
    bioCard: null,
    placeholder: true,
  },
  {
    id: 'first-pulse',
    name: 'First Pulse ×2',
    time: '4:00 – 7:00 PM',
    tag: 'Opening',
    hook: 'Two names nobody knows. Yet.',
    bio: 'The first three hours of Sonic Pulse belong to two artists chosen from the open First Pulse call. Their posters get made in the same treatment as the headliners — same sky, same constellation, same stage.',
    poster: null,
    bioCard: null,
    placeholder: true,
    href: '/first-pulse',
  },
]

export const ARTIST_COUNT = acts.length + 1 // First Pulse counts as two acts (×2)

export type TimetableRow = {
  time: string
  name: string
  sub?: string
  tag: string
  href?: string
  ritual?: boolean
}

/** Fully chronological, 4 PM Friday → 9:30 AM Saturday. */
export const timetableRows: TimetableRow[] = [
  { time: '4:00 – 7:00 PM', name: 'First Pulse ×2', sub: 'Two rising acts from the open call', tag: 'Opening', href: '/first-pulse' },
  { time: '7:00 – 8:30 PM', name: 'Fly on the Wall', tag: 'Dusk' },
  { time: '8:30 – 10:00 PM', name: 'Izhaqo', tag: 'Night', href: '/lineup#izhaqo' },
  { time: '10:00 – 11:30 PM', name: 'Vampbetch', tag: 'Night', href: '/lineup#vampbetch' },
  { time: '11:30 PM – 3:00 AM', name: 'Night Rituals', sub: 'Ember Rites peak · The Great Burn at midnight · resident selectors between', tag: 'Ritual', href: '/activities', ritual: true },
  { time: '3:00 – 4:30 AM', name: 'Psytaraa', tag: 'Peak', href: '/lineup#psytaraa' },
  { time: '4:30 – 6:30 AM', name: 'Starside Hours', sub: 'Guided stargazing over an ambient bridge set · Cloud Nine at its best', tag: 'Drift', href: '/activities', ritual: true },
  { time: '6:30 – 8:00 AM', name: 'Drip', tag: 'Sunrise', href: '/lineup#drip' },
  { time: '8:00 – 9:30 AM', name: 'Rii', tag: 'Closing', href: '/lineup#rii' },
]
