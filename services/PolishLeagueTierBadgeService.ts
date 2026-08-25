import { PolishFourthLeagueService } from './PolishFourthLeagueService';
import { PolishThirdLeagueService } from './PolishThirdLeagueService';

export interface PolishLeagueTierBadge {
  label: string;
  color: string;
}

/**
 * Returns the short competition-level badge used next to Polish clubs in cup views.
 *
 * The regional III and IV leagues do not use one shared league identifier. Each
 * group/voivodeship has its own ID, so reading only the numeric part of the ID is
 * misleading: `L_PL_4_G1` is III liga and `L_PL_5_MZ` is IV liga. Keeping this
 * translation in one place prevents the draw and results screens from disagreeing.
 */
export const getPolishLeagueTierBadge = (
  leagueId: string | null | undefined,
): PolishLeagueTierBadge => {
  if (PolishThirdLeagueService.isThirdLeagueId(leagueId) || leagueId === 'L_PL_4') {
    return { label: '3L', color: '#94a3b8' };
  }

  if (PolishFourthLeagueService.isFourthLeagueId(leagueId)) {
    return { label: '4L', color: '#22d3ee' };
  }

  switch (leagueId) {
    case 'L_PL_1':
      return { label: 'EKS', color: '#f59e0b' };
    case 'L_PL_2':
      return { label: '1L', color: '#60a5fa' };
    case 'L_PL_3':
      return { label: '2L', color: '#a3e635' };
    default:
      return { label: '?', color: '#64748b' };
  }
};
