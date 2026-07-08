import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executePayment } from '@/lib/payments/bkash'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// bKash redirects the user's browser here with paymentID + status as query
// params. Never trust this GET on its own — status=success only triggers a
// server-to-server executePayment call, and the row is only ever marked
// paid from that response, not from the redirect itself.
export async function GET(req: NextRequest) {
  const paymentID = req.nextUrl.searchParams.get('paymentID')
  const status = req.nextUrl.searchParams.get('status')
  const supabase = serviceClient()

  if (!paymentID) {
    return NextResponse.redirect('connect://payment/result?error=missing_payment_id')
  }

  const { data: paymentRow } = await supabase
    .from('payments')
    .select('id, amount, status')
    .eq('raw_payload->>paymentID', paymentID)
    .maybeSingle()

  if (!paymentRow) {
    return NextResponse.redirect('connect://payment/result?error=unknown_payment')
  }

  // Idempotent: a row that's already been resolved (by a prior callback hit
  // or — more commonly for SSLCommerz-style flows — an IPN landing first)
  // is a no-op, not a re-processing.
  if (paymentRow.status !== 'initiated') {
    return NextResponse.redirect(`connect://payment/result?ref=${paymentRow.id}`)
  }

  if (status !== 'success') {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentRow.id).eq('status', 'initiated')
    return NextResponse.redirect(`connect://payment/result?ref=${paymentRow.id}`)
  }

  try {
    const result = await executePayment(paymentID)
    const transactionStatus = result.transactionStatus
    const trxID = result.trxID as string | undefined
    const paidAmount = Math.round(parseFloat(String(result.amount)) * 100)
    const expectedAmount = paymentRow.amount * 100

    if (transactionStatus === 'Completed' && paidAmount === expectedAmount) {
      await supabase
        .from('payments')
        .update({ status: 'success', provider_txn_id: trxID, raw_payload: result })
        .eq('id', paymentRow.id)
        .eq('status', 'initiated')
    } else {
      await supabase
        .from('payments')
        .update({ status: 'failed', raw_payload: result })
        .eq('id', paymentRow.id)
        .eq('status', 'initiated')
    }
  } catch (err) {
    await supabase
      .from('payments')
      .update({ status: 'failed', raw_payload: { error: String(err) } })
      .eq('id', paymentRow.id)
      .eq('status', 'initiated')
  }

  return NextResponse.redirect(`connect://payment/result?ref=${paymentRow.id}`)
}
