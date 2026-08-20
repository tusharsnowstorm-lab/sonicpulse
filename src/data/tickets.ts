export type TicketTier = {
  id: 'phase1' | 'phase2' | 'phase3'
  label: string
  price: number
  badge?: string
  perks: string[]
  status: 'available' | 'selling_fast' | 'sold_out'
  highlight?: boolean
}

export const APP_NAME = 'Afterhours'

/**
 * Master switch for all public ticket surfaces (owner request, 29 Jul 2026).
 * false = prices, buying CTAs and ticket registration are hidden site-wide;
 * flip to true to bring them all back. See REDESIGN_PLAN.md §8.9.
 */
export const TICKETS_LIVE = false

/**
 * Afterhours hand-off (REDESIGN_PLAN §8.39). The app is the only
 * ticket + price surface. TICKETS_LIVE stays false permanently —
 * the internal application flow serves already-issued tickets only.
 * Flip AFTERHOURS_TICKETS_LIVE to false to pull the app CTAs.
 */
export const AFTERHOURS_TICKETS_LIVE = true
export const AFTERHOURS_EVENT_URL = 'https://www.onlyafterhours.com/events/sonicpulse-festival-26'
export const AFTERHOURS_SIGNIN_URL = 'https://www.onlyafterhours.com/tonight?auth=1'
export const TICKETS_CTA_LIVE = TICKETS_LIVE || AFTERHOURS_TICKETS_LIVE

export const ticketTiers: TicketTier[] = [
  {
    id: 'phase1',
    label: 'PULSE',
    price: 5500,
    perks: [
      'General entry',
      'Both stages',
      'Rest zones',
    ],
    status: 'available',
  },
  {
    id: 'phase2',
    label: 'RHYTHM',
    price: 6500,
    badge: 'MOST POPULAR',
    perks: [
      'Priority entry',
      'Lounge access',
      'Complimentary drink',
    ],
    status: 'available',
    highlight: true,
  },
  {
    id: 'phase3',
    label: 'CRESCENDO',
    price: 7500,
    perks: [
      'VIP entry',
      'Stage-side deck',
      'Dedicated drinks counter',
    ],
    status: 'available',
  },
]

export const CURRENT_PHASE: 'phase1' | 'phase2' | 'phase3' = 'phase1'
export const MAX_TICKETS_PER_ORDER = 4
