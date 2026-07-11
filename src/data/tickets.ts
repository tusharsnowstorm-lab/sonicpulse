export type TicketTier = {
  id: 'phase1' | 'phase2' | 'phase3'
  label: string
  price: number
  /** Price when purchased inside the Afterhours app — see APP_DISCOUNT. */
  appPrice: number
  badge?: string
  perks: string[]
  status: 'available' | 'selling_fast' | 'sold_out'
  highlight?: boolean
}

export const APP_NAME = 'Afterhours'
export const APP_DISCOUNT = 1000

export const ticketTiers: TicketTier[] = [
  {
    id: 'phase1',
    label: 'PULSE',
    price: 5500,
    appPrice: 4500,
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
    appPrice: 5500,
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
    appPrice: 6500,
    perks: [
      'VIP entry',
      'Stage-side deck',
      'Dedicated bar',
    ],
    status: 'available',
  },
]

export const CURRENT_PHASE: 'phase1' | 'phase2' | 'phase3' = 'phase1'
export const MAX_TICKETS_PER_ORDER = 4
