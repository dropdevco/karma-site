-- Release 2 seed data, converted from the Release 1 static events
-- (src/data/events.ts). Safe to re-run: existing slugs are left untouched.
--
-- series_id groups occurrences of the same recurring event together:
--   11111111-1111-1111-1111-111111111111  Sunday Pickup Soccer
--   22222222-2222-2222-2222-222222222222  Tuesday Night Basketball
--   33333333-3333-3333-3333-333333333333  Thursday Community Run

insert into public.events (
  slug, title_en, title_es, description_en, description_es, category,
  starts_at, ends_at, venue_name, venue_address, capacity,
  donation_item_en, donation_item_es, donation_suggestion_en, donation_suggestion_es,
  beneficiary_en, beneficiary_es, recurring, series_id, status
) values
  (
    'sunday-pickup-soccer-2026-09-20',
    'Sunday Pickup Soccer', 'Fútbol Casual del Domingo',
    'A relaxed, all-levels pickup game on the big grass fields. Cleats optional, good attitude required. We split teams on the spot, so come alone or bring a crowd.',
    'Un partido casual para todos los niveles en las canchas de césped. Los tacos son opcionales, la buena actitud es obligatoria. Formamos los equipos en el momento, así que puedes venir solo o con tu gente.',
    'soccer',
    '2026-09-20T09:00:00', '2026-09-20T11:00:00',
    'Riverside Park Fields', '1200 Riverside Dr, Springfield, IL 62701',
    30,
    'Non-perishable food', 'Alimentos no perecederos',
    'Canned vegetables, rice, pasta, or peanut butter. One bag per family is plenty.',
    'Verduras enlatadas, arroz, pasta o crema de cacahuate. Con una bolsa por familia es suficiente.',
    'Casa Esperanza Foster Home', 'Casa Esperanza, Hogar de Acogida',
    true, '11111111-1111-1111-1111-111111111111', 'scheduled'
  ),
  (
    'sunday-pickup-soccer-2026-09-27',
    'Sunday Pickup Soccer', 'Fútbol Casual del Domingo',
    'A relaxed, all-levels pickup game on the big grass fields. Cleats optional, good attitude required. We split teams on the spot, so come alone or bring a crowd.',
    'Un partido casual para todos los niveles en las canchas de césped. Los tacos son opcionales, la buena actitud es obligatoria. Formamos los equipos en el momento, así que puedes venir solo o con tu gente.',
    'soccer',
    '2026-09-27T09:00:00', '2026-09-27T11:00:00',
    'Riverside Park Fields', '1200 Riverside Dr, Springfield, IL 62701',
    30,
    'Non-perishable food', 'Alimentos no perecederos',
    'Canned vegetables, rice, pasta, or peanut butter. One bag per family is plenty.',
    'Verduras enlatadas, arroz, pasta o crema de cacahuate. Con una bolsa por familia es suficiente.',
    'Casa Esperanza Foster Home', 'Casa Esperanza, Hogar de Acogida',
    true, '11111111-1111-1111-1111-111111111111', 'scheduled'
  ),
  (
    'tuesday-night-basketball-2026-09-22',
    'Tuesday Night Basketball', 'Básquetbol de los Martes',
    'Full-court runs indoors under the lights. Bring light and dark shirts — teams get picked when you walk in the door.',
    'Partidos de cancha completa bajo techo. Trae una playera clara y una oscura: los equipos se forman apenas llegas.',
    'basketball',
    '2026-09-22T19:00:00', '2026-09-22T21:00:00',
    'Eastside Recreation Center', '845 Eastside Ave, Springfield, IL 62703',
    20,
    'Hygiene essentials', 'Artículos de higiene',
    'Travel-size soap, shampoo, toothpaste, and deodorant for teens in shelter care.',
    'Jabón, champú, pasta dental y desodorante de tamaño viaje para adolescentes en el refugio.',
    'St. Anne''s Youth Shelter', 'Refugio Juvenil St. Anne',
    true, '22222222-2222-2222-2222-222222222222', 'scheduled'
  ),
  (
    'thursday-community-run-2026-09-24',
    'Thursday Community Run', 'Carrera Comunitaria del Jueves',
    'An easy 5K loop along the lake before work. All paces welcome — we stay together as a group and finish with coffee.',
    'Una vuelta tranquila de 5K junto al lago antes del trabajo. Todos los ritmos son bienvenidos: nos mantenemos juntos como grupo y terminamos con café.',
    'running',
    '2026-09-24T06:00:00', '2026-09-24T07:00:00',
    'Lakeside Trailhead', '30 Lakeshore Rd, Springfield, IL 62704',
    40,
    'School supplies', 'Útiles escolares',
    'Notebooks, pencils, backpacks, and folders for kids heading back to class.',
    'Cuadernos, lápices, mochilas y carpetas para los niños que regresan a clases.',
    'Bright Path Family Center', 'Centro Familiar Bright Path',
    true, '33333333-3333-3333-3333-333333333333', 'scheduled'
  ),
  (
    'community-5k-fun-run-2026-10-03',
    'Community 5K Fun Run', 'Carrera Comunitaria de 5K',
    'Our biggest run of the fall — a closed-course 5K through downtown with a finish-line block party. Strollers and walkers welcome.',
    'Nuestra carrera más grande del otoño: un circuito cerrado de 5K por el centro con fiesta en la meta. Carreolas y caminantes son bienvenidos.',
    'running',
    '2026-10-03T08:00:00', '2026-10-03T10:00:00',
    'Downtown Springfield Plaza', '2 Old State Capitol Plaza, Springfield, IL 62701',
    100,
    'Winter coats', 'Abrigos de invierno',
    'New or gently used coats in kids’ and adult sizes.',
    'Abrigos nuevos o en buen estado, en tallas infantiles y de adulto.',
    'Bright Path Family Center', 'Centro Familiar Bright Path',
    false, null, 'scheduled'
  ),
  (
    'sunset-volleyball-social-2026-10-10',
    'Sunset Volleyball Social', 'Vóleibol al Atardecer',
    'Casual sand volleyball as the sun goes down. Rotating teams, string lights, and music after the last set.',
    'Vóleibol de arena, sin presión, mientras cae el sol. Equipos rotativos, luces y música después del último set.',
    'volleyball',
    '2026-10-10T17:00:00', '2026-10-10T19:00:00',
    'Marner Park Sand Courts', '410 Marner Way, Springfield, IL 62702',
    24,
    'Winter coats', 'Abrigos de invierno',
    'Coats, gloves, and hats — any size helps as it gets colder.',
    'Abrigos, guantes y gorros de cualquier talla; todo ayuda cuando baja la temperatura.',
    'St. Anne''s Youth Shelter', 'Refugio Juvenil St. Anne',
    false, null, 'scheduled'
  ),
  (
    'fall-basketball-tournament-2026-10-18',
    '3-on-3 Fall Basketball Tournament', 'Torneo de Otoño de Básquetbol 3 contra 3',
    'A one-day bracket tournament, teams of three. Sign up solo and we’ll place you on a squad, or come with your own.',
    'Torneo de un día en formato de eliminación, equipos de tres. Inscríbete solo y te asignamos un equipo, o ven con el tuyo.',
    'basketball',
    '2026-10-18T10:00:00', '2026-10-18T16:00:00',
    'Eastside Recreation Center', '845 Eastside Ave, Springfield, IL 62703',
    64,
    'Non-perishable food', 'Alimentos no perecederos',
    'Canned goods, cereal, and shelf-stable milk for pantry restocking.',
    'Alimentos enlatados, cereal y leche de larga duración para reabastecer la despensa.',
    'Casa Esperanza Foster Home', 'Casa Esperanza, Hogar de Acogida',
    false, null, 'scheduled'
  ),
  (
    'thanksgiving-food-drive-match-2026-11-21',
    'Thanksgiving Food Drive Match', 'Partido Pro Cena de Acción de Gracias',
    'A festive pickup soccer match dedicated to stocking Thanksgiving boxes for local foster families. Wear orange if you’ve got it.',
    'Un partido festivo de fútbol casual dedicado a preparar canastas de Acción de Gracias para familias de acogida locales. Si tienes algo naranja, ¡úsalo!',
    'soccer',
    '2026-11-21T10:00:00', '2026-11-21T13:00:00',
    'Riverside Park Fields', '1200 Riverside Dr, Springfield, IL 62701',
    50,
    'Thanksgiving food boxes', 'Canastas de Acción de Gracias',
    'A frozen turkey or ham, stuffing, canned vegetables, and pie mix.',
    'Un pavo o jamón congelado, relleno, verduras enlatadas y mezcla para pay.',
    'Casa Esperanza Foster Home', 'Casa Esperanza, Hogar de Acogida',
    false, null, 'scheduled'
  ),
  (
    'turkey-trot-charity-run-2026-11-26',
    'Turkey Trot Charity Run', 'Carrera Benéfica del Pavo',
    'A Thanksgiving-morning 5K to earn your seat at the table. Costumes encouraged, seriousness discouraged.',
    'Una carrera de 5K la mañana de Acción de Gracias para ganarte tu lugar en la mesa. Los disfraces se aplauden, la seriedad no tanto.',
    'running',
    '2026-11-26T08:00:00', '2026-11-26T09:30:00',
    'Lakeside Trailhead', '30 Lakeshore Rd, Springfield, IL 62704',
    150,
    'Warm coats & blankets', 'Abrigos y cobijas',
    'Coats, blankets, and gloves to get shelter residents through the winter.',
    'Abrigos, cobijas y guantes para que los residentes del refugio pasen bien el invierno.',
    'St. Anne''s Youth Shelter', 'Refugio Juvenil St. Anne',
    false, null, 'scheduled'
  ),
  (
    'back-to-school-pickup-soccer-2026-08-15',
    'Back-to-School Pickup Soccer', 'Fútbol Casual de Regreso a Clases',
    'We kicked off the school year with a full pitch of pickup soccer and a mountain of backpacks for local kids.',
    'Arrancamos el año escolar con un partido de fútbol casual y una montaña de mochilas para los niños de la comunidad.',
    'soccer',
    '2026-08-15T09:00:00', '2026-08-15T11:00:00',
    'Riverside Park Fields', '1200 Riverside Dr, Springfield, IL 62701',
    30,
    'School supplies', 'Útiles escolares',
    'Backpacks, notebooks, and pencil cases.',
    'Mochilas, cuadernos y estuches.',
    'Bright Path Family Center', 'Centro Familiar Bright Path',
    false, null, 'scheduled'
  )
on conflict (slug) do nothing;
