import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'SP-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function validateId(id: string, type: string): { valid: boolean; message?: string } {
  if (type === 'nid') {
    if (!/^\d{10}$/.test(id) && !/^\d{17}$/.test(id))
      return { valid: false, message: 'Bangladesh NIDs are 10 or 17 digits.' }
  } else if (type === 'passport') {
    if (id.length < 5 || id.length > 20)
      return { valid: false, message: 'Passport number must be 5–20 characters.' }
  } else if (type === 'birth_certificate') {
    if (!/^\d{8,20}$/.test(id))
      return { valid: false, message: 'Birth certificate number must be 8–20 digits.' }
  } else {
    return { valid: false, message: 'Invalid ID type.' }
  }
  return { valid: true }
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
    const nidNumber        = (formData.get('idNumber') ?? formData.get('nidNumber')) as string
    const idType           = (formData.get('idType') as string | null) ?? 'nid'
    const instagramHandle  = (formData.get('instagramHandle') as string | null)?.replace(/^@/, '') ?? ''
    const gender           = formData.get('gender') as string | null
    const ticketTier       = formData.get('ticketTier') as string
    const nidFile          = formData.get('nidFile') as File | null
    const nidFilePath      = formData.get('nidFilePath') as string | null

    if (!fullName || !phone || !nidNumber || !ticketTier || !instagramHandle || !gender) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }
    const idValidation = validateId(nidNumber, idType)
    if (!idValidation.valid) {
      return Response.json({ error: idValidation.message }, { status: 400 })
    }
    if (!['phase1', 'phase2', 'phase3'].includes(ticketTier)) {
      return Response.json({ error: 'Invalid ticket tier.' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if this ID number + type is already registered
    const { data: existingNid } = await admin
      .from('user_tickets')
      .select('id')
      .eq('nid_number', nidNumber)
      .eq('id_type', idType)
      .single()

    if (existingNid) {
      const idTypeLabel = idType === 'nid' ? 'NID number' : idType === 'passport' ? 'passport number' : 'birth certificate number'
      return Response.json({ error: `This ${idTypeLabel} is already registered for a ticket. Each person can only have one ticket.` }, { status: 409 })
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
      if (nidFile.size > 5 * 1024 * 1024) {
        return Response.json({ error: 'NID file must be under 5MB.' }, { status: 400 })
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
        id_type: idType,
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

    // Application received email
    import('@/lib/email').then(({ sendApplicationEmail }) =>
      sendApplicationEmail(user.email!, fullName, ticketTier, referenceCode)
    ).catch(() => {})

    return Response.json({ success: true, ticket }, { status: 201 })
  } catch {
    return Response.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
