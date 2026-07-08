// SSLCommerz Session/IPN API (sandbox base: https://sandbox.sslcommerz.com).
// Env names only — never commit values: SSLCZ_BASE_URL, SSLCZ_STORE_ID,
// SSLCZ_STORE_PASSWD, PUBLIC_SITE_URL.

export async function createSession(params: {
  paymentsRowId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
}): Promise<{ gatewayUrl: string }> {
  // success_url/fail_url/cancel_url all point at a single tiny GET handler
  // that just redirects to the app deep link — the IPN below is the source
  // of truth, never the browser redirect (its payload can be hand-crafted).
  const redirectHandler = `${process.env.PUBLIC_SITE_URL}/api/payments/sslcommerz/redirect`
  const body = new URLSearchParams({
    store_id: process.env.SSLCZ_STORE_ID!,
    store_passwd: process.env.SSLCZ_STORE_PASSWD!,
    total_amount: String(params.amount),
    currency: 'BDT',
    tran_id: params.paymentsRowId,
    success_url: redirectHandler,
    fail_url: redirectHandler,
    cancel_url: redirectHandler,
    ipn_url: `${process.env.PUBLIC_SITE_URL}/api/payments/sslcommerz/ipn`,
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_phone: params.customerPhone,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Connect Ticket',
    product_category: 'Event Ticket',
    product_profile: 'general',
    num_of_item: '1',
  })

  const res = await fetch(`${process.env.SSLCZ_BASE_URL}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`SSLCommerz createSession failed: ${res.status}`)
  const data = await res.json()
  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(`SSLCommerz createSession rejected: ${data.failedreason ?? data.status}`)
  }
  return { gatewayUrl: data.GatewayPageURL as string }
}

export async function validateTransaction(valId: string): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSLCZ_STORE_ID!,
    store_passwd: process.env.SSLCZ_STORE_PASSWD!,
    format: 'json',
  })
  const res = await fetch(`${process.env.SSLCZ_BASE_URL}/validator/api/validationserverAPI.php?${params.toString()}`)
  if (!res.ok) throw new Error(`SSLCommerz validateTransaction failed: ${res.status}`)
  return res.json()
}

// SSLCommerz returns amounts as decimal strings ("4500.00") that can carry
// float noise ("4500.0000") — compare in integer cents, never with === on
// the raw float or string. Mirrored (not imported) in
// scripts/test-payments-math.mjs, which runs under plain node with no
// TypeScript build step.
export function amountsMatch(expectedWholeBdt: number, gatewayAmountString: string): boolean {
  const parsedCents = Math.round(parseFloat(gatewayAmountString) * 100)
  return parsedCents === expectedWholeBdt * 100
}
