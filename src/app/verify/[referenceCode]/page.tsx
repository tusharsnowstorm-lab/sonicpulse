import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { CheckCircle, XCircle } from 'lucide-react'

export const metadata = { title: 'Ticket Verification — Sonic Pulse' }

type Props = { params: Promise<{ referenceCode: string }> }

export default async function VerifyPage({ params }: Props) {
  const { referenceCode } = await params

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: ticket } = await admin
    .from('user_tickets')
    .select('full_name, nid_number, ticket_tier, status, reference_code')
    .eq('reference_code', referenceCode.toUpperCase())
    .maybeSingle()

  const approved = ticket?.status === 'approved'

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-void)' }}
    >
      <div className="w-full max-w-sm text-center">
        <Image
          src="/images/logo-badge.webp"
          alt="Sonic Pulse"
          width={56}
          height={56}
          className="rounded-full mx-auto mb-6"
          style={{ border: '2px solid rgba(255,255,255,0.25)' }}
        />

        {!ticket ? (
          <>
            <XCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-pulse)' }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
              Ticket not found
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Reference code <code style={{ color: 'var(--accent-electric)' }}>{referenceCode}</code> does not match any ticket.
            </p>
          </>
        ) : (
          <>
            {approved
              ? <CheckCircle size={40} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              : <XCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-pulse)' }} />
            }
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
              {approved ? 'Valid ticket' : 'Ticket not approved'}
            </h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              {ticket.reference_code}
            </p>

            <div
              className="rounded-lg text-left space-y-4 p-5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Registered Name</p>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{ticket.full_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>NID (masked)</p>
                <p className="font-mono text-sm" style={{ color: 'var(--accent-electric)' }}>
                  {ticket.nid_number.slice(0, 4)}{'•'.repeat(ticket.nid_number.length - 4)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>Status</p>
                <p className="text-sm font-semibold" style={{ color: approved ? '#22c55e' : 'var(--accent-pulse)' }}>
                  {approved ? 'Approved' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </p>
              </div>
            </div>

            <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
              Sonic Pulse · 15 November 2025 · Bashundhara Open Grounds, Dhaka
            </p>
          </>
        )}
      </div>
    </main>
  )
}
