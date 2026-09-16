/**
 * Release 1 seed data for events. Shaped so Release 2 can swap this module
 * for a real API client without touching the components that consume it:
 * every bilingual string is `{ en, es }`, dates are ISO strings, and the
 * capacity/beneficiary/donation fields already match what a booking backend
 * would need to track.
 */

export interface LocalizedText {
  en: string
  es: string
}

export type EventCategory = 'soccer' | 'basketball' | 'running' | 'volleyball'

export interface EventVenue {
  name: string
  /** Full postal address, used both for display and for the "get directions" maps link. */
  address: string
}

export interface EventDonationDrive {
  /** e.g. "Non-perishable food", "Winter coats" */
  itemType: LocalizedText
  /** Specific suggestions for what to bring. */
  suggestion: LocalizedText
}

export interface KarmaEvent {
  slug: string
  title: LocalizedText
  description: LocalizedText
  category: EventCategory
  /** ISO 8601 datetime string. */
  startsAt: string
  /** ISO 8601 datetime string. */
  endsAt: string
  venue: EventVenue
  capacity: number
  spotsTaken: number
  donation: EventDonationDrive
  beneficiary: LocalizedText
  /** True for events that repeat on a schedule (each occurrence is still its own row in R1). */
  recurring: boolean
  /** Groups occurrences of the same recurring event together for future backend use. */
  seriesId?: string
}

const CASA_ESPERANZA: LocalizedText = {
  en: 'Casa Esperanza Foster Home',
  es: 'Casa Esperanza, Hogar de Acogida',
}

const ST_ANNES: LocalizedText = {
  en: "St. Anne's Youth Shelter",
  es: 'Refugio Juvenil St. Anne',
}

const BRIGHT_PATH: LocalizedText = {
  en: 'Bright Path Family Center',
  es: 'Centro Familiar Bright Path',
}

const RIVERSIDE_FIELDS: EventVenue = {
  name: 'Riverside Park Fields',
  address: '1200 Riverside Dr, Springfield, IL 62701',
}

const EASTSIDE_REC: EventVenue = {
  name: 'Eastside Recreation Center',
  address: '845 Eastside Ave, Springfield, IL 62703',
}

const LAKESIDE_TRAILHEAD: EventVenue = {
  name: 'Lakeside Trailhead',
  address: '30 Lakeshore Rd, Springfield, IL 62704',
}

const DOWNTOWN_PLAZA: EventVenue = {
  name: 'Downtown Springfield Plaza',
  address: '2 Old State Capitol Plaza, Springfield, IL 62701',
}

const MARNER_SAND_COURTS: EventVenue = {
  name: 'Marner Park Sand Courts',
  address: '410 Marner Way, Springfield, IL 62702',
}

export const events: KarmaEvent[] = [
  {
    slug: 'sunday-pickup-soccer-2026-09-20',
    title: { en: 'Sunday Pickup Soccer', es: 'Fútbol Casual del Domingo' },
    description: {
      en: 'A relaxed, all-levels pickup game on the big grass fields. Cleats optional, good attitude required. We split teams on the spot, so come alone or bring a crowd.',
      es: 'Un partido casual para todos los niveles en las canchas de césped. Los tacos son opcionales, la buena actitud es obligatoria. Formamos los equipos en el momento, así que puedes venir solo o con tu gente.',
    },
    category: 'soccer',
    startsAt: '2026-09-20T09:00:00',
    endsAt: '2026-09-20T11:00:00',
    venue: RIVERSIDE_FIELDS,
    capacity: 30,
    spotsTaken: 24,
    donation: {
      itemType: { en: 'Non-perishable food', es: 'Alimentos no perecederos' },
      suggestion: {
        en: 'Canned vegetables, rice, pasta, or peanut butter. One bag per family is plenty.',
        es: 'Verduras enlatadas, arroz, pasta o crema de cacahuate. Con una bolsa por familia es suficiente.',
      },
    },
    beneficiary: CASA_ESPERANZA,
    recurring: true,
    seriesId: 'sunday-soccer',
  },
  {
    slug: 'sunday-pickup-soccer-2026-09-27',
    title: { en: 'Sunday Pickup Soccer', es: 'Fútbol Casual del Domingo' },
    description: {
      en: 'A relaxed, all-levels pickup game on the big grass fields. Cleats optional, good attitude required. We split teams on the spot, so come alone or bring a crowd.',
      es: 'Un partido casual para todos los niveles en las canchas de césped. Los tacos son opcionales, la buena actitud es obligatoria. Formamos los equipos en el momento, así que puedes venir solo o con tu gente.',
    },
    category: 'soccer',
    startsAt: '2026-09-27T09:00:00',
    endsAt: '2026-09-27T11:00:00',
    venue: RIVERSIDE_FIELDS,
    capacity: 30,
    spotsTaken: 11,
    donation: {
      itemType: { en: 'Non-perishable food', es: 'Alimentos no perecederos' },
      suggestion: {
        en: 'Canned vegetables, rice, pasta, or peanut butter. One bag per family is plenty.',
        es: 'Verduras enlatadas, arroz, pasta o crema de cacahuate. Con una bolsa por familia es suficiente.',
      },
    },
    beneficiary: CASA_ESPERANZA,
    recurring: true,
    seriesId: 'sunday-soccer',
  },
  {
    slug: 'tuesday-night-basketball-2026-09-22',
    title: { en: 'Tuesday Night Basketball', es: 'Básquetbol de los Martes' },
    description: {
      en: 'Full-court runs indoors under the lights. Bring light and dark shirts — teams get picked when you walk in the door.',
      es: 'Partidos de cancha completa bajo techo. Trae una playera clara y una oscura: los equipos se forman apenas llegas.',
    },
    category: 'basketball',
    startsAt: '2026-09-22T19:00:00',
    endsAt: '2026-09-22T21:00:00',
    venue: EASTSIDE_REC,
    capacity: 20,
    spotsTaken: 19,
    donation: {
      itemType: { en: 'Hygiene essentials', es: 'Artículos de higiene' },
      suggestion: {
        en: 'Travel-size soap, shampoo, toothpaste, and deodorant for teens in shelter care.',
        es: 'Jabón, champú, pasta dental y desodorante de tamaño viaje para adolescentes en el refugio.',
      },
    },
    beneficiary: ST_ANNES,
    recurring: true,
    seriesId: 'tuesday-basketball',
  },
  {
    slug: 'thursday-community-run-2026-09-24',
    title: { en: 'Thursday Community Run', es: 'Carrera Comunitaria del Jueves' },
    description: {
      en: 'An easy 5K loop along the lake before work. All paces welcome — we stay together as a group and finish with coffee.',
      es: 'Una vuelta tranquila de 5K junto al lago antes del trabajo. Todos los ritmos son bienvenidos: nos mantenemos juntos como grupo y terminamos con café.',
    },
    category: 'running',
    startsAt: '2026-09-24T06:00:00',
    endsAt: '2026-09-24T07:00:00',
    venue: LAKESIDE_TRAILHEAD,
    capacity: 40,
    spotsTaken: 16,
    donation: {
      itemType: { en: 'School supplies', es: 'Útiles escolares' },
      suggestion: {
        en: 'Notebooks, pencils, backpacks, and folders for kids heading back to class.',
        es: 'Cuadernos, lápices, mochilas y carpetas para los niños que regresan a clases.',
      },
    },
    beneficiary: BRIGHT_PATH,
    recurring: true,
    seriesId: 'thursday-run',
  },
  {
    slug: 'community-5k-fun-run-2026-10-03',
    title: { en: 'Community 5K Fun Run', es: 'Carrera Comunitaria de 5K' },
    description: {
      en: 'Our biggest run of the fall — a closed-course 5K through downtown with a finish-line block party. Strollers and walkers welcome.',
      es: 'Nuestra carrera más grande del otoño: un circuito cerrado de 5K por el centro con fiesta en la meta. Carreolas y caminantes son bienvenidos.',
    },
    category: 'running',
    startsAt: '2026-10-03T08:00:00',
    endsAt: '2026-10-03T10:00:00',
    venue: DOWNTOWN_PLAZA,
    capacity: 100,
    spotsTaken: 100,
    donation: {
      itemType: { en: 'Winter coats', es: 'Abrigos de invierno' },
      suggestion: {
        en: 'New or gently used coats in kids’ and adult sizes.',
        es: 'Abrigos nuevos o en buen estado, en tallas infantiles y de adulto.',
      },
    },
    beneficiary: BRIGHT_PATH,
    recurring: false,
  },
  {
    slug: 'sunset-volleyball-social-2026-10-10',
    title: { en: 'Sunset Volleyball Social', es: 'Vóleibol al Atardecer' },
    description: {
      en: 'Casual sand volleyball as the sun goes down. Rotating teams, string lights, and music after the last set.',
      es: 'Vóleibol de arena, sin presión, mientras cae el sol. Equipos rotativos, luces y música después del último set.',
    },
    category: 'volleyball',
    startsAt: '2026-10-10T17:00:00',
    endsAt: '2026-10-10T19:00:00',
    venue: MARNER_SAND_COURTS,
    capacity: 24,
    spotsTaken: 21,
    donation: {
      itemType: { en: 'Winter coats', es: 'Abrigos de invierno' },
      suggestion: {
        en: 'Coats, gloves, and hats — any size helps as it gets colder.',
        es: 'Abrigos, guantes y gorros de cualquier talla; todo ayuda cuando baja la temperatura.',
      },
    },
    beneficiary: ST_ANNES,
    recurring: false,
  },
  {
    slug: 'fall-basketball-tournament-2026-10-18',
    title: { en: '3-on-3 Fall Basketball Tournament', es: 'Torneo de Otoño de Básquetbol 3 contra 3' },
    description: {
      en: 'A one-day bracket tournament, teams of three. Sign up solo and we’ll place you on a squad, or come with your own.',
      es: 'Torneo de un día en formato de eliminación, equipos de tres. Inscríbete solo y te asignamos un equipo, o ven con el tuyo.',
    },
    category: 'basketball',
    startsAt: '2026-10-18T10:00:00',
    endsAt: '2026-10-18T16:00:00',
    venue: EASTSIDE_REC,
    capacity: 64,
    spotsTaken: 38,
    donation: {
      itemType: { en: 'Non-perishable food', es: 'Alimentos no perecederos' },
      suggestion: {
        en: 'Canned goods, cereal, and shelf-stable milk for pantry restocking.',
        es: 'Alimentos enlatados, cereal y leche de larga duración para reabastecer la despensa.',
      },
    },
    beneficiary: CASA_ESPERANZA,
    recurring: false,
  },
  {
    slug: 'thanksgiving-food-drive-match-2026-11-21',
    title: { en: 'Thanksgiving Food Drive Match', es: 'Partido Pro Cena de Acción de Gracias' },
    description: {
      en: 'A festive pickup soccer match dedicated to stocking Thanksgiving boxes for local foster families. Wear orange if you’ve got it.',
      es: 'Un partido festivo de fútbol casual dedicado a preparar canastas de Acción de Gracias para familias de acogida locales. Si tienes algo naranja, ¡úsalo!',
    },
    category: 'soccer',
    startsAt: '2026-11-21T10:00:00',
    endsAt: '2026-11-21T13:00:00',
    venue: RIVERSIDE_FIELDS,
    capacity: 50,
    spotsTaken: 9,
    donation: {
      itemType: { en: 'Thanksgiving food boxes', es: 'Canastas de Acción de Gracias' },
      suggestion: {
        en: 'A frozen turkey or ham, stuffing, canned vegetables, and pie mix.',
        es: 'Un pavo o jamón congelado, relleno, verduras enlatadas y mezcla para pay.',
      },
    },
    beneficiary: CASA_ESPERANZA,
    recurring: false,
  },
  {
    slug: 'turkey-trot-charity-run-2026-11-26',
    title: { en: 'Turkey Trot Charity Run', es: 'Carrera Benéfica del Pavo' },
    description: {
      en: 'A Thanksgiving-morning 5K to earn your seat at the table. Costumes encouraged, seriousness discouraged.',
      es: 'Una carrera de 5K la mañana de Acción de Gracias para ganarte tu lugar en la mesa. Los disfraces se aplauden, la seriedad no tanto.',
    },
    category: 'running',
    startsAt: '2026-11-26T08:00:00',
    endsAt: '2026-11-26T09:30:00',
    venue: LAKESIDE_TRAILHEAD,
    capacity: 150,
    spotsTaken: 40,
    donation: {
      itemType: { en: 'Warm coats & blankets', es: 'Abrigos y cobijas' },
      suggestion: {
        en: 'Coats, blankets, and gloves to get shelter residents through the winter.',
        es: 'Abrigos, cobijas y guantes para que los residentes del refugio pasen bien el invierno.',
      },
    },
    beneficiary: ST_ANNES,
    recurring: false,
  },
  {
    slug: 'back-to-school-pickup-soccer-2026-08-15',
    title: { en: 'Back-to-School Pickup Soccer', es: 'Fútbol Casual de Regreso a Clases' },
    description: {
      en: 'We kicked off the school year with a full pitch of pickup soccer and a mountain of backpacks for local kids.',
      es: 'Arrancamos el año escolar con un partido de fútbol casual y una montaña de mochilas para los niños de la comunidad.',
    },
    category: 'soccer',
    startsAt: '2026-08-15T09:00:00',
    endsAt: '2026-08-15T11:00:00',
    venue: RIVERSIDE_FIELDS,
    capacity: 30,
    spotsTaken: 30,
    donation: {
      itemType: { en: 'School supplies', es: 'Útiles escolares' },
      suggestion: {
        en: 'Backpacks, notebooks, and pencil cases.',
        es: 'Mochilas, cuadernos y estuches.',
      },
    },
    beneficiary: BRIGHT_PATH,
    recurring: false,
  },
]

export function getUpcomingEvents(reference: Date = new Date()): KarmaEvent[] {
  return events
    .filter((event) => new Date(event.endsAt) >= reference)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

export function getPastEvents(reference: Date = new Date()): KarmaEvent[] {
  return events
    .filter((event) => new Date(event.endsAt) < reference)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
}

export function findEventBySlug(slug: string): KarmaEvent | undefined {
  return events.find((event) => event.slug === slug)
}
