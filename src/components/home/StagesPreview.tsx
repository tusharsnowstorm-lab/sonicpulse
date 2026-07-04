const stages = [
  {
    name: 'MAIN STAGE',
    description: 'The centrepiece. Peak-hour techno, house, and big-room energy. Full production lighting, wall-of-sound system, and the crowd you came for.',
    detail: 'Headliners · Peak Hour · Full Production',
    accent: 'var(--accent-volt)',
    poster: '/images/hero-visual.jpg',
    position: 'center center',
  },
  {
    name: 'SUNRISE STAGE',
    description: 'Intimate. Melodic. The sun rises directly behind the decks. This is where the night ends and the morning begins.',
    detail: 'Melodic · Ambient · Sunrise Facing',
    accent: 'var(--accent-electric)',
    poster: '/images/poster-2.webp',
    position: 'center center',
  },
]

export default function StagesPreview() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          The Stages
        </p>
        <h2
          className="text-2xl md:text-3xl font-black mb-10 glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          TWO WORLDS
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.name}
              className="relative rounded-[4px] overflow-hidden"
              style={{
                minHeight: 280,
                backgroundImage: `url(${stage.poster})`,
                backgroundSize: 'cover',
                backgroundPosition: stage.position,
              }}
            >
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(5,5,8,0.88) 0%, rgba(5,5,8,0.60) 100%)' }}
                aria-hidden="true"
              />
              {/* Content */}
              <div className="relative p-6 md:p-8 flex flex-col justify-between" style={{ minHeight: 280 }}>
                <div>
                  <span
                    className="text-xs font-bold tracking-[0.3em] uppercase"
                    style={{ fontFamily: 'var(--font-jetbrains-mono)', color: stage.accent }}
                  >
                    {stage.name}
                  </span>
                  <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
                    {stage.description}
                  </p>
                </div>
                <p
                  className="mt-6 text-xs tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  {stage.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
