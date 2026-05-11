/**
 * Transit-данные: 12 городов Казахстана + ключевые автобусные маршруты.
 *
 * Owner: архитектура (Миша). Это полная transit-модель (с маршрутами, остановками
 * и геометрией). Лёгкие landing-метаданные для лендинга живут параллельно в
 * `src/lib/cities.ts`. Слияние двух источников запланировано на фазу 3.
 *
 * Фаза 1 seed: реальные центры/bbox, реалистичные slug'и маршрутов,
 * остановки и геометрия — правдоподобные, но не сверены 1-в-1 с OSM relations.
 * Фаза 2 (script `scripts/fetch-osm-routes.ts`) подтянет точные координаты
 * остановок и плотную геометрию (30+ точек на маршрут) из Overpass API.
 */

import type {
  City,
  CitySlug,
  LngLat,
  LocalizedString,
  Route,
  RouteKind,
  Stop,
} from "@/types/transit";

const TZ_KZ = "Asia/Almaty" as const;

const ACCENT = {
  blue: "#1F6FEB",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
} as const;

interface RouteSeed {
  shortName: string;
  longName: LocalizedString;
  kind: RouteKind;
  color: string;
  headwayMinutes: number;
  from: string;
  to: string;
  stops: ReadonlyArray<{ name: LocalizedString; location: LngLat }>;
  geometry: readonly LngLat[];
}

function buildRoute(citySlug: CitySlug, seed: RouteSeed): Route {
  const id = `${citySlug}-${seed.shortName.toLowerCase()}`;
  const stops: Stop[] = seed.stops.map((s, idx) => ({
    id: `${id}-s-${idx + 1}`,
    order: idx + 1,
    name: s.name,
    location: s.location,
  }));
  return {
    id,
    citySlug,
    shortName: seed.shortName,
    longName: seed.longName,
    kind: seed.kind,
    color: seed.color,
    headwayMinutes: seed.headwayMinutes,
    operatingHours: { from: seed.from, to: seed.to },
    stops,
    geometry: seed.geometry,
  };
}

// -----------------------------------------------------------------------------
// Алматы
// -----------------------------------------------------------------------------

const almatyRoutes: readonly RouteSeed[] = [
  {
    shortName: "2",
    longName: {
      ru: "мкр Шанырак — Театр оперы",
      kk: "TODO_KZ:мкр Шанырак — Театр оперы",
      en: "Shanyrak — Opera Theatre",
    },
    kind: "bus",
    color: ACCENT.blue,
    headwayMinutes: 8,
    from: "06:00",
    to: "23:00",
    stops: [
      {
        name: { ru: "мкр Шанырак-2", kk: "Шаңырақ-2", en: "Shanyrak-2" },
        location: [76.9461, 43.2002],
      },
      {
        name: {
          ru: "Райымбека / Сейфуллина",
          kk: "Райымбек / Сейфуллин",
          en: "Rayymbek / Seifullin",
        },
        location: [76.931, 43.2585],
      },
      {
        name: { ru: "Жибек жолы", kk: "Жібек жолы", en: "Zhibek Zholy" },
        location: [76.938, 43.2602],
      },
      { name: { ru: "Панфилова", kk: "Панфилов", en: "Panfilov" }, location: [76.941, 43.2605] },
      {
        name: { ru: "Театр оперы", kk: "Опера театры", en: "Opera Theatre" },
        location: [76.9437, 43.2604],
      },
    ],
    geometry: [
      [76.9461, 43.2002],
      [76.942, 43.211],
      [76.938, 43.23],
      [76.934, 43.245],
      [76.931, 43.2585],
      [76.934, 43.2598],
      [76.938, 43.2602],
      [76.941, 43.2605],
      [76.9437, 43.2604],
    ],
  },
  {
    shortName: "32",
    longName: {
      ru: "Алгабас — площадь Республики",
      kk: "TODO_KZ:Алгабас — площадь Республики",
      en: "Algabas — Republic Square",
    },
    kind: "bus",
    color: ACCENT.green,
    headwayMinutes: 10,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "Алгабас", kk: "Алғабас", en: "Algabas" }, location: [76.842, 43.1875] },
      {
        name: { ru: "Райымбека / Толе би", kk: "Райымбек / Төле би", en: "Rayymbek / Tole Bi" },
        location: [76.895, 43.252],
      },
      {
        name: { ru: "Абая / Розыбакиева", kk: "Абай / Розыбакиев", en: "Abay / Rozybakiev" },
        location: [76.905, 43.241],
      },
      {
        name: { ru: "Сатпаева / Маркова", kk: "Сәтпаев / Марков", en: "Satpayev / Markov" },
        location: [76.91, 43.233],
      },
      {
        name: { ru: "пл. Республики", kk: "Республика алаңы", en: "Republic Square" },
        location: [76.9405, 43.236],
      },
    ],
    geometry: [
      [76.842, 43.1875],
      [76.86, 43.21],
      [76.88, 43.235],
      [76.895, 43.252],
      [76.902, 43.247],
      [76.905, 43.241],
      [76.909, 43.236],
      [76.91, 43.233],
      [76.92, 43.2345],
      [76.9405, 43.236],
    ],
  },
  {
    shortName: "79",
    longName: {
      ru: "Орбита-3 — Алатау",
      kk: "TODO_KZ:Орбита-3 — Алатау",
      en: "Orbita-3 — Alatau",
    },
    kind: "bus",
    color: ACCENT.amber,
    headwayMinutes: 12,
    from: "06:30",
    to: "22:30",
    stops: [
      { name: { ru: "Орбита-3", kk: "Орбита-3", en: "Orbita-3" }, location: [76.852, 43.223] },
      {
        name: {
          ru: "Розыбакиева / Тимирязева",
          kk: "Розыбакиев / Тимирязев",
          en: "Rozybakiev / Timiryazev",
        },
        location: [76.905, 43.2245],
      },
      {
        name: { ru: "Гагарина / Сатпаева", kk: "Гагарин / Сәтпаев", en: "Gagarin / Satpayev" },
        location: [76.921, 43.2305],
      },
      {
        name: {
          ru: "Жандосова / Розыбакиева",
          kk: "Жандосов / Розыбакиев",
          en: "Zhandosov / Rozybakiev",
        },
        location: [76.902, 43.212],
      },
      { name: { ru: "Алатау", kk: "Алатау", en: "Alatau" }, location: [76.887, 43.199] },
    ],
    geometry: [
      [76.852, 43.223],
      [76.875, 43.2238],
      [76.89, 43.224],
      [76.905, 43.2245],
      [76.913, 43.228],
      [76.921, 43.2305],
      [76.917, 43.224],
      [76.91, 43.218],
      [76.902, 43.212],
      [76.895, 43.205],
      [76.887, 43.199],
    ],
  },
  {
    shortName: "121",
    longName: {
      ru: "Аэропорт — Сайран",
      kk: "TODO_KZ:Аэропорт — Сайран",
      en: "Airport — Sayran",
    },
    kind: "bus",
    color: ACCENT.rose,
    headwayMinutes: 15,
    from: "05:30",
    to: "00:30",
    stops: [
      {
        name: { ru: "Аэропорт Алматы", kk: "Алматы әуежайы", en: "Almaty Airport" },
        location: [77.0094, 43.3521],
      },
      {
        name: {
          ru: "Майлина / Кульджинский",
          kk: "Майлин / Қолжынғал",
          en: "Mailin / Kuldzhinsky",
        },
        location: [76.984, 43.301],
      },
      {
        name: {
          ru: "Сейфуллина / Райымбека",
          kk: "Сейфуллин / Райымбек",
          en: "Seifullin / Rayymbek",
        },
        location: [76.931, 43.258],
      },
      {
        name: {
          ru: "Толе би / Байтурсынова",
          kk: "Төле би / Байтұрсын",
          en: "Tole Bi / Baitursynov",
        },
        location: [76.917, 43.251],
      },
      {
        name: { ru: "Автовокзал Сайран", kk: "Сайран автовокзалы", en: "Sayran Bus Terminal" },
        location: [76.883, 43.24],
      },
    ],
    geometry: [
      [77.0094, 43.3521],
      [76.997, 43.33],
      [76.984, 43.301],
      [76.959, 43.28],
      [76.941, 43.267],
      [76.931, 43.258],
      [76.924, 43.254],
      [76.917, 43.251],
      [76.9, 43.245],
      [76.883, 43.24],
    ],
  },
  {
    shortName: "137",
    longName: {
      ru: "мкр Каргалы — пр. Абая",
      kk: "TODO_KZ:мкр Каргалы — пр. Абая",
      en: "Kargaly — Abay Ave.",
    },
    kind: "bus",
    color: ACCENT.purple,
    headwayMinutes: 14,
    from: "06:00",
    to: "23:00",
    stops: [
      {
        name: { ru: "мкр Каргалы", kk: "Қарғалы ы.а.", en: "Kargaly" },
        location: [76.821, 43.174],
      },
      {
        name: { ru: "Аль-Фараби / Навои", kk: "Әл-Фараби / Науаи", en: "Al-Farabi / Navoi" },
        location: [76.892, 43.209],
      },
      {
        name: { ru: "Абая / Гагарина", kk: "Абай / Гагарин", en: "Abay / Gagarin" },
        location: [76.921, 43.24],
      },
      {
        name: { ru: "пл. Республики", kk: "Республика алаңы", en: "Republic Square" },
        location: [76.9405, 43.236],
      },
    ],
    geometry: [
      [76.821, 43.174],
      [76.853, 43.19],
      [76.873, 43.201],
      [76.892, 43.209],
      [76.905, 43.22],
      [76.915, 43.231],
      [76.921, 43.24],
      [76.93, 43.238],
      [76.9405, 43.236],
    ],
  },
  {
    shortName: "5",
    longName: {
      ru: "Гипромез — мкр Айнабулак",
      kk: "TODO_KZ:Гипромез — Айнабұлақ",
      en: "Gipromez — Ainabulak",
    },
    kind: "trolleybus",
    color: ACCENT.cyan,
    headwayMinutes: 11,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "Гипромез", kk: "Гипромез", en: "Gipromez" }, location: [76.912, 43.227] },
      {
        name: {
          ru: "Сатпаева / Сейфуллина",
          kk: "Сәтпаев / Сейфуллин",
          en: "Satpayev / Seifullin",
        },
        location: [76.931, 43.233],
      },
      {
        name: {
          ru: "Райымбека / Жангельдина",
          kk: "Райымбек / Жангелдин",
          en: "Rayymbek / Zhangeldin",
        },
        location: [76.943, 43.2585],
      },
      {
        name: { ru: "Айнабулак-2", kk: "Айнабұлақ-2", en: "Ainabulak-2" },
        location: [76.971, 43.281],
      },
    ],
    geometry: [
      [76.912, 43.227],
      [76.922, 43.231],
      [76.931, 43.233],
      [76.937, 43.245],
      [76.943, 43.2585],
      [76.952, 43.266],
      [76.962, 43.274],
      [76.971, 43.281],
    ],
  },
];

// -----------------------------------------------------------------------------
// Астана
// -----------------------------------------------------------------------------

const astanaRoutes: readonly RouteSeed[] = [
  {
    shortName: "10",
    longName: {
      ru: "ЖД-вокзал — Чубары",
      kk: "TODO_KZ:ЖД-вокзал — Чубары",
      en: "Railway Station — Chubary",
    },
    kind: "bus",
    color: ACCENT.blue,
    headwayMinutes: 6,
    from: "06:00",
    to: "23:30",
    stops: [
      {
        name: { ru: "ЖД-вокзал", kk: "Теміржол вокзалы", en: "Railway Station" },
        location: [71.4116, 51.131],
      },
      {
        name: { ru: "Республики, 24", kk: "Республика, 24", en: "Respubliki 24" },
        location: [71.425, 51.148],
      },
      {
        name: { ru: "Хан Шатыр", kk: "Хан шатыры", en: "Khan Shatyr" },
        location: [71.4282, 51.1326],
      },
      { name: { ru: "Байтерек", kk: "Бәйтерек", en: "Baiterek" }, location: [71.4307, 51.128] },
      { name: { ru: "Чубары", kk: "Шұбары", en: "Chubary" }, location: [71.481, 51.101] },
    ],
    geometry: [
      [71.4116, 51.131],
      [71.418, 51.14],
      [71.425, 51.148],
      [71.4282, 51.1326],
      [71.4307, 51.128],
      [71.442, 51.118],
      [71.46, 51.108],
      [71.481, 51.101],
    ],
  },
  {
    shortName: "30",
    longName: {
      ru: "Аэропорт — Юго-Восток",
      kk: "TODO_KZ:Аэропорт — Юго-Восток",
      en: "Airport — Yugo-Vostok",
    },
    kind: "bus",
    color: ACCENT.green,
    headwayMinutes: 15,
    from: "05:30",
    to: "00:30",
    stops: [
      {
        name: {
          ru: "Аэропорт Нурсултан Назарбаев",
          kk: "Нұрсұлтан Назарбаев әуежайы",
          en: "Nursultan Nazarbayev Airport",
        },
        location: [71.467, 51.022],
      },
      {
        name: { ru: "Кабанбай батыра", kk: "Қабанбай батыр", en: "Kabanbay Batyr" },
        location: [71.447, 51.111],
      },
      { name: { ru: "Сарыарка", kk: "Сарыарқа", en: "Saryarka" }, location: [71.435, 51.15] },
      {
        name: { ru: "Юго-Восток", kk: "Оңтүстік-Шығыс", en: "Yugo-Vostok" },
        location: [71.498, 51.173],
      },
    ],
    geometry: [
      [71.467, 51.022],
      [71.457, 51.07],
      [71.447, 51.111],
      [71.44, 51.132],
      [71.435, 51.15],
      [71.455, 51.16],
      [71.498, 51.173],
    ],
  },
  {
    shortName: "44",
    longName: {
      ru: "Байтерек — ЭКСПО",
      kk: "TODO_KZ:Байтерек — ЭКСПО",
      en: "Baiterek — EXPO",
    },
    kind: "bus",
    color: ACCENT.amber,
    headwayMinutes: 10,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "Байтерек", kk: "Бәйтерек", en: "Baiterek" }, location: [71.4307, 51.128] },
      {
        name: { ru: "Дом министерств", kk: "Министрліктер үйі", en: "Ministries House" },
        location: [71.444, 51.129],
      },
      {
        name: {
          ru: "Пирамида мира и согласия",
          kk: "Бейбітшілік пирамидасы",
          en: "Pyramid of Peace",
        },
        location: [71.466, 51.123],
      },
      { name: { ru: "ЭКСПО", kk: "ЭКСПО", en: "EXPO" }, location: [71.414, 51.09] },
    ],
    geometry: [
      [71.4307, 51.128],
      [71.438, 51.1285],
      [71.444, 51.129],
      [71.454, 51.1265],
      [71.466, 51.123],
      [71.45, 51.108],
      [71.43, 51.096],
      [71.414, 51.09],
    ],
  },
  {
    shortName: "18",
    longName: {
      ru: "Триумф Астаны — Назарбаев Университет",
      kk: "TODO_KZ:Триумф Астаны — Назарбаев Университет",
      en: "Triumph of Astana — Nazarbayev University",
    },
    kind: "bus",
    color: ACCENT.rose,
    headwayMinutes: 12,
    from: "06:00",
    to: "23:00",
    stops: [
      {
        name: { ru: "Триумф Астаны", kk: "Астана Триумфы", en: "Triumph of Astana" },
        location: [71.418, 51.167],
      },
      {
        name: { ru: "Дворец независимости", kk: "Тәуелсіздік сарайы", en: "Independence Palace" },
        location: [71.4555, 51.1208],
      },
      {
        name: { ru: "Нур-Астана", kk: "Нұр-Астана", en: "Nur-Astana" },
        location: [71.428, 51.124],
      },
      {
        name: {
          ru: "Назарбаев Университет",
          kk: "Назарбаев Университеті",
          en: "Nazarbayev University",
        },
        location: [71.3947, 51.0902],
      },
    ],
    geometry: [
      [71.418, 51.167],
      [71.425, 51.15],
      [71.433, 51.134],
      [71.4555, 51.1208],
      [71.44, 51.124],
      [71.428, 51.124],
      [71.41, 51.107],
      [71.3947, 51.0902],
    ],
  },
  {
    shortName: "50",
    longName: {
      ru: "Артем — Хан Шатыр",
      kk: "TODO_KZ:Артем — Хан Шатыр",
      en: "Artem — Khan Shatyr",
    },
    kind: "bus",
    color: ACCENT.purple,
    headwayMinutes: 14,
    from: "06:00",
    to: "22:30",
    stops: [
      { name: { ru: "мкр Артем", kk: "Артем ы.а.", en: "Artem" }, location: [71.358, 51.181] },
      { name: { ru: "Жубанова", kk: "Жұбанов", en: "Zhubanov" }, location: [71.385, 51.162] },
      {
        name: {
          ru: "Республики / Богенбай батыра",
          kk: "Республика / Бөгенбай батыр",
          en: "Respubliki / Bogenbai",
        },
        location: [71.423, 51.145],
      },
      {
        name: { ru: "Хан Шатыр", kk: "Хан шатыры", en: "Khan Shatyr" },
        location: [71.4282, 51.1326],
      },
    ],
    geometry: [
      [71.358, 51.181],
      [71.372, 51.1715],
      [71.385, 51.162],
      [71.405, 51.153],
      [71.423, 51.145],
      [71.426, 51.139],
      [71.4282, 51.1326],
    ],
  },
];

// -----------------------------------------------------------------------------
// Шымкент
// -----------------------------------------------------------------------------

const shymkentRoutes: readonly RouteSeed[] = [
  {
    shortName: "9",
    longName: {
      ru: "Авторынок — мкр Самал",
      kk: "TODO_KZ:Авторынок — Самал",
      en: "Auto Market — Samal",
    },
    kind: "bus",
    color: ACCENT.blue,
    headwayMinutes: 8,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "Авторынок", kk: "Автобазар", en: "Auto Market" }, location: [69.55, 42.312] },
      {
        name: { ru: "Тауке-хана", kk: "Тәуке хан", en: "Tauke Khan" },
        location: [69.581, 42.3315],
      },
      {
        name: { ru: "Центральный рынок", kk: "Орталық базар", en: "Central Market" },
        location: [69.591, 42.338],
      },
      { name: { ru: "мкр Самал", kk: "Самал ы.а.", en: "Samal" }, location: [69.62, 42.355] },
    ],
    geometry: [
      [69.55, 42.312],
      [69.565, 42.322],
      [69.581, 42.3315],
      [69.587, 42.336],
      [69.591, 42.338],
      [69.605, 42.347],
      [69.62, 42.355],
    ],
  },
  {
    shortName: "23",
    longName: {
      ru: "Аэропорт — Северный вокзал",
      kk: "TODO_KZ:Аэропорт — Северный вокзал",
      en: "Airport — Northern Station",
    },
    kind: "bus",
    color: ACCENT.green,
    headwayMinutes: 15,
    from: "05:30",
    to: "23:30",
    stops: [
      {
        name: { ru: "Аэропорт Шымкент", kk: "Шымкент әуежайы", en: "Shymkent Airport" },
        location: [69.4787, 42.364],
      },
      { name: { ru: "Кунаева", kk: "Қонаев", en: "Kunayev" }, location: [69.544, 42.34] },
      {
        name: { ru: "Парк Абая", kk: "Абай саябағы", en: "Abai Park" },
        location: [69.587, 42.329],
      },
      {
        name: { ru: "Северный вокзал", kk: "Солтүстік вокзалы", en: "Northern Station" },
        location: [69.61, 42.37],
      },
    ],
    geometry: [
      [69.4787, 42.364],
      [69.51, 42.352],
      [69.544, 42.34],
      [69.568, 42.334],
      [69.587, 42.329],
      [69.598, 42.35],
      [69.61, 42.37],
    ],
  },
  {
    shortName: "12",
    longName: {
      ru: "мкр Нурсат — Площадь Аль-Фараби",
      kk: "TODO_KZ:Нұрсат — Әл-Фараби алаңы",
      en: "Nursat — Al-Farabi Square",
    },
    kind: "bus",
    color: ACCENT.amber,
    headwayMinutes: 10,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "мкр Нурсат-2", kk: "Нұрсат-2", en: "Nursat-2" }, location: [69.642, 42.311] },
      { name: { ru: "Байтерек", kk: "Бәйтерек", en: "Baiterek" }, location: [69.608, 42.322] },
      { name: { ru: "Аль-Фараби", kk: "Әл-Фараби", en: "Al-Farabi" }, location: [69.59, 42.316] },
    ],
    geometry: [
      [69.642, 42.311],
      [69.625, 42.317],
      [69.608, 42.322],
      [69.599, 42.319],
      [69.59, 42.316],
    ],
  },
  {
    shortName: "33",
    longName: {
      ru: "мкр Достык — Парк Победы",
      kk: "TODO_KZ:Достық ы.а. — Жеңіс саябағы",
      en: "Dostyk — Victory Park",
    },
    kind: "bus",
    color: ACCENT.rose,
    headwayMinutes: 12,
    from: "06:00",
    to: "22:30",
    stops: [
      { name: { ru: "мкр Достык", kk: "Достық ы.а.", en: "Dostyk" }, location: [69.608, 42.37] },
      { name: { ru: "Молодежная", kk: "Жастар", en: "Molodyozhnaya" }, location: [69.597, 42.358] },
      {
        name: { ru: "Парк Победы", kk: "Жеңіс саябағы", en: "Victory Park" },
        location: [69.575, 42.34],
      },
    ],
    geometry: [
      [69.608, 42.37],
      [69.602, 42.365],
      [69.597, 42.358],
      [69.587, 42.35],
      [69.581, 42.345],
      [69.575, 42.34],
    ],
  },
  {
    shortName: "7",
    longName: {
      ru: "Старый город — Университетский",
      kk: "TODO_KZ:Ескі қала — Университеттік",
      en: "Old Town — University District",
    },
    kind: "trolleybus",
    color: ACCENT.purple,
    headwayMinutes: 11,
    from: "06:00",
    to: "23:00",
    stops: [
      { name: { ru: "Старый город", kk: "Ескі қала", en: "Old Town" }, location: [69.578, 42.324] },
      {
        name: { ru: "Драм. театр", kk: "Драма театры", en: "Drama Theatre" },
        location: [69.59, 42.329],
      },
      {
        name: { ru: "Университет", kk: "Университет", en: "University" },
        location: [69.602, 42.338],
      },
    ],
    geometry: [
      [69.578, 42.324],
      [69.584, 42.3265],
      [69.59, 42.329],
      [69.596, 42.3335],
      [69.602, 42.338],
    ],
  },
];

// -----------------------------------------------------------------------------
// Helper: 3 синтетических маршрута для средних городов.
// -----------------------------------------------------------------------------

function midSizedCityRoutes(citySlug: CitySlug, center: LngLat): readonly RouteSeed[] {
  const [cx, cy] = center;
  // Три радиальных маршрута: восток, запад, север, ~5-7 км.
  const mk = (
    n: string,
    color: string,
    dx: number,
    dy: number,
    nameRu: string,
    nameEn: string,
  ): RouteSeed => ({
    shortName: n,
    longName: {
      ru: nameRu,
      kk: `TODO_KZ:${nameRu}`,
      en: nameEn,
    },
    kind: "bus",
    color,
    headwayMinutes: 12,
    from: "06:00",
    to: "23:00",
    stops: [
      {
        name: {
          ru: `${citySlug}-центр`,
          kk: `TODO_KZ:${citySlug}-центр`,
          en: `${citySlug}-center`,
        },
        location: [cx, cy] as LngLat,
      },
      {
        name: {
          ru: "Центральный рынок",
          kk: "Орталық базар",
          en: "Central Market",
        },
        location: [cx + dx * 0.3, cy + dy * 0.3] as LngLat,
      },
      {
        name: {
          ru: "Микрорайон",
          kk: "Ы.а.",
          en: "District",
        },
        location: [cx + dx * 0.7, cy + dy * 0.7] as LngLat,
      },
      {
        name: {
          ru: nameRu.split(" — ")[1] ?? "Конечная",
          kk: `TODO_KZ:${nameRu.split(" — ")[1] ?? "Конечная"}`,
          en: nameEn.split(" — ")[1] ?? "Terminal",
        },
        location: [cx + dx, cy + dy] as LngLat,
      },
    ],
    geometry: [
      [cx, cy],
      [cx + dx * 0.25, cy + dy * 0.25],
      [cx + dx * 0.5, cy + dy * 0.5],
      [cx + dx * 0.75, cy + dy * 0.75],
      [cx + dx, cy + dy],
    ],
  });

  return [
    mk("1", ACCENT.blue, 0.08, 0.02, "Центр — Восточный мкр", "Center — East District"),
    mk("2", ACCENT.green, -0.07, 0.01, "Центр — Западный мкр", "Center — West District"),
    mk("3", ACCENT.amber, 0.0, 0.05, "Центр — Северный мкр", "Center — North District"),
  ];
}

// -----------------------------------------------------------------------------
// Сборка 12 городов
// -----------------------------------------------------------------------------

interface CitySeed {
  slug: CitySlug;
  name: LocalizedString;
  center: LngLat;
  bbox: [number, number, number, number];
  population: number;
  routes: readonly RouteSeed[];
}

const seeds: readonly CitySeed[] = [
  {
    slug: "almaty",
    name: { ru: "Алматы", kk: "Алматы", en: "Almaty" },
    center: [76.9286, 43.2389],
    bbox: [76.75, 43.18, 77.05, 43.32],
    population: 2_100_000,
    routes: almatyRoutes,
  },
  {
    slug: "astana",
    name: { ru: "Астана", kk: "Астана", en: "Astana" },
    center: [71.4491, 51.1694],
    bbox: [71.3, 51.05, 71.65, 51.25],
    population: 1_350_000,
    routes: astanaRoutes,
  },
  {
    slug: "shymkent",
    name: { ru: "Шымкент", kk: "Шымкент", en: "Shymkent" },
    center: [69.5901, 42.3417],
    bbox: [69.45, 42.25, 69.75, 42.45],
    population: 1_220_000,
    routes: shymkentRoutes,
  },
  {
    slug: "karaganda",
    name: { ru: "Караганда", kk: "Қарағанды", en: "Karaganda" },
    center: [73.0875, 49.8047],
    bbox: [72.95, 49.7, 73.25, 49.9],
    population: 500_000,
    routes: midSizedCityRoutes("karaganda", [73.0875, 49.8047]),
  },
  {
    slug: "aktobe",
    name: { ru: "Актобе", kk: "Ақтөбе", en: "Aktobe" },
    center: [57.166, 50.2837],
    bbox: [57.05, 50.2, 57.32, 50.36],
    population: 540_000,
    routes: midSizedCityRoutes("aktobe", [57.166, 50.2837]),
  },
  {
    slug: "taraz",
    name: { ru: "Тараз", kk: "Тараз", en: "Taraz" },
    center: [71.3784, 42.9013],
    bbox: [71.27, 42.83, 71.49, 42.98],
    population: 360_000,
    routes: midSizedCityRoutes("taraz", [71.3784, 42.9013]),
  },
  {
    slug: "pavlodar",
    name: { ru: "Павлодар", kk: "Павлодар", en: "Pavlodar" },
    center: [76.9651, 52.2871],
    bbox: [76.85, 52.22, 77.1, 52.36],
    population: 340_000,
    routes: midSizedCityRoutes("pavlodar", [76.9651, 52.2871]),
  },
  {
    slug: "oskemen",
    name: { ru: "Усть-Каменогорск", kk: "Өскемен", en: "Oskemen" },
    center: [82.6286, 49.9486],
    bbox: [82.5, 49.88, 82.78, 50.02],
    population: 330_000,
    routes: midSizedCityRoutes("oskemen", [82.6286, 49.9486]),
  },
  {
    slug: "semey",
    name: { ru: "Семей", kk: "Семей", en: "Semey" },
    center: [80.2275, 50.4112],
    bbox: [80.1, 50.34, 80.36, 50.48],
    population: 320_000,
    routes: midSizedCityRoutes("semey", [80.2275, 50.4112]),
  },
  {
    slug: "atyrau",
    name: { ru: "Атырау", kk: "Атырау", en: "Atyrau" },
    center: [51.9233, 47.0945],
    bbox: [51.8, 47.02, 52.05, 47.17],
    population: 290_000,
    routes: midSizedCityRoutes("atyrau", [51.9233, 47.0945]),
  },
  {
    slug: "kostanay",
    name: { ru: "Костанай", kk: "Қостанай", en: "Kostanay" },
    center: [63.625, 53.2144],
    bbox: [63.5, 53.14, 63.78, 53.3],
    population: 250_000,
    routes: midSizedCityRoutes("kostanay", [63.625, 53.2144]),
  },
  {
    slug: "kyzylorda",
    name: { ru: "Кызылорда", kk: "Қызылорда", en: "Kyzylorda" },
    center: [65.5125, 44.8488],
    bbox: [65.4, 44.78, 65.64, 44.92],
    population: 250_000,
    routes: midSizedCityRoutes("kyzylorda", [65.5125, 44.8488]),
  },
];

export const cities: readonly City[] = seeds.map((seed) => ({
  slug: seed.slug,
  name: seed.name,
  center: seed.center,
  bbox: seed.bbox,
  timezone: TZ_KZ,
  population: seed.population,
  routes: seed.routes.map((r) => buildRoute(seed.slug, r)),
}));

const citiesBySlug: ReadonlyMap<CitySlug, City> = new Map(cities.map((c) => [c.slug, c]));

/** Достать город по slug. Возвращает undefined если slug неизвестен. */
export function getCity(slug: string): City | undefined {
  return citiesBySlug.get(slug as CitySlug);
}

/** Достать маршрут города по routeId. */
export function getRoute(citySlug: string, routeId: string): Route | undefined {
  const city = getCity(citySlug);
  if (!city) return undefined;
  return city.routes.find((r) => r.id === routeId);
}

/** Все routeIds во всех городах. Для статической генерации `generateStaticParams`. */
export function allRouteIds(): ReadonlyArray<{ citySlug: CitySlug; routeId: string }> {
  return cities.flatMap((c) => c.routes.map((r) => ({ citySlug: c.slug, routeId: r.id })));
}

/** Все city slugs. */
export const citySlugs: readonly CitySlug[] = cities.map((c) => c.slug);
