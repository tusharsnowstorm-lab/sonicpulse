// Plain-node assertion of the amount-comparison formula used by
// src/app/api/payments/sslcommerz/ipn/route.ts (via amountsMatch in
// src/lib/payments/sslcommerz.ts). Reimplemented here rather than imported
// because this script runs under plain `node`, with no TypeScript build
// step — SSLCommerz returns amounts as decimal strings that can carry
// float noise ("4500.0000"), so this must compare in integer cents, never
// with === on the raw float or string.
function amountsMatch(expectedWholeBdt, gatewayAmountString) {
  const parsedCents = Math.round(parseFloat(gatewayAmountString) * 100)
  return parsedCents === expectedWholeBdt * 100
}

const cases = [
  ['4500.00', true],
  ['4500.0000', true],
  ['4500.01', false],
]

let failed = false
for (const [input, expected] of cases) {
  const actual = amountsMatch(4500, input)
  const pass = actual === expected
  console.log(`${pass ? 'PASS' : 'FAIL'} amountsMatch(4500, "${input}") === ${expected} (got ${actual})`)
  if (!pass) failed = true
}

if (failed) {
  console.error('One or more amount-comparison assertions failed.')
  process.exit(1)
}
console.log('All amount-comparison assertions passed.')
