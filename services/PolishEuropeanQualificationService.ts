export interface PolishEuropeanQualificationInput {
  leagueTableIds: string[];
  cupWinnerId?: string | null;
  cupRunnerUpId?: string | null;
}

export interface PolishEuropeanQualificationResult {
  championsLeagueR2TeamId: string | null;
  championsLeagueR1TeamId: string | null;
  europaLeagueR2TeamId: string | null;
  conferenceLeagueR2TeamIds: string[];
}

export interface InitialPolishEuropeanQualification {
  championsLeagueR2TeamId: string;
  championsLeagueR1TeamId: string;
  europaLeagueR2TeamId: string;
  conferenceLeagueR1TeamIds: string[];
  conferenceLeagueR2TeamIds: string[];
}

const DEFAULT_INITIAL_QUALIFICATION: InitialPolishEuropeanQualification = {
  championsLeagueR2TeamId: 'PL_LECH_POZNAN',
  championsLeagueR1TeamId: 'PL_RAKOW_CZESTOCHOWA',
  europaLeagueR2TeamId: 'PL_LEGIA_WARSZAWA',
  conferenceLeagueR1TeamIds: [],
  conferenceLeagueR2TeamIds: ['PL_JAGIELLONIA_BIALYSTOK', 'PL_POGON_SZCZECIN'],
};

const INITIAL_QUALIFICATION_2026_27: InitialPolishEuropeanQualification = {
  championsLeagueR2TeamId: 'PL_LECH_POZNAN',
  championsLeagueR1TeamId: 'PL_GORNIK_ZABRZE',
  europaLeagueR2TeamId: 'PL_JAGIELLONIA_BIALYSTOK',
  conferenceLeagueR1TeamIds: ['PL_RAKOW_CZESTOCHOWA', 'PL_GKS_KATOWICE'],
  conferenceLeagueR2TeamIds: [],
};

const firstAvailable = (teamIds: Array<string | null | undefined>, excludedIds: Set<string>): string | null =>
  teamIds.find((teamId): teamId is string => !!teamId && !excludedIds.has(teamId)) ?? null;

/**
 * Przydziela polskim klubom miejsca w europejskich pucharach.
 *
 * Priorytet miejsc:
 * 1. mistrz Polski -> Liga Mistrzów R2,
 * 2. wicemistrz Polski -> Liga Mistrzów R1,
 * 3. zdobywca Pucharu Polski -> Liga Europy R2,
 * 4. dwa najwyżej sklasyfikowane wolne kluby od 3. miejsca -> Liga Konferencji R2.
 *
 * Jeżeli zdobywca Pucharu Polski jest już w Lidze Mistrzów, miejsce w Lidze Europy
 * otrzymuje finalista PP spoza LM, a jeśli również jest zajęty - najwyższy wolny klub ligi.
 */
export const PolishEuropeanQualificationService = {
  getInitialQualification(careerStartYear: number): InitialPolishEuropeanQualification {
    const qualification = careerStartYear === 2026
      ? INITIAL_QUALIFICATION_2026_27
      : DEFAULT_INITIAL_QUALIFICATION;

    return {
      ...qualification,
      conferenceLeagueR1TeamIds: [...qualification.conferenceLeagueR1TeamIds],
      conferenceLeagueR2TeamIds: [...qualification.conferenceLeagueR2TeamIds],
    };
  },

  resolve({
    leagueTableIds,
    cupWinnerId,
    cupRunnerUpId,
  }: PolishEuropeanQualificationInput): PolishEuropeanQualificationResult {
    const uniqueLeagueTableIds = leagueTableIds.filter(
      (teamId, index) => !!teamId && leagueTableIds.indexOf(teamId) === index,
    );

    const championsLeagueR2TeamId = uniqueLeagueTableIds[0] ?? null;
    const championsLeagueR1TeamId = uniqueLeagueTableIds[1] ?? null;
    const championsLeagueIds = new Set(
      [championsLeagueR2TeamId, championsLeagueR1TeamId].filter((teamId): teamId is string => !!teamId),
    );

    const europaLeagueR2TeamId = firstAvailable(
      [cupWinnerId, cupRunnerUpId, ...uniqueLeagueTableIds.slice(2)],
      championsLeagueIds,
    );

    const occupiedIds = new Set(championsLeagueIds);
    if (europaLeagueR2TeamId) occupiedIds.add(europaLeagueR2TeamId);

    const conferenceLeagueR2TeamIds = uniqueLeagueTableIds
      .slice(2)
      .filter(teamId => !occupiedIds.has(teamId))
      .slice(0, 2);

    return {
      championsLeagueR2TeamId,
      championsLeagueR1TeamId,
      europaLeagueR2TeamId,
      conferenceLeagueR2TeamIds,
    };
  },
};
