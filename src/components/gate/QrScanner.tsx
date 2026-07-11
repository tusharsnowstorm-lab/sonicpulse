'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, AlertCircle } from 'lucide-react'

type Props = { onClose: () => void }

export default function QrScanner({ onClose }: Props) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [detected, setDetected] = useState<string | null>(null)
  const scannerRef = useRef<import('@zxing/browser').BrowserQRCodeReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let active = true

    const start = async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        const reader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 200,
        })
        scannerRef.current = reader

        // Prefer back camera on mobile
        const devices = await BrowserQRCodeReader.listVideoInputDevices()
        const backCamera = devices.find(
          (d) => /back|rear|environment/i.test(d.label)
        ) ?? devices[0]

        const deviceId = backCamera?.deviceId

        if (!videoRef.current) return

        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (!active) return
            if (result) {
              const text = result.getText().trim()

              // Extract reference code from full verify URL or bare code
              let ref: string | null = null
              const urlMatch = text.match(/\/verify\/([^/?#\s]+)/i)
              if (urlMatch) {
                ref = urlMatch[1].toUpperCase()
              } else {
                const codeMatch = text.match(/SP-[A-Z0-9]+/i)
                if (codeMatch) ref = codeMatch[0].toUpperCase()
              }

              if (ref) {
                setDetected(ref)
                controls.stop()
                setTimeout(() => {
                  if (active) {
                    router.push(`/verify/${ref}`)
                    onClose()
                  }
                }, 600)
              }
            }
          }
        )
        controlsRef.current = controls
      } catch (e: unknown) {
        if (!active) return
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setError('Camera access was denied. Please allow camera permission and try again.')
        } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
          setError('No camera found on this device.')
        } else {
          setError('Could not start camera. Please try again.')
        }
      }
    }

    start()

    return () => {
      active = false
      controlsRef.current?.stop()
    }
  }, [router, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.97)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <p className="font-bold text-sm" style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-montserrat)', letterSpacing: '0.1em' }}>
          Scan ticket QR code
        </p>
        <button
          onClick={onClose}
          type="button"
          style={{ width: 44, height: 44, color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}
          className="flex items-center justify-center"
          aria-label="Close scanner"
        >
          <X size={24} />
        </button>
      </div>

      {/* Camera / error area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {error ? (
          <div className="text-center space-y-4">
            <AlertCircle size={48} style={{ color: '#e24b4a', margin: '0 auto' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: '#fff', touchAction: 'manipulation' }}
            >
              Go back
            </button>
          </div>
        ) : detected ? (
          <div className="text-center space-y-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'var(--accent-faint)', border: '2px solid var(--accent-magenta)' }}
            >
              <span style={{ fontSize: 28, color: 'var(--accent-magenta)' }}>✓</span>
            </div>
            <p className="font-bold" style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-montserrat)' }}>
              Code detected
            </p>
            <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.72)' }}>{detected}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Opening ticket…</p>
          </div>
        ) : (
          <>
            {/* Viewfinder */}
            <div className="relative w-full max-w-[320px]">
              <video
                ref={videoRef}
                className="w-full rounded-2xl"
                style={{ aspectRatio: '1 / 1', objectFit: 'cover', background: '#111' }}
                playsInline
                muted
              />
              {/* Corner guides */}
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-8 h-8 ${cls}`}
                  style={{ borderColor: 'var(--accent-magenta)' }}
                />
              ))}
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Camera size={14} style={{ color: 'var(--accent-magenta)' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Point camera at the QR code on the ticket
                </p>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Keep the code within the frame
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
