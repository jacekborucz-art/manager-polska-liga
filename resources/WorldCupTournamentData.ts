import type { WCConfederation } from '../types';

export interface WorldCupStadium {
  name: string;
  city: string;
  country: string;
  capacity: number;
}

export interface WorldCupHostBid {
  id: string;
  hosts: string[];
  confederations: WCConfederation[];
  stadiums: WorldCupStadium[];
}

export const OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR: Record<number, string[]> = {
  2026: ['Meksyk', 'Kanada', 'Stany Zjednoczone'],
  2030: ['Maroko', 'Portugalia', 'Hiszpania', 'Argentyna', 'Paragwaj', 'Urugwaj'],
  2034: ['Arabia Saudyjska'],
};

export const WORLD_CUP_HOST_CONFEDERATION_BY_NAME: Record<string, WCConfederation> = {
  Meksyk: 'CONCACAF',
  Kanada: 'CONCACAF',
  'Stany Zjednoczone': 'CONCACAF',
  Maroko: 'CAF',
  Portugalia: 'UEFA',
  Hiszpania: 'UEFA',
  Argentyna: 'CONMEBOL',
  Paragwaj: 'CONMEBOL',
  Urugwaj: 'CONMEBOL',
  'Arabia Saudyjska': 'AFC',
};

export const WORLD_CUP_STADIUMS_BY_COUNTRY: Record<string, WorldCupStadium[]> = {
  Meksyk: [
    { name: 'Estadio Azteca', city: 'Meksyk', country: 'Meksyk', capacity: 87000 },
    { name: 'Estadio BBVA', city: 'Monterrey', country: 'Meksyk', capacity: 53500 },
    { name: 'Estadio Akron', city: 'Guadalajara', country: 'Meksyk', capacity: 48000 },
  ],
  Kanada: [
    { name: 'BC Place', city: 'Vancouver', country: 'Kanada', capacity: 54500 },
    { name: 'BMO Field', city: 'Toronto', country: 'Kanada', capacity: 45000 },
  ],
  'Stany Zjednoczone': [
    { name: 'MetLife Stadium', city: 'East Rutherford', country: 'Stany Zjednoczone', capacity: 82500 },
    { name: 'SoFi Stadium', city: 'Inglewood', country: 'Stany Zjednoczone', capacity: 70240 },
    { name: 'AT&T Stadium', city: 'Arlington', country: 'Stany Zjednoczone', capacity: 80000 },
    { name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'Stany Zjednoczone', capacity: 71000 },
    { name: 'Hard Rock Stadium', city: 'Miami Gardens', country: 'Stany Zjednoczone', capacity: 65326 },
    { name: 'Lumen Field', city: 'Seattle', country: 'Stany Zjednoczone', capacity: 68740 },
    { name: 'Levi’s Stadium', city: 'Santa Clara', country: 'Stany Zjednoczone', capacity: 68500 },
  ],
  Maroko: [
    { name: 'Grand Stade Hassan II', city: 'Casablanca', country: 'Maroko', capacity: 115000 },
    { name: 'Stade Prince Moulay Abdellah', city: 'Rabat', country: 'Maroko', capacity: 69500 },
    { name: 'Grand Stade de Tanger', city: 'Tanger', country: 'Maroko', capacity: 75500 },
    { name: 'Stade de Fès', city: 'Fez', country: 'Maroko', capacity: 55800 },
    { name: 'Grand Stade d’Agadir', city: 'Agadir', country: 'Maroko', capacity: 46000 },
    { name: 'Grand Stade de Marrakech', city: 'Marrakesz', country: 'Maroko', capacity: 45860 },
  ],
  Portugalia: [
    { name: 'Estádio da Luz', city: 'Lizbona', country: 'Portugalia', capacity: 70000 },
    { name: 'Estádio José Alvalade', city: 'Lizbona', country: 'Portugalia', capacity: 52095 },
    { name: 'Estádio do Dragão', city: 'Porto', country: 'Portugalia', capacity: 50033 },
  ],
  Hiszpania: [
    { name: 'Santiago Bernabéu', city: 'Madryt', country: 'Hiszpania', capacity: 83186 },
    { name: 'Metropolitano', city: 'Madryt', country: 'Hiszpania', capacity: 70692 },
    { name: 'Camp Nou', city: 'Barcelona', country: 'Hiszpania', capacity: 105000 },
    { name: 'RCDE Stadium', city: 'Barcelona', country: 'Hiszpania', capacity: 40500 },
    { name: 'San Mamés', city: 'Bilbao', country: 'Hiszpania', capacity: 53331 },
    { name: 'Estadio de Gran Canaria', city: 'Las Palmas', country: 'Hiszpania', capacity: 44500 },
    { name: 'Estadio de Anoeta', city: 'San Sebastián', country: 'Hiszpania', capacity: 42300 },
    { name: 'La Cartuja', city: 'Sewilla', country: 'Hiszpania', capacity: 70000 },
    { name: 'Nou Mestalla', city: 'Walencja', country: 'Hiszpania', capacity: 70044 },
    { name: 'Estadio de Balaídos', city: 'Vigo', country: 'Hiszpania', capacity: 44000 },
    { name: 'Nueva Romareda', city: 'Saragossa', country: 'Hiszpania', capacity: 43110 },
  ],
  Argentyna: [
    { name: 'Estadio Monumental', city: 'Buenos Aires', country: 'Argentyna', capacity: 100000 },
  ],
  Paragwaj: [
    { name: 'Estadio Osvaldo Domínguez Dibb', city: 'Asunción', country: 'Paragwaj', capacity: 46000 },
  ],
  Urugwaj: [
    { name: 'Estadio Centenario', city: 'Montevideo', country: 'Urugwaj', capacity: 62782 },
  ],
  'Arabia Saudyjska': [
    { name: 'King Salman International Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 92760 },
    { name: 'King Fahd Sports City Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 70200 },
    { name: 'King Abdullah Sports City Stadium', city: 'Dżudda', country: 'Arabia Saudyjska', capacity: 62345 },
    { name: 'South Riyadh Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 47060 },
    { name: 'Prince Mohammed bin Salman Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 46979 },
    { name: 'Prince Faisal bin Fahd Sports City Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 46865 },
    { name: 'King Saud University Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 46319 },
    { name: 'New Murabba Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 46010 },
    { name: 'ROSHN Stadium', city: 'Rijad', country: 'Arabia Saudyjska', capacity: 46000 },
    { name: 'Qiddiya Coast Stadium', city: 'Dżudda', country: 'Arabia Saudyjska', capacity: 46096 },
    { name: 'Jeddah Central Development Stadium', city: 'Dżudda', country: 'Arabia Saudyjska', capacity: 45794 },
    { name: 'King Abdullah Economic City Stadium', city: 'Dżudda', country: 'Arabia Saudyjska', capacity: 45700 },
    { name: 'Aramco Stadium', city: 'Al Khobar', country: 'Arabia Saudyjska', capacity: 46096 },
    { name: 'NEOM Stadium', city: 'Neom', country: 'Arabia Saudyjska', capacity: 46010 },
    { name: 'King Khalid University Stadium', city: 'Abha', country: 'Arabia Saudyjska', capacity: 45428 },
  ],
  Anglia: [
    { name: 'Wembley', city: 'Londyn', country: 'Anglia', capacity: 90000 },
    { name: 'Old Trafford', city: 'Manchester', country: 'Anglia', capacity: 74140 },
    { name: 'Tottenham Hotspur Stadium', city: 'Londyn', country: 'Anglia', capacity: 62850 },
    { name: 'London Stadium', city: 'Londyn', country: 'Anglia', capacity: 62500 },
    { name: 'Etihad Stadium', city: 'Manchester', country: 'Anglia', capacity: 53400 },
  ],
  Niemcy: [
    { name: 'Olympiastadion Berlin', city: 'Berlin', country: 'Niemcy', capacity: 74475 },
    { name: 'Allianz Arena', city: 'Monachium', country: 'Niemcy', capacity: 75000 },
    { name: 'Signal Iduna Park', city: 'Dortmund', country: 'Niemcy', capacity: 81365 },
    { name: 'Volksparkstadion', city: 'Hamburg', country: 'Niemcy', capacity: 57000 },
  ],
  Włochy: [
    { name: 'Stadio Olimpico', city: 'Rzym', country: 'Włochy', capacity: 70634 },
    { name: 'San Siro', city: 'Mediolan', country: 'Włochy', capacity: 75923 },
    { name: 'Allianz Stadium', city: 'Turyn', country: 'Włochy', capacity: 41507 },
    { name: 'Stadio Diego Armando Maradona', city: 'Neapol', country: 'Włochy', capacity: 54726 },
  ],
  Brazylia: [
    { name: 'Maracanã', city: 'Rio de Janeiro', country: 'Brazylia', capacity: 78838 },
    { name: 'Mané Garrincha', city: 'Brasília', country: 'Brazylia', capacity: 72788 },
    { name: 'Arena Corinthians', city: 'São Paulo', country: 'Brazylia', capacity: 49205 },
    { name: 'Mineirão', city: 'Belo Horizonte', country: 'Brazylia', capacity: 61846 },
  ],
  Japonia: [
    { name: 'National Stadium', city: 'Tokio', country: 'Japonia', capacity: 68000 },
    { name: 'Saitama Stadium', city: 'Saitama', country: 'Japonia', capacity: 63700 },
    { name: 'Nissan Stadium', city: 'Jokohama', country: 'Japonia', capacity: 72327 },
  ],
  'Korea PŁD': [
    { name: 'Seoul World Cup Stadium', city: 'Seul', country: 'Korea PŁD', capacity: 66806 },
    { name: 'Busan Asiad Stadium', city: 'Busan', country: 'Korea PŁD', capacity: 53864 },
    { name: 'Daegu Stadium', city: 'Daegu', country: 'Korea PŁD', capacity: 66422 },
  ],
  Australia: [
    { name: 'Stadium Australia', city: 'Sydney', country: 'Australia', capacity: 83500 },
    { name: 'Melbourne Cricket Ground', city: 'Melbourne', country: 'Australia', capacity: 100024 },
    { name: 'Lang Park', city: 'Brisbane', country: 'Australia', capacity: 52500 },
  ],
  'Nowa Zelandia': [
    { name: 'Eden Park', city: 'Auckland', country: 'Nowa Zelandia', capacity: 50000 },
    { name: 'Sky Stadium', city: 'Wellington', country: 'Nowa Zelandia', capacity: 34500 },
  ],
  Egipt: [
    { name: 'Cairo International Stadium', city: 'Kair', country: 'Egipt', capacity: 75000 },
    { name: 'Borg El Arab Stadium', city: 'Aleksandria', country: 'Egipt', capacity: 86000 },
  ],
  Nigeria: [
    { name: 'Moshood Abiola Stadium', city: 'Abudża', country: 'Nigeria', capacity: 60000 },
    { name: 'Godswill Akpabio Stadium', city: 'Uyo', country: 'Nigeria', capacity: 30000 },
  ],
  Turcja: [
    { name: 'Atatürk Olympic', city: 'Stambuł', country: 'Turcja', capacity: 76092 },
    { name: 'Rams Park', city: 'Stambuł', country: 'Turcja', capacity: 52280 },
    { name: 'Şükrü Saracoğlu Stadium', city: 'Stambuł', country: 'Turcja', capacity: 47834 },
  ],
};

export const GENERATED_WORLD_CUP_HOST_BIDS: WorldCupHostBid[] = [
  { id: 'ENGLAND', hosts: ['Anglia'], confederations: ['UEFA'], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Anglia },
  { id: 'GERMANY', hosts: ['Niemcy'], confederations: ['UEFA'], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Niemcy },
  { id: 'ITALY', hosts: ['Włochy'], confederations: ['UEFA'], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Włochy },
  { id: 'BRAZIL', hosts: ['Brazylia'], confederations: ['CONMEBOL'], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Brazylia },
  { id: 'JAPAN_KOREA', hosts: ['Japonia', 'Korea PŁD'], confederations: ['AFC'], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Japonia, ...WORLD_CUP_STADIUMS_BY_COUNTRY['Korea PŁD']] },
  { id: 'AUSTRALIA_NEW_ZEALAND', hosts: ['Australia', 'Nowa Zelandia'], confederations: ['AFC', 'OFC'], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Australia, ...WORLD_CUP_STADIUMS_BY_COUNTRY['Nowa Zelandia']] },
  { id: 'EGYPT_NIGERIA', hosts: ['Egipt', 'Nigeria'], confederations: ['CAF'], stadiums: [...WORLD_CUP_STADIUMS_BY_COUNTRY.Egipt, ...WORLD_CUP_STADIUMS_BY_COUNTRY.Nigeria] },
  { id: 'TURKEY', hosts: ['Turcja'], confederations: ['UEFA'], stadiums: WORLD_CUP_STADIUMS_BY_COUNTRY.Turcja },
];

class WorldCupDataRng {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0 || 1;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const hashWorldCupData = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return hash >>> 0;
};

const isWorldCupYear = (year: number): boolean =>
  year >= 2026 && (year - 2026) % 4 === 0;

export const getWorldCupHostConfederationForName = (host: string): WCConfederation => {
  const official = WORLD_CUP_HOST_CONFEDERATION_BY_NAME[host];
  if (official) return official;
  const generatedBid = GENERATED_WORLD_CUP_HOST_BIDS.find(bid => bid.hosts.includes(host));
  return generatedBid?.confederations[0] ?? 'INTERCONT';
};

export const getGeneratedWorldCupHostBidForYear = (year: number): WorldCupHostBid => {
  const rng = new WorldCupDataRng(hashWorldCupData(`GENERATED_WORLD_CUP_HOST_${year}`));
  const recentHostConfs = [
    ...getWorldCupHostsForYear(year - 4).map(getWorldCupHostConfederationForName),
    ...getWorldCupHostsForYear(year - 8).map(getWorldCupHostConfederationForName),
  ];
  const recentSet = new Set(recentHostConfs.filter(conf => conf !== 'INTERCONT'));
  const preferredBids = GENERATED_WORLD_CUP_HOST_BIDS.filter(bid => !bid.confederations.some(conf => recentSet.has(conf)));
  const pool = preferredBids.length > 0 ? preferredBids : GENERATED_WORLD_CUP_HOST_BIDS;
  return pool[rng.int(0, pool.length - 1)];
};

export const getWorldCupHostsForYear = (year: number): string[] => {
  if (!isWorldCupYear(year)) return [];
  const officialHosts = OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR[year];
  if (officialHosts) return [...officialHosts];

  // FIFA has no official host data in the game database after 2034. The game
  // therefore chooses one curated bid deterministically from the tournament year.
  // This keeps reports, qualification host exemptions and the tournament draw in
  // sync without writing generated hosts into save files.
  return [...getGeneratedWorldCupHostBidForYear(year).hosts];
};

export const getWorldCupStadiumsForYear = (year: number): WorldCupStadium[] => {
  const officialHosts = OFFICIAL_WORLD_CUP_HOSTS_BY_YEAR[year];
  if (officialHosts) {
    return officialHosts.flatMap(host => WORLD_CUP_STADIUMS_BY_COUNTRY[host] ?? []);
  }
  return getGeneratedWorldCupHostBidForYear(year).stadiums;
};

export const pickWorldCupStadiumForMatch = (year: number, matchKey: string): WorldCupStadium | null => {
  const stadiums = getWorldCupStadiumsForYear(year);
  if (stadiums.length === 0) return null;
  const rng = new WorldCupDataRng(hashWorldCupData(`WORLD_CUP_VENUE_${year}_${matchKey}`));
  return stadiums[rng.int(0, stadiums.length - 1)];
};
