import Image from 'next/image'

type PhotoCardProps = {
  src: string
  alt: string
  title: string
  caption?: string
  /** '3/4' for artist portraits, '4/3' for experience cards, '16/9' for wide */
  ratio?: '3/4' | '4/3' | '16/9'
  sizes?: string
  priority?: boolean
  /** 'tracked' — short uppercase caption (artist times). 'prose' — a full sentence (experience cards). */
  captionStyle?: 'tracked' | 'prose'
}

/** Image + bottom scrim + meta text — the gallery-style card used for artists and experience. */
export default function PhotoCard({ src, alt, title, caption, ratio = '3/4', sizes = '(max-width: 640px) 50vw, 25vw', priority = false, captionStyle = 'tracked' }: PhotoCardProps) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: ratio.replace('/', ' / '),
        overflow: 'hidden',
        borderRadius: 0,
      }}
      className="photo-card"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)' }}
        className="photo-card-img"
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 22,
          textAlign: 'left',
          zIndex: 2,
        }}
      >
        <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-montserrat)', margin: 0 }}>{title}</p>
        {caption && captionStyle === 'tracked' && (
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 4,
            }}
          >
            {caption}
          </p>
        )}
        {caption && captionStyle === 'prose' && (
          <p
            style={{
              fontSize: 12.5,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 5,
              lineHeight: 1.5,
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
