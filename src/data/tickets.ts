export type TicketTier = {
  id: 'phase1' | 'phase2' | 'phase3'
  label: string
  price: number
  badge?: string
  perks: string[]
  status: 'available' | 'selling_fast' | 'sold_out'
  highlight?: boolean
}

export const ticketTiers: TicketTier[] = [
  {
    id: 'phase1',
    label: 'PHASE 1 — EARLY BIRD',
    price: 3500,
    badge: 'BEST VALUE',
    perks: [
      'General admission',
      'Wristband included',
      'Access to both stages',
      'Early bird discount',
    ],
    status: 'available',
    highlight: true,
  },
  {
    id: 'phase2',
    label: 'PHASE 2 — STANDARD',
    price: 4500,
    perks: [
      'General admission',
      'Wristband included',
      'Access to both stages',
    ],
    status: 'available',
  },
  {
    id: 'phase3',
    label: 'PHASE 3 — FINAL',
    price: 5500,
    badge: 'LAST CHANCE',
    perks: [
      'General admission',
      'Wristband included',
      'Access to both stages',
    ],
    status: 'available',
  },
]

export const CURRENT_PHASE: 'phase1' | 'phase2' | 'phase3' = 'phase1'
export const MAX_TICKETS_PER_ORDER = 4
