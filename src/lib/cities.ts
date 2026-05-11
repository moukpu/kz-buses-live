export type City = {
  slug: string;
  nameRu: string;
  nameKk: string;
  region: string;
  center: { lng: number; lat: number };
  hasRealtime: boolean;
};

export const cities: readonly City[] = [
  {
    slug: "almaty",
    nameRu: "Алматы",
    nameKk: "Алматы",
    region: "Алматинская агломерация",
    center: { lng: 76.9286, lat: 43.2389 },
    hasRealtime: true,
  },
  {
    slug: "astana",
    nameRu: "Астана",
    nameKk: "Астана",
    region: "Столица",
    center: { lng: 71.4491, lat: 51.1694 },
    hasRealtime: true,
  },
  {
    slug: "shymkent",
    nameRu: "Шымкент",
    nameKk: "Шымкент",
    region: "Туркестанский регион",
    center: { lng: 69.5901, lat: 42.3417 },
    hasRealtime: false,
  },
  {
    slug: "karaganda",
    nameRu: "Караганда",
    nameKk: "Қарағанды",
    region: "Карагандинская область",
    center: { lng: 73.0875, lat: 49.8047 },
    hasRealtime: false,
  },
  {
    slug: "aktobe",
    nameRu: "Актобе",
    nameKk: "Ақтөбе",
    region: "Актюбинская область",
    center: { lng: 57.166, lat: 50.2837 },
    hasRealtime: false,
  },
  {
    slug: "taraz",
    nameRu: "Тараз",
    nameKk: "Тараз",
    region: "Жамбылская область",
    center: { lng: 71.3784, lat: 42.9013 },
    hasRealtime: false,
  },
  {
    slug: "pavlodar",
    nameRu: "Павлодар",
    nameKk: "Павлодар",
    region: "Павлодарская область",
    center: { lng: 76.9651, lat: 52.2871 },
    hasRealtime: false,
  },
  {
    slug: "oskemen",
    nameRu: "Усть-Каменогорск",
    nameKk: "Өскемен",
    region: "Восточно-Казахстанская область",
    center: { lng: 82.6286, lat: 49.9486 },
    hasRealtime: false,
  },
  {
    slug: "semey",
    nameRu: "Семей",
    nameKk: "Семей",
    region: "Абайская область",
    center: { lng: 80.2275, lat: 50.4112 },
    hasRealtime: false,
  },
  {
    slug: "atyrau",
    nameRu: "Атырау",
    nameKk: "Атырау",
    region: "Атырауская область",
    center: { lng: 51.9233, lat: 47.0945 },
    hasRealtime: false,
  },
  {
    slug: "kostanay",
    nameRu: "Костанай",
    nameKk: "Қостанай",
    region: "Костанайская область",
    center: { lng: 63.625, lat: 53.2144 },
    hasRealtime: false,
  },
  {
    slug: "kyzylorda",
    nameRu: "Кызылорда",
    nameKk: "Қызылорда",
    region: "Кызылординская область",
    center: { lng: 65.5125, lat: 44.8488 },
    hasRealtime: false,
  },
];
