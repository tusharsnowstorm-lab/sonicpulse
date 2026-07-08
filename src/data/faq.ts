export type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
}

export const faqs: FAQItem[] = [
  // Event Basics
  {
    id: 'what-is-sonic-pulse',
    category: 'Event Basics',
    question: 'What is Sonic Pulse?',
    answer: 'Sonic Pulse is a large-scale outdoor music festival organised by Dhaka Music Festival. Two stages, 800+ festival-goers, and music from dusk till dawn.',
  },
  {
    id: 'when-where',
    category: 'Event Basics',
    question: 'When and where is it?',
    answer: '25 September 2026 (Friday) at 4 PM through to 9 AM Saturday morning. Venue is TBA — full address will be sent to registered attendees via email closer to the event.',
  },
  {
    id: 'event-hours',
    category: 'Event Basics',
    question: 'Is this an all-night event? What are the hours?',
    answer: 'Yes. Doors open at 4 PM on Friday and the event runs through the night until 9 AM Saturday morning — 17 hours of music. Both stages operate simultaneously.',
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
    question: 'What is the minimum age to attend?',
    answer: 'You must be 18 or older to attend. Valid government-issued ID (NID) is required at entry. This is enforced strictly.',
  },
  // Tickets & Registration
  {
    id: 'why-nid',
    category: 'Tickets & Registration',
    question: 'Why do I need to provide my National ID?',
    answer: 'NID verification helps us maintain a safe event and is required under our venue permit conditions. Your data is stored securely and used only for this event.',
  },
  {
    id: 'nid-data-protection',
    category: 'Tickets & Registration',
    question: 'How is my NID data stored and protected?',
    answer: 'Your NID document is stored in a private, encrypted cloud storage — it is never publicly accessible. Only authorised staff can access it, and access is logged. We comply with Bangladesh Digital Security Act obligations.',
  },
  {
    id: 'ticket-transfer',
    category: 'Tickets & Registration',
    question: 'Can I transfer my ticket to someone else?',
    answer: 'Tickets are non-transferable. The name on the registration must match the NID presented at entry.',
  },
  {
    id: 'lost-ticket',
    category: 'Tickets & Registration',
    question: 'What if I lose my ticket/QR code?',
    answer: 'Email us at support@sonicpulsedhaka.com with your reference number. We will reissue your ticket.',
  },
  {
    id: 'door-sales',
    category: 'Tickets & Registration',
    question: 'Can I buy tickets at the door?',
    answer: 'No. All tickets must be purchased and registered online in advance. NID verification takes time and cannot be done at the gate.',
  },
  {
    id: 'refund-policy',
    category: 'Tickets & Registration',
    question: 'What is your refund policy?',
    answer: 'All tickets are non-refundable. If the event is cancelled due to circumstances outside the organiser\'s control, your ticket will carry over to the next edition of Sonic Pulse.',
  },
  // At the Event
  {
    id: 'what-to-bring',
    category: 'At the Event',
    question: 'What should I bring?',
    answer: 'Your printed or digital ticket (QR code), your original NID (must match registration), comfortable clothes, ear protection (optional but recommended), and your energy.',
  },
  {
    id: 'prohibited',
    category: 'At the Event',
    question: 'What is prohibited at the venue?',
    answer: 'Professional cameras/recording equipment, outside food and drinks, illegal substances, weapons of any kind, and glass bottles. Security checks are thorough.',
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
    answer: 'Yes. Multiple food stalls and a fully stocked bar will operate throughout the night. We cater to vegetarian and non-vegetarian preferences.',
  },
  {
    id: 'stages',
    category: 'At the Event',
    question: 'What stages are there and where are they?',
    answer: 'Two stages: the Main Stage (peak-hour techno and house, full production lighting and sound) and the Sunrise Stage (intimate, melodic, facing east for the sunrise). A site map will be included in your ticket email.',
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
