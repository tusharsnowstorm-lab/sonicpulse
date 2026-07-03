'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

type Area = { x: number; y: number; width: number; height: number }

// react-easy-crop's croppedAreaPixels are already in natural image pixel coordinates.
// Cap output at 900px to keep file size sane while preserving gate-staff clarity.
const OUTPUT_SIZE = 900

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })

  // Cap at OUTPUT_SIZE; never upscale if the crop area is already smaller.
  const size = Math.min(Math.min(pixelCrop.width, pixelCrop.height), OUTPUT_SIZE)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable on this device.')

  // Clip to circle
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  )

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas empty'))), 'image/png', 0.92)
  )
}

type Props = {
  imageSrc: string
  onDone: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

export default function ImageCropModal({ imageSrc, onDone, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedArea(pixelCrop)
  }, [])

  const [cropError, setCropError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!croppedArea) return
    setProcessing(true)
    setCropError(null)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea)
      const previewUrl = URL.createObjectURL(blob)
      onDone(blob, previewUrl)
    } catch (err) {
      setCropError(err instanceof Error ? err.message : 'Failed to process image. Try a different photo.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(14px)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk)' }}>
            Crop your photo
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Drag to reposition · Pinch or scroll to zoom
          </p>
        </div>

        {/* Crop area — touch-action:none prevents iOS scroll hijack during pinch/drag */}
        <div className="relative" style={{ height: 300, background: '#000', touchAction: 'none' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid var(--accent-electric)', boxShadow: '0 0 0 9999px rgba(5,5,8,0.7)' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em' }}>
            ZOOM
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--accent-electric)' }}
          />
        </div>

        {cropError && (
          <p className="px-5 py-3 text-xs" style={{ color: 'var(--accent-pulse)', borderTop: '1px solid var(--border)' }}>{cropError}</p>
        )}

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded text-sm cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={processing}
            className="flex-1 py-2.5 rounded text-sm font-bold cursor-pointer"
            style={{ background: 'var(--accent-electric)', color: '#050508', opacity: processing ? 0.6 : 1 }}
          >
            {processing ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
