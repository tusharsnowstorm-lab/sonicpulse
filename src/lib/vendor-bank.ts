import 'server-only'
import type { BankDetails } from '@/data/vendor-contract'

/** Organiser settlement account, from Vercel env — never in the repo (§8.67). */
export function vendorBankDetails(): BankDetails | null {
  const accountName = process.env.VENDOR_BANK_ACCOUNT_NAME?.trim()
  const bankBranch = process.env.VENDOR_BANK_BRANCH?.trim()
  const accountNumber = process.env.VENDOR_BANK_ACCOUNT_NUMBER?.trim()
  if (!accountName || !bankBranch || !accountNumber) return null
  return { accountName, bankBranch, accountNumber }
}
