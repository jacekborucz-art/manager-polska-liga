import assert from 'node:assert/strict';
import { FOURTH_LEAGUE_IDS } from '../services/PolishFourthLeagueService';
import { THIRD_LEAGUE_GROUP_IDS } from '../services/PolishThirdLeagueService';
import { getPolishLeagueTierBadge } from '../services/PolishLeagueTierBadgeService';

assert.equal(getPolishLeagueTierBadge('L_PL_1').label, 'EKS');
assert.equal(getPolishLeagueTierBadge('L_PL_2').label, '1L');
assert.equal(getPolishLeagueTierBadge('L_PL_3').label, '2L');

// Every regional III liga group must keep the public 3L label.
THIRD_LEAGUE_GROUP_IDS.forEach(leagueId => {
  assert.equal(getPolishLeagueTierBadge(leagueId).label, '3L', leagueId);
});

// Every voivodeship IV liga must be recognized, on either side of a cup tie.
// The UI calls the same pure helper for home and away clubs, so covering the
// complete ID collection prevents a region-specific fallback to the `?` badge.
FOURTH_LEAGUE_IDS.forEach(leagueId => {
  assert.equal(getPolishLeagueTierBadge(leagueId).label, '4L', leagueId);
});

assert.equal(getPolishLeagueTierBadge('UNKNOWN_LEAGUE').label, '?');

console.log(`Polish league tier badges: ${THIRD_LEAGUE_GROUP_IDS.length} III liga groups and ${FOURTH_LEAGUE_IDS.length} IV liga regions passed.`);
