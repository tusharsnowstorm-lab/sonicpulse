/**
 * Vendor stall applications — see REDESIGN_PLAN.md §8.67.
 *
 * VENDORS_LIVE: master switch for the public /vendors application form
 * and the footer link. Flip to false to close applications; the page
 * then shows the closed card, and the receipt-upload section stays up
 * so paid vendors can still send proof.
 */
export const VENDORS_LIVE = true

export const CONTRACT_VERSION = 'v2026-09-14'
export const PAYMENT_DEADLINE = '20 September 2026'
export const VENDOR_CONTACT_EMAIL = 'contact@sonicpulsefestival.com'
export const MAX_STALLS = 10
export const MAX_RECEIPT_FILES = 3
export const MAX_RECEIPT_MB = 5

export type PackageCode = 'MKT-B' | 'FS-B' | 'FS-P'

export type VendorPackage = {
  code: PackageCode
  name: string          // as printed in the agreement
  shortName: string     // card title, sentence case
  fee: number           // BDT per stall
  feeWords: string      // as printed in Clause 3
  food: boolean
  zoneBullet: string    // Clause 2, third bullet
  zoneName: string      // Clause 5 staff-zone bullet
  blurb: string         // card copy
  extra: string | null  // card: what this package adds
}

export const vendorPackages: VendorPackage[] = [
  {
    code: 'MKT-B',
    name: 'Marketplace Stall — Basic',
    shortName: 'Marketplace stall',
    fee: 10000,
    feeWords: 'ten thousand',
    food: false,
    zoneBullet: 'A position within the marketplace zone, allocated by the Organiser.',
    zoneName: 'the marketplace',
    blurb: 'A covered 10 × 10 stall in the marketplace zone for merchandise, crafts and everything that is not food.',
    extra: null,
  },
  {
    code: 'FS-B',
    name: 'Food Stall — Basic',
    shortName: 'Food stall — basic',
    fee: 20000,
    feeWords: 'twenty thousand',
    food: true,
    zoneBullet: 'A position within the food court, allocated by the Organiser.',
    zoneName: 'the food court',
    blurb: 'A covered 10 × 10 stall in the food court. Cook on site with the equipment you declare.',
    extra: null,
  },
  {
    code: 'FS-P',
    name: 'Food Stall — Premium',
    shortName: 'Food stall — premium',
    fee: 25000,
    feeWords: 'twenty-five thousand',
    food: true,
    zoneBullet: 'A premium position within the food court, in a higher-footfall location selected and allocated by the Organiser.',
    zoneName: 'the food court',
    blurb: 'The same food stall in a higher-footfall position, chosen and allocated by the organiser.',
    extra: 'Premium higher-footfall position in the food court',
  },
]

export const packageByCode = (code: string) =>
  vendorPackages.find((p) => p.code === code) ?? null

export const bdt = (n: number) => `BDT ${n.toLocaleString('en-US')}`

export const stallFee = (pkg: VendorPackage, stalls: number) => pkg.fee * stalls

export const paymentReference = (code: PackageCode, businessName: string) =>
  `SP/VEND/2026/${code} ${businessName.trim()}`

/** Every package includes these; the card lists them under "Included". */
export const commonIncludes = [
  "10' × 10' canopy tent, supplied and erected by the organiser",
  'One electrical connection point for lighting and light loads',
  'Position allocated by the organiser',
  'Three named, non-transferable staff passes per stall',
  'Listing in the on-site vendor directory, where one is produced',
]

export const excludedNote =
  'Everything else — tables, chairs, counters, signage, cords, cooking and serving kit, refrigeration, stock, packaging, staff, transport, insurance and cleaning — is the vendor\'s own cost.'

export type VendorStatus =
  | 'awaiting_payment'
  | 'paid_pending_verification'
  | 'confirmed'
  | 'lapsed'
  | 'rejected'
  | 'cancelled_by_organiser'

export const VENDOR_STATUSES: VendorStatus[] = [
  'awaiting_payment', 'paid_pending_verification', 'confirmed', 'lapsed', 'rejected', 'cancelled_by_organiser',
]

export const STATUS_LABEL: Record<VendorStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  paid_pending_verification: 'Paid — pending verification',
  confirmed: 'Confirmed',
  lapsed: 'Lapsed',
  rejected: 'Rejected',
  cancelled_by_organiser: 'Cancelled by organiser',
}
