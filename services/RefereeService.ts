
import { Referee, Region } from '../types';
import { NameGeneratorService } from './NameGeneratorService';

export const RefereeService = {
  pool: [] as Referee[],

  /**
   * Generates a fixed pool of referees:
   * - 150 Polish (domestic)
   * - ~300 European (UEFA countries, excl. Poland)
   * - ~400 International (non-European)
   */
  initializePool: () => {
    if (RefereeService.pool.length > 0) return;

    // ── POLSKA (150) — wstępnie bez odznaki międzynarodowej ───────────
    for (let i = 0; i < 150; i++) {
      const names = NameGeneratorService.getRandomName(Region.POLAND);
      RefereeService.pool.push({
        id: `REF_${i}`,
        firstName: names.firstName,
        lastName: names.lastName,
        age: 30 + Math.floor(Math.random() * 25),
        nationality: Region.POLAND,
        strictness: 20 + Math.floor(Math.random() * 70),
        consistency: 30 + Math.floor(Math.random() * 60),
        advantageTendency: 10 + Math.floor(Math.random() * 80),
        experience: 30 + Math.floor(Math.random() * 70),
        matchRatings: [],
        totalYellowCardsShown: 0,
        totalRedCardsShown: 0,
        isInternational: false,
      });
    }

    // ── TOP 25 Polskich sędziów FIFA/UEFA ────────────────────────────────
    // Ranking: 60% consistency + 40% experience (jak realna selekcja FIFA)
    const polishRefs = RefereeService.pool.filter(r => r.nationality === Region.POLAND);
    const top25Polish = [...polishRefs]
      .sort((a, b) => (b.consistency * 0.6 + b.experience * 0.4) - (a.consistency * 0.6 + a.experience * 0.4))
      .slice(0, 25)
      .map(r => r.id);
    top25Polish.forEach(id => {
      const ref = RefereeService.pool.find(r => r.id === id);
      if (ref) ref.isInternational = true;
    });

    // ── EUROPA (bez Polski) — 12 sędziów × 25 regionów UEFA = 300 ──────
    // Wszyscy arbitrzy UEFA są automatycznie oznaczeni jako FIFA/UEFA
    const EUR_REGIONS: Region[] = [
      Region.BALKANS, Region.CZ_SK, Region.IBERIA, Region.SWEDEN, Region.SCANDINAVIA,
      Region.EX_USSR, Region.SPAIN, Region.ENGLAND, Region.GERMANY, Region.ITALY,
      Region.FRANCE, Region.TURKEY, Region.FINLAND, Region.GEORGIA, Region.ARMENIA,
      Region.ALBANIA, Region.ROMANIA, Region.BALTIC, Region.BENELUX, Region.HUNGARIAN,
      Region.MALTESE, Region.ISRAELI, Region.GREEK, Region.AZERBAIJANI, Region.KAZAKH,
    ];
    let eurIdx = 0;
    EUR_REGIONS.forEach(region => {
      for (let j = 0; j < 12; j++) {
        const names = NameGeneratorService.getRandomName(region);
        RefereeService.pool.push({
          id: `REF_EUR_${eurIdx++}`,
          firstName: names.firstName,
          lastName: names.lastName,
          age: 28 + Math.floor(Math.random() * 27),
          nationality: region,
          strictness: 20 + Math.floor(Math.random() * 70),
          consistency: 30 + Math.floor(Math.random() * 60),
          advantageTendency: 10 + Math.floor(Math.random() * 80),
          experience: 25 + Math.floor(Math.random() * 75),
          matchRatings: [],
          totalYellowCardsShown: 0,
          totalRedCardsShown: 0,
          isInternational: true, // Arbiter UEFA
        });
      }
    });

    // ── POZAEUROPEJSKIE — 50 sędziów × 8 regionów = 400 ────────────────
    // Wszyscy arbitrzy FIFA spoza Europy są oznaczeni jako FIFA
    const INTL_REGIONS: Region[] = [
      Region.SSA, Region.MEXICO, Region.JAPAN, Region.KOREA,
      Region.ARGENTINA, Region.BRAZIL, Region.ARABIA, Region.SOUTH_AMERICAN,
    ];
    let intlIdx = 0;
    INTL_REGIONS.forEach(region => {
      for (let j = 0; j < 50; j++) {
        const names = NameGeneratorService.getRandomName(region);
        RefereeService.pool.push({
          id: `REF_INTL_${intlIdx++}`,
          firstName: names.firstName,
          lastName: names.lastName,
          age: 28 + Math.floor(Math.random() * 27),
          nationality: region,
          strictness: 20 + Math.floor(Math.random() * 70),
          consistency: 30 + Math.floor(Math.random() * 60),
          advantageTendency: 10 + Math.floor(Math.random() * 80),
          experience: 20 + Math.floor(Math.random() * 80),
          matchRatings: [],
          totalYellowCardsShown: 0,
          totalRedCardsShown: 0,
          isInternational: true, // Arbiter FIFA
        });
      }
    });
  },

  /**
   * Assigns an INTERNATIONAL referee (FIFA/UEFA) for a CL/EL/CONF match.
   * Referee must be from a different country than both competing teams.
   */
  assignInternationalReferee: (
    seedStr: string,
    homeCountry: string,
    awayCountry: string,
    usedRefereeIds: Set<string> = new Set()
  ): Referee => {
    RefereeService.initializePool();

    // Mapa kodów krajów (ISO 3166-1 alpha-3 / custom) → Region
    const COUNTRY_REGION: Record<string, Region> = {
      'POL': Region.POLAND,
      'ENG': Region.ENGLAND, 'GBR': Region.ENGLAND,
      'ESP': Region.SPAIN,
      'GER': Region.GERMANY, 'DEU': Region.GERMANY,
      'ITA': Region.ITALY,
      'FRA': Region.FRANCE,
      'TUR': Region.TURKEY,
      'SWE': Region.SWEDEN,
      'NOR': Region.SCANDINAVIA, 'DNK': Region.SCANDINAVIA, 'ISL': Region.SCANDINAVIA,
      'RUS': Region.EX_USSR, 'UKR': Region.EX_USSR, 'BLR': Region.EX_USSR,
      'SRB': Region.BALKANS, 'HRV': Region.BALKANS, 'BIH': Region.BALKANS, 'SVN': Region.BALKANS, 'MNE': Region.BALKANS, 'MKD': Region.BALKANS,
      'CZE': Region.CZ_SK, 'SVK': Region.CZ_SK,
      'POR': Region.IBERIA, 'PRT': Region.IBERIA,
      'FIN': Region.FINLAND,
      'GEO': Region.GEORGIA,
      'ARM': Region.ARMENIA,
      'ALB': Region.ALBANIA,
      'ROU': Region.ROMANIA,
      'LTU': Region.BALTIC, 'LVA': Region.BALTIC, 'EST': Region.BALTIC,
      'BEL': Region.BENELUX, 'NLD': Region.BENELUX, 'LUX': Region.BENELUX,
      'HUN': Region.HUNGARIAN,
      'MLT': Region.MALTESE,
      'ISR': Region.ISRAELI,
      'GRC': Region.GREEK,
      'AZE': Region.AZERBAIJANI,
      'KAZ': Region.KAZAKH,
      'JPN': Region.JAPAN,
      'KOR': Region.KOREA,
      'ARG': Region.ARGENTINA,
      'BRA': Region.BRAZIL,
      'MEX': Region.MEXICO,
      'SAU': Region.ARABIA, 'UAE': Region.ARABIA, 'QAT': Region.ARABIA, 'EGY': Region.ARABIA,
      'NGA': Region.SSA, 'GHA': Region.SSA, 'CMR': Region.SSA, 'SEN': Region.SSA,
      'COL': Region.SOUTH_AMERICAN, 'CHL': Region.SOUTH_AMERICAN, 'URU': Region.SOUTH_AMERICAN, 'PER': Region.SOUTH_AMERICAN,
    };

    const homeRegion = COUNTRY_REGION[homeCountry?.toUpperCase()];
    const awayRegion = COUNTRY_REGION[awayCountry?.toUpperCase()];

    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }

    const notConflict = (r: Referee) =>
      (!homeRegion || r.nationality !== homeRegion) &&
      (!awayRegion || r.nationality !== awayRegion);

    const EUR_ONLY: Region[] = [
      Region.POLAND,
      Region.BALKANS, Region.CZ_SK, Region.IBERIA, Region.SWEDEN, Region.SCANDINAVIA,
      Region.EX_USSR, Region.SPAIN, Region.ENGLAND, Region.GERMANY, Region.ITALY,
      Region.FRANCE, Region.TURKEY, Region.FINLAND, Region.GEORGIA, Region.ARMENIA,
      Region.ALBANIA, Region.ROMANIA, Region.BALTIC, Region.BENELUX, Region.HUNGARIAN,
      Region.MALTESE, Region.ISRAELI, Region.GREEK, Region.AZERBAIJANI, Region.KAZAKH,
    ];
    const isEuropean = (r: Referee) => EUR_ONLY.includes(r.nationality);

    // Pula 1: FIFA/UEFA, europejski, dobra konsekwencja, inny kraj, jeszcze nie sędziował dziś
    const eligible = RefereeService.pool.filter(r =>
      r.isInternational &&
      isEuropean(r) &&
      r.consistency > 55 &&
      notConflict(r) &&
      !usedRefereeIds.has(r.id)
    );

    if (eligible.length > 0) {
      return eligible[Math.abs(hash) % eligible.length];
    }

    // Pula 2: Dowolny FIFA/UEFA europejski, inny kraj, jeszcze nie sędziował dziś
    const eligibleAnyQuality = RefereeService.pool.filter(r =>
      r.isInternational &&
      isEuropean(r) &&
      notConflict(r) &&
      !usedRefereeIds.has(r.id)
    );

    if (eligibleAnyQuality.length > 0) {
      return eligibleAnyQuality[Math.abs(hash) % eligibleAnyQuality.length];
    }

    // Pula 3 (fallback): Polscy sędziowie z licencją międzynarodową (top 25), jeszcze nie sędziowali dziś
    const polishFallback = RefereeService.pool.filter(r =>
      r.isInternational &&
      r.nationality === Region.POLAND &&
      !usedRefereeIds.has(r.id)
    );

    if (polishFallback.length > 0) {
      return polishFallback[Math.abs(hash) % polishFallback.length];
    }

    // Pula 4 (ostateczny fallback): Dowolny dostępny europejski sędzia (ignorujemy usedRefereeIds)
    const anyAvailable = RefereeService.pool.filter(r => r.isInternational && isEuropean(r));
    const lastResort = anyAvailable.length > 0 ? anyAvailable : RefereeService.pool;
    return lastResort[Math.abs(hash) % lastResort.length];
  },

  /**
   * Assigns a European referee for a national team match.
   * Referee must be European, from a different region than both teams, and not already used in this matchday.
   */
  assignEuropeanRefereeByRegion: (
    seedStr: string,
    homeRegion: Region,
    awayRegion: Region,
    usedRefereeIds: Set<string> = new Set()
  ): Referee => {
    RefereeService.initializePool();

    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }

    const EUR_ONLY: Region[] = [
      Region.POLAND, Region.BALKANS, Region.CZ_SK, Region.IBERIA, Region.SWEDEN, Region.SCANDINAVIA,
      Region.EX_USSR, Region.SPAIN, Region.ENGLAND, Region.GERMANY, Region.ITALY,
      Region.FRANCE, Region.TURKEY, Region.FINLAND, Region.GEORGIA, Region.ARMENIA,
      Region.ALBANIA, Region.ROMANIA, Region.BALTIC, Region.BENELUX, Region.HUNGARIAN,
      Region.MALTESE, Region.ISRAELI, Region.GREEK, Region.AZERBAIJANI, Region.KAZAKH,
    ];
    const isEuropean = (r: Referee) => EUR_ONLY.includes(r.nationality);
    const notConflict = (r: Referee) => r.nationality !== homeRegion && r.nationality !== awayRegion;

    // Pula 1: UEFA/FIFA, europejski, dobra jakość, inny region, nie sędziował dziś
    const eligible = RefereeService.pool.filter(r =>
      r.isInternational && isEuropean(r) && r.consistency > 55 && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible.length > 0) return eligible[Math.abs(hash) % eligible.length];

    // Pula 2: Dowolny UEFA/FIFA europejski, inny region, nie sędziował dziś
    const eligible2 = RefereeService.pool.filter(r =>
      r.isInternational && isEuropean(r) && notConflict(r) && !usedRefereeIds.has(r.id)
    );
    if (eligible2.length > 0) return eligible2[Math.abs(hash) % eligible2.length];

    // Pula 3: Dowolny europejski, nie sędziował dziś (ignorujemy konflikt)
    const eligible3 = RefereeService.pool.filter(r => isEuropean(r) && !usedRefereeIds.has(r.id));
    if (eligible3.length > 0) return eligible3[Math.abs(hash) % eligible3.length];

    // Fallback: Dowolny europejski
    const anyEur = RefereeService.pool.filter(r => isEuropean(r));
    const lastResort = anyEur.length > 0 ? anyEur : RefereeService.pool;
    return lastResort[Math.abs(hash) % lastResort.length];
  },

  /**
   * Deterministically assigns a referee based on match criteria.
   */
  assignReferee: (seedStr: string, importance: number): Referee => {
    RefereeService.initializePool();
    
    // Hash-like selection
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    
    // Important matches get better (more consistent) referees
    const eligibleRefs = RefereeService.pool.filter(r => {
      if (importance >= 4) return r.consistency > 70;
      if (importance >= 3) return r.consistency > 50;
      return true;
    });

    const finalPool = eligibleRefs.length > 0 ? eligibleRefs : RefereeService.pool;
    const index = Math.abs(hash) % finalPool.length;
    return finalPool[index];
  },

  /**
   * Losuje ocenę 1-10. Wyższy consistency = szansa na wyższą ocenę.
   */
  generateMatchRating: (referee: Referee): number => {
    const maxRating = Math.min(10, 4 + Math.floor(referee.consistency / 15));
    return Math.floor(1 + Math.random() * maxRating);
  },

  recordMatchStats: (refereeId: string, rating: number, yellowCards: number, redCards: number): void => {
    const ref = RefereeService.pool.find(r => r.id === refereeId);
    if (!ref) return;
    ref.matchRatings.push(rating);
    ref.totalYellowCardsShown += yellowCards;
    ref.totalRedCardsShown += redCards;
  },

  getAverageRating: (referee: Referee): number | null => {
    if (referee.matchRatings.length === 0) return null;
    const sum = referee.matchRatings.reduce((a, b) => a + b, 0);
    return Math.round((sum / referee.matchRatings.length) * 10) / 10;
  },

  applyEndOfSeasonAdjustments: (): void => {
    RefereeService.pool.forEach(ref => {
      if (ref.matchRatings.length <= 5) return;
      const avg = RefereeService.getAverageRating(ref)!;
      const attrs: (keyof Pick<Referee, 'strictness' | 'consistency' | 'advantageTendency'>)[] =
        ['strictness', 'consistency', 'advantageTendency'];

      if (avg < 6) {
        const penalty = Math.floor(Math.random() * 3) + 1;
        attrs.forEach(attr => {
          ref[attr] = Math.max(5, ref[attr] - penalty);
        });
      } else if (avg > 6.5) {
        const bonus = Math.floor(Math.random() * 3) + 1;
        attrs.forEach(attr => {
          ref[attr] = Math.min(99, ref[attr] + bonus);
        });
      }
    });
  },

  resetSeasonStats: (): void => {
    RefereeService.pool.forEach(ref => {
      ref.matchRatings = [];
      ref.totalYellowCardsShown = 0;
      ref.totalRedCardsShown = 0;
    });
  }
};
