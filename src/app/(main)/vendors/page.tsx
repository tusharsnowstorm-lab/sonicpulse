import type { Metadata } from 'next'
import PageHeader from '@/components/ui/PageHeader'
import VendorPortal from '@/components/vendors/VendorPortal'
import { vendorBankDetails } from '@/lib/vendor-bank'
import { VENDORS_LIVE } from '@/data/vendors'

export const metadata: Metadata = {
  title: 'Vendors — Sonic Pulse',
  description: 'Marketplace and food stalls at Sonic Pulse 2026. Three packages, one agreement, bank transfer only.',
}

export default function VendorsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="Stall vendor applications" title="Vendors" sub="Trade the night, gates to sunrise." />
      <VendorPortal live={VENDORS_LIVE} bank={vendorBankDetails()} />
    </div>
  )
}
