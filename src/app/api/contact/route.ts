import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (message.length < 20) {
      return Response.json({ error: 'Message must be at least 20 characters.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })

    if (error) {
      console.error('Contact DB error:', error)
      return Response.json({ error: 'Failed to send message.' }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Contact error:', err)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
