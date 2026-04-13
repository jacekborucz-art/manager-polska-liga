/**
 * NationalTeamSchedule.ts
 *
 * Centralny rejestr meczów reprezentacji narodowych, kluczowany rokiem (seasonStartYear).
 *
 * Zasada działania:
 *   - Słownik NT_SCHEDULE_BY_YEAR jest kluczowany wartością `seasonStartYear`
 *     (rok, w którym sezon się ZACZYNA — np. 2025 dla sezonu 2025/26).
 *   - Każdy wpis to lista dni meczowych (NTMatchDay) z konkretnymi meczami.
 *   - month używa formatu JavaScript (0-11): 8 = wrzesień, 9 = październik, 10 = listopad.
 *   - competitionLabel to etykieta wyświetlana graczowi (np. "Kwalifikacje MŚ 2026 – Gr. G").
 *   - polishGroupOnly: gdy true, widok pokazuje TYLKO mecze z grupy Polski.
 *     Gdy false (np. finał MŚ), pokazuje wszystkie mecze z listy.
 *
 * Jak dodać nowy rok / nowe rozgrywki:
 *   1. Dodaj nowy klucz do NT_SCHEDULE_BY_YEAR, np. 2026: [...].
 *   2. Wypełnij listę NTMatchDay[] zgodnie z harmonogramem FIFA/UEFA.
 *   3. Nic więcej nie musisz zmieniać — reszta systemu pobierze dane automatycznie.
 *
 * Jak działa integracja z grą:
 *   - CalendarEngine wykrywa BREAK slot z labelką "REPREZENTACJA" i zwraca EventKind.NATIONAL_TEAM_MATCH.
 *   - GameContext w advanceDay wywołuje NationalTeamSimulator.simulateMatchDay(matchDay).
 *   - Wyniki są przechowywane w stanie gry i wyświetlane w NationalTeamResultsView.
 */

// ─── Typy ────────────────────────────────────────────────────────────────────

/** Pojedynczy mecz reprezentacji (gospodarz vs gość). */
export interface NTGroupMatch {
  /** Nazwa drużyny gospodarza (w języku polskim). */
  home: string;
  /** Nazwa drużyny gościa (w języku polskim). */
  away: string;
  /** Etykieta grupy (np. 'A', 'G'). Opcjonalna — używana do filtrowania wyników. */
  group?: string;
  /** Etykieta rozgrywek dla tego meczu (nadrzędna nad poziomem dnia meczowego). */
  competitionLabel?: string;
}

/**
 * Typ specjalnego zdarzenia:
 *   - 'GROUP_MATCH'     — normalny dzień meczowy grupy (domyślny, brak pola = GROUP_MATCH)
 *   - 'WCQ_PLAYOFF_DRAW' — losowanie bar aży eliminacyjnych MŚ (29 listopada)
 *   - 'WCQ_PLAYOFF_SF'   — półfinały baraży (17 marca)
 *   - 'WCQ_PLAYOFF_FINAL' — finały baraży (20 marca)
 */
export type NTEventType = 'GROUP_MATCH' | 'WCQ_PLAYOFF_DRAW' | 'WCQ_PLAYOFF_SF' | 'WCQ_PLAYOFF_FINAL';

/** Dzień meczowy reprezentacji — jedna data = jeden blok meczów. */
export interface NTMatchDay {
  /** Dzień miesiąca (1-31). */
  day: number;
  /** Miesiąc w formacie JS (0-11). 8 = wrzesień, 9 = październik, 10 = listopad. */
  month: number;
  /** Etykieta rozgrywek wyświetlana graczowi. */
  competitionLabel: string;
  /** Lista wszystkich meczów rozgrywanych w tym dniu. */
  matches: NTGroupMatch[];
  /** Typ specjalnego zdarzenia. undefined = normalny dzień meczowy. */
  eventType?: NTEventType;
}

// ─── Dane ─────────────────────────────────────────────────────────────────────

/**
 * Harmonogram meczów reprezentacji kluczowany rokiem startowym sezonu.
 *
 * Klucz: seasonStartYear (rok w którym zaczyna się sezon, np. 2025 dla 2025/26).
 * Wartość: lista dni meczowych (NTMatchDay[]).
 *
 * Stan na start gry (lipiec 2025): 3 kolejki zostały już rozegrane (marzec 2025),
 * więc w sezonie 2025/26 pozostały kolejki 4–9 (wrzesień, październik, listopad 2025).
 */
export const NT_SCHEDULE_BY_YEAR: Record<number, NTMatchDay[]> = {

  // ── Sezon 2025/26 — Kwalifikacje do Mistrzostw Świata 2026, Grupy A–L ───────
  // Polska (Gr. G): Holandia, Finlandia, Litwa, Malta
  // Kolejki 4–9 Gr. G / kolejki 1–6 Gr. A–F / kolejki 5–10 Gr. H–L
  2025: [
    {
      // 4 września 2025 — okno wrześniowe, mecz 1
      day: 4,
      month: 8, // wrzesień
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Luksemburg',          away: 'Irlandia Północna',    group: 'A' },
        { home: 'Słowacja',            away: 'Niemcy',               group: 'A' },
        { home: 'Szwecja',             away: 'Słowenia',             group: 'B' },
        { home: 'Kosovo',              away: 'Szwajcaria',           group: 'B' },
        { home: 'Białoruś',            away: 'Grecja',               group: 'C' },
        { home: 'Dania',               away: 'Szkocja',              group: 'C' },
        { home: 'Azerbejdżan',         away: 'Islandia',             group: 'D' },
        { home: 'Ukraina',             away: 'Francja',              group: 'D' },
        { home: 'Bułgaria',            away: 'Gruzja',               group: 'E' },
        { home: 'Turcja',              away: 'Hiszpania',            group: 'E' },
        { home: 'Armenia',             away: 'Węgry',                group: 'F' },
        { home: 'Irlandia',            away: 'Portugalia',           group: 'F' },
        { home: 'Holandia',            away: 'Polska',               group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Litwa',               away: 'Malta',                group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Austria',             away: 'Rumunia',              group: 'H' },
        { home: 'Bośnia i Hercegowina', away: 'San Marino',          group: 'H' },
        { home: 'Izrael',              away: 'Włochy',               group: 'I' },
        { home: 'Norwegia',            away: 'Estonia',              group: 'I' },
        { home: 'Macedonia Północna',  away: 'Belgia',               group: 'J' },
        { home: 'Walia',               away: 'Liechtenstein',        group: 'J' },
        { home: 'Albania',             away: 'Anglia',               group: 'K' },
        { home: 'Serbia',              away: 'Łotwa',                group: 'K' },
        { home: 'Gibraltar',           away: 'Chorwacja',            group: 'L' },
        { home: 'Czechy',              away: 'Wyspy Owcze',          group: 'L' },
      ],
    },
    {
      // 7 września 2025 — okno wrześniowe, mecz 2
      day: 7,
      month: 8, // wrzesień
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Luksemburg',          away: 'Słowacja',             group: 'A' },
        { home: 'Niemcy',              away: 'Irlandia Północna',    group: 'A' },
        { home: 'Szwecja',             away: 'Kosovo',               group: 'B' },
        { home: 'Szwajcaria',          away: 'Słowenia',             group: 'B' },
        { home: 'Białoruś',            away: 'Dania',                group: 'C' },
        { home: 'Szkocja',             away: 'Grecja',               group: 'C' },
        { home: 'Azerbejdżan',         away: 'Ukraina',              group: 'D' },
        { home: 'Francja',             away: 'Islandia',             group: 'D' },
        { home: 'Bułgaria',            away: 'Turcja',               group: 'E' },
        { home: 'Hiszpania',           away: 'Gruzja',               group: 'E' },
        { home: 'Armenia',             away: 'Irlandia',             group: 'F' },
        { home: 'Portugalia',          away: 'Węgry',                group: 'F' },
        { home: 'Polska',              away: 'Finlandia',            group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Litwa',               away: 'Holandia',             group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'San Marino',          away: 'Rumunia',              group: 'H' },
        { home: 'Cypr',                away: 'Bośnia i Hercegowina', group: 'H' },
        { home: 'Estonia',             away: 'Włochy',               group: 'I' },
        { home: 'Mołdawia',            away: 'Norwegia',             group: 'I' },
        { home: 'Liechtenstein',       away: 'Belgia',               group: 'J' },
        { home: 'Kazachstan',          away: 'Walia',                group: 'J' },
        { home: 'Łotwa',               away: 'Anglia',               group: 'K' },
        { home: 'Andora',              away: 'Serbia',               group: 'K' },
        { home: 'Wyspy Owcze',         away: 'Chorwacja',            group: 'L' },
        { home: 'Czarnogóra',          away: 'Czechy',               group: 'L' },
      ],
    },
    {
      // 8 października 2025 — okno październikowe, mecz 1
      day: 8,
      month: 9, // październik
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Irlandia Północna',   away: 'Słowacja',             group: 'A' },
        { home: 'Niemcy',              away: 'Luksemburg',           group: 'A' },
        { home: 'Słowenia',            away: 'Kosovo',               group: 'B' },
        { home: 'Szwajcaria',          away: 'Szwecja',              group: 'B' },
        { home: 'Grecja',              away: 'Dania',                group: 'C' },
        { home: 'Szkocja',             away: 'Białoruś',             group: 'C' },
        { home: 'Islandia',            away: 'Ukraina',              group: 'D' },
        { home: 'Francja',             away: 'Azerbejdżan',          group: 'D' },
        { home: 'Gruzja',              away: 'Turcja',               group: 'E' },
        { home: 'Hiszpania',           away: 'Bułgaria',             group: 'E' },
        { home: 'Węgry',               away: 'Irlandia',             group: 'F' },
        { home: 'Portugalia',          away: 'Armenia',              group: 'F' },
        { home: 'Finlandia',           away: 'Litwa',                group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Malta',               away: 'Holandia',             group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Bośnia i Hercegowina', away: 'Austria',             group: 'H' },
        { home: 'San Marino',          away: 'Cypr',                 group: 'H' },
        { home: 'Norwegia',            away: 'Izrael',               group: 'I' },
        { home: 'Estonia',             away: 'Mołdawia',             group: 'I' },
        { home: 'Walia',               away: 'Macedonia Północna',   group: 'J' },
        { home: 'Liechtenstein',       away: 'Kazachstan',           group: 'J' },
        { home: 'Serbia',              away: 'Albania',              group: 'K' },
        { home: 'Łotwa',               away: 'Andora',               group: 'K' },
        { home: 'Czechy',              away: 'Gibraltar',            group: 'L' },
        { home: 'Wyspy Owcze',         away: 'Czarnogóra',           group: 'L' },
      ],
    },
    {
      // 11 października 2025 — okno październikowe, mecz 2
      day: 11,
      month: 9, // październik
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Irlandia Północna',   away: 'Niemcy',               group: 'A' },
        { home: 'Słowacja',            away: 'Luksemburg',           group: 'A' },
        { home: 'Słowenia',            away: 'Szwajcaria',           group: 'B' },
        { home: 'Kosovo',              away: 'Szwecja',              group: 'B' },
        { home: 'Grecja',              away: 'Szkocja',              group: 'C' },
        { home: 'Dania',               away: 'Białoruś',             group: 'C' },
        { home: 'Islandia',            away: 'Francja',              group: 'D' },
        { home: 'Ukraina',             away: 'Azerbejdżan',          group: 'D' },
        { home: 'Gruzja',              away: 'Hiszpania',            group: 'E' },
        { home: 'Turcja',              away: 'Bułgaria',             group: 'E' },
        { home: 'Węgry',               away: 'Portugalia',           group: 'F' },
        { home: 'Irlandia',            away: 'Armenia',              group: 'F' },
        { home: 'Holandia',            away: 'Finlandia',            group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Litwa',               away: 'Polska',               group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Cypr',                away: 'Austria',              group: 'H' },
        { home: 'Rumunia',             away: 'Bośnia i Hercegowina', group: 'H' },
        { home: 'Mołdawia',            away: 'Izrael',               group: 'I' },
        { home: 'Włochy',              away: 'Norwegia',             group: 'I' },
        { home: 'Kazachstan',          away: 'Macedonia Północna',   group: 'J' },
        { home: 'Belgia',              away: 'Walia',                group: 'J' },
        { home: 'Andora',              away: 'Albania',              group: 'K' },
        { home: 'Anglia',              away: 'Serbia',               group: 'K' },
        { home: 'Czarnogóra',          away: 'Gibraltar',            group: 'L' },
        { home: 'Chorwacja',           away: 'Czechy',               group: 'L' },
      ],
    },
    {
      // 14 listopada 2025 — okno listopadowe, mecz 1
      day: 14,
      month: 10, // listopad
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Luksemburg',          away: 'Niemcy',               group: 'A' },
        { home: 'Słowacja',            away: 'Irlandia Północna',    group: 'A' },
        { home: 'Szwecja',             away: 'Szwajcaria',           group: 'B' },
        { home: 'Kosovo',              away: 'Słowenia',             group: 'B' },
        { home: 'Białoruś',            away: 'Szkocja',              group: 'C' },
        { home: 'Dania',               away: 'Grecja',               group: 'C' },
        { home: 'Azerbejdżan',         away: 'Francja',              group: 'D' },
        { home: 'Ukraina',             away: 'Islandia',             group: 'D' },
        { home: 'Bułgaria',            away: 'Hiszpania',            group: 'E' },
        { home: 'Turcja',              away: 'Gruzja',               group: 'E' },
        { home: 'Armenia',             away: 'Portugalia',           group: 'F' },
        { home: 'Irlandia',            away: 'Węgry',                group: 'F' },
        { home: 'Finlandia',           away: 'Malta',                group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Polska',              away: 'Holandia',             group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'San Marino',          away: 'Austria',              group: 'H' },
        { home: 'Rumunia',             away: 'Cypr',                 group: 'H' },
        { home: 'Estonia',             away: 'Izrael',               group: 'I' },
        { home: 'Włochy',              away: 'Mołdawia',             group: 'I' },
        { home: 'Liechtenstein',       away: 'Macedonia Północna',   group: 'J' },
        { home: 'Belgia',              away: 'Kazachstan',           group: 'J' },
        { home: 'Łotwa',               away: 'Albania',              group: 'K' },
        { home: 'Anglia',              away: 'Andora',               group: 'K' },
        { home: 'Wyspy Owcze',         away: 'Gibraltar',            group: 'L' },
        { home: 'Chorwacja',           away: 'Czarnogóra',           group: 'L' },
      ],
    },
    {
      // 17 listopada 2025 — okno listopadowe, mecz 2
      day: 17,
      month: 10, // listopad
      competitionLabel: 'Kwalifikacje MŚ 2026',
      matches: [
        { home: 'Irlandia Północna',   away: 'Luksemburg',           group: 'A' },
        { home: 'Niemcy',              away: 'Słowacja',             group: 'A' },
        { home: 'Słowenia',            away: 'Szwecja',              group: 'B' },
        { home: 'Szwajcaria',          away: 'Kosovo',               group: 'B' },
        { home: 'Grecja',              away: 'Białoruś',             group: 'C' },
        { home: 'Szkocja',             away: 'Dania',                group: 'C' },
        { home: 'Islandia',            away: 'Azerbejdżan',          group: 'D' },
        { home: 'Francja',             away: 'Ukraina',              group: 'D' },
        { home: 'Gruzja',              away: 'Bułgaria',             group: 'E' },
        { home: 'Hiszpania',           away: 'Turcja',               group: 'E' },
        { home: 'Węgry',               away: 'Armenia',              group: 'F' },
        { home: 'Portugalia',          away: 'Irlandia',             group: 'F' },
        { home: 'Holandia',            away: 'Litwa',                group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Malta',               away: 'Polska',               group: 'G', competitionLabel: 'Kwalifikacje MŚ 2026' },
        { home: 'Rumunia',             away: 'Austria',              group: 'H' },
        { home: 'San Marino',          away: 'Bośnia i Hercegowina', group: 'H' },
        { home: 'Włochy',              away: 'Izrael',               group: 'I' },
        { home: 'Estonia',             away: 'Norwegia',             group: 'I' },
        { home: 'Belgia',              away: 'Macedonia Północna',   group: 'J' },
        { home: 'Liechtenstein',       away: 'Walia',                group: 'J' },
        { home: 'Anglia',              away: 'Albania',              group: 'K' },
        { home: 'Łotwa',               away: 'Serbia',               group: 'K' },
        { home: 'Chorwacja',           away: 'Gibraltar',            group: 'L' },
        { home: 'Wyspy Owcze',         away: 'Czechy',               group: 'L' },
      ],
    },
    {
      // 29 listopada 2025 — Losowanie par baraży MŚ 2026 UEFA
      day: 29,
      month: 10, // listopad
      competitionLabel: 'Baraże MŚ 2026 – Losowanie',
      eventType: 'WCQ_PLAYOFF_DRAW',
      matches: [],
    },
  ],

  // ── Sezon 2026 — Baraże MŚ 2026 (mecze w marcu 2026) ────────────────────────
  // Klucz: 2026 (rok kalendarzowy marca 2026; CalendarEngine używa getFullYear = 2026)
  2026: [
    {
      // 17 marca 2026 — Półfinały baraży
      day: 17,
      month: 2, // marzec
      competitionLabel: 'Baraże MŚ 2026 – Półfinały',
      eventType: 'WCQ_PLAYOFF_SF',
      matches: [],
    },
    {
      // 20 marca 2026 — Finały baraży
      day: 20,
      month: 2, // marzec
      competitionLabel: 'Baraże MŚ 2026 – Finały',
      eventType: 'WCQ_PLAYOFF_FINAL',
      matches: [],
    },
  ],
};

/**
 * Pomocnicza funkcja — zwraca NTMatchDay dla danej daty i roku, lub null jeśli brak.
 *
 * @param date    - aktualna data gry
 * @param year    - seasonStartYear (rok startowy sezonu)
 * @returns NTMatchDay lub null
 */
export function getNTMatchDayForDate(date: Date, year: number): NTMatchDay | null {
  const schedule = NT_SCHEDULE_BY_YEAR[year];
  if (!schedule) return null;

  const day   = date.getDate();
  const month = date.getMonth(); // 0-11

  return schedule.find(md => md.day === day && md.month === month) ?? null;
}
