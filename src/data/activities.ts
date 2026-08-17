export type Activity = {
  id: string
  kicker: string
  name: string
  tail: string
  hook: string
  extended: string
  caption?: string
  image: string | null
}

export const activities: Activity[] = [
  {
    id: 'ember-rites',
    kicker: 'Fire show',
    name: 'EMBER RITES',
    tail: 'Dancers of Flame',
    hook: 'Fire dancers rewrite the dark in ropes of live spark — held close enough to feel on your face.',
    extended: 'Performances run in waves through the night at the ritual ground beneath the glyph wall. Spinners, breathers and whip artists trace the Signal\'s loops in flame while the far stage bleeds bass across the field. Stand inside the drum circle\'s edge — close enough for heat, behind the ember line. Final rite leads the crowd to the Great Burn.',
    image: '/images/activities/ember-rites.webp',
  },
  {
    id: 'great-burn',
    kicker: 'Bonfire',
    name: 'THE GREAT BURN',
    tail: 'Night of Release',
    hook: "One match. Twelve feet of lore. The whole night's weight, released at once.",
    extended: "All night, Icarus — the giant kite (Echo XII) — collects paper ribbons where guests write the thing they came to let go of. Then the drums stop, the field goes dark, and the kite takes its only flight: as fire. A minute of silence, then the heaviest drop of the night. This is the moment people will describe badly to their friends for a year.",
    caption: 'Midnight, inside the Night Rituals block.',
    image: '/images/activities/great-burn.webp',
  },
  {
    id: 'warpaint',
    kicker: 'Glow painting',
    name: 'WARPAINT',
    tail: 'Skin of Light',
    hook: "UV artists mark you in the Signal's own handwriting. Your crew, one constellation.",
    extended: 'The glyphs burned into the gate, the boats and the feast stalls have an alphabet — and the paint station is where it gets written on skin. Pick a line of the lore or let the artist read you and improvise. The paint blazes under the stage UV rigs and washes off in the morning. What it says doesn\'t.',
    image: '/images/activities/warpaint.webp',
  },
  {
    id: 'neon-lagoon',
    kicker: 'Poolside',
    name: 'NEON LAGOON',
    tail: 'Water That Glows Back',
    hook: 'A pool that glows back. Float in color while the bass rolls across the water.',
    extended: "The pool deck is tiled in lit glyphs and the water runs cyan-to-magenta all night. Loungers, towels and a slow poolside selector who never rushes anyone anywhere. At dawn it turns into the best seat in the house: Drip and Rii's sunrise sets carry across the water. Bring shorts, leave dignity — the 7 AM swim is a rite.",
    image: '/images/activities/neon-lagoon.webp',
  },
  {
    id: 'starside',
    kicker: 'Stargazing',
    name: 'STARSIDE',
    tail: 'The Whisper Hour',
    hook: "Lights face down; eyes go up. The delta sky, narrated — you're looking at where the Signal came from.",
    extended: "In the quiet hours a guide sets up scopes on the dark side of the grounds, away from the rigs. Star maps, a laser pointer, and the version of the lore where every constellation the artists wear on their skin is real and overhead. Best paired with the Cloud Nine nets next door.",
    image: null,
  },
  {
    id: 'styx',
    kicker: 'Boating',
    name: 'STYX',
    tail: 'The Silent Ferry',
    hook: 'Glide black water in a glowing boat between carved stone lanterns. The quietest set of the night is out here.',
    extended: 'Circuit-lit boats, two to four seekers each, drifting a channel of carved stone lanterns. Mist on the water, the far stage reduced to a heartbeat. The route passes under Event Horizon, the portal of light (Echo IV) — and boat crews swear the water under the bridge plays a note nothing on land does.',
    image: '/images/activities/styx.webp',
  },
  {
    id: 'bazaar-of-echoes',
    kicker: 'Marketplace',
    name: 'BAZAAR OF ECHOES',
    tail: 'Trades of Wonder',
    hook: 'A night bazaar of makers — wearables, prints, and oddities that glow in the temple lanes.',
    extended: 'Designers, UV jewellers, print artists and the installation crews selling miniatures of the Twelve Echoes. Everything under strings of neon in the temple lanes. At 3 AM the bazaar runs a barter hour — money down, trades only — which is exactly as chaotic and beautiful as it sounds.',
    image: '/images/activities/bazaar-of-echoes.webp',
  },
  {
    id: 'feast-quarter',
    kicker: 'Food stalls',
    name: 'FEAST QUARTER',
    tail: 'Fire and Ice',
    hook: 'Eating as ceremony. Open flame on one side, iced chai and cold treats on the other — until the last beat, and a while after.',
    extended: 'Stone counters, open flame, glyphs glowing under the woks — and across the lane, the cold side: iced chai, kulfi and frozen treats for the sweat-drenched. Street classics next to late-night biryani, a full vegetarian line, and hot chai at sunrise poured for whoever\'s still standing. The quarter never closes while the music plays — refuelling is part of the ritual, not a break from it.',
    image: '/images/activities/feast-quarter.webp',
  },
  {
    id: 'cloud-nine',
    kicker: 'Net platforms',
    name: 'CLOUD NINE',
    tail: 'The Star Nets',
    hook: 'Raised star-nets over the grass. Sit, sprawl, sink — the mesh hums with the far stage\'s bass.',
    extended: 'A hive of lit nets stretched between bamboo pillars, raised off the grass — nine bays around a floating center. Shoes off, climb in, lie back. The netting carries the sub-bass like a slow heartbeat and the sky does the rest. Doubles as Echo XI in the lore. Best hours: 4 to 6 AM, between the peak and the sunrise sets. The only place on the grounds where doing nothing is doing everything.',
    image: '/images/echoes/cloud-nine.webp',
  },
]
