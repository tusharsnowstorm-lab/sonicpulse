export type SetSlot = {
  time: string
  artist: string
  artistId: string
  duration: number
  genre: string
  published: boolean
  nextDay?: boolean
}

export type Schedule = {
  mainStage: SetSlot[]
  sunriseStage: SetSlot[]
}

export const schedule: Schedule = {
  mainStage: [
    { time: '20:30', artist: 'Izhaqo',   artistId: 'izhaqo',   duration: 90,  genre: 'Hip-Hop / Electronic', published: true },
    { time: '22:00', artist: 'TBA',       artistId: 'tba-1',    duration: 90,  genre: '',                    published: false },
    { time: '23:30', artist: 'Ra Tao',    artistId: 'ra-tao',   duration: 90,  genre: 'Electronic',          published: false },
    { time: '01:00', artist: 'Psytaraa',  artistId: 'psytaraa', duration: 90,  genre: 'Electronic / Fusion', published: true,  nextDay: true },
    { time: '05:00', artist: 'Rii',       artistId: 'rii',      duration: 90,  genre: 'Electronic / DJ',     published: false, nextDay: true },
    { time: '06:30', artist: 'Elyna',     artistId: 'elyna',    duration: 120, genre: 'Electronic / Ambient',published: false, nextDay: true },
  ],
  sunriseStage: [
    { time: '04:00', artist: 'Aurora Wave',  artistId: 'aurora-wave',  duration: 75,  genre: 'Melodic Techno', published: false, nextDay: true },
    { time: '05:15', artist: 'Pulse Echo',   artistId: 'pulse-echo',   duration: 75,  genre: 'Ambient House',  published: false, nextDay: true },
    { time: '06:30', artist: 'Solar Drift',  artistId: 'solar-drift',  duration: 60,  genre: 'Deep House',     published: false, nextDay: true },
    { time: '07:30', artist: 'Dawnbreak',    artistId: 'dawnbreak',    duration: 60,  genre: 'Melodic House',  published: false, nextDay: true },
  ],
}

export const EVENT_DATE = '2026-09-25'
export const EVENT_DATE_DISPLAY = '25 SEPTEMBER 2026'
export const EVENT_VENUE = 'TBA'
export const EVENT_START = '16:00'
export const EVENT_END = '09:00'
