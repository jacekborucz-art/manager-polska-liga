// scripts/live_match_stats_diagnostic.ts
var TARGETS = {
  shots: [22, 26],
  shotsOnTarget: [7, 9],
  goals: [2.7, 2.8],
  corners: [9, 10],
  fouls: [22, 28],
  yellowCards: [4, 5],
  redCards: [0.15, 0.25],
  offsides: [3, 5],
  freeKicks: [22, 28],
  throwIns: [35, 50],
  goalKicks: [12, 18]
};
var seededRng = (seed, minute, offset = 0) => {
  const x = Math.sin(seed + minute + offset) * 1e4;
  return x - Math.floor(x);
};
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var qualityGapCurve = (gap) => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};
var emptyStats = () => ({
  shots: 0,
  shotsOnTarget: 0,
  corners: 0,
  fouls: 0,
  yellowCards: 0,
  redCards: 0,
  offsides: 0,
  goals: 0,
  freeKicks: 0,
  throwIns: 0,
  goalKicks: 0
});
var simulateMatch = (seed) => {
  const stats = { home: emptyStats(), away: emptyStats() };
  const homeQuality = 60 + seededRng(seed, 0, 11) * 18;
  const awayQuality = 58 + seededRng(seed, 0, 12) * 18;
  const homeAttackBias = 42 + seededRng(seed, 0, 21) * 32;
  const awayAttackBias = 42 + seededRng(seed, 0, 22) * 32;
  const homeDefenseBias = 42 + seededRng(seed, 0, 31) * 35;
  const awayDefenseBias = 42 + seededRng(seed, 0, 32) * 35;
  for (let minute = 1; minute <= 90; minute++) {
    const scoreDiff = stats.home.goals - stats.away.goals;
    const momentum = clamp(
      (stats.home.shots - stats.away.shots) * 2.2 + scoreDiff * 8 + (seededRng(seed, minute, 41) - 0.5) * 34,
      -100,
      100
    );
    const homeInitiative = clamp(
      0.5 + qualityGapCurve(homeQuality - awayQuality) * 0.12 + momentum * 15e-4,
      0.34,
      0.66
    );
    const activeSide = seededRng(seed, minute, 500) < homeInitiative ? "home" : "away";
    const defendingSide = activeSide === "home" ? "away" : "home";
    const active = stats[activeSide];
    const defending = stats[defendingSide];
    const activeQuality = activeSide === "home" ? homeQuality : awayQuality;
    const defendingQuality = activeSide === "home" ? awayQuality : homeQuality;
    const ratingGap = activeQuality - defendingQuality;
    const attackingBias = activeSide === "home" ? homeAttackBias : awayAttackBias;
    const defendingBias = activeSide === "home" ? awayDefenseBias : homeDefenseBias;
    const activeMidfieldControlDiff = ratingGap * 0.65 + (attackingBias - defendingBias) * 0.12;
    const hasMomentumAdvantage = activeSide === "home" && momentum > 0 || activeSide === "away" && momentum < 0;
    const activeShotGap = active.shots - defending.shots;
    const shotVolumeDrag = minute < 25 || activeShotGap < 8 ? 0 : Math.min(0.034, (activeShotGap - 7) * 26e-4) * (ratingGap > 10 ? 0.4 : ratingGap > 6 ? 0.65 : 1);
    let shotThreshold = 0.092 - defendingBias / 100 * 0.03 + Math.max(-0.014, Math.min(0.02, qualityGapCurve(ratingGap) * 0.02)) + Math.max(-0.016, Math.min(0.016, (attackingBias - 50) / 100 * 0.04)) + (hasMomentumAdvantage ? Math.abs(momentum) / 100 * 0.012 : 0) + (activeMidfieldControlDiff > 2 ? Math.min(6e-3, activeMidfieldControlDiff * 45e-5) : 0);
    if (active.goals - defending.goals >= 3) shotThreshold *= 0.72;
    shotThreshold = clamp(shotThreshold - shotVolumeDrag, 0.05, 0.135);
    const statShotGapDrag = active.shots >= 14 ? Math.min(0.035, (active.shots - 13) * 7e-3) : 0;
    const statPressureChance = clamp(
      0.6 + clamp(qualityGapCurve(ratingGap) * 0.022, -0.018, 0.024) + clamp((attackingBias - 50) / 100 * 0.045, -0.014, 0.018) + (activeMidfieldControlDiff > 0 ? Math.min(0.014, activeMidfieldControlDiff * 1e-3) : -Math.min(0.012, Math.abs(activeMidfieldControlDiff) * 9e-4)) + (hasMomentumAdvantage ? Math.abs(momentum) / 100 * 0.01 : 0) - statShotGapDrag,
      0.48,
      0.68
    );
    const statPressureLimit = Math.min(0.92, shotThreshold + statPressureChance);
    const rngEvent = seededRng(seed, minute, 600);
    const foulThreshold = 0.043;
    if (rngEvent < foulThreshold) {
      active.fouls++;
      defending.freeKicks++;
      const cardRoll = seededRng(seed, minute, 1600);
      if (cardRoll < 0.17) active.yellowCards++;
      if (cardRoll < 8e-3) active.redCards++;
      continue;
    }
    if (rngEvent < shotThreshold) {
      active.shots++;
      const goalChance = clamp(0.105 + qualityGapCurve(ratingGap) * 0.035, 0.055, 0.17);
      const isGoal = seededRng(seed, minute, 750) < goalChance;
      if (isGoal) {
        active.goals++;
        active.shotsOnTarget++;
      } else {
        const failRng = seededRng(seed, minute, 780);
        const isOffTarget = failRng > 0.85;
        if (!isOffTarget) active.shotsOnTarget++;
        if (isOffTarget) defending.goalKicks++;
      }
      continue;
    }
    if (rngEvent < statPressureLimit) {
      const statRng = seededRng(seed, minute, 910);
      const shotShare = active.shots < 8 ? 0.36 : active.shots > 13 ? 0.27 : 0.31;
      const cornerShare = 0.16 + Math.max(0, Math.min(0.05, (active.shots - active.corners) * 5e-3));
      const foulShare = 0.41 + Math.max(0, Math.min(0.06, (70 - defendingBias) * 16e-4));
      if (statRng < shotShare) {
        active.shots++;
        const onTargetChance = clamp(
          0.3 + clamp(qualityGapCurve(ratingGap) * 0.06, -0.05, 0.06) + (activeMidfieldControlDiff > 0 ? 0.025 : -0.015),
          0.22,
          0.42
        );
        if (seededRng(seed, minute, 918) < onTargetChance) active.shotsOnTarget++;
        else defending.goalKicks++;
      } else if (statRng < shotShare + cornerShare) {
        active.corners++;
      } else if (statRng < shotShare + cornerShare + foulShare) {
        active.fouls++;
        defending.freeKicks++;
      } else {
        active.offsides++;
        defending.freeKicks++;
      }
      continue;
    }
    if (rngEvent < 0.32) {
      const flavorRng = seededRng(seed, minute, 900);
      if (flavorRng < 0.12) {
        active.throwIns++;
      } else if (flavorRng < 0.25) {
        active.corners++;
        if (seededRng(seed, minute, 3300) < 0.23) {
          active.shots++;
          if (seededRng(seed, minute, 3500) < 0.08) {
            active.goals++;
            active.shotsOnTarget++;
          } else if (seededRng(seed, minute, 3501) < 0.28) {
            active.shotsOnTarget++;
          } else {
            defending.goalKicks++;
          }
        }
      } else if (flavorRng < 0.72) {
        if (seededRng(seed, minute, 960) < 0.55) active.throwIns++;
      } else if (flavorRng < 0.84) {
        active.offsides++;
        defending.freeKicks++;
      } else if (flavorRng < 0.9) {
        active.freeKicks++;
        if (seededRng(seed, minute, 5100) < 0.18) {
          active.shots++;
          if (seededRng(seed, minute, 5200) < 0.08) {
            active.goals++;
            active.shotsOnTarget++;
          } else defending.goalKicks++;
        }
      } else {
        active.fouls++;
        defending.freeKicks++;
      }
    }
  }
  return stats;
};
var addTotals = (totals, match) => {
  const combined = {
    shots: match.home.shots + match.away.shots,
    shotsOnTarget: match.home.shotsOnTarget + match.away.shotsOnTarget,
    corners: match.home.corners + match.away.corners,
    fouls: match.home.fouls + match.away.fouls,
    yellowCards: match.home.yellowCards + match.away.yellowCards,
    redCards: match.home.redCards + match.away.redCards,
    offsides: match.home.offsides + match.away.offsides,
    goals: match.home.goals + match.away.goals,
    freeKicks: match.home.freeKicks + match.away.freeKicks,
    throwIns: match.home.throwIns + match.away.throwIns,
    goalKicks: match.home.goalKicks + match.away.goalKicks
  };
  for (const key of Object.keys(combined)) totals[key] += combined[key];
  totals.matches++;
};
var fmt = (value) => value.toFixed(2).padStart(6);
var verdict = (value, [min, max]) => {
  if (value < min) return `LOW by ${(min - value).toFixed(2)}`;
  if (value > max) return `HIGH by ${(value - max).toFixed(2)}`;
  return "OK";
};
var run = (matches = 2e3) => {
  const totals = { ...emptyStats(), matches: 0 };
  const zeroShots = { home: 0, away: 0 };
  const zeroCorners = { home: 0, away: 0 };
  const examples = [];
  for (let i = 0; i < matches; i++) {
    const match = simulateMatch(1e5 + i * 97);
    addTotals(totals, match);
    if (match.home.shots === 0) zeroShots.home++;
    if (match.away.shots === 0) zeroShots.away++;
    if (match.home.corners === 0) zeroCorners.home++;
    if (match.away.corners === 0) zeroCorners.away++;
    if (i < 5) examples.push(match);
  }
  console.log(`Live match stats diagnostic sample: ${matches} matches`);
  console.log("Metric             Avg     Target       Verdict");
  for (const key of Object.keys(TARGETS)) {
    const avg = totals[key] / totals.matches;
    const target = TARGETS[key];
    console.log(`${key.padEnd(17)} ${fmt(avg)}   ${target[0]}-${target[1]}      ${verdict(avg, target)}`);
  }
  console.log("");
  console.log(`Zero-shot teams: home ${zeroShots.home}/${matches}, away ${zeroShots.away}/${matches}`);
  console.log(`Zero-corner teams: home ${zeroCorners.home}/${matches}, away ${zeroCorners.away}/${matches}`);
  console.log("");
  console.log("First 5 examples:");
  examples.forEach((match, idx) => {
    const totalShots = match.home.shots + match.away.shots;
    const totalCorners = match.home.corners + match.away.corners;
    const totalGoals = match.home.goals + match.away.goals;
    console.log(
      `#${idx + 1}: ${match.home.goals}-${match.away.goals}, shots ${match.home.shots}-${match.away.shots} (${totalShots}), SoT ${match.home.shotsOnTarget}-${match.away.shotsOnTarget}, corners ${match.home.corners}-${match.away.corners} (${totalCorners}), goals ${totalGoals}`
    );
  });
};
var arg = Number(process.argv[2]);
run(Number.isFinite(arg) && arg > 0 ? Math.floor(arg) : 2e3);
