import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateTransaction, amountsMatch } from '@/lib/payments/sslcommerz'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Server-to-server. Gateways retry IPNs, and this can land before (or
// instead of) the browser redirect — this handler, not the redirect one,
// is the sole source of truth for a successful payment.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  const valId = form?.get('val_id')
  const tranId = form?.get('tran_id')
  if (!valId || !tranId) {
    return NextResponse.json({ error: 'Missing val_id/tran_id' }, { status: 400 })
  }

  const supabase = serviceClient()
  const { data: paymentRow } = await supabase
    .from('payments')
    .select('id, amount, status')
    .eq('id', String(tranId))
    .maybeSingle()

  if (!paymentRow) {
    // Unknown tran_id — acknowledge so the gateway doesn't retry forever,
    // there is nothing further we can do with it.
    return NextResponse.json({ ok: true, note: 'unknown payment' })
  }

  // Already resolved by an earlier IPN delivery (or the redirect handler
  // racing it) — a no-op, not an error, so the retry stops.
  if (paymentRow.status !== 'initiated') {
    return NextResponse.json({ ok: true, note: 'already processed' })
  }

  let validation: Record<string, unknown>
  try {
    validation = await validateTransaction(String(valId))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'validation failed' }, { status: 502 })
  }

  const validStatus = validation.status === 'VALID' || validation.status === 'VALIDATED'
  const amountOk = amountsMatch(paymentRow.amount, String(validation.amount ?? '0'))

  if (validStatus && amountOk) {
    await supabase
      .from('payments')
      .update({ status: 'success', provider_txn_id: String(valId), raw_payload: validation })
      .eq('id', paymentRow.id)
      .eq('status', 'initiated')
  } else {
    await supabase
      .from('payments')
      .update({ status: 'failed', raw_payload: validation })
      .eq('id', paymentRow.id)
      .eq('status', 'initiated')
  }

  return NextResponse.json({ ok: true })
}
