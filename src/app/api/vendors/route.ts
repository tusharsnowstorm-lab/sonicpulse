import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import { packageByCode, stallFee, MAX_STALLS, CONTRACT_VERSION, type PackageCode } from '@/data/vendors'
import { contractPlainText, type ContractFields } from '@/data/vendor-contract'
import { vendorBankDetails } from '@/lib/vendor-bank'
import { sendVendorReceivedEmail } from '@/lib/vendor-email'

const ACK_IDS = ['clause3', 'clause4', 'clause5', 'clause7', 'clause9', 'signature']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const packageCode = (body.packageCode ?? '').trim()
    const stalls = parseInt(body.stalls, 10)
    const businessName = (body.businessName ?? '').trim()
    const contactPerson = (body.contactPerson ?? '').trim()
    const phone = (body.phone ?? '').trim()
    const email = (body.email ?? '').trim()
    const businessAddress = (body.businessAddress ?? '').trim()
    const tradeLicence = (body.tradeLicence ?? '').trim()
    const goodsDescription = (body.goodsDescription ?? '').trim()
    const electricalLoads = (body.electricalLoads ?? '').trim()
    const cookingEquipment = (body.cookingEquipment ?? '').trim()
    const staffList = (body.staffList ?? '').trim()
    const signatoryName = (body.signatoryName ?? '').trim()
    const signatoryDesignation = (body.signatoryDesignation ?? '').trim()
    const acknowledged: string[] = Array.isArray(body.acknowledged) ? body.acknowledged : []

    const pkg = packageByCode(packageCode)
    if (!pkg) {
      return Response.json({ error: 'Choose a package.' }, { status: 400 })
    }

    if (!Number.isInteger(stalls) || stalls < 1 || stalls > MAX_STALLS) {
      return Response.json({ error: 'Number of stalls must be between 1 and 10.' }, { status: 400 })
    }

    if (
      !businessName ||
      !contactPerson ||
      !phone ||
      !email ||
      !businessAddress ||
      !goodsDescription ||
      !signatoryName ||
      !signatoryDesignation
    ) {
      return Response.json({ error: 'All required fields must be filled in.' }, { status: 400 })
    }

    if (goodsDescription.length > 1000) {
      return Response.json({ error: "Describe what you'll sell in 1000 characters or fewer." }, { status: 400 })
    }

    if (pkg.food && !cookingEquipment) {
      return Response.json({ error: 'List the cooking equipment and any LPG you will bring.' }, { status: 400 })
    }

    const staffLines = staffList.split('\n').map((l: string) => l.trim()).filter(Boolean)
    const maxStaff = 3 * stalls
    if (staffLines.length > maxStaff) {
      return Response.json(
        { error: `Up to three staff per stall — that is ${maxStaff} for this application.` },
        { status: 400 }
      )
    }

    const hasAllAcks =
      acknowledged.length === ACK_IDS.length && ACK_IDS.every((id) => acknowledged.includes(id))
    if (!hasAllAcks) {
      return Response.json({ error: 'Tick every acknowledgement to sign.' }, { status: 400 })
    }

    const bank = vendorBankDetails()

    const fields: ContractFields = {
      agreementRef: '',
      businessName,
      contactPerson,
      phone,
      email,
      businessAddress,
      tradeLicence,
      stalls,
      signatoryName,
      signatoryDesignation,
      signedAt: '',
      bank,
    }

    const text = contractPlainText(pkg, fields)
    const hash = createHash('sha256').update(text).digest('hex')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Allocate the next running number for this package code.
    const { data: latest, error: latestError } = await supabase
      .from('vendor_applications')
      .select('agreement_ref')
      .eq('package_code', packageCode)
      .order('created_at', { ascending: false })
      .limit(1)

    if (latestError) {
      if (latestError.code === '42P01' || latestError.code === 'PGRST205') {
        return Response.json({ error: 'not_open', message: 'Applications open soon.' }, { status: 503 })
      }
      console.error('Vendor DB lookup error:', latestError.code, latestError.message)
      return Response.json(
        { error: 'Something went wrong on our end. Try again in a minute, or email your application to contact@sonicpulsefestival.com.' },
        { status: 500 }
      )
    }

    let nextNumber = 0
    if (latest && latest[0]) {
      const match = latest[0].agreement_ref.match(/-(\d{3})$/)
      nextNumber = match ? parseInt(match[1], 10) : 0
    }

    const signedIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const signedUserAgent = req.headers.get('user-agent')

    let insertedRef = ''
    let insertError: { code?: string; message?: string } | null = null

    for (let attempt = 0; attempt < 3; attempt++) {
      const candidateRef = `SP/VEND/2026/${packageCode}-${String(nextNumber + 1 + attempt).padStart(3, '0')}`
      const { error } = await supabase.from('vendor_applications').insert({
        agreement_ref: candidateRef,
        package_code: packageCode as PackageCode,
        stalls,
        stall_fee: stallFee(pkg, stalls),
        business_name: businessName,
        contact_person: contactPerson,
        phone,
        email,
        business_address: businessAddress,
        trade_licence: tradeLicence || null,
        goods_description: goodsDescription,
        electrical_loads: electricalLoads || null,
        cooking_equipment: cookingEquipment || null,
        staff_list: staffList || null,
        signatory_name: signatoryName,
        signatory_designation: signatoryDesignation,
        signed_ip: signedIp,
        signed_user_agent: signedUserAgent,
        contract_version: CONTRACT_VERSION,
        contract_hash: hash,
        acknowledged_clauses: acknowledged,
        status: 'awaiting_payment',
      })

      if (!error) {
        insertedRef = candidateRef
        insertError = null
        break
      }

      insertError = error
      if (error.code !== '23505') break
    }

    if (insertError || !insertedRef) {
      if (insertError?.code === '42P01' || insertError?.code === 'PGRST205') {
        return Response.json({ error: 'not_open', message: 'Applications open soon.' }, { status: 503 })
      }
      console.error('Vendor DB insert error:', insertError?.code, insertError?.message)
      return Response.json(
        { error: 'Something went wrong on our end. Try again in a minute, or email your application to contact@sonicpulsefestival.com.' },
        { status: 500 }
      )
    }

    const stallFeeTotal = stallFee(pkg, stalls)

    await sendVendorReceivedEmail(
      {
        agreement_ref: insertedRef,
        package_code: packageCode as PackageCode,
        stalls,
        stall_fee: stallFeeTotal,
        business_name: businessName,
        contact_person: contactPerson,
        email,
        contract_hash: hash,
        countersigned_by: null,
        countersigned_designation: null,
        confirmed_at: null,
      },
      pkg,
      bank
    )

    return Response.json(
      {
        success: true,
        agreementRef: insertedRef,
        stallFee: stallFeeTotal,
        paymentReference: `SP/VEND/2026/${packageCode} ${businessName}`,
        bank,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Vendor application error:', err)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
