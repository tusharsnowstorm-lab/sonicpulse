import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'SP-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function validateNid(nid: string): boolean {
  return /^\d{10}$/.test(nid) || /^\d{17}$/.test(nid)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const fullName       = formData.get('fullName') as string
    const dateOfBirth    = formData.get('dateOfBirth') as string
    const email          = formData.get('email') as string
    const phone          = formData.get('phone') as string
    const instagramHandle = formData.get('instagramHandle') as string
    const nidNumber      = formData.get('nidNumber') as string
    const ticketTier     = formData.get('ticketTier') as string
    const ticketQty      = parseInt(formData.get('ticketQty') as string, 10)
    const shuttle        = formData.get('shuttle') === 'yes'
    const nidFile        = formData.get('nidFile') as File | null

    // Server-side validation
    if (!fullName || !dateOfBirth || !email || !phone || !instagramHandle || !nidNumber || !ticketTier) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!validateNid(nidNumber)) {
      return Response.json({ error: "Bangladesh NIDs are 10 or 17 digits." }, { status: 400 })
    }

    if (!['phase1', 'phase2', 'phase3'].includes(ticketTier)) {
      return Response.json({ error: 'Invalid ticket tier.' }, { status: 400 })
    }

    // File validation
    if (nidFile && nidFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(nidFile.type)) {
        return Response.json({ error: 'NID file must be JPG, PNG, or PDF.' }, { status: 400 })
      }
      if (nidFile.size > 5 * 1024 * 1024) {
        return Response.json({ error: 'NID file must be under 5MB.' }, { status: 400 })
      }
    }

    // Use service role key for server-side operations (bypasses RLS for storage upload)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload NID file to private bucket
    let nidFilePath = ''
    if (nidFile && nidFile.size > 0) {
      const ext = nidFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const arrayBuffer = await nidFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('nid-documents')
        .upload(fileName, arrayBuffer, { contentType: nidFile.type, upsert: false })

      if (uploadError) {
        console.error('NID upload error:', uploadError)
        return Response.json({ error: 'Failed to upload NID document. Please try again.' }, { status: 500 })
      }
      nidFilePath = fileName
    }

    const referenceCode = generateRef()

    const { error: dbError } = await supabase.from('registrations').insert({
      full_name: fullName,
      date_of_birth: dateOfBirth,
      email,
      phone,
      instagram_handle: instagramHandle,
      nid_number: nidNumber,
      nid_file_path: nidFilePath,
      ticket_tier: ticketTier,
      ticket_qty: ticketQty,
      shuttle,
      status: 'pending',
      reference_code: referenceCode,
    })

    if (dbError) {
      console.error('DB insert error:', dbError)
      return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    // Send confirmation email
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME ?? 'Sonic Pulse'} <${process.env.EMAIL_FROM ?? 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Registration received — Sonic Pulse 2025',
        html: `
          <div style="background:#050508;color:#F0F0F8;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;">
            <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Registration received.</h1>
            <p style="color:#6B6B7E;margin:0 0 24px;">Sonic Pulse — 25 September 2026</p>
            <p style="margin:0 0 16px;">Hi <strong>${fullName}</strong>,</p>
            <p style="margin:0 0 16px;">We've received your registration for <strong>Sonic Pulse 2025</strong>. Our team will review your details and contact you within 24 hours with payment instructions if you're approved.</p>
            <div style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;padding:16px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7E;letter-spacing:0.2em;text-transform:uppercase;">Reference Code</p>
              <p style="margin:0;font-family:monospace;font-size:18px;color:#FF3FC2;font-weight:bold;">${referenceCode}</p>
            </div>
            <p style="margin:0 0 8px;font-size:12px;color:#6B6B7E;">Ticket tier: ${ticketTier.toUpperCase()} · Qty: ${ticketQty}</p>
            <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">Questions? Reply to this email or message us on Instagram @sonicpulsefestival</p>
          </div>
        `,
      })
    } catch (emailErr) {
      // Don't fail the registration if email fails — log it
      console.error('Email send error:', emailErr)
    }

    return Response.json({ success: true, referenceCode }, { status: 201 })
  } catch (err) {
    console.error('Registration error:', err)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
