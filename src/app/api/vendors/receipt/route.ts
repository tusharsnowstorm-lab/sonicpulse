import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { sendVendorReceiptEmail } from '@/lib/vendor-email'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILES = 3
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const agreementRef = (formData.get('agreementRef') as string | null ?? '').trim().toUpperCase()
    const email = (formData.get('email') as string | null ?? '').trim().toLowerCase()
    const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

    if (files.length === 0) {
      return Response.json({ error: 'Attach at least one receipt.' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return Response.json({ error: 'Up to three files.' }, { status: 400 })
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ error: 'Receipts must be JPG, PNG or PDF.' }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return Response.json({ error: 'Each file must be under 5 MB.' }, { status: 400 })
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: row, error: lookupError } = await supabase
      .from('vendor_applications')
      .select('id, email, status, receipt_paths, agreement_ref, package_code, stalls, stall_fee, business_name, contact_person, contract_hash')
      .eq('agreement_ref', agreementRef)
      .limit(1)
      .maybeSingle()

    if (lookupError) {
      if (lookupError.code === '42P01' || lookupError.code === 'PGRST205') {
        return Response.json({ error: 'not_open', message: 'Applications open soon.' }, { status: 503 })
      }
      console.error('Vendor receipt lookup error:', lookupError.code, lookupError.message)
      return Response.json({ error: 'Upload failed. Try again in a minute.' }, { status: 500 })
    }

    if (!row || row.email.toLowerCase() !== email) {
      return Response.json(
        { error: "We couldn't match that reference and email. Check both against your confirmation email." },
        { status: 404 }
      )
    }

    if (['lapsed', 'rejected', 'cancelled_by_organiser'].includes(row.status)) {
      return Response.json(
        { error: "This booking is closed. Email contact@sonicpulsefestival.com if you think that's wrong." },
        { status: 409 }
      )
    }

    const newPaths: string[] = []
    const safeRef = agreementRef.replace(/\//g, '_')

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'bin'
      const fileName = `${safeRef}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const arrayBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('vendor-receipts')
        .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false })

      if (uploadError) {
        console.error('Vendor receipt upload error:', uploadError)
        return Response.json({ error: 'Upload failed. Try again in a minute.' }, { status: 500 })
      }

      newPaths.push(fileName)
    }

    const updatedPaths = [...(row.receipt_paths ?? []), ...newPaths]
    const update: { receipt_paths: string[]; receipt_uploaded_at: string; status?: string } = {
      receipt_paths: updatedPaths,
      receipt_uploaded_at: new Date().toISOString(),
    }
    if (row.status === 'awaiting_payment') {
      update.status = 'paid_pending_verification'
    }

    const { error: updateError } = await supabase
      .from('vendor_applications')
      .update(update)
      .eq('id', row.id)

    if (updateError) {
      console.error('Vendor receipt update error:', updateError)
      return Response.json({ error: 'Upload failed. Try again in a minute.' }, { status: 500 })
    }

    await sendVendorReceiptEmail(
      {
        agreement_ref: row.agreement_ref,
        package_code: row.package_code,
        stalls: row.stalls,
        stall_fee: row.stall_fee,
        business_name: row.business_name,
        contact_person: row.contact_person,
        email: row.email,
        contract_hash: row.contract_hash,
        countersigned_by: null,
        countersigned_designation: null,
        confirmed_at: null,
      },
      files.length
    )

    return Response.json({ success: true, count: files.length })
  } catch (err) {
    console.error('Vendor receipt upload error:', err)
    return Response.json({ error: 'Upload failed. Try again in a minute.' }, { status: 500 })
  }
}
