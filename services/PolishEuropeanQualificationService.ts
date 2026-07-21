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
