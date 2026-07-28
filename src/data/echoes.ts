export type Echo = {
  id: string
  roman: string
  phase: string
  name: string
  tail: string
  where: string
  lore: string
  onSite: string
  image: string | null
}

/** The Nine Echoes — gate to burn, in trail order. */
export const echoes: Echo[] = [
  {
    id: 'coilgate',
    roman: 'I',
    phase: 'The Gate',
    name: 'COILGATE',
    tail: 'The First Loop',
    where: 'Main entrance — the first thing every guest sees',
    lore: 'The serpent that swallowed the first sound and has circled it ever since. You enter the night through its coil, and inside, time runs on BPM instead of clocks. Meet its eye on the way in — it will already be looking at you.',
    onSite: 'Ember-lit scales, teal glass eye, kites and jellies visible through the arch. The oldest symbol of the loop — every set, every night, every year feeding back into itself.',
    image: '/images/echoes/coilgate.webp',
  },
  {
    id: 'glowtide',
    roman: 'II',
    phase: 'The Walkway',
    name: 'GLOWTIDE',
    tail: 'The Migration of Dreams',
    where: 'From the gate into the heart of the grounds',
    lore: "The current that pulls every wanderer inward — gently, and without asking. The jellies overhead migrate along it all night, feeding on bass and lantern light. Walk it slowly: arrival isn't a race, it's a descent into deeper water.",
    onSite: "Glowing jellyfish avenue between lit poles and lanterns — the festival's bloodstream, gate to heart.",
    image: '/images/echoes/glowtide.webp',
  },
  {
    id: 'event-horizon',
    roman: 'III',
    phase: 'The Bridge',
    name: 'EVENT HORIZON',
    tail: 'Bridge of Light',
    where: 'The short bridge across the lake, into the alcove',
    lore: 'A bridge strung with so much light it stops being a bridge. Cross it with a question and the alcove on the other side answers quietly. Everyone comes back across the Horizon a little lighter than they went.',
    onSite: 'Tunnel-of-light dressing over the existing bridge; the Styx boats pass beneath.',
    image: null,
  },
  {
    id: 'mycelia',
    roman: 'IV',
    phase: 'Overhead',
    name: 'MYCELIA',
    tail: 'Dream of the Forest Floor',
    where: 'Hanging above the grove — soft light, fairy weather',
    lore: "The forest has always talked underground — root to root, a whisper-web beneath the grass. On the night the Signal fell, the network dreamed for the first time, and its dream floated up: soft-lit blooms hanging overhead. Stand beneath them and you're inside the forest's dream.",
    onSite: 'Giant lit mushroom-medusa canopies hanging overhead among the trees — half coral, half toadstool, all glow.',
    image: '/images/echoes/mycelia.webp',
  },
  {
    id: 'emberhart',
    roman: 'V',
    phase: 'The Keeper',
    name: 'EMBERHART',
    tail: 'Keeper of the Wilds',
    where: 'Standing watch over the open field, fully lit',
    lore: "The antlered keeper walked out of the floodplain on the first night, antlers tuned like antennae, eyes lit with embers of the first burn. It hasn't moved since. Regulars insist it does — but only when nobody's watching.",
    onSite: '"Hart" — the old word for a crowned stag; ember for the eyes.',
    image: '/images/echoes/emberhart.webp',
  },
  {
    id: 'chroma',
    roman: 'VI',
    phase: 'The Climb',
    name: 'CHROMA',
    tail: 'Beast of Broken Light',
    where: 'Climbable — stairs up the mane to the crown',
    lore: 'A creature assembled from every wish that was ever dismissed as childish. Each stair up its mane is a wish somebody gave up on; climb them and give those wishes somewhere to go. From the crown, the whole dreamscape is yours.',
    onSite: 'Iridescent glass-panel beast, lit stair spiralling up the mane, horn throwing a beam that splits the night into color.',
    image: '/images/echoes/chroma.webp',
  },
  {
    id: 'empty-throne',
    roman: 'VII',
    phase: 'The Overlook',
    name: 'THE EMPTY THRONE',
    tail: 'Seat of No King',
    where: 'Climbable — stand on the seat and see the whole field',
    lore: "A throne built for whoever runs the night. Nobody runs the night. So it stands empty — which means, for one climb, it's yours. Reign for a minute. Survey your kingdom. Come down humble.",
    onSite: "Oversized chair in warm neon trim, twin flame torches, guests allowed up for the view — the grounds' highest legal vantage point.",
    image: '/images/echoes/empty-throne.webp',
  },
  {
    id: 'cloud-nine',
    roman: 'VIII',
    phase: 'The Rest',
    name: 'CLOUD NINE',
    tail: 'The Star Nets',
    where: 'The raised nets over the grass — lie down, look up',
    lore: 'Woven to catch falling stars, the nets caught dreamers instead. Lie back and the mesh hums with the far stage\'s bass like a slow heartbeat. The only place on the grounds where doing nothing is doing everything.',
    onSite: 'Nine bamboo-framed net bays with warm edge light, radiating from a floating center — the name is literal. Doubles as the activity of the same name.',
    image: '/images/echoes/cloud-nine.webp',
  },
  {
    id: 'icarus',
    roman: 'IX',
    phase: 'The Finale',
    name: 'ICARUS',
    tail: 'The Last Transmission',
    where: 'The ritual ground — burned at the Great Burn',
    lore: "Every festival ends. Ours transmits. Icarus is a giant kite of bamboo and woven light that spends the night collecting what the crowd wants to release — then flies the only way a message that heavy can: as fire. They said don't fly too close to the sun. Icarus brings the sun to the field instead. The sparks that rise are the reply.",
    onSite: 'Monumental kite, psychedelic lit panels, braided tail; ribbon-writing station beside it all night until the burn.',
    image: '/images/echoes/icarus.webp',
  },
]
