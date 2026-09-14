import { bdt, paymentReference, VENDOR_CONTACT_EMAIL, type PackageCode, type VendorPackage } from '@/data/vendors'
import type { BankDetails } from '@/data/vendor-contract'

const CC = VENDOR_CONTACT_EMAIL

export type VendorApplicationRow = {
  agreement_ref: string
  package_code: PackageCode
  stalls: number
  stall_fee: number
  business_name: string
  contact_person: string
  email: string
  contract_hash: string
  countersigned_by: string | null
  countersigned_designation: string | null
  confirmed_at: string | null
}

function fmtBST(iso: string): string {
  return (
    new Date(iso).toLocaleString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' BST'
  )
}

function referenceBox(label: string, value: string) {
  return `<div style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;padding:16px;margin:24px 0;">
    <p style="margin:0 0 8px;font-size:12px;color:#6B6B7E;letter-spacing:0.2em;text-transform:uppercase;">${label}</p>
    <p style="margin:0;font-family:monospace;font-size:18px;color:#FF3FC2;font-weight:bold;">${value}</p>
  </div>`
}

function detailsTable(rows: [string, string][]) {
  const trs = rows
    .map(
      ([label, value], i) => `
    <tr>
      <td style="padding:10px 16px;${i === rows.length - 1 ? '' : 'border-bottom:1px solid #1E1E2E;'}">
        <span style="font-size:11px;color:#6B6B7E;letter-spacing:0.1em;text-transform:uppercase;">${label}</span><br>
        <strong style="font-size:14px;color:#F0F0F8;">${value}</strong>
      </td>
    </tr>`
    )
    .join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;margin:16px 0;">${trs}</table>`
}

function wrap(body: string) {
  return `<div style="background:#050508;color:#F0F0F8;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;">${body}</div>`
}

async function send(to: string, subject: string, html: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME ?? 'Sonic Pulse'} <${process.env.EMAIL_FROM ?? 'onboarding@resend.dev'}>`,
      to,
      cc: CC,
      subject,
      html,
    })
  } catch (err) {
    console.error('Vendor email send error:', err)
  }
}

// ── EMAIL 1: APPLICATION RECEIVED ───────────────────────────────────────────

export async function sendVendorReceivedEmail(
  app: VendorApplicationRow,
  pkg: VendorPackage,
  bank: BankDetails | null
) {
  const bankRows: [string, string][] = bank
    ? [
        ['Stall Fee', `${app.stalls} × ${bdt(pkg.fee)} = ${bdt(app.stall_fee)}`],
        ['Payment deadline', '20 September 2026'],
        ['Payment reference', paymentReference(pkg.code, app.business_name)],
        ['Account name', bank.accountName],
        ['Bank / branch', bank.bankBranch],
        ['Account number', bank.accountNumber],
      ]
    : [
        ['Stall Fee', `${app.stalls} × ${bdt(pkg.fee)} = ${bdt(app.stall_fee)}`],
        ['Payment deadline', '20 September 2026'],
        ['Payment reference', paymentReference(pkg.code, app.business_name)],
      ]

  const html = wrap(`
    <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Application received.</h1>
    <p style="color:#6B6B7E;margin:0 0 24px;">Stall vendor agreement — Sonic Pulse, 25 September 2026</p>
    <p style="margin:0 0 16px;">Hi <strong>${app.contact_person}</strong>,</p>
    <p style="margin:0 0 16px;">We've received <strong>${app.business_name}</strong>'s application for ${app.stalls} × ${pkg.name} at Sonic Pulse. By submitting the application you signed the Stall Vendor Agreement (version v2026-09-14) on behalf of the Vendor.</p>
    <p style="margin:0 0 16px;"><strong>Your booking is not confirmed and no stall is reserved until the full Stall Fee has been received in cleared funds and Dhaka Music Festival sends written confirmation.</strong></p>
    ${referenceBox('Agreement reference', app.agreement_ref)}
    ${detailsTable(bankRows)}
    ${
      bank
        ? ''
        : '<p style="margin:0 0 16px;">Bank details follow in a separate email from contact@sonicpulsefestival.com.</p>'
    }
    <p style="margin:0 0 16px;">Bank transfer only, in one payment. No cash, cheque, bKash, Nagad or card, and no deposit or part-payment holds a stall.</p>
    <p style="margin:0 0 16px;">Once you've transferred, upload the receipt at sonicpulsefestival.com/vendors using your agreement reference and this email address. Stalls are allocated in the order full payment is received.</p>
    <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">The full agreement text you accepted (version v2026-09-14, SHA-256 ${app.contract_hash}) is shown for your package at sonicpulsefestival.com/vendors. Keep this email. Questions: contact@sonicpulsefestival.com. Sonic Pulse is organised by Dhaka Music Festival — @dhakamusicfestival.</p>
  `)

  await send(app.email, `Stall application received — ${app.agreement_ref}`, html)
}

// ── EMAIL 2: RECEIPT RECEIVED ───────────────────────────────────────────────

export async function sendVendorReceiptEmail(app: VendorApplicationRow, fileCount: number) {
  const html = wrap(`
    <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Receipt received.</h1>
    <p style="color:#6B6B7E;margin:0 0 24px;">Stall vendor agreement — Sonic Pulse, 25 September 2026</p>
    <p style="margin:0 0 16px;">Hi <strong>${app.contact_person}</strong>, we've received ${fileCount} file(s) against ${app.agreement_ref}. We'll check the transfer against the account and email written confirmation once the funds have cleared. Until then the booking is not confirmed.</p>
    ${referenceBox('Agreement reference', app.agreement_ref)}
    <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">Keep this email. Questions: contact@sonicpulsefestival.com. Sonic Pulse is organised by Dhaka Music Festival — @dhakamusicfestival.</p>
  `)

  await send(app.email, `Receipt received — ${app.agreement_ref}`, html)
}

// ── EMAIL 3: BOOKING CONFIRMED ──────────────────────────────────────────────

export async function sendVendorConfirmedEmail(app: VendorApplicationRow, pkg: VendorPackage | null) {
  const pkgName = pkg?.name ?? app.package_code
  const confirmedAt = app.confirmed_at ? fmtBST(app.confirmed_at) : ''

  const html = wrap(`
    <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Booking confirmed.</h1>
    <p style="color:#6B6B7E;margin:0 0 24px;">Stall vendor agreement — Sonic Pulse, 25 September 2026</p>
    <p style="margin:0 0 16px;">Hi <strong>${app.contact_person}</strong>, Dhaka Music Festival has received the full Stall Fee in cleared funds for ${app.business_name}. This email is the written confirmation under Clause 1 of Stall Vendor Agreement ${app.agreement_ref}.</p>
    <p style="margin:0 0 16px;">Countersigned for the Organiser by ${app.countersigned_by}, ${app.countersigned_designation}, on ${confirmedAt}.</p>
    ${referenceBox('Agreement reference', app.agreement_ref)}
    ${detailsTable([
      ['Package', `${app.stalls} × ${pkgName}`],
      ['Stall Fee received', bdt(app.stall_fee)],
    ])}
    <p style="margin:24px 0 8px;font-size:14px;font-weight:bold;color:#F0F0F8;">What happens next</p>
    <p style="margin:0 0 10px;">The venue, access route, stall plan, your stall position and the set-up and breakdown times follow by email before the event.</p>
    <p style="margin:0 0 10px;">Names and phone numbers for your staff (up to three per stall) must reach contact@sonicpulsefestival.com by 20 September 2026. Passes are issued in those names only.</p>
    <p style="margin:0 0 16px;">Be set up and trading-ready by 3:00 PM on 25 September 2026, one hour before gates.</p>
    <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">Keep this email. Questions: contact@sonicpulsefestival.com. Sonic Pulse is organised by Dhaka Music Festival — @dhakamusicfestival.</p>
  `)

  await send(app.email, `Booking confirmed — ${app.agreement_ref}`, html)
}
