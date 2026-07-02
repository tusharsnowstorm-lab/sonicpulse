export function isGateStaff(email: string | null | undefined): boolean {
  const emails = (process.env.GATE_STAFF_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && emails.includes(email.toLowerCase())
}
