export type SetSlot = {
  time: string
  artist: string
  artistId: string
  duration: number
  genre: string
}

export type Schedule = {
  mainStage: SetSlot[]
  sunriseStage: SetSlot[]
}

export const schedule: Schedule = {
  mainStage: [
    { time: '22:00', artist: 'Volta Dhaka',    artistId: 'volta-dhaka',    duration: 60, genre: 'Techno' },
    { time: '23:00', artist: 'Subzero FX',     artistId: 'subzero-fx',     duration: 120, genre: 'House' },
    { time: '01:00', artist: 'Ravemaster 9000', artistId: 'ravemaster-9000', duration: 120, genre: 'Techno' },
    { time: '03:00', artist: 'Neon Dhaka',     artistId: 'neon-dhaka',     duration: 120, genre: 'Hard Techno' },
  ],
  sunriseStage: [
    { time: '22:00', artist: 'Aurora Wave',  artistId: 'aurora-wave',  duration: 120, genre: 'Melodic Techno' },
    { time: '00:00', artist: 'Pulse Echo',   artistId: 'pulse-echo',   duration: 120, genre: 'Ambient House' },
    { time: '02:00', artist: 'Solar Drift',  artistId: 'solar-drift',  duration: 120, genre: 'Deep House' },
    { time: '04:00', artist: 'Dawnbreak',    artistId: 'dawnbreak',    duration: 120, genre: 'Melodic House' },
  ],
}

export const EVENT_DATE = '2025-11-15'
export const EVENT_DATE_DISPLAY = '15 NOVEMBER 2025'
export const EVENT_VENUE = 'BASHUNDHARA OPEN GROUNDS, DHAKA'
export const EVENT_START = '22:00'
