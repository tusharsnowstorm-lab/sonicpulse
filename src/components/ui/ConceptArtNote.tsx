import { CONCEPT_ART_NOTE, CONCEPT_ART_NOTE_LIVE } from '@/data/concept-art'

/** Discreet footnote for AI-generated concept imagery — see §8.10. */
export default function ConceptArtNote({ centered = false }: { centered?: boolean }) {
  if (!CONCEPT_ART_NOTE_LIVE) return null
  return (
    <p
      style={{
        fontSize: 11.5,
        lineHeight: 1.6,
        color: 'var(--text-label-muted)',
        marginTop: 18,
        maxWidth: 560,
        textAlign: centered ? 'center' : 'left',
        marginLeft: centered ? 'auto' : 0,
        marginRight: centered ? 'auto' : 0,
      }}
    >
      {CONCEPT_ART_NOTE}
    </p>
  )
}
