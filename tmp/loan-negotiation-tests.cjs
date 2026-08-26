// tests/LoanNegotiationTests.ts
var import_node_assert = require("node:assert");

// services/LoanNegotiationService.ts
var POSITION_STARTERS = {
  ["GK" /* GK */]: 1,
  ["DEF" /* DEF */]: 4,
  ["MID" /* MID */]: 4,
  ["FWD" /* FWD */]: 2
};
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var unit = (seed) => {
  const x = Math.sin(seed) * 1e4;
  return x - Math.floor(x);
};
var getDevelopmentPriority = (player2) => {
  const ageScore = player2.age <= 19 ? 1 : player2.age <= 21 ? 0.86 : player2.age <= 23 ? 0.66 : player2.age <= 25 ? 0.36 : 0.1;
  const talentGap = clamp((player2.attributes.talent - player2.overallRating) / 22, 0, 1);
  const overallScore = clamp((player2.overallRating - 52) / 28, 0, 1);
  return clamp(ageScore * 0.52 + talentGap * 0.2 + overallScore * 0.28, 0, 1);
};
var getRoleCredibility = (player2, buyerSquad2, role) => {
  const samePosition = buyerSquad2.filter((candidate) => candidate.position === player2.position && candidate.id !== player2.id);
  const strongerPlayers = samePosition.filter((candidate) => candidate.overallRating > player2.overallRating).length;
  const starterSlots = POSITION_STARTERS[player2.position];
  const allowedAhead = role === "FIRST_TEAM" ? starterSlots - 1 : starterSlots + 2;
  if (strongerPlayers <= allowedAhead) return 1;
  return clamp(1 - (strongerPlayers - allowedAhead) * 0.22, 0.12, 0.82);
};
var LoanNegotiationService = {
  getArrivalDate(agreementDate) {
    const date = new Date(agreementDate);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().split("T")[0];
  },
  isClubInterested(input) {
    const { player: player2, buyerClub, sellerClub, buyerSquad: buyerSquad2, sellerSquad: sellerSquad2, seed } = input;
    const developmentPriority = getDevelopmentPriority(player2);
    const firstTeamCredibility = getRoleCredibility(player2, buyerSquad2, "FIRST_TEAM");
    const sellerSamePosition = sellerSquad2.filter((candidate) => candidate.position === player2.position && candidate.id !== player2.id);
    const starterSlots = POSITION_STARTERS[player2.position];
    const strongerAtSeller = sellerSamePosition.filter((candidate) => candidate.overallRating >= player2.overallRating).length;
    const isImportantAtSeller = sellerSamePosition.length <= starterSlots + 1 && strongerAtSeller < starterSlots;
    const isSurplusAtSeller = strongerAtSeller >= starterSlots || sellerSamePosition.length >= starterSlots + 3;
    const reputationGap = buyerClub.reputation - sellerClub.reputation;
    let chance = 0.74;
    chance += developmentPriority * 0.1;
    chance += isSurplusAtSeller ? 0.12 : 0;
    chance -= isImportantAtSeller ? 0.34 : 0;
    chance += firstTeamCredibility >= 0.62 ? 0.06 : -0.16;
    chance += clamp(reputationGap * 0.018, -0.12, 0.06);
    return unit(seed + 17001) < clamp(chance, 0.18, 0.96);
  },
  createState(currentDate, initialTerms2, seed) {
    return {
      startedAt: new Date(currentDate).toISOString().split("T")[0],
      approach: 0,
      maxApproaches: 3 + Math.floor(unit(seed + 17101) * 3),
      clubTerms: initialTerms2
    };
  },
  negotiateRound(input) {
    const { player: player2, buyerSquad: buyerSquad2, sellerClub, submittedTerms, state, expectedLoanFee, seed } = input;
    const nextApproach = state.approach + 1;
    const isFinalApproach = nextApproach >= state.maxApproaches;
    const roleCredibility = getRoleCredibility(player2, buyerSquad2, submittedTerms.promisedPlayingTime);
    const requestedFinancialScore = Math.min(1.4, submittedTerms.wageCoveragePercent / 65) * 0.55 + Math.min(1.4, expectedLoanFee > 0 ? submittedTerms.loanFee / expectedLoanFee : submittedTerms.loanFee > 0 ? 1 : 0) * 0.45;
    const currentClubTerms = state.clubTerms;
    const meetsClubTerms = submittedTerms.loanFee >= currentClubTerms.loanFee && submittedTerms.wageCoveragePercent >= currentClubTerms.wageCoveragePercent && (currentClubTerms.promisedPlayingTime !== "FIRST_TEAM" || submittedTerms.promisedPlayingTime === "FIRST_TEAM");
    if (isFinalApproach) {
      let finalChance = 0.24 + requestedFinancialScore * 0.34 + roleCredibility * 0.25;
      if (meetsClubTerms) finalChance += 0.2;
      if (player2.age <= 23 && submittedTerms.promisedPlayingTime === "FIRST_TEAM") finalChance += 0.12;
      finalChance += (unit(seed + nextApproach * 307) - 0.5) * 0.14;
      if (unit(seed + nextApproach * 311) < clamp(finalChance, 0.12, 0.94)) {
        return {
          outcome: "ACCEPT",
          message: `${sellerClub.name} zaakceptowa\u0142 ostateczne warunki wypo\u017Cyczenia. Zawodnik zamelduje si\u0119 w nowym klubie nast\u0119pnego dnia.`
        };
      }
      return {
        outcome: "REJECT",
        message: `${sellerClub.name} nie jest zainteresowany wypo\u017Cyczeniem zawodnika do tego klubu na uzgodnionych warunkach.`
      };
    }
    const feeDirection = unit(seed + nextApproach * 401) < 0.62 ? 1 : -1;
    const coverageDirection = unit(seed + nextApproach * 409) < 0.62 ? 1 : -1;
    const feeStep = Math.max(5e3, Math.round(Math.max(expectedLoanFee, 2e4) * (0.15 + unit(seed + nextApproach * 419) * 0.3) / 5e3) * 5e3);
    const coverageStep = 5 + Math.floor(unit(seed + nextApproach * 421) * 3) * 5;
    const referenceFee = nextApproach === 1 ? submittedTerms.loanFee : currentClubTerms.loanFee;
    const referenceCoverage = nextApproach === 1 ? submittedTerms.wageCoveragePercent : currentClubTerms.wageCoveragePercent;
    const shouldDemandFirstTeam = player2.age <= 23 && getRoleCredibility(player2, buyerSquad2, "FIRST_TEAM") >= 0.62 && unit(seed + nextApproach * 431) < 0.48;
    const counterOffer = {
      loanFee: Math.max(0, Math.round((referenceFee + feeDirection * feeStep) / 5e3) * 5e3),
      wageCoveragePercent: clamp(Math.round((referenceCoverage + coverageDirection * coverageStep) / 5) * 5, 0, 100),
      loanDuration: unit(seed + nextApproach * 433) < 0.22 ? submittedTerms.loanDuration === "SEASON" ? "ROUND" : "SEASON" : submittedTerms.loanDuration,
      promisedPlayingTime: shouldDemandFirstTeam ? "FIRST_TEAM" : submittedTerms.promisedPlayingTime
    };
    const nextState = {
      ...state,
      approach: nextApproach,
      clubTerms: counterOffer
    };
    return {
      outcome: "COUNTER",
      message: `${sellerClub.name} chce kontynuowa\u0107 rozmowy i przedstawia w\u0142asne warunki wypo\u017Cyczenia.`,
      nextState,
      counterOffer
    };
  },
  getLockoutUntil(currentDate, seed) {
    const date = new Date(currentDate);
    const months = 3 + Math.floor(unit(seed + 19981) * 10);
    const originalDay = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + months);
    const endOfTargetMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(originalDay, endOfTargetMonth));
    return date.toISOString().split("T")[0];
  },
  isLocked(player2, buyerClubId, currentDate) {
    const lockout = player2.loanNegotiationLockouts?.[buyerClubId];
    if (!lockout) return false;
    const until = new Date(lockout);
    const now = new Date(currentDate);
    return !Number.isNaN(until.getTime()) && until > now;
  },
  reviewPromise(input) {
    const {
      player: player2,
      promisedPlayingTime,
      eligibleClubMatches,
      playerMatches,
      playerMinutes,
      previousBreaches,
      seed
    } = input;
    if (eligibleClubMatches < 3) {
      return { outcome: "NOT_ENOUGH_DATA", nextBreaches: previousBreaches, message: "Za ma\u0142o oficjalnych mecz\xF3w do rzetelnej oceny obietnicy." };
    }
    const requiredMatches = Math.ceil(eligibleClubMatches * (promisedPlayingTime === "FIRST_TEAM" ? 0.6 : 0.35));
    const requiredMinutes = eligibleClubMatches * (promisedPlayingTime === "FIRST_TEAM" ? 50 : 18);
    const fulfilled2 = playerMatches >= requiredMatches && playerMinutes >= requiredMinutes;
    if (fulfilled2) {
      return { outcome: "FULFILLED", nextBreaches: 0, message: "Klub macierzysty jest zadowolony z realizacji obietnicy minut." };
    }
    const nextBreaches = previousBreaches + 1;
    if (nextBreaches === 1) {
      return { outcome: "WARNING", nextBreaches, message: "Klub macierzysty ostrzega, \u017Ce obietnica dotycz\u0105ca minut nie jest realizowana." };
    }
    const matchRatio = requiredMatches > 0 ? playerMatches / requiredMatches : 0;
    const minuteRatio = requiredMinutes > 0 ? playerMinutes / requiredMinutes : 0;
    const severity = clamp(1 - Math.min(matchRatio, minuteRatio), 0, 1);
    const developmentPriority = getDevelopmentPriority(player2);
    const recallChance = clamp(
      0.34 + developmentPriority * 0.34 + severity * 0.24 + (playerMatches === 0 ? 0.1 : 0),
      0.35,
      0.95
    );
    if (unit(seed + 21113) < recallChance) {
      return { outcome: "RECALL", nextBreaches, message: "Klub macierzysty odwo\u0142uje zawodnika z powodu z\u0142amania warunk\xF3w wypo\u017Cyczenia." };
    }
    return { outcome: "CONTINUE", nextBreaches, message: "Klub macierzysty pozostawia zawodnika na wypo\u017Cyczeniu, ale nadal obserwuje jego minuty." };
  }
};

// tests/LoanNegotiationTests.ts
var club = (id, reputation) => ({
  id,
  name: id,
  shortName: id.slice(0, 3),
  leagueId: id === "BUYER" ? "L_PL_3" : "L_PL_1",
  tier: id === "BUYER" ? 3 : 1,
  colorsHex: ["#000000", "#ffffff"],
  stadiumName: "Stadion",
  stadiumCapacity: 1e4,
  reputation,
  country: "POL",
  isDefaultActive: true,
  rosterIds: [],
  stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
  budget: 1e6,
  transferBudget: 5e5,
  boardStrictness: 50,
  signingBonusPool: 0
});
var player = (id, age, overallRating, talent) => ({
  id,
  firstName: "Jan",
  lastName: id,
  age,
  clubId: "SELLER",
  nationality: "POLAND" /* POLAND */,
  position: "FWD" /* FWD */,
  overallRating,
  attributes: {
    strength: 60,
    stamina: 60,
    pace: 60,
    defending: 40,
    passing: 60,
    attacking: 65,
    finishing: 65,
    technique: 60,
    vision: 60,
    dribbling: 60,
    heading: 60,
    positioning: 60,
    goalkeeping: 10,
    freeKicks: 50,
    talent,
    penalties: 50,
    corners: 50,
    aggression: 50,
    crossing: 50,
    leadership: 50,
    mentality: 60,
    workRate: 60
  },
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: []
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: "2052-06-30",
  annualSalary: 12e4,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0
});
var buyer = club("BUYER", 6);
var seller = club("SELLER", 13);
var prospect = player("PROSPECT", 19, 70, 90);
var buyerSquad = [player("BUYER_FWD_1", 27, 64, 65), player("BUYER_FWD_2", 24, 62, 68)];
var sellerSquad = [prospect, player("SELLER_FWD_1", 27, 76, 78), player("SELLER_FWD_2", 25, 74, 77), player("SELLER_FWD_3", 23, 72, 82), player("SELLER_FWD_4", 21, 71, 85)];
var initialTerms = {
  loanFee: 0,
  wageCoveragePercent: 20,
  loanDuration: "SEASON",
  promisedPlayingTime: "ROTATION"
};
import_node_assert.strict.equal(
  LoanNegotiationService.getArrivalDate("2050-07-31"),
  "2050-08-01",
  "zawodnik musi do\u0142\u0105czy\u0107 dok\u0142adnie nast\u0119pnego dnia, tak\u017Ce na granicy miesi\u0105ca"
);
var approachCounts = /* @__PURE__ */ new Set();
for (let seed = 1; seed <= 300; seed += 1) {
  const state = LoanNegotiationService.createState("2050-07-01", initialTerms, seed);
  approachCounts.add(state.maxApproaches);
  import_node_assert.strict.ok(state.maxApproaches >= 3 && state.maxApproaches <= 5, "negocjacje musz\u0105 trwa\u0107 od 3 do 5 podej\u015B\u0107");
  import_node_assert.strict.deepEqual(
    state,
    LoanNegotiationService.createState("2050-07-01", initialTerms, seed),
    "ukryta liczba podej\u015B\u0107 musi by\u0107 odporna na ponowne wczytanie"
  );
}
import_node_assert.strict.deepEqual([...approachCounts].sort(), [3, 4, 5], "RNG musi wykorzystywa\u0107 wszystkie d\u0142ugo\u015Bci negocjacji");
var higherCounters = 0;
var lowerCounters = 0;
for (let seed = 1; seed <= 300; seed += 1) {
  const state = LoanNegotiationService.createState("2050-07-01", initialTerms, seed);
  const result = LoanNegotiationService.negotiateRound({
    player: prospect,
    buyerClub: buyer,
    sellerClub: seller,
    buyerSquad,
    sellerSquad,
    submittedTerms: initialTerms,
    state,
    expectedLoanFee: 5e4,
    seed
  });
  import_node_assert.strict.equal(result.outcome, "COUNTER", "pierwsza oferta zainteresowanego klubu nie mo\u017Ce natychmiast ko\u0144czy\u0107 negocjacji");
  if ((result.counterOffer?.loanFee ?? 0) > initialTerms.loanFee || (result.counterOffer?.wageCoveragePercent ?? 0) > initialTerms.wageCoveragePercent) higherCounters += 1;
  if ((result.counterOffer?.loanFee ?? 0) < initialTerms.loanFee || (result.counterOffer?.wageCoveragePercent ?? 0) < initialTerms.wageCoveragePercent) lowerCounters += 1;
}
import_node_assert.strict.ok(higherCounters > 0, "klub musi czasem podwy\u017Csza\u0107 warunki");
import_node_assert.strict.ok(lowerCounters > 0, "klub musi czasem obni\u017Ca\u0107 warunki");
var stateFive = { ...LoanNegotiationService.createState("2050-07-01", initialTerms, 10), maxApproaches: 5 };
var currentState = stateFive;
for (let approach = 1; approach < 5; approach += 1) {
  const result = LoanNegotiationService.negotiateRound({
    player: prospect,
    buyerClub: buyer,
    sellerClub: seller,
    buyerSquad,
    sellerSquad,
    submittedTerms: currentState.clubTerms,
    state: currentState,
    expectedLoanFee: 5e4,
    seed: 10
  });
  import_node_assert.strict.equal(result.outcome, "COUNTER", "przed ukrytym limitem klub powinien kontynuowa\u0107 rozmowy");
  currentState = result.nextState;
}
var finalResult = LoanNegotiationService.negotiateRound({
  player: prospect,
  buyerClub: buyer,
  sellerClub: seller,
  buyerSquad,
  sellerSquad,
  submittedTerms: { loanFee: 1e5, wageCoveragePercent: 100, loanDuration: "SEASON", promisedPlayingTime: "FIRST_TEAM" },
  state: currentState,
  expectedLoanFee: 5e4,
  seed: 10
});
import_node_assert.strict.ok(finalResult.outcome === "ACCEPT" || finalResult.outcome === "REJECT", "dopiero ostatnie podej\u015Bcie powinno zako\u0144czy\u0107 rozmowy");
for (let seed = 1; seed <= 100; seed += 1) {
  const until = new Date(LoanNegotiationService.getLockoutUntil("2050-01-15", seed));
  import_node_assert.strict.ok(until >= /* @__PURE__ */ new Date("2050-04-15"), "blokada nie mo\u017Ce by\u0107 kr\xF3tsza ni\u017C 3 miesi\u0105ce");
  import_node_assert.strict.ok(until <= /* @__PURE__ */ new Date("2051-01-15"), "blokada nie mo\u017Ce by\u0107 d\u0142u\u017Csza ni\u017C 12 miesi\u0119cy");
}
var warning = LoanNegotiationService.reviewPromise({
  player: prospect,
  promisedPlayingTime: "FIRST_TEAM",
  eligibleClubMatches: 5,
  playerMatches: 1,
  playerMinutes: 30,
  previousBreaches: 0,
  seed: 10
});
import_node_assert.strict.equal(warning.outcome, "WARNING");
var fulfilled = LoanNegotiationService.reviewPromise({
  player: prospect,
  promisedPlayingTime: "FIRST_TEAM",
  eligibleClubMatches: 5,
  playerMatches: 4,
  playerMinutes: 320,
  previousBreaches: 1,
  seed: 10
});
import_node_assert.strict.equal(fulfilled.outcome, "FULFILLED");
import_node_assert.strict.equal(fulfilled.nextBreaches, 0);
console.log("LoanNegotiationTests: OK");
