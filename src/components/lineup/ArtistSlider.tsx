'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { acts } from '@/data/lineup'

function Slide({ act }: { act: (typeof acts)[number] }) {
  const [bioOpen, setBioOpen] = useState(false)

  return (
    <article
      className="grid md:grid-cols-12"
      style={{
        flex: '0 0 100%',
        scrollSnapAlign: 'start',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      <div className="md:col-span-5 relative" style={{ minHeight: 340 }}>
        {act.poster ? (
          <Image
            src={act.poster}
            alt={`${act.name} poster`}
            fill
            sizes="(max-width: 768px) 100vw, 42vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2"
            style={{
              padding: 30,
              background:
                'radial-gradient(120% 90% at 70% 10%, rgba(163,79,255,0.25), transparent 60%), radial-gradient(120% 90% at 20% 90%, rgba(255,63,194,0.18), transparent 55%), #0d0416',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>{act.name}</span>
            <span style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              {act.href ? 'Applications open' : 'Poster & bio pending'}
            </span>
          </div>
        )}
      </div>

      <div className="md:col-span-7 flex flex-col gap-4" style={{ padding: '34px 36px 30px' }} id={act.href ? undefined : act.id}>
        <span
          className="self-start inline-flex items-center gap-2"
          style={{
            border: '1px solid var(--accent-soft)',
            background: 'var(--accent-faint)',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-magenta)' }} />
          {act.time} · {act.tag.toUpperCase()}
        </span>

        <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '0.01em', color: '#fff', fontFamily: 'var(--font-montserrat)' }}>
          {act.name}
        </h3>

        <p style={{ color: 'var(--accent-magenta)', fontWeight: 600, fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {act.hook}
        </p>

        <p style={{ color: 'var(--text-dim)', fontSize: 14.5, maxWidth: '56ch', lineHeight: 1.65 }}>{act.bio}</p>

        {act.href && (
          <Link
            href={act.href}
            className="self-start inline-flex items-center"
            style={{
              border: '1px solid var(--border-strong)',
              borderRadius: 999,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              touchAction: 'manipulation',
            }}
          >
            Apply for First Pulse →
          </Link>
        )}

        {act.bioCard && (
          <>
            <button
              type="button"
              onClick={() => setBioOpen((o) => !o)}
              className="self-start"
              style={{
                border: '1px solid var(--border-strong)',
                background: 'none',
                color: 'var(--text-dim)',
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {bioOpen ? 'Hide bio card' : 'View bio card'}
            </button>
            {bioOpen && (
              <div style={{ maxWidth: 300 }}>
                <Image
                  src={act.bioCard}
                  alt={`${act.name} bio card`}
                  width={1080}
                  height={1350}
                  sizes="300px"
                  style={{ width: '100%', height: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}

export default function ArtistSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const go = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(acts.length - 1, i))
    track.scrollTo({ left: clamped * (track.clientWidth + 20), behavior: 'smooth' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth)
      setIndex(i)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div>
      <div
        ref={trackRef}
        className="flex"
        style={{ gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {acts.map((act) => (
          <Slide key={act.id} act={act} />
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 18 }}>
        <div className="flex" style={{ gap: 8 }} role="tablist" aria-label="Slide position">
          {acts.map((act, i) => (
            <button
              key={act.id}
              type="button"
              aria-label={`Go to ${act.name}`}
              onClick={() => go(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                background: i === index ? 'var(--accent-magenta)' : 'var(--border-strong)',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            />
          ))}
        </div>
        <div className="flex" style={{ gap: 10 }}>
          <button
            type="button"
            aria-label="Previous artist"
            onClick={() => go(index - 1)}
            className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', color: '#fff', cursor: 'pointer', touchAction: 'manipulation' }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next artist"
            onClick={() => go(index + 1)}
            className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', color: '#fff', cursor: 'pointer', touchAction: 'manipulation' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
