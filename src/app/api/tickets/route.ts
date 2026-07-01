import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'SP-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function validateNid(nid: string): boolean {
  return /^\d{10}$/.test(nid) || /^\d{17}$/.test(nid)
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await admin
      .from('user_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ tickets: data })
  } catch {
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const fullName         = formData.get('fullName') as string
    const phone            = formData.get('phone') as string
    const nidNumber        = formData.get('nidNumber') as string
    const instagramHandle  = (formData.get('instagramHandle') as string | null)?.replace(/^@/, '') ?? ''
    const gender           = formData.get('gender') as string | null
    const ticketTier       = formData.get('ticketTier') as string
    const nidFile          = formData.get('nidFile') as File | null
    const nidFilePath      = formData.get('nidFilePath') as string | null

    if (!fullName || !phone || !nidNumber || !ticketTier || !instagramHandle || !gender) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!validateNid(nidNumber)) {
      return Response.json({ error: 'Bangladesh NIDs are 10 or 17 digits.' }, { status: 400 })
    }
    if (!['phase1', 'phase2', 'phase3'].includes(ticketTier)) {
      return Response.json({ error: 'Invalid ticket tier.' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if NID is already registered
    const { data: existingNid } = await admin
      .from('user_tickets')
      .select('id')
      .eq('nid_number', nidNumber)
      .single()

    if (existingNid) {
      return Response.json({ error: 'This NID number is already registered for a ticket. Each person can only have one ticket.' }, { status: 409 })
    }

    // If buying for myself, check they don't already have a "for myself" ticket
    if (nidFilePath) {
      const { data: existingOwn } = await admin
        .from('user_tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('nid_file_path', nidFilePath)
        .single()

      if (existingOwn) {
        return Response.json({ error: 'You already have a ticket registered for yourself. Additional tickets must be for someone else.' }, { status: 409 })
      }
    }

    let fileName: string

    if (nidFilePath) {
      // Reuse the file already stored in the user's profile
      fileName = nidFilePath
    } else {
      if (!nidFile || nidFile.size === 0) {
        return Response.json({ error: 'NID document upload is required.' }, { status: 400 })
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(nidFile.type)) {
        return Response.json({ error: 'NID file must be JPG, PNG, or PDF.' }, { status: 400 })
      }
      if (nidFile.size > 2 * 1024 * 1024) {
        return Response.json({ error: 'NID file must be under 2MB. Try compressing the image or saving at a lower resolution.' }, { status: 400 })
      }
      const ext = nidFile.name.split('.').pop()
      fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const arrayBuffer = await nidFile.arrayBuffer()
      const { error: uploadError } = await admin.storage
        .from('nid-documents')
        .upload(fileName, arrayBuffer, { contentType: nidFile.type, upsert: false })
      if (uploadError) {
        return Response.json({ error: 'Failed to upload NID document.' }, { status: 500 })
      }
    }

    const referenceCode = generateRef()
    const { data: ticket, error: dbError } = await admin
      .from('user_tickets')
      .insert({
        user_id: user.id,
        user_email: user.email,
        full_name: fullName,
        phone,
        nid_number: nidNumber,
        nid_file_path: fileName,
        instagram_handle: instagramHandle,
        gender: gender,
        ticket_tier: ticketTier,
        status: 'pending',
        reference_code: referenceCode,
      })
      .select()
      .single()

    if (dbError) {
      return Response.json({ error: 'Failed to save ticket.' }, { status: 500 })
    }

    // Confirmation email
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME ?? 'Sonic Pulse'} <${process.env.EMAIL_FROM ?? 'onboarding@resend.dev'}>`,
        to: user.email!,
        subject: `Ticket registered for ${fullName} — Sonic Pulse 2025`,
        html: `
          <div style="background:#050508;color:#F0F0F8;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;">
            <h1 style="color:#00F0FF;font-size:24px;margin:0 0 8px;">Ticket registration received.</h1>
            <p style="color:#6B6B7E;margin:0 0 24px;">Sonic Pulse — 15 November 2025</p>
            <p style="margin:0 0 16px;">A ticket for <strong>${fullName}</strong> has been submitted for review. We'll notify you once it's approved.</p>
            <div style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;padding:16px;margin:24px 0;">
              <p style="margin:0 0 4px;font-size:12px;color:#6B6B7E;letter-spacing:0.2em;text-transform:uppercase;">Reference Code</p>
              <p style="margin:0;font-family:monospace;font-size:18px;color:#CCFF00;font-weight:bold;">${referenceCode}</p>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">Questions? Message us on Instagram @sonicpulsefestival</p>
          </div>
        `,
      })
    } catch {}

    return Response.json({ success: true, ticket }, { status: 201 })
  } catch {
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
