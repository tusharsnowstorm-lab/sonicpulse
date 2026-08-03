import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'FP-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeMixLink(value: string): string {
  if (!value) return value
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value) ? value : `https://${value}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const fullName = (body.fullName ?? '').trim()
    const email = (body.email ?? '').trim()
    const stageName = (body.stageName ?? '').trim()
    const cityCountry = (body.cityCountry ?? '').trim()
    const genres = (body.genres ?? '').trim()
    const bio = (body.bio ?? '').trim()
    const mixLink = normalizeMixLink((body.mixLink ?? '').trim())
    const instagramHandle = (body.instagramHandle ?? '').trim()
    const yearsExperience = body.yearsExperience === '' || body.yearsExperience == null ? null : parseInt(body.yearsExperience, 10)
    const notes = (body.notes ?? '').trim()

    if (!fullName || !email || !stageName || !cityCountry || !genres || !bio) {
      return Response.json({ error: 'All required fields must be filled in.' }, { status: 400 })
    }

    if (bio.length > 1000) {
      return Response.json({ error: 'Bio must be 1000 characters or fewer.' }, { status: 400 })
    }

    if (mixLink && !isValidUrl(mixLink)) {
      return Response.json({ error: "That link doesn't look right — paste the full link from SoundCloud, Mixcloud, or YouTube." }, { status: 400 })
    }

    if (yearsExperience !== null && (Number.isNaN(yearsExperience) || yearsExperience < 0 || yearsExperience > 60)) {
      return Response.json({ error: 'Years behind the decks must be a number between 0 and 60.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const referenceCode = generateRef()

    const { error: dbError } = await supabase.from('artist_applications').insert({
      full_name: fullName,
      email,
      stage_name: stageName,
      city_country: cityCountry,
      genres,
      bio,
      mix_link: mixLink || null,
      instagram_handle: instagramHandle || null,
      years_experience: yearsExperience,
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
      console.error('First Pulse DB insert error:', dbError.code, dbError.message, dbError.details)
      if (/api key|jwt|authoriz/i.test(dbError.message ?? '')) {
        console.error('First Pulse: Supabase rejected the server credentials — re-paste SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in Vercel env, then redeploy. See REDESIGN_PLAN.md §8.16.')
      }
      return Response.json({ error: 'Something went wrong on our end. Try again in a minute, or email your application to hello@sonicpulsefestival.com.' }, { status: 500 })
    }

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME ?? 'Sonic Pulse'} <${process.env.EMAIL_FROM ?? 'onboarding@resend.dev'}>`,
        to: email,
        subject: 'Application received — First Pulse',
        html: `
          <div style="background:#050508;color:#F0F0F8;font-family:Arial,sans-serif;padding:32px;max-width:560px;margin:0 auto;">
            <h1 style="color:#FF3FC2;font-size:28px;margin:0 0 8px;">Application received.</h1>
            <p style="color:#6B6B7E;margin:0 0 24px;">First Pulse — Sonic Pulse, 25 September 2026</p>
            <p style="margin:0 0 16px;">Hi <strong>${fullName}</strong>,</p>
            <p style="margin:0 0 16px;">We've received your First Pulse application as <strong>${stageName}</strong>. The Sonic Pulse artists will review submissions and two names will open the night — 4:00 to 7:00 PM on the main stage.</p>
            <div style="background:#0D0D14;border:1px solid #1E1E2E;border-radius:4px;padding:16px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6B7E;letter-spacing:0.2em;text-transform:uppercase;">Reference Code</p>
              <p style="margin:0;font-family:monospace;font-size:18px;color:#FF3FC2;font-weight:bold;">${referenceCode}</p>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#6B6B7E;">Selected names will be announced on the event page. Questions? Reply to this email or message us on Instagram @sonicpulsefestival. Sonic Pulse is organised by Dhaka Music Festival — @dhakamusicfestival.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('First Pulse email send error:', emailErr)
    }

    return Response.json({ success: true, referenceCode }, { status: 201 })
  } catch (err) {
    console.error('First Pulse application error:', err)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
