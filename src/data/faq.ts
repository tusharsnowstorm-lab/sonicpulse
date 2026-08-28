export type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
  link?: { href: string; label: string }
}

export const faqs: FAQItem[] = [
  // Event Basics
  {
    id: 'what-is-sonic-pulse',
    category: 'Event Basics',
    question: 'What is Sonic Pulse?',
    answer: 'Sonic Pulse is a large-scale outdoor music festival organised by Dhaka Music Festival — @dhakamusicfestival on Instagram. Two stages, 800+ festival-goers, and music from dusk till dawn.',
  },
  {
    id: 'when-where',
    category: 'Event Basics',
    question: 'When and where is it?',
    answer: '25 September 2026 (Friday) at 4 PM through to 9:30 AM Saturday morning. Venue is TBA — full address will be sent to registered attendees via email closer to the event.',
  },
  {
    id: 'event-hours',
    category: 'Event Basics',
    question: 'Is this an all-night event? What are the hours?',
    answer: 'Yes. Doors open at 4 PM on Friday and the event runs through the night until 9:30 AM Saturday morning — 17.5 hours of music. The Main Stage runs from 4 PM to 4:30 AM, then the Sunrise Stage takes over through to 9:30 AM.',
  },
  {
    id: 'rain-policy',
    category: 'Event Basics',
    question: 'Is it outdoors? What happens if it rains?',
    answer: 'The event is primarily outdoors with covered areas available. In the event of severe weather we will update attendees via email and our social channels. The show goes on in light rain.',
  },
  {
    id: 'age-limit',
    category: 'Event Basics',
    question: 'Is there a minimum age to attend?',
    answer: 'Sonic Pulse is open to all ages. Every attendee registers with a valid ID — a National ID, passport, or birth certificate — and the name on the ticket must match the ID presented at the gate.',
  },
  // Tickets & Registration
  {
    id: 'where-to-buy',
    category: 'Tickets & Registration',
    question: 'Where do I buy tickets?',
    answer: 'Tickets are sold only through Afterhours at onlyafterhours.com. Sign up with Google, Apple, or an email magic link, pick your tier, and pay by bKash on the site — the Afterhours app is coming soon. Tier announcements land on @sonicpulsefestival first.',
  },
  {
    id: 'why-nid',
    category: 'Tickets & Registration',
    question: 'Why do I need to provide an ID?',
    answer: 'ID verification helps us keep the event safe and is required under our venue permit conditions. We accept a National ID, passport, or birth certificate. Your data is stored securely and used only for this event.',
  },
  {
    id: 'nid-data-protection',
    category: 'Tickets & Registration',
    question: 'How is my ID data stored and protected?',
    answer: 'Your ID document is stored in a private, encrypted cloud storage — it is never publicly accessible. Only authorised staff can access it, and access is logged. We comply with Bangladesh Digital Security Act obligations.',
  },
  {
    id: 'ticket-transfer',
    category: 'Tickets & Registration',
    question: 'Can I transfer my ticket to someone else?',
    answer: 'Transfers happen through Afterhours, and the new holder goes through the same ID verification. The name on the ticket must always match the ID presented at entry.',
  },
  {
    id: 'lost-ticket',
    category: 'Tickets & Registration',
    question: 'What if I lose my ticket/QR code?',
    answer: 'Your ticket lives in your Afterhours account, so it can\'t be lost or forgotten at home. If you can\'t sign in, email support@onlyafterhours.com.',
  },
  {
    id: 'door-sales',
    category: 'Tickets & Registration',
    question: 'Can I buy tickets at the door?',
    answer: 'No. All tickets are bought in advance through Afterhours — ID verification takes time and cannot be done at the gate.',
  },
  {
    id: 'refund-policy',
    category: 'Tickets & Registration',
    question: 'What is your refund policy?',
    answer: 'All tickets are non-refundable. If the event is cancelled due to circumstances outside the organiser\'s control, your ticket will carry over to the next edition of Sonic Pulse.',
    link: { href: '/policy', label: 'Read the full event policy →' },
  },
  // At the Event
  {
    id: 'what-to-bring',
    category: 'At the Event',
    question: 'What should I bring?',
    answer: 'Your ticket QR ready in your Afterhours account, your original ID matching your registration, comfortable clothes, ear protection (optional but recommended), and your energy.',
  },
  {
    id: 'prohibited',
    category: 'At the Event',
    question: 'What is prohibited at the venue?',
    answer: 'Professional cameras/recording equipment, outside food and drinks, alcohol, narcotics and illegal substances, weapons of any kind, and glass bottles. Security checks are thorough.',
    link: { href: '/policy', label: 'Read the full event policy →' },
  },
  {
    id: 'parking',
    category: 'At the Event',
    question: 'Is there parking?',
    answer: 'Limited parking is available on-site. We strongly recommend arriving by rideshare or in groups. A designated drop-off/pick-up zone will be clearly marked.',
  },
  {
    id: 'food-drinks',
    category: 'At the Event',
    question: 'Will there be food and drinks?',
    answer: 'Yes. Multiple food stalls and drink counters run throughout the night — street food, late-night biryani, a full vegetarian line, iced chai, and hot chai at sunrise. Sonic Pulse is an alcohol-free event: alcohol, narcotics and illegal substances are not permitted anywhere on the premises.',
  },
  {
    id: 'alcohol-free',
    category: 'At the Event',
    question: 'Is alcohol served at the event?',
    answer: 'No. Sonic Pulse is an alcohol-free event. Alcohol, narcotics and illegal substances are not permitted anywhere on the premises, and anyone suspected of being intoxicated may be denied entry or removed. Gate checks are thorough.',
    link: { href: '/policy', label: 'Read the full event policy →' },
  },
  {
    id: 'stages',
    category: 'At the Event',
    question: 'What stages are there and where are they?',
    answer: 'Two stages, running in sequence: the Main Stage (4 PM – 4:30 AM — peak-hour techno and house, full production lighting and sound) and the Sunrise Stage (4:30 – 9:30 AM — intimate, melodic, facing east for the sunrise). A site map will be included in your ticket email.',
  },
  // Accessibility
  {
    id: 'wheelchair',
    category: 'Accessibility',
    question: 'Is the venue wheelchair accessible?',
    answer: 'Yes. Accessible pathways and a dedicated viewing area near both stages are available. Contact us in advance so we can make the right arrangements.',
  },
  {
    id: 'quiet-zone',
    category: 'Accessibility',
    question: 'Is there a quiet zone or chill-out area?',
    answer: 'Yes. A designated chill-out zone away from the main sound systems will be available throughout the event.',
  },
]
