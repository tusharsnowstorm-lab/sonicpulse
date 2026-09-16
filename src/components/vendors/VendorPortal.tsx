'use client'
import { useState } from 'react'
import PillButton from '@/components/ui/PillButton'
import ContractText from './ContractText'
import ReceiptUpload from './ReceiptUpload'
import BankDetailsCard from './BankDetailsCard'
import {
  vendorPackages, packageByCode, bdt, stallFee,
  commonIncludes, excludedNote, MAX_STALLS, VENDOR_CONTACT_EMAIL,
} from '@/data/vendors'
import { buildContract, type ContractFields, type BankDetails } from '@/data/vendor-contract'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  color: '#fff',
  fontFamily: 'var(--font-montserrat)',
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-label-muted)',
  fontWeight: 700,
  marginBottom: 6,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 32,
  textAlign: 'center',
}

const Required = () => <em style={{ color: 'var(--accent-magenta)', fontStyle: 'normal' }}>*</em>

type AckId = 'clause3' | 'clause4' | 'clause5' | 'clause7' | 'clause9' | 'signature'

const ACK_ITEMS: { id: AckId; label: string }[] = [
  { id: 'clause3', label: 'Clause 3 — I understand the full Stall Fee is payable in advance by bank transfer only, that no deposit or part-payment holds a stall, and that the fee is non-refundable and non-transferable once the booking is confirmed.' },
  { id: 'clause4', label: 'Clause 4 — I understand the Organiser may change stall position, layout, timings, package items, venue rules or the venue, or postpone the Event, without prior notice and with no refund or claim.' },
  { id: 'clause5', label: 'Clause 5 — I understand no more than three staff per stall are admitted, that their names are due by 20 September 2026, and that staff must remain in the vendor zone. A vendor pass is not an Event ticket.' },
  { id: 'clause7', label: "Clause 7 — I understand the Vendor bears its own security, that the Organiser's liability is capped at the Stall Fee paid, and that the Vendor indemnifies the Organiser." },
  { id: 'clause9', label: 'Clause 9 — I understand the Vendor cannot cancel after the booking is confirmed, and the cancellation and postponement terms.' },
  { id: 'signature', label: 'I am authorised to sign for the Vendor. Submitting this application is my signature on the Stall Vendor Agreement above, version v2026-09-14.' },
]

const HOW_IT_WORKS = [
  { title: 'Choose a package and apply', body: 'Fill in the form, read the agreement for your package and submit. Submitting is your signature.' },
  { title: 'Transfer the full stall fee', body: 'Bank transfer only, in one payment, by 20 September 2026. Use the payment reference on your confirmation.' },
  { title: 'Upload your receipt', body: 'Attach a photo or PDF of the transfer receipt on this page. We check it against the account.' },
  { title: 'Get confirmed', body: 'Once funds clear, Dhaka Music Festival countersigns and emails your written confirmation. Stalls go in the order full payment arrives.' },
]

const initialForm = {
  packageCode: '',
  stalls: '1',
  businessName: '',
  contactPerson: '',
  phone: '',
  email: '',
  businessAddress: '',
  tradeLicence: '',
  goodsDescription: '',
  electricalLoads: '',
  cookingEquipment: '',
  staffList: '',
  signatoryName: '',
  signatoryDesignation: '',
}

const initialAcks: Record<AckId, boolean> = {
  clause3: false,
  clause4: false,
  clause5: false,
  clause7: false,
  clause9: false,
  signature: false,
}

type Status = 'idle' | 'submitting' | 'success' | 'not_open' | 'error'

type Result = {
  agreementRef: string
  stallFee: number
  paymentReference: string
  bank: BankDetails | null
}

export default function VendorPortal({ live, bank }: { live: boolean; bank: BankDetails | null }) {
  const [form, setForm] = useState(initialForm)
  const [acks, setAcks] = useState(initialAcks)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const set = (key: keyof typeof initialForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleAck = (id: AckId) => setAcks((a) => ({ ...a, [id]: !a[id] }))

  const selectedPkg = packageByCode(form.packageCode)
  const stallsNum = Math.max(1, parseInt(form.stalls, 10) || 1)

  const liveFields: ContractFields = {
    agreementRef: '',
    businessName: form.businessName,
    contactPerson: form.contactPerson,
    phone: form.phone,
    email: form.email,
    businessAddress: form.businessAddress,
    tradeLicence: form.tradeLicence,
    stalls: stallsNum,
    signatoryName: form.signatoryName,
    signatoryDesignation: form.signatoryDesignation,
    signedAt: '',
    bank,
  }

  const allAcked = ACK_ITEMS.every((item) => acks[item.id])

  const applyPackage = (code: string) => {
    setForm((f) => ({ ...f, packageCode: code }))
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setStatus('submitting')
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stalls: Number(form.stalls),
          acknowledged: Object.keys(acks).filter((k) => acks[k as AckId]),
        }),
      })
      const json = await res.json().catch(() => ({}))

      if (res.status === 503 && json.error === 'not_open') {
        setStatus('not_open')
        return
      }
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong on our end. Try again in a minute, or email your application to contact@sonicpulsefestival.com.')
        setStatus('error')
        return
      }

      setResult({
        agreementRef: json.agreementRef,
        stallFee: json.stallFee,
        paymentReference: json.paymentReference,
        bank: json.bank,
      })
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrorMsg('Something went wrong on our end. Try again in a minute, or email your application to contact@sonicpulsefestival.com.')
      setStatus('error')
    }
  }

  return (
    <div>
      {/* A. How it works */}
      <section style={{ marginTop: 0 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700, marginBottom: 16 }}>
          How it works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 22 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-magenta)', fontWeight: 700, marginBottom: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{step.title}</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* B. Packages */}
      <section style={{ marginTop: 56 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700, marginBottom: 16 }}>
          Three packages
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {vendorPackages.map((pkg) => (
            <div
              key={pkg.code}
              style={{
                background: 'var(--bg-elevated)',
                border: form.packageCode === pkg.code ? '1px solid var(--accent-soft)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>
                {pkg.shortName}
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>
                {bdt(pkg.fee)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-dim)' }}>per stall</span>
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{pkg.blurb}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700, marginTop: 4 }}>
                Included
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, listStyle: 'none', padding: 0 }}>
                {pkg.extra && (
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#fff' }}>
                    <span style={{ color: 'var(--accent-magenta)' }}>—</span>
                    <span>{pkg.extra}</span>
                  </li>
                )}
                {commonIncludes.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--accent-magenta)' }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PillButton
                type="button"
                variant="outline"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => applyPackage(pkg.code)}
              >
                Apply — {pkg.shortName} →
              </PillButton>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', marginTop: 16, lineHeight: 1.6 }}>{excludedNote}</p>
      </section>

      {/* B2. How to pay — the account details, in the open (§8.68) */}
      <section id="pay" style={{ marginTop: 56 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700, marginBottom: 16 }}>
          How to pay
        </p>
        <BankDetailsCard
          bank={bank}
          paymentReference={`SP/VEND/2026/${selectedPkg ? selectedPkg.code : '<package code>'} + your business name`}
          note="Transfer after you have submitted the application below — your confirmation email carries the exact reference to use. Stalls are allocated in the order full payment arrives."
        />
      </section>

      {!live ? (
        <section style={{ marginTop: 56 }}>
          <div style={cardStyle}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Stall applications are closed.</p>
            <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Email contact@sonicpulsefestival.com for late enquiries.</p>
          </div>
        </section>
      ) : status === 'success' && result ? (
        <section style={{ marginTop: 56 }}>
          <div style={{ ...cardStyle, textAlign: 'left', border: '1px solid var(--accent-soft)' }} aria-live="polite">
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16, textAlign: 'center' }}>Application signed.</p>

            <p style={{ ...labelStyle, marginBottom: 4 }}>Agreement reference</p>
            <p style={{ fontFamily: 'monospace', fontSize: 20, color: 'var(--accent-magenta)', fontWeight: 700, marginBottom: 16 }}>{result.agreementRef}</p>

            <p style={{ ...labelStyle, marginBottom: 4 }}>Stall Fee</p>
            <p style={{ fontSize: 16, color: '#fff', marginBottom: 16 }}>{bdt(result.stallFee)}</p>

            <div style={{ marginBottom: 16 }}>
              <BankDetailsCard bank={result.bank} paymentReference={result.paymentReference} />
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 8 }}>
              Your booking is not confirmed and no stall is reserved until the full Stall Fee has cleared and Dhaka Music Festival emails written confirmation. Stalls go in the order full payment arrives.
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', marginBottom: 24 }}>We&apos;ve emailed a copy of this to {form.email}.</p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Paid already? Upload your receipt</p>
              <ReceiptUpload agreementRef={result.agreementRef} email={form.email} locked compact />
            </div>
          </div>
        </section>
      ) : (
        <section id="apply" style={{ marginTop: 56 }}>
          {status === 'not_open' ? (
            <div style={cardStyle}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Applications open soon.</p>
              <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>Check back shortly, or email contact@sonicpulsefestival.com.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 30, display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700 }}>
                Apply for a stall
              </p>

              <div>
                <label style={labelStyle} htmlFor="vd-package">Package <Required /></label>
                <select id="vd-package" style={fieldStyle} required value={form.packageCode} onChange={set('packageCode')}>
                  <option value="">Select a package</option>
                  {vendorPackages.map((pkg) => (
                    <option key={pkg.code} value={pkg.code}>{pkg.name} — {bdt(pkg.fee)} per stall</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-stalls">Number of stalls <Required /></label>
                <input id="vd-stalls" type="number" min={1} max={MAX_STALLS} style={fieldStyle} required value={form.stalls} onChange={set('stalls')} />
                {selectedPkg && (
                  <p style={{ fontSize: 13, color: '#fff', marginTop: 8 }}>
                    Stall Fee: {stallsNum} × {bdt(selectedPkg.fee)} = {bdt(stallFee(selectedPkg, stallsNum))} — payable in full, by bank transfer, by 20 September 2026.
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-business">Business name <Required /></label>
                <input id="vd-business" style={fieldStyle} required value={form.businessName} onChange={set('businessName')} placeholder="As it should appear on the agreement" />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-contact">Contact person <Required /></label>
                <input id="vd-contact" style={fieldStyle} required value={form.contactPerson} onChange={set('contactPerson')} placeholder="Who we call about this booking" />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-phone">Phone <Required /></label>
                <input id="vd-phone" inputMode="tel" style={fieldStyle} required value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-email">Email <Required /></label>
                <input id="vd-email" type="email" style={fieldStyle} required value={form.email} onChange={set('email')} placeholder="you@business.com" />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-address">Business address <Required /></label>
                <textarea id="vd-address" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} required value={form.businessAddress} onChange={set('businessAddress')} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-licence">Trade licence number</label>
                <input id="vd-licence" style={fieldStyle} value={form.tradeLicence} onChange={set('tradeLicence')} />
                <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6 }}>Leave blank if you don&apos;t have one.</p>
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-goods">
                  Goods or menu you will sell <Required />
                  <span style={{ float: 'right', textTransform: 'none', fontWeight: 400, color: form.goodsDescription.length > 1000 ? '#e24b4a' : 'var(--text-label-muted)' }}>
                    {form.goodsDescription.length}/1000
                  </span>
                </label>
                <textarea id="vd-goods" style={{ ...fieldStyle, minHeight: 90, resize: 'vertical' }} maxLength={1000} required value={form.goodsDescription} onChange={set('goodsDescription')} />
                <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6 }}>You may only trade in what you describe here (Clause 5).</p>
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-electrical">Heavy or continuous electrical loads</label>
                <textarea id="vd-electrical" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} value={form.electricalLoads} onChange={set('electricalLoads')} />
                <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6 }}>
                  Fridges, grills, heaters — anything that runs continuously. Declare before 20 September 2026; it may be refused or charged (Clause 2).
                </p>
              </div>

              {selectedPkg?.food && (
                <div>
                  <label style={labelStyle} htmlFor="vd-cooking">Cooking equipment and LPG on site <Required /></label>
                  <textarea id="vd-cooking" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} required value={form.cookingEquipment} onChange={set('cookingEquipment')} />
                  <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6 }}>
                    List every cooking appliance and any LPG cylinders. Cooking is permitted only with declared equipment (Clause 5).
                  </p>
                </div>
              )}

              <div>
                <label style={labelStyle} htmlFor="vd-staff">Stall staff — up to three per stall</label>
                <textarea id="vd-staff" style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} value={form.staffList} onChange={set('staffList')} placeholder="One per line: Name — phone" />
                <p style={{ fontSize: 12, color: 'var(--text-label-muted)', marginTop: 6 }}>
                  Passes are issued in these names and are not transferable. Names must reach us by 20 September 2026; email additions to contact@sonicpulsefestival.com.
                </p>
              </div>

              {/* E. The agreement */}
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', fontWeight: 700, marginBottom: 6 }}>
                  The agreement
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', marginBottom: 12 }}>
                  Version v2026-09-14. Read it in full — you sign it by submitting.
                </p>
                {!selectedPkg ? (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: 16, padding: 22, textAlign: 'center' }}>
                    <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>Choose a package above to read its agreement.</p>
                  </div>
                ) : (
                  <div id="agreement" style={{ maxHeight: 460, overflowY: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
                    <ContractText blocks={buildContract(selectedPkg, liveFields)} />
                  </div>
                )}
              </div>

              {ACK_ITEMS.map((item) => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    required
                    checked={acks[item.id]}
                    onChange={() => toggleAck(item.id)}
                    style={{ marginTop: 3, accentColor: 'var(--accent-magenta)', width: 16, height: 16, touchAction: 'manipulation' }}
                  />
                  {item.label}
                </label>
              ))}

              <div>
                <label style={labelStyle} htmlFor="vd-sig-name">Signatory name (print) <Required /></label>
                <input id="vd-sig-name" style={fieldStyle} required value={form.signatoryName} onChange={set('signatoryName')} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="vd-sig-designation">Designation <Required /></label>
                <input id="vd-sig-designation" style={fieldStyle} required value={form.signatoryDesignation} onChange={set('signatoryDesignation')} placeholder="Owner, proprietor, manager…" />
              </div>

              {status === 'error' && (
                <p style={{ fontSize: 13, color: '#e24b4a' }} aria-live="polite">{errorMsg}</p>
              )}

              <PillButton type="submit" disabled={status === 'submitting' || !allAcked} style={{ width: '100%', marginTop: 6 }}>
                {status === 'submitting' ? 'Signing…' : 'Sign and submit application →'}
              </PillButton>

              <p style={{ fontSize: 11.5, color: 'var(--text-label-muted)', textAlign: 'center' }}>
                Your booking is confirmed only when the full Stall Fee has cleared and Dhaka Music Festival sends written confirmation.
              </p>
            </form>
          )}
        </section>
      )}

      {/* G. Standalone receipt section */}
      <section id="receipt" style={{ marginTop: 56 }}>
        <ReceiptUpload />
      </section>

      {/* H. Contact line */}
      <p style={{ fontSize: 12.5, color: 'var(--text-label-muted)', textAlign: 'center', marginTop: 56 }}>
        Questions before you apply? Email {VENDOR_CONTACT_EMAIL}.
      </p>
    </div>
  )
}
