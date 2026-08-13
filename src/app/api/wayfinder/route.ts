import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'WF-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const LEVELS = ['undergraduate_final', 'hsc_alevel', 'other']
const SHIFTS = ['dusk', 'dawn', 'either']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const fullName = (body.fullName ?? '').trim()
    const email = (body.email ?? '').trim()
    const phone = (body.phone ?? '').trim()
    const institution = (body.institution ?? '').trim()
    const level = (body.level ?? '').trim()
    const shiftPreference = (body.shiftPreference ?? '').trim()
    const emergencyContactName = (body.emergencyContactName ?? '').trim()
    const emergencyContactPhone = (body.emergencyContactPhone ?? '').trim()
    const motivation = (body.motivation ?? '').trim()
    const instagramHandle = (body.instagramHandle ?? '').trim()
    const notes = (body.notes ?? '').trim()
    const dateOfBirth = (body.dateOfBirth ?? '').trim()
    const stayToClose = body.stayToClose === true
    const graduationYear =
      body.graduationYear === '' || body.graduationYear == null ? null : parseInt(body.graduationYear, 10)

    if (
      !fullName ||
      !email ||
      !phone ||
      !institution ||
      !level ||
      !shiftPreference ||
      !emergencyContactName ||
      !emergencyContactPhone
    ) {
      return Response.json({ error: 'All required fields must be filled in.' }, { status: 400 })
    }

    if (!LEVELS.includes(level) || !SHIFTS.includes(shiftPreference)) {
      return Response.json({ error: 'All required fields must be filled in.' }, { status: 400 })
    }

    if (motivation.length > 600) {
      return Response.json({ error: 'Tell us in 600 characters or fewer.' }, { status: 400 })
    }

    if (graduationYear !== null && (Number.isNaN(graduationYear) || graduationYear < 2026 || graduationYear > 2032)) {
      return Response.json({ error: 'Graduation year must be between 2026 and 2032.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const referenceCode = generateRef()

    const { error: dbError } = await supabase.from('wayfinder_applications').insert({
      full_name: fullName,
      email,
      phone,
      institution,
      level,
      graduation_year: graduationYear,
      date_of_birth: dateOfBirth || null,
      shift_preference: shiftPreference,
      stay_to_close: stayToClose,
      motivation: motivation || null,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      instagram_handle: instagramHandle || null,
      notes: notes || null,
      status: 'pending',
      reference_code: referenceCode,
    })

    if (dbError) {
      // Table not created yet — degrade gracefully instead of a hard 500.
      // PostgREST reports a missing table as PGRST205; the raw Postgres
      // code (42P01) only surfaces via direct SQL. Both are checked.
      if (dbError.code === '42P01' || dbError.code === 'PGRST205') {
        return Response.json({ error: 'not_open', message: 'Applications open soon.' }, { status: 503 })
      }
      // Duplicate email (unique index on lower(email))
      if (dbError.code === '23505') {
        return Response.json({ error: "You've already applied — the application we have on file is the one that counts." }, { status: 409 })
      }
      console.error('Wayfinder DB insert error:', dbError.code, dbError.message, dbError.details)
      if (/api key|jwt|authoriz/i.test(dbError.message ?? '')) {
        console.error('Wayfinder: Supabase rejected the server credentials — re-paste SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in Vercel env, then redeploy. See REDESIGN_PLAN.md §8.19.')
      }
      return Response.json({ error: 'Something went wrong on our end. Try again in a minute, or email your application to hello@sonicpulsefestival.com.' }, { status: 500 })
    }

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME ?? 'Sonic Pulse'} <${process.env.EMAIL_FROM ?? 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Application received — Wayfinder',
        html: `
          <div style="background:#050508;color:#F0F0F8;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;">
            <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Application received.</h1>
            <p style="color:#6B6B7E;margin:0 0 24px;">Wayfinder — Sonic Pulse, 25 September 2026</p>
            <p style="margin:0 0 16px;">Hi <strong>${fullName}</strong>,</p>
            <p style="margin:0 0 16px;">We've received your application to join the Wayfinder volunteer corps. Fifty Wayfinders work the night in two shifts, guiding guests across the grounds from gates to sunrise.</p>
            <div style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;padding:16px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7E;letter-spacing:0.2em;text-transform:uppercase;">Reference Code</p>
              <p style="margin:0;font-family:monospace;font-size:18px;color:#FF3FC2;font-weight:bold;">${referenceCode}</p>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">We'll confirm shifts and briefing details closer to the event. Questions? Reply to this email or message us on Instagram @sonicpulsefestival. Sonic Pulse is organised by Dhaka Music Festival — @dhakamusicfestival.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Wayfinder email send error:', emailErr)
    }

    return Response.json({ success: true, referenceCode }, { status: 201 })
  } catch (err) {
    console.error('Wayfinder application error:', err)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
