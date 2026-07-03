import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase-server'
import { isGateStaff } from '@/lib/gate-auth'
import VerifyClient from './VerifyClient'

export const metadata = { title: 'Ticket Verification — Sonic Pulse' }

type Props = { params: Promise<{ referenceCode: string }> }

export default async function VerifyPage({ params }: Props) {
  const { referenceCode } = await params

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [userResult, ticketResult] = await Promise.all([
    getUser(),
    admin
      .from('user_tickets')
      .select('id, full_name, phone, nid_number, id_type, nid_file_path, ticket_tier, status, reference_code, profile_picture_path')
      .eq('reference_code', referenceCode.toUpperCase())
      .maybeSingle(),
  ])

  const user = userResult
  const ticket = ticketResult.data
  const gateStaff = isGateStaff(user?.email)

  // Fetch scan history (gate staff only)
  let scans: { scan_type: string; scanned_at: string }[] = []
  if (gateStaff && ticket) {
    const { data } = await admin
      .from('ticket_scans')
      .select('scan_type, scanned_at')
      .eq('ticket_id', ticket.id)
      .order('scanned_at', { ascending: true })
    scans = data ?? []
  }

  // Get signed URL for NID document (gate staff only)
  let nidSignedUrl: string | null = null
  if (gateStaff && ticket?.nid_file_path) {
    const { data } = await admin.storage
      .from('nid-documents')
      .createSignedUrl(ticket.nid_file_path, 600)
    nidSignedUrl = data?.signedUrl ?? null
  }

  // Profile picture public URL
  const profilePicUrl = ticket?.profile_picture_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${ticket.profile_picture_path}`
    : null

  return (
    <VerifyClient
      referenceCode={referenceCode}
      ticket={ticket ? {
        id: ticket.id,
        fullName: ticket.full_name,
        phone: ticket.phone,
        idNumber: ticket.nid_number,
        idType: ticket.id_type ?? 'nid',
        ticketTier: ticket.ticket_tier,
        status: ticket.status,
        referenceCode: ticket.reference_code,
      } : null}
      scans={scans}
      isGateStaff={gateStaff}
      nidSignedUrl={nidSignedUrl}
      profilePicUrl={profilePicUrl}
    />
  )
}
