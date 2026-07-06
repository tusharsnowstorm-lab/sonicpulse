export type Artist = {
  id: string
  name: string
  stage: 'main' | 'sunrise'
  genre: string
  isHeadliner: boolean
  setTime: string
  bio?: string
  image?: string
  socialLink?: string
}

export const artists: Artist[] = [
  {
    id: 'paytaraa',
    name: 'Paytaraa',
    stage: 'main',
    genre: 'Electronic / Fusion',
    isHeadliner: true,
    setTime: '22:00–00:00',
    bio: 'Raw emotion meets electronic architecture. Paytaraa blurs the line between folk memory and club culture — her sets move through silence and surge without warning.',
    image: '/images/artists/paytaraa.svg',
    socialLink: '#',
  },
  {
    id: 'ishaqo',
    name: 'Ishaqo',
    stage: 'main',
    genre: 'Hip-Hop / Electronic',
    isHeadliner: true,
    setTime: '00:00–02:00',
    bio: 'Dense, layered, uncompromising. Ishaqo constructs sonic worlds from the ground up — rhythms that hit like architecture, hooks that linger for days.',
    image: '/images/artists/ishaqo.svg',
    socialLink: '#',
  },
  {
    id: 'drip',
    name: 'Drip',
    stage: 'main',
    genre: 'Trap / Electronic',
    isHeadliner: true,
    setTime: '02:00–04:00',
    bio: 'Minimal in form, maximal in impact. Drip turns open air into a pressure chamber — every drop lands exactly where it needs to.',
    image: '/images/artists/drip.svg',
    socialLink: '#',
  },
  {
    id: 'ravemaster-9000',
    name: 'Ravemaster 9000',
    stage: 'main',
    genre: 'Techno',
    isHeadliner: true,
    setTime: '01:00–03:00',
    bio: 'Berlin-trained, Dhaka-born. Peak-hour techno built for open skies.',
    socialLink: '#',
  },
  {
    id: 'neon-dhaka',
    name: 'Neon Dhaka',
    stage: 'main',
    genre: 'Hard Techno',
    isHeadliner: true,
    setTime: '03:00–05:00',
    bio: 'The closing set you will not forget. Industrial rhythms meet acid basslines.',
    socialLink: '#',
  },
  {
    id: 'subzero-fx',
    name: 'Subzero FX',
    stage: 'main',
    genre: 'House',
    isHeadliner: false,
    setTime: '23:00–01:00',
    socialLink: '#',
  },
  {
    id: 'volta-dhaka',
    name: 'Volta Dhaka',
    stage: 'main',
    genre: 'Techno',
    isHeadliner: false,
    setTime: '22:00–23:00',
    socialLink: '#',
  },
  {
    id: 'aurora-wave',
    name: 'Aurora Wave',
    stage: 'sunrise',
    genre: 'Melodic Techno',
    isHeadliner: false,
    setTime: '22:00–00:00',
    socialLink: '#',
  },
  {
    id: 'pulse-echo',
    name: 'Pulse Echo',
    stage: 'sunrise',
    genre: 'Ambient House',
    isHeadliner: false,
    setTime: '00:00–02:00',
    socialLink: '#',
  },
  {
    id: 'solar-drift',
    name: 'Solar Drift',
    stage: 'sunrise',
    genre: 'Deep House',
    isHeadliner: false,
    setTime: '02:00–04:00',
    socialLink: '#',
  },
  {
    id: 'dawnbreak',
    name: 'Dawnbreak',
    stage: 'sunrise',
    genre: 'Melodic House',
    isHeadliner: false,
    setTime: '04:00–06:00',
    socialLink: '#',
  },
]

export const headliners = artists.filter((a) => a.isHeadliner)
export const mainStageArtists = artists.filter((a) => a.stage === 'main')
export const sunriseStageArtists = artists.filter((a) => a.stage === 'sunrise')
