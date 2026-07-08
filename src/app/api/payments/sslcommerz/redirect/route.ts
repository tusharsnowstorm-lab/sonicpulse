import { NextRequest, NextResponse } from 'next/server'

// SSLCommerz posts the customer's browser here (success_url/fail_url/
// cancel_url all point at this one handler) carrying transaction data as
// POST form fields. That payload is never trusted — it's only used to
// pick a ref for the deep link back to the app; the IPN handler below is
// the sole source of truth for whether the payment actually succeeded.
export async function POST(req: NextRequest) {
  let ref = ''
  try {
    const form = await req.formData()
    ref = String(form.get('tran_id') ?? '')
  } catch {
    // Ignore — the app polls /api/payments/status regardless of this ref.
  }
  return NextResponse.redirect(`connect://payment/result${ref ? `?ref=${ref}` : ''}`)
}

export async function GET() {
  return NextResponse.redirect('connect://payment/result')
}
