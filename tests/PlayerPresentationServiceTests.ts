import assert from 'node:assert/strict';
import { PlayerPresentationService } from '../services/PlayerPresentationService';

/**
 * Presentation boundary test
 *
 * What this test protects:
 * Condition bars are used in the live match, tactics modal, squad view, and player card. The visual
 * warning threshold must stay consistent: 85 and above is green, below 85 down to 60 is orange, and
 * below 60 is red.
 *
 * Why this matters:
 * The match engine now starts applying user-team fatigue action penalties below 85, so the UI needs to
 * warn at the same boundary. Locking this boundary prevents a later styling cleanup from accidentally
 * moving the orange warning away from the match-engine fatigue penalty threshold.
 */

assert.equal(PlayerPresentationService.getConditionColorClass(100), 'bg-emerald-500');
assert.equal(PlayerPresentationService.getConditionColorClass(85), 'bg-emerald-500');
assert.equal(PlayerPresentationService.getConditionColorClass(84.99), 'bg-orange-500');
assert.equal(PlayerPresentationService.getConditionColorClass(75), 'bg-orange-500');
assert.equal(PlayerPresentationService.getConditionColorClass(70), 'bg-orange-500');
assert.equal(PlayerPresentationService.getConditionColorClass(60), 'bg-orange-500');
assert.equal(PlayerPresentationService.getConditionColorClass(59.99), 'bg-red-500');
assert.equal(PlayerPresentationService.getConditionColorClass(40), 'bg-red-500');

console.log('PlayerPresentationServiceTests: OK');
