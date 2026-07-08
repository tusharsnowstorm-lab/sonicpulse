// bKash Tokenized Checkout API (sandbox base: https://tokenized.sandbox.bka.sh/v1.2.0-beta).
// Env names only — never commit values: BKASH_BASE_URL, BKASH_APP_KEY,
// BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, PUBLIC_SITE_URL.

type TokenCache = { token: string; expiresAt: number } | null
let tokenCache: TokenCache = null

function baseUrl() {
  return process.env.BKASH_BASE_URL!
}

async function grantToken(): Promise<string> {
  const res = await fetch(`${baseUrl()}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: process.env.BKASH_USERNAME!,
      password: process.env.BKASH_PASSWORD!,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`bKash grant token failed: ${res.status}`)
  const data = await res.json()
  if (!data.id_token) throw new Error('bKash grant token response missing id_token')
  return data.id_token as string
}

async function getToken(forceRefresh = false): Promise<string> {
  const now = Date.now()
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > now) return tokenCache.token
  const token = await grantToken()
  // Tokens last ~1h; refresh 5 minutes early.
  tokenCache = { token, expiresAt: now + 55 * 60 * 1000 }
  return token
}

async function bkashFetch(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const doFetch = (t: string) =>
    fetch(`${baseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: t,
        'X-App-Key': process.env.BKASH_APP_KEY!,
      },
      body: JSON.stringify(body),
    })

  let token = await getToken()
  let res = await doFetch(token)
  if (res.status === 401) {
    // Drop the cache and retry exactly once — never loop.
    token = await getToken(true)
    res = await doFetch(token)
  }
  if (!res.ok) throw new Error(`bKash ${path} failed: ${res.status}`)
  return res.json()
}

export async function createPayment(params: {
  paymentsRowId: string
  userId: string
  amount: number
}): Promise<{ paymentID: string; bkashURL: string }> {
  const data = await bkashFetch('/tokenized/checkout/create', {
    mode: '0011',
    payerReference: params.userId,
    callbackURL: `${process.env.PUBLIC_SITE_URL}/api/payments/bkash/callback`,
    amount: String(params.amount),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: params.paymentsRowId,
  })
  if (!data.paymentID || !data.bkashURL) {
    throw new Error('bKash createPayment response missing paymentID/bkashURL')
  }
  return { paymentID: data.paymentID as string, bkashURL: data.bkashURL as string }
}

export async function executePayment(paymentID: string): Promise<Record<string, unknown>> {
  return bkashFetch('/tokenized/checkout/execute', { paymentID })
}

export async function queryPayment(paymentID: string): Promise<Record<string, unknown>> {
  return bkashFetch('/tokenized/checkout/payment/status', { paymentID })
}
