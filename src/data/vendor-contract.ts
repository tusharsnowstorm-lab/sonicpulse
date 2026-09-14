import {
  type VendorPackage, CONTRACT_VERSION, PAYMENT_DEADLINE, VENDOR_CONTACT_EMAIL, bdt, stallFee,
} from './vendors'

export type BankDetails = { accountName: string; bankBranch: string; accountNumber: string }

export type ContractFields = {
  agreementRef: string          // '' until allocated
  businessName: string
  contactPerson: string
  phone: string
  email: string
  businessAddress: string
  tradeLicence: string
  stalls: number
  signatoryName: string
  signatoryDesignation: string
  signedAt: string              // '' until signed; display string after
  bank: BankDetails | null
}

export type ContractBlock =
  | { type: 'title'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'p'; text: string }
  | { type: 'table'; rows: [string, string][] }
  | { type: 'list'; items: string[] }

const BLANK = '________________________________'
const v = (s: string) => (s.trim() ? s.trim() : BLANK)

export function buildContract(pkg: VendorPackage, f: ContractFields): ContractBlock[] {
  const total = stallFee(pkg, f.stalls)
  const ref = f.agreementRef || `SP/VEND/2026/${pkg.code}-____`
  const bank: [string, string][] = f.bank
    ? [['Account name', f.bank.accountName], ['Bank / branch', f.bank.bankBranch], ['Account number', f.bank.accountNumber]]
    : [['Account name', BLANK], ['Bank / branch', BLANK], ['Account number', BLANK]]

  const staffZone = `Staff to remain in the vendor zone. Vendor staff are admitted for the purpose of trading only. For the duration of the Event they must remain within ${pkg.zoneName} and the areas designated for vendors, and are not permitted to leave that zone to enter the audience, stage, camping or other Event areas, or to leave and re-enter the venue, except with the Organiser's permission or for a genuine emergency. A vendor pass is not an Event ticket. Any staff member found outside the vendor zone may be removed from the venue and the Vendor's trading suspended under Clause 8.`

  const tailBullets = pkg.food
    ? [
        'Food and hygiene. Prepare, store, handle and serve food in compliance with the Bangladesh Safe Food Act and applicable hygiene standards; keep raw and cooked food separated; maintain safe temperatures; provide hand-washing or sanitising facilities for staff; and ensure all staff handling food are in clean attire with hair covered.',
        'Cooking and fire. Cooking is permitted only within the stall using equipment declared to the Organiser in advance. LPG cylinders must be regulator-fitted, upright, secured and kept away from heat sources; a minimum of one serviceable fire extinguisher and a fire blanket must be at the stall at all times. No open fires, charcoal or wood burning outside a proper contained appliance. The Organiser may stop any cooking it considers unsafe.',
        "Water, oil and waste. Bring the Vendor's own potable water for food preparation. Used cooking oil, grease and food waste must be contained and removed by the Vendor; nothing may be poured onto the ground or into drains.",
        "Serve in disposable or take-away packaging of the Vendor's own supply; where the Organiser designates eco-friendly or non-plastic packaging as a requirement, the Vendor shall comply.",
      ]
    : [
        'Marketplace goods. Display and sell only lawful, genuine merchandise. Handmade and locally produced goods are encouraged. No food or drink may be sold from a marketplace stall.',
      ]

  return [
    { type: 'title', text: 'SONIC PULSE PRESENTED BY DHAKA MUSIC FESTIVAL' },
    { type: 'title', text: 'STALL VENDOR AGREEMENT' },
    { type: 'title', text: `${pkg.name.toUpperCase()} — ${bdt(pkg.fee).toUpperCase()} PER STALL` },
    { type: 'table', rows: [
      ['Agreement reference', ref],
      ['Organiser', 'Dhaka Music Festival, a music event production company operating in Dhaka, Bangladesh (the "Organiser")'],
      ['Vendor — business name', v(f.businessName)],
      ['Contact person', v(f.contactPerson)],
      ['Phone / email', `${v(f.phone)} / ${v(f.email)}`],
      ['Business address', v(f.businessAddress)],
      ['Trade licence no. (if any)', v(f.tradeLicence)],
      ['Package', pkg.name],
      ['Number of stalls', `${f.stalls}  ×  ${bdt(pkg.fee)}  =  ${bdt(total)} (the "Stall Fee")`],
      ['Event', 'Sonic Pulse, Friday 25 September 2026, 4:00 PM to Saturday 26 September 2026, 9:30 AM (the "Event")'],
      ['Venue', 'Gazipur, Bangladesh. The exact venue, access route and stall plan are notified to confirmed Vendors by the Organiser.'],
      ['Payment deadline', `Full Stall Fee by ${PAYMENT_DEADLINE}, by bank transfer only (Clause 3)`],
      ['Contact', VENDOR_CONTACT_EMAIL],
      ['Agreement version', CONTRACT_VERSION],
    ] },

    { type: 'heading', text: 'Clause 1 — The Engagement' },
    { type: 'p', text: 'The Organiser grants the Vendor a licence to occupy and trade from the stall(s) stated above at the Event, on the terms of this Agreement. This is a licence to trade for the duration of the Event only; it creates no tenancy, no interest in the venue and no right to occupy beyond the times in Clause 6.' },
    { type: 'p', text: "The Vendor's booking is not confirmed, and no stall is reserved for the Vendor, until the Organiser has received the full Stall Fee in cleared funds and has issued a written confirmation (email or message) to the Vendor. Stalls are limited and are allocated in the order in which full payment is received." },

    { type: 'heading', text: 'Clause 2 — Package — What Is Included' },
    { type: 'p', text: `The ${pkg.name} package includes:` },
    { type: 'list', items: [
      "One (1) stall space of ten feet by ten feet (10' × 10') covered by a canopy tent supplied and erected by the Organiser.",
      'One (1) electrical connection point at the stall for lighting and light equipment. Any appliance with a heavy or continuous load must be declared to the Organiser in writing before 20 September 2026 and may be refused or made subject to a separate charge.',
      pkg.zoneBullet,
      "Listing of the Vendor's business name in the Organiser's on-site vendor directory where one is produced.",
      'Three (3) vendor staff access passes per stall, in the form notified by the Organiser. Passes are issued in the names of the staff notified by the Vendor and are not transferable.',
    ] },
    { type: 'p', text: "Everything not listed above is excluded and is the Vendor's own responsibility and cost — including tables, chairs, counters, shelving, signage, lighting fixtures, extension cords, cooking and serving equipment, refrigeration, stock, packaging, staff, transport, insurance and cleaning of the stall." },

    { type: 'heading', text: 'Clause 3 — Stall Fee And Payment' },
    { type: 'table', rows: [
      ['PARTICULARS', 'AMOUNT (BDT)'],
      [`${pkg.name} — per stall`, pkg.fee.toLocaleString('en-US')],
      [`STALL FEE PER STALL (BDT ${pkg.feeWords})`, pkg.fee.toLocaleString('en-US')],
    ] },
    { type: 'p', text: "The full Stall Fee for all stalls booked is payable in advance, in one payment, by bank transfer only to the Organiser's account below. No cash, cheque or mobile-money payment is accepted, and no part-payment, deposit or instalment secures a booking." },
    { type: 'table', rows: [...bank, ['Payment reference', `SP/VEND/2026/${pkg.code} + Vendor business name`]] },
    { type: 'p', text: `Payment must be received in cleared funds by ${PAYMENT_DEADLINE}. The Vendor shall send the transfer receipt to ${VENDOR_CONTACT_EMAIL} on the day of payment. A booking for which full payment has not been received by that date lapses automatically and the stall may be offered to another vendor without notice to the Vendor.` },
    { type: 'p', text: "The Stall Fee is non-refundable and non-transferable once the booking is confirmed, except as stated in Clause 9. The Stall Fee does not include any tax, levy or charge payable by the Vendor on its own sales, which remain the Vendor's responsibility." },

    { type: 'heading', text: "Clause 4 — Organiser's Right to Change" },
    { type: 'p', text: 'The Vendor acknowledges that the Event is a live production and agrees that the Organiser may, at its sole discretion and without prior notice to or consent of the Vendor: (a) change the location, position, orientation or layout of any stall, zone or the food court; (b) change the Event timings, run of show, gate times, set-up and breakdown times; (c) change, substitute or withdraw any item of the package in Clause 2 where an equivalent or alternative is provided, or where the change is required by the venue, the authorities, weather or safety; (d) change the venue; (e) change the vendor rules, site rules and operating guidelines from time to time; and (f) postpone the Event to a later date.' },
    { type: 'p', text: 'No change under this Clause 4 entitles the Vendor to a refund, reduction of the Stall Fee, compensation or any claim against the Organiser. Where the Organiser makes a change it will inform the Vendor as soon as reasonably practicable, but failure to do so does not affect the validity of the change or of this Agreement.' },

    { type: 'heading', text: "Clause 5 — Vendor's Obligations" },
    { type: 'list', items: [
      "Trade only in the goods or services described in the Vendor's booking. The Organiser may refuse or remove any item it considers unsuitable, unsafe, offensive, counterfeit or in conflict with an Event sponsor or partner.",
      'Not sell, serve, display or promote alcohol, tobacco or vaping products, drugs, weapons, fireworks or any item prohibited by law or by the venue.',
      'Display prices clearly, sell only at displayed prices, and trade fairly and courteously with guests.',
      'Bring, set up, staff, secure, clean and remove everything the Vendor uses at the stall. Keep the stall and the area around it clean throughout the Event and remove all waste to the points designated by the Organiser.',
      'Use only the electrical connection provided, with sound equipment and cabling. No generators, no tampering with distribution boards, and no connection to any other supply. Loads must be declared under Clause 2.',
      "Staff limit. No more than three (3) staff per stall, including the Vendor's owner or contact person, are permitted on site. Their names and phone numbers must be given to the Organiser in writing by 20 September 2026. No additional or substitute staff will be admitted on the day without the Organiser's written permission.",
      staffZone,
      "Staff the stall continuously from gates opening until the Organiser announces close of trading. Do not dismantle or vacate the stall before then without the Organiser's permission.",
      "Obtain and hold any licence, permit or registration required by law for the Vendor's business and produce it on request.",
      'Comply with all instructions of the Organiser, its site management and security, and with the venue rules, at all times.',
      "Use the Sonic Pulse and Dhaka Music Festival names, logos and artwork only with the Organiser's prior written permission, and only in the form approved.",
      ...tailBullets,
    ] },

    { type: 'heading', text: 'Clause 6 — Set-Up, Trading And Breakdown' },
    { type: 'p', text: 'Set-up: the Vendor may access the venue to set up from the time notified by the Organiser on 25 September 2026 and must be fully set up and ready to trade at least one (1) hour before gates open at 4:00 PM. Vehicles are permitted only in the areas and at the times notified by the Organiser and must be removed from the site before gates open.' },
    { type: 'p', text: "Trading: from gates opening until the Organiser announces close of trading. Breakdown: after close of trading and in any case by the time notified by the Organiser on 26 September 2026, leaving the stall space clean and clear. Anything left behind may be disposed of by the Organiser at the Vendor's cost." },
    { type: 'p', text: 'The Organiser may vary any of these times under Clause 4.' },

    { type: 'heading', text: 'Clause 7 — Security, Risk And Liability' },
    { type: 'p', text: "The Vendor is responsible for the security of its own goods, cash, equipment and staff at all times, including overnight. The Organiser provides general event security only and is not liable for loss, theft or damage to the Vendor's property, however caused." },
    { type: 'p', text: "The Vendor is responsible for, and shall indemnify the Organiser against, any loss, damage, injury, claim, fine or cost arising from the Vendor's goods, food, equipment, staff, conduct, or breach of this Agreement or of any law, including any claim by a guest relating to goods or food sold by the Vendor." },
    { type: 'p', text: "The Organiser's total liability to the Vendor under or in connection with this Agreement, whatever the cause, shall not exceed the Stall Fee actually paid by the Vendor. The Organiser is not liable for the Vendor's loss of sales, profit or opportunity, or for the level of attendance at the Event." },

    { type: 'heading', text: 'Clause 8 — Conduct And Removal' },
    { type: 'p', text: "The Organiser may, without refund or compensation, suspend the Vendor's trading, close the stall or remove the Vendor and its staff from the venue if the Vendor breaches this Agreement, trades in prohibited items, behaves in a manner the Organiser considers unsafe, offensive or damaging to the Event, or fails to follow an instruction of the Organiser or security. The Vendor remains liable for the full Stall Fee and for any loss caused." },

    { type: 'heading', text: 'Clause 9 — Cancellation And Postponement' },
    { type: 'p', text: "By the Vendor: the Vendor may not cancel after the booking is confirmed; the Stall Fee is not refundable and the stall may not be transferred, sub-let or shared with another trader without the Organiser's written consent." },
    { type: 'p', text: "By the Organiser: if the Organiser cancels the Event entirely for a reason within its control and does not reschedule, it will refund the Stall Fee paid, without interest, within thirty (30) working days, and that refund is the Vendor's only remedy. If the Event is postponed, this Agreement applies to the rescheduled date and no refund is due. If the Event is cancelled, shortened or interrupted because of weather, an act of any authority, a security threat, an epidemic, a hartal, a strike, a failure of utilities or any other cause beyond the Organiser's reasonable control, the Organiser is not liable to the Vendor and any refund is at the Organiser's discretion." },

    { type: 'heading', text: 'Clause 10 — General' },
    { type: 'p', text: "This Agreement, together with the Organiser's vendor rules as issued and updated from time to time, is the entire agreement between the Parties for the stall(s) and replaces any earlier discussion. It may be amended only by the Organiser under Clause 4 or in writing signed by both Parties. If any provision is unenforceable the rest continues in force. This Agreement is governed by the laws of the People's Republic of Bangladesh, and the courts of Dhaka have jurisdiction. It is executed in English; any Bangla translation is for convenience only." },

    { type: 'heading', text: 'Clause 11 — Execution' },
    { type: 'p', text: 'By signing below, each Party confirms that it has read and understood this Agreement and agrees to be bound by it. The Vendor confirms in particular that it has read Clauses 3, 4, 5 (staff limit and staff to remain in the vendor zone), 7 and 9.' },
    { type: 'table', rows: [
      ['FOR THE ORGANISER — DHAKA MUSIC FESTIVAL', 'Countersigned electronically on receipt of the full Stall Fee in cleared funds. Name, designation and date are stated in the written confirmation.'],
      ['FOR THE VENDOR', `Signed electronically by ${v(f.signatoryName)}, ${v(f.signatoryDesignation)}, on ${f.signedAt || 'submission of this application'}.`],
    ] },
  ]
}

/** Canonical plain text — hashed server-side; identical input gives identical output. */
export function contractPlainText(pkg: VendorPackage, f: ContractFields): string {
  return buildContract(pkg, f)
    .map((b) => {
      if (b.type === 'table') return b.rows.map(([k, val]) => `${k}: ${val}`).join('\n')
      if (b.type === 'list') return b.items.map((i) => `- ${i}`).join('\n')
      return b.text
    })
    .join('\n\n')
}
