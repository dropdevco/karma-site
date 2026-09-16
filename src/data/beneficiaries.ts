/* Placeholder seed data. Real partner names, descriptions, and needs
   will be updated as Karma establishes partnerships. */

export interface Beneficiary {
  slug: string
  name: string
  category: 'foster-home' | 'family-services' | 'youth-shelter' | 'housing-support'
  description: {
    en: string
    es: string
  }
  mostNeeded: {
    en: string
    es: string
  }
  servesAround: {
    en: string
    es: string
  }
}

export const beneficiaries: Beneficiary[] = [
  {
    slug: 'riverside-family-services',
    name: 'Riverside Family Services',
    category: 'family-services',
    description: {
      en: 'Supports families in transition with case management, emergency funds, and housing assistance. Works with foster families and kinship caregivers.',
      es: 'Apoya a familias en transición con gestión de casos, fondos de emergencia y asistencia de vivienda. Trabaja con familias de acogida y cuidadores de parentesco.',
    },
    mostNeeded: {
      en: 'Canned proteins, shelf-stable baby food, household cleaning supplies',
      es: 'Proteínas enlatadas, comida para bebés de larga duración, artículos de limpieza del hogar',
    },
    servesAround: {
      en: 'Central city, East neighborhoods',
      es: 'Centro de la ciudad, vecindarios del Este',
    },
  },
  {
    slug: 'oakmont-foster-home',
    name: 'Oakmont Foster Collective',
    category: 'foster-home',
    description: {
      en: 'Network of licensed foster homes providing trauma-informed care to children ages 5–17. Each home cares for 4–6 kids.',
      es: 'Red de hogares de acogida autorizados que brindan atención informada por trauma a niños de 5 a 17 años. Cada hogar cuida de 4 a 6 niños.',
    },
    mostNeeded: {
      en: 'Canned fruits and vegetables, pasta, rice, school-year clothing in sizes 6–14',
      es: 'Frutas y verduras enlatadas, pasta, arroz, ropa de la temporada escolar en tallas 6-14',
    },
    servesAround: {
      en: 'Westside, South neighborhoods',
      es: 'Vecindarios del Oeste y Sur',
    },
  },
  {
    slug: 'hope-youth-shelter',
    name: 'Hope Youth Shelter',
    category: 'youth-shelter',
    description: {
      en: 'Emergency and transitional shelter for young people 16–24 experiencing homelessness. Provides meals, counseling, and job training.',
      es: 'Refugio de emergencia y transitorio para jóvenes de 16 a 24 años que viven en situación de calle. Proporciona comidas, consejería y capacitación laboral.',
    },
    mostNeeded: {
      en: 'Canned meals, snacks, hygiene items, new socks and underwear',
      es: 'Comidas enlatadas, refrigerios, artículos de higiene, calcetines y ropa interior nuevos',
    },
    servesAround: {
      en: 'Downtown, North neighborhoods',
      es: 'Centro, vecindarios del Norte',
    },
  },
  {
    slug: 'dawn-community-initiative',
    name: 'Dawn Community Initiative',
    category: 'housing-support',
    description: {
      en: 'Provides emergency housing, stability funds, and life skills coaching to families experiencing homelessness or housing crisis. Reunifies families.',
      es: 'Proporciona vivienda de emergencia, fondos de estabilidad, y asesoramiento de habilidades para la vida a familias que viven en situación de calle o crisis de vivienda. Reunifica familias.',
    },
    mostNeeded: {
      en: 'Canned goods, cooking staples, cleaning supplies, laundry detergent',
      es: 'Alimentos enlatados, ingredientes básicos de cocina, artículos de limpieza, detergente para la ropa',
    },
    servesAround: {
      en: 'All neighborhoods, city-wide programs',
      es: 'Todos los vecindarios, programas a nivel de ciudad',
    },
  },
  {
    slug: 'lincoln-house-collective',
    name: 'Lincoln House Collective',
    category: 'foster-home',
    description: {
      en: 'Operates 12 licensed family foster homes and one group home. Specializes in children with complex medical or behavioral needs.',
      es: 'Opera 12 hogares de acogida familiar autorizados y un hogar grupal. Se especializa en niños con necesidades médicas o conductuales complejas.',
    },
    mostNeeded: {
      en: 'Nutritious shelf-stable foods, diapers, first-aid supplies, age-appropriate books',
      es: 'Alimentos nutritivos de larga duración, pañales, botiquines de primeros auxilios, libros apropiados para la edad',
    },
    servesAround: {
      en: 'Central and West neighborhoods',
      es: 'Vecindarios Central y Oeste',
    },
  },
  {
    slug: 'community-support-alliance',
    name: 'Community Support Alliance',
    category: 'family-services',
    description: {
      en: 'Helps families exit foster care safely through mentorship, job placement, and basic needs support. Serves young adults aging out of the system.',
      es: 'Ayuda a familias a salir del cuidado de acogida de manera segura mediante tutoría, colocación laboral, y apoyo de necesidades básicas. Sirve a jóvenes adultos que salen del sistema.',
    },
    mostNeeded: {
      en: 'Ready-to-eat meals, kitchen essentials, clothing, bus passes, job interview clothing',
      es: 'Comidas listas para comer, artículos esenciales de cocina, ropa, pases de autobús, ropa para entrevistas de trabajo',
    },
    servesAround: {
      en: 'All neighborhoods, especially high-need areas',
      es: 'Todos los vecindarios, especialmente áreas de alta necesidad',
    },
  },
]
