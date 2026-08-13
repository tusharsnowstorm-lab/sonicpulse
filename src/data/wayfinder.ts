/**
 * Wayfinder volunteer programme — see REDESIGN_PLAN.md §8.28.
 *
 * WAYFINDER_LIVE: master switch for the public /wayfinder page and its
 * nav entries. Flip to false once all 50 places are filled; the page
 * then shows the closed card instead of the form.
 */
export const WAYFINDER_LIVE = true

export const WAYFINDER_TOTAL = 50

export type WayfinderShift = {
  id: 'dusk' | 'dawn'
  label: string
  time: string
  blurb: string
  places: number
}

export const wayfinderShifts: WayfinderShift[] = [
  {
    id: 'dusk',
    label: 'Shift A · Dusk',
    time: '3:00 PM – 11:00 PM',
    blurb: 'Briefing before gates, the arrival rush, sunset, and the first sets.',
    places: 25,
  },
  {
    id: 'dawn',
    label: 'Shift B · Dawn',
    time: '11:00 PM – 7:00 AM',
    blurb: 'Night Rituals, the Great Burn at midnight, the quiet hours, and sunrise.',
    places: 25,
  },
]
