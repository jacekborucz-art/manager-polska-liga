var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));

// tests/ManagerContractServiceTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/ManagerJobService.ts
function getLeagueTier(club2) {
  const tier = Number.parseInt(String(club2.leagueId).split("_")[2] || "", 10);
  return Number.isFinite(tier) ? tier : club2.tier ?? 4;
}
function getRequiredManagerExp(club2) {
  const tier = getLeagueTier(club2);
  const reputation = club2.reputation ?? 5;
  if (tier === 1) return Math.round(130 + reputation * 18);
  if (tier === 2) return Math.round(35 + reputation * 9);
  return Math.max(1, Math.round(reputation * 4));
}

// services/ManagerContractService.ts
var DAY_MS = 864e5;
var BOARD_LEVEL = {
  bardzo_niska: 1,
  niska: 2,
  przecietna: 3,
  wysoka: 4,
  bardzo_wysoka: 5
};
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var SALARY_MODEL_VERSION = 4;
var SALARY_STEP = 5e5;
var MANAGER_SALARY_NEGOTIATION_STEP = 1e5;
var RELEGATION_MANAGER_SURVIVAL_CHANCE = 0.05;
var roundSalary = (value) => Math.max(SALARY_STEP, Math.round(value / SALARY_STEP) * SALARY_STEP);
var normalizeNegotiatedSalary = (value) => Math.max(MANAGER_SALARY_NEGOTIATION_STEP, Math.round(value / MANAGER_SALARY_NEGOTIATION_STEP) * MANAGER_SALARY_NEGOTIATION_STEP);
var getTier = (club2) => {
  const parsed = Number.parseInt(String(club2.leagueId).split("_")[2] || "", 10);
  return Number.isFinite(parsed) ? parsed : Math.max(1, club2.tier ?? 3);
};
var getLeagueSize = (club2, clubs2) => Math.max(16, clubs2.filter((candidate) => candidate.leagueId === club2.leagueId).length);
var getDayTimestamp = (value) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return Number.NaN;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};
function getManagerTenureSnapshot(contract, club2, fixtures, currentDate) {
  if (!contract || contract.clubId !== club2.id) {
    return {
      daysInRole: Number.POSITIVE_INFINITY,
      leagueMatchesManaged: Math.max(0, club2.stats.played ?? 0),
      pressureStage: "FULL",
      dismissalEligible: true
    };
  }
  const signedAt = getDayTimestamp(contract.signedAt || contract.terms.startDate);
  const currentDay = getDayTimestamp(currentDate);
  if (!Number.isFinite(signedAt) || !Number.isFinite(currentDay)) {
    return { daysInRole: 0, leagueMatchesManaged: 0, pressureStage: "NONE", dismissalEligible: false };
  }
  const leagueMatchesManaged = fixtures.filter((fixture) => {
    if (fixture.status !== "FINISHED" /* FINISHED */ || fixture.leagueId !== club2.leagueId) return false;
    if (fixture.homeTeamId !== club2.id && fixture.awayTeamId !== club2.id) return false;
    const fixtureDay = getDayTimestamp(fixture.date);
    return Number.isFinite(fixtureDay) && fixtureDay >= signedAt && fixtureDay <= currentDay;
  }).length;
  const daysInRole = Math.max(0, Math.floor((currentDay - signedAt) / DAY_MS));
  const pressureStage = daysInRole < 21 || leagueMatchesManaged < 3 ? "NONE" : daysInRole < 42 || leagueMatchesManaged < 6 ? "CONCERN" : "FULL";
  return {
    daysInRole,
    leagueMatchesManaged,
    pressureStage,
    dismissalEligible: daysInRole >= 60 && leagueMatchesManaged >= 8
  };
}
function getManagerPolishChampionshipCount(profile) {
  if (!profile) return 0;
  const achievementTitles = new Set(
    (profile.achievements ?? []).filter((entry) => entry.competition === "Ekstraklasa" && /^Mistrz Polski\b/i.test(entry.title)).map((entry) => entry.seasonLabel || entry.id)
  );
  const expHistoryTitles = new Set(
    (profile.expHistory ?? []).filter((entry) => entry.label === "Mistrzostwo Polski").map((entry) => String(entry.season))
  );
  return Math.max(achievementTitles.size, expHistoryTitles.size);
}
function calculateClubManagerSalaryBenchmark(club2) {
  const tier = getTier(club2);
  const reputation = clamp(club2.reputation ?? 5, 1, 20);
  if (tier === 1) return roundSalary(clamp(2e6 + reputation * 3e5, 25e5, 5e6));
  if (tier === 2) return roundSalary(clamp(7e5 + reputation * 16e4, 1e6, 25e5));
  if (tier === 3) return roundSalary(clamp(4e5 + reputation * 9e4, 5e5, 15e5));
  return roundSalary(clamp(25e4 + reputation * 5e4, 5e5, 1e6));
}
function calculateManagerNegotiationSalaryCeiling(club2, profile) {
  const clubSalaryBenchmark = calculateClubManagerSalaryBenchmark(club2);
  const tier = getTier(club2);
  const requiredExp = Math.max(1, getRequiredManagerExp(club2));
  const managerExp = Math.max(1, profile?.expPoints ?? 1);
  const experienceRatio = managerExp / requiredExp;
  const polishChampionships = getManagerPolishChampionshipCount(profile);
  const careerSeasons = Math.max(0, profile?.careerHistory?.length ?? 0);
  const experienceGrowth = clamp(Math.log2(Math.max(1, experienceRatio)) * 0.025, 0, 0.22);
  const honoursGrowth = clamp(Math.max(0, polishChampionships - 1) * 0.07, 0, 0.28);
  const longevityGrowth = clamp(Math.max(0, careerSeasons - 3) * 0.015, 0, 0.08);
  const managerGrowth = experienceGrowth + honoursGrowth + longevityGrowth;
  const financialStrength = Math.max(0, club2.budget ?? 0) + Math.max(0, club2.transferBudget ?? 0) * 0.35;
  const wealthThreshold = tier === 1 ? 6e7 : tier === 2 ? 18e6 : tier === 3 ? 6e6 : 2e6;
  const wealthRange = tier === 1 ? 3e8 : tier === 2 ? 9e7 : tier === 3 ? 3e7 : 12e6;
  const financialGrowthCapacity = clamp((financialStrength - wealthThreshold) / wealthRange, 0, 0.55);
  const dynamicGrowth = Math.min(managerGrowth, financialGrowthCapacity);
  return normalizeNegotiatedSalary(clubSalaryBenchmark * (1 + dynamicGrowth));
}
function getManagerSalaryLeverage(club2, profile) {
  const requiredExp = Math.max(1, getRequiredManagerExp(club2));
  const managerExp = Math.max(1, profile?.expPoints ?? 1);
  const ratio = clamp(managerExp / requiredExp, 0, 1.5);
  const polishChampionships = getManagerPolishChampionshipCount(profile);
  const careerSeasons = Math.max(0, profile?.careerHistory?.length ?? 0);
  const clubSalaryBenchmark = calculateClubManagerSalaryBenchmark(club2);
  const negotiationSalaryCeiling = calculateManagerNegotiationSalaryCeiling(club2, profile);
  const experienceContribution = clamp((ratio - 0.1) / 0.9, 0, 1) * 0.06;
  const offerMultiplier = clamp(
    0.5 + Math.min(3, polishChampionships) * 0.12 + experienceContribution + Math.min(5, careerSeasons) * 8e-3,
    0.5,
    0.94
  );
  const maxNegotiatedPremium = clamp(
    0.08 + Math.min(3, polishChampionships) * 0.085 + Math.min(1, ratio) * 0.04,
    0.08,
    0.38
  );
  return {
    requiredExp,
    managerExp,
    polishChampionships,
    clubSalaryBenchmark,
    negotiationSalaryCeiling,
    offerMultiplier,
    maxNegotiatedPremium,
    isDiscountedOffer: offerMultiplier < 0.8
  };
}
var getSeasonEnd = (startDate, durationYears) => {
  return new Date(startDate.getFullYear() + durationYears, 5, 30, 12, 0, 0, 0);
};
var target = (club2, clubs2, type, label, description, ambitionLevel, leagueMaxRank, requiresPolishCup = false) => ({
  id: `${club2.leagueId}:${type}:${leagueMaxRank}:${requiresPolishCup ? "CUP" : "LEAGUE"}`,
  type,
  label,
  description,
  ambitionLevel,
  leagueMaxRank: clamp(leagueMaxRank, 1, getLeagueSize(club2, clubs2)),
  requiresPolishCup
});
function getAvailableTargets(club2, clubs2) {
  const tier = getTier(club2);
  const leagueSize = getLeagueSize(club2, clubs2);
  const survivalRank = Math.max(10, leagueSize - 3);
  const middleRank = Math.max(8, Math.ceil(leagueSize * 0.58));
  if (tier >= 2) {
    const promotionDestination = tier === 2 ? "Ekstraklasy" : tier === 3 ? "1. ligi" : "wy\u017Cszej ligi";
    return [
      target(club2, clubs2, "SURVIVAL", "Utrzymanie w lidze", "Zesp\xF3\u0142 ma utrzyma\u0107 si\u0119 w lidze i zako\u0144czy\u0107 sezon poza stref\u0105 spadkow\u0105.", 1, survivalRank),
      target(club2, clubs2, "MID_TABLE", "Bezpieczny \u015Brodek tabeli", "Celem jest spokojny sezon i stabilna pozycja w \u015Brodku tabeli.", 2, middleRank),
      target(club2, clubs2, "PROMOTION_PLAYOFFS", "Miejsce bara\u017Cowe", "Dru\u017Cyna ma zakwalifikowa\u0107 si\u0119 do bara\u017Cy o awans.", 3, 6),
      target(club2, clubs2, "PROMOTION", `Awans do ${promotionDestination}`, `Celem jest wywalczenie bezpo\u015Bredniego awansu do ${promotionDestination}.`, 4, 2),
      target(club2, clubs2, "POLISH_CUP", "Zdobycie Pucharu Polski", `Zesp\xF3\u0142 ma utrzyma\u0107 bezpieczn\u0105 pozycj\u0119 ligow\u0105 i zdoby\u0107 Puchar Polski.`, 5, middleRank, true),
      target(club2, clubs2, "PROMOTION_AND_CUP", `Awans do ${promotionDestination} i Puchar Polski`, `Celem jest bezpo\u015Bredni awans do ${promotionDestination} oraz zdobycie Pucharu Polski w tym samym sezonie.`, 7, 2, true)
    ];
  }
  return [
    target(club2, clubs2, "SURVIVAL", "Utrzymanie w Ekstraklasie", "Zesp\xF3\u0142 ma unikn\u0105\u0107 spadku i zachowa\u0107 miejsce w Ekstraklasie.", 1, survivalRank),
    target(club2, clubs2, "MID_TABLE", "\u015Arodek tabeli", "Celem jest stabilna pozycja w \u015Brodku tabeli.", 2, middleRank),
    target(club2, clubs2, "TOP_SIX", "G\xF3rna sz\xF3stka", "Celem jest zako\u0144czenie sezonu w g\xF3rnej cz\u0119\u015Bci tabeli.", 3, 6),
    target(club2, clubs2, "TOP_THREE", "Podium", "Celem jest miejsce na podium i walka o europejskie puchary.", 4, 3),
    target(club2, clubs2, "CHAMPION", "Mistrzostwo Polski", "Celem jest zdobycie Mistrzostwa Polski.", 5, 1),
    target(club2, clubs2, "POLISH_CUP", "Zdobycie Pucharu Polski", "Zesp\xF3\u0142 ma utrzyma\u0107 stabiln\u0105 pozycj\u0119 ligow\u0105 i zdoby\u0107 Puchar Polski.", 5, middleRank, true),
    target(club2, clubs2, "LEAGUE_AND_CUP", "Mistrzostwo i Puchar Polski", "Celem jest zdobycie Mistrzostwa Polski oraz Pucharu Polski w tym samym sezonie.", 7, 1, true)
  ];
}
function getBoardPreferredTarget(club2, clubs2) {
  const options = getAvailableTargets(club2, clubs2);
  const expectation = BOARD_LEVEL[club2.board?.oczekiwania ?? "przecietna"];
  const ambition = BOARD_LEVEL[club2.board?.ambicja ?? "przecietna"];
  const reputationBoost = (club2.reputation ?? 5) >= 9 ? 1 : 0;
  const preferredAmbition = clamp(Math.round(expectation * 0.65 + ambition * 0.35 + reputationBoost), 1, 5);
  return [...options].filter((option) => option.type !== "POLISH_CUP" && option.type !== "LEAGUE_AND_CUP" && option.type !== "PROMOTION_AND_CUP").sort((a, b) => Math.abs(a.ambitionLevel - preferredAmbition) - Math.abs(b.ambitionLevel - preferredAmbition))[0];
}
var normalizeTargetForClub = (currentTarget, club2, clubs2) => {
  const availableTargets = getAvailableTargets(club2, clubs2);
  const exactTarget = availableTargets.find((option) => option.type === currentTarget.type);
  if (exactTarget) return exactTarget;
  const tier = getTier(club2);
  const replacementType = tier >= 2 ? currentTarget.type === "CHAMPION" ? "PROMOTION" : currentTarget.type === "LEAGUE_AND_CUP" ? "PROMOTION_AND_CUP" : null : currentTarget.type === "PROMOTION_AND_CUP" ? "LEAGUE_AND_CUP" : null;
  const replacement = replacementType ? availableTargets.find((option) => option.type === replacementType) : null;
  if (replacement) return replacement;
  return [...availableTargets].sort(
    (a, b) => Math.abs(a.ambitionLevel - currentTarget.ambitionLevel) - Math.abs(b.ambitionLevel - currentTarget.ambitionLevel)
  )[0];
};
function normalizeManagerContractTargets(contract, club2, clubs2) {
  return {
    ...contract,
    terms: {
      ...contract.terms,
      target: normalizeTargetForClub(contract.terms.target, club2, clubs2)
    }
  };
}
function normalizeManagerContractNegotiationTargets(negotiation, club2, clubs2) {
  const availableTargets = getAvailableTargets(club2, clubs2);
  return {
    ...negotiation,
    availableTargets,
    clubTerms: {
      ...negotiation.clubTerms,
      target: normalizeTargetForClub(negotiation.clubTerms.target, club2, clubs2)
    },
    agreedTerms: negotiation.agreedTerms ? {
      ...negotiation.agreedTerms,
      target: normalizeTargetForClub(negotiation.agreedTerms.target, club2, clubs2)
    } : void 0
  };
}
function getBoardMinimumTarget(club2, clubs2) {
  const preferred = getBoardPreferredTarget(club2, clubs2);
  const minimumAmbition = Math.max(1, preferred.ambitionLevel - 1);
  const leagueTargets = getAvailableTargets(club2, clubs2).filter((option) => !option.requiresPolishCup).sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  return leagueTargets.find((option) => option.ambitionLevel >= minimumAmbition) ?? preferred;
}
function calculateBaseSalary(club2, profile) {
  const leverage = getManagerSalaryLeverage(club2, profile);
  return roundSalary(leverage.clubSalaryBenchmark * leverage.offerMultiplier);
}
function calculateSalaryForTarget(club2, clubs2, profile, selectedTarget) {
  const preferred = getBoardPreferredTarget(club2, clubs2);
  const ambitionDelta = selectedTarget.ambitionLevel - preferred.ambitionLevel;
  const multiplier = ambitionDelta >= 0 ? 1 + ambitionDelta * 0.13 : 1 + ambitionDelta * 0.09;
  const salaryCeiling = calculateManagerNegotiationSalaryCeiling(club2, profile);
  return Math.min(salaryCeiling, roundSalary(calculateBaseSalary(club2, profile) * clamp(multiplier, 0.72, 1.85)));
}
function createTerms(club2, clubs2, profile, startDate, selectedTarget = getBoardPreferredTarget(club2, clubs2), durationYears = 2) {
  return {
    startDate: startDate.toISOString(),
    endDate: getSeasonEnd(startDate, durationYears).toISOString(),
    durationYears,
    annualSalary: calculateSalaryForTarget(club2, clubs2, profile, selectedTarget),
    target: selectedTarget,
    salaryModelVersion: SALARY_MODEL_VERSION,
    salaryReviewAfterOneSeason: getManagerSalaryLeverage(club2, profile).isDiscountedOffer
  };
}
function createNegotiation(club2, clubs2, profile, startDate, source, jobOfferId, proposedTerms) {
  const availableTargets = getAvailableTargets(club2, clubs2);
  const clubTerms = proposedTerms?.salaryModelVersion === SALARY_MODEL_VERSION ? proposedTerms : createTerms(club2, clubs2, profile, startDate);
  return {
    id: `MANAGER_CONTRACT_NEGOTIATION_${club2.id}_${startDate.toISOString()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: club2.id,
    source,
    jobOfferId,
    status: "NEGOTIATING",
    roundsUsed: 0,
    maxRounds: 4 + Math.floor(Math.random() * 4),
    availableTargets,
    clubTerms,
    message: source === "RENEWAL" ? "Zarz\u0105d chce om\xF3wi\u0107 warunki dalszej wsp\xF3\u0142pracy." : source === "RENEGOTIATION" ? "Zarz\u0105d zgodzi\u0142 si\u0119 rozpocz\u0105\u0107 renegocjacj\u0119 obowi\u0105zuj\u0105cego kontraktu." : "Zarz\u0105d przedstawi\u0142 warunki obj\u0119cia pierwszego zespo\u0142u.",
    lastResponseType: "INFO",
    startedAt: startDate.toISOString()
  };
}
var getNegotiationAcceptanceChance = (negotiation, club2, proposedTerms, profile) => {
  const currentAmbition = negotiation.clubTerms.target.ambitionLevel;
  const requestedAmbition = proposedTerms.target.ambitionLevel;
  const delta = requestedAmbition - currentAmbition;
  const board = club2.board;
  const ambition = BOARD_LEVEL[board?.ambicja ?? "przecietna"];
  const generosity = BOARD_LEVEL[board?.hojnosc ?? "przecietna"];
  const greed = BOARD_LEVEL[board?.chciwosc ?? "przecietna"];
  const patience = BOARD_LEVEL[board?.cierpliwosc ?? "przecietna"];
  const competence = BOARD_LEVEL[board?.kompetencja ?? "przecietna"];
  const expBonus = Math.min(12, Math.log10(Math.max(1, profile?.expPoints ?? 1) + 9) * 4);
  const salaryLeverage = getManagerSalaryLeverage(club2, profile);
  const salaryRatio = proposedTerms.annualSalary / Math.max(1, negotiation.clubTerms.annualSalary);
  const salaryPremium = Math.max(0, salaryRatio - 1);
  const salaryDiscount = Math.max(0, 1 - salaryRatio);
  let chance = 82 + expBonus;
  if (delta > 0) {
    chance = 44 + ambition * 7 + generosity * 5 - greed * 4 - delta * 10 + expBonus;
  } else if (delta < 0) {
    chance = 48 + patience * 5 + greed * 3 - ambition * 8 - Math.abs(delta) * 9 + expBonus;
  }
  const premiumTolerance = 1 + salaryLeverage.maxNegotiatedPremium * 1.8;
  chance -= salaryPremium / premiumTolerance * (45 + greed * 5 - generosity * 3);
  chance += salaryDiscount * (8 + generosity * 2);
  if (proposedTerms.durationYears === 3) chance += patience * 2 - greed * 2;
  if (proposedTerms.durationYears === 1) chance += greed * 2 - patience;
  chance += competence * 1.5;
  return clamp(Math.round(chance), 8, 94);
};
var getExceptionalSalaryAcceptanceChance = (negotiation, club2, proposedTerms, standardSalaryLimit, profile) => {
  const leverage = getManagerSalaryLeverage(club2, profile);
  if (proposedTerms.annualSalary > leverage.negotiationSalaryCeiling) return 0;
  const generosity = BOARD_LEVEL[club2.board?.hojnosc ?? "przecietna"];
  const ambition = BOARD_LEVEL[club2.board?.ambicja ?? "przecietna"];
  const excessRatio = proposedTerms.annualSalary / Math.max(1, standardSalaryLimit) - 1;
  const targetBonus = Math.max(0, proposedTerms.target.ambitionLevel - negotiation.clubTerms.target.ambitionLevel) * 0.45;
  const chance = 0.6 + generosity * 0.35 + ambition * 0.15 + leverage.polishChampionships * 0.55 + targetBonus - excessRatio * 3.5;
  return clamp(chance, 0.35, 6);
};
var counterTarget = (negotiation, requestedTarget) => {
  const ordered = [...negotiation.availableTargets].sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  const currentIndex = ordered.findIndex((option) => option.id === negotiation.clubTerms.target.id);
  const requestedIndex = ordered.findIndex((option) => option.id === requestedTarget.id);
  if (currentIndex < 0 || requestedIndex < 0 || currentIndex === requestedIndex) return negotiation.clubTerms.target;
  const step = requestedIndex > currentIndex ? 1 : -1;
  return ordered[clamp(currentIndex + step, 0, ordered.length - 1)];
};
function negotiate(negotiation, club2, clubs2, profile, targetId, durationYears, proposedAnnualSalary) {
  if (negotiation.status !== "NEGOTIATING") return negotiation;
  const selectedTarget = negotiation.availableTargets.find((option) => option.id === targetId) ?? negotiation.clubTerms.target;
  const startDate = new Date(negotiation.clubTerms.startDate);
  const calculatedTerms = createTerms(club2, clubs2, profile, startDate, selectedTarget, durationYears);
  const requestedTerms = {
    ...calculatedTerms,
    annualSalary: Number.isFinite(proposedAnnualSalary) ? normalizeNegotiatedSalary(proposedAnnualSalary) : calculatedTerms.annualSalary
  };
  const roundsUsed = negotiation.roundsUsed + 1;
  const preferredTarget = getBoardPreferredTarget(club2, clubs2);
  const minimumTarget = getBoardMinimumTarget(club2, clubs2);
  const hardVeto = selectedTarget.ambitionLevel < minimumTarget.ambitionLevel;
  const salaryLeverage = getManagerSalaryLeverage(club2, profile);
  const standardSalaryLimit = Math.min(
    salaryLeverage.negotiationSalaryCeiling,
    normalizeNegotiatedSalary(calculatedTerms.annualSalary * (1 + salaryLeverage.maxNegotiatedPremium))
  );
  if (hardVeto) {
    const vetoMessage = `Veto zarz\u0105du: cel \u201E${selectedTarget.label}\u201D jest nie do przyj\u0119cia. Ambicj\u0105 klubu jest \u201E${preferredTarget.label}\u201D, a najni\u017Cszy cel, o kt\xF3rym zarz\u0105d mo\u017Ce rozmawia\u0107, to \u201E${minimumTarget.label}\u201D. Klub podtrzymuje swoj\u0105 propozycj\u0119 i oczekuje wyra\u017Anie ambitniejszego planu.`;
    if (roundsUsed >= negotiation.maxRounds) {
      return {
        ...negotiation,
        roundsUsed,
        status: "FAILED",
        lastResponseType: "FAILED",
        message: `${vetoMessage} Zarz\u0105d zako\u0144czy\u0142 negocjacje z powodu zbyt du\u017Cej r\xF3\u017Cnicy w ocenie potencja\u0142u dru\u017Cyny.`
      };
    }
    return {
      ...negotiation,
      roundsUsed,
      clubTerms: createTerms(club2, clubs2, profile, startDate, preferredTarget, negotiation.clubTerms.durationYears),
      lastResponseType: "VETO",
      message: vetoMessage
    };
  }
  if (requestedTerms.annualSalary > standardSalaryLimit) {
    const exceptionalChance = getExceptionalSalaryAcceptanceChance(
      negotiation,
      club2,
      requestedTerms,
      standardSalaryLimit,
      profile
    );
    const exceptionalAccepted = exceptionalChance > 0 && negotiation.roundsUsed > 0 && Math.random() * 100 <= exceptionalChance;
    if (exceptionalAccepted) {
      return {
        ...negotiation,
        roundsUsed,
        status: "AGREED",
        agreedTerms: requestedTerms,
        lastResponseType: "ACCEPTED",
        message: "Zarz\u0105d wyj\u0105tkowo zaakceptowa\u0142 proponowane warunki finansowe. Kontrakt jest gotowy do podpisania."
      };
    }
    const aboveClubCeiling = requestedTerms.annualSalary > salaryLeverage.negotiationSalaryCeiling;
    const salaryMessage = aboveClubCeiling ? `Proponowane wynagrodzenie przekracza obecne mo\u017Cliwo\u015Bci finansowe klubu oraz poziom warunk\xF3w uzasadniony Pana dotychczasowym dorobkiem. Zarz\u0105d mo\u017Ce obecnie rozmawia\u0107 o stawce do ${salaryLeverage.negotiationSalaryCeiling.toLocaleString("pl-PL")} PLN rocznie.` : salaryLeverage.managerExp < salaryLeverage.requiredExp ? `Po przeanalizowaniu Pana dotychczasowego do\u015Bwiadczenia Zarz\u0105d uzna\u0142, \u017Ce proponowane wynagrodzenie znacz\u0105co wykracza poza standardowe warunki. Klub podtrzymuje ofert\u0119 w wysoko\u015Bci ${standardSalaryLimit.toLocaleString("pl-PL")} PLN rocznie. Wy\u017Csza stawka mo\u017Ce zosta\u0107 zaakceptowana wy\u0142\u0105cznie w drodze wyj\u0105tkowej decyzji Zarz\u0105du. Po zako\u0144czeniu pe\u0142nego sezonu pracy b\u0119dzie Pan m\xF3g\u0142 wyst\u0105pi\u0107 o renegocjacj\u0119 warunk\xF3w kontraktu.` : `Zarz\u0105d wysoko ocenia Pana do\u015Bwiadczenie, jednak proponowane wynagrodzenie wykracza poza standardowe warunki. Klub podtrzymuje ofert\u0119 w wysoko\u015Bci ${standardSalaryLimit.toLocaleString("pl-PL")} PLN rocznie.`;
    if (roundsUsed >= negotiation.maxRounds) {
      return {
        ...negotiation,
        roundsUsed,
        status: "FAILED",
        lastResponseType: "FAILED",
        message: `${salaryMessage} Zarz\u0105d zako\u0144czy\u0142 negocjacje.`
      };
    }
    return {
      ...negotiation,
      roundsUsed,
      clubTerms: { ...negotiation.clubTerms, annualSalary: standardSalaryLimit },
      lastResponseType: "VETO",
      message: salaryMessage
    };
  }
  const proposalDiffersFromClubTerms = selectedTarget.id !== negotiation.clubTerms.target.id || durationYears !== negotiation.clubTerms.durationYears || requestedTerms.annualSalary !== negotiation.clubTerms.annualSalary;
  const requiresOpeningCounter = negotiation.roundsUsed === 0 && proposalDiffersFromClubTerms;
  const accepted = !requiresOpeningCounter && Math.random() * 100 <= getNegotiationAcceptanceChance(negotiation, club2, requestedTerms, profile);
  if (accepted) {
    return {
      ...negotiation,
      roundsUsed,
      status: "AGREED",
      agreedTerms: requestedTerms,
      lastResponseType: "ACCEPTED",
      message: "Zarz\u0105d zaakceptowa\u0142 proponowane warunki. Kontrakt jest gotowy do podpisania."
    };
  }
  if (roundsUsed >= negotiation.maxRounds) {
    return {
      ...negotiation,
      roundsUsed,
      status: "FAILED",
      lastResponseType: "FAILED",
      message: "Zarz\u0105d zako\u0144czy\u0142 rozmowy. Nie uda\u0142o si\u0119 osi\u0105gn\u0105\u0107 porozumienia."
    };
  }
  const proposedCounterTarget = counterTarget(negotiation, selectedTarget);
  const nextTarget = proposedCounterTarget.ambitionLevel < minimumTarget.ambitionLevel ? minimumTarget : proposedCounterTarget;
  const counterDuration = Math.random() < 0.55 ? durationYears : negotiation.clubTerms.durationYears;
  const baseCounter = createTerms(club2, clubs2, profile, startDate, nextTarget, counterDuration);
  const salaryBlend = roundSalary(baseCounter.annualSalary * 0.72 + requestedTerms.annualSalary * 0.28);
  const clubTerms = { ...baseCounter, annualSalary: salaryBlend };
  return {
    ...negotiation,
    roundsUsed,
    clubTerms,
    lastResponseType: "COUNTER",
    message: requiresOpeningCounter ? `Zarz\u0105d nie podpisze zmienionych warunk\xF3w bez negocjacji. Klub przedstawia kontrofert\u0119: cel \u201E${clubTerms.target.label}\u201D, umowa na ${clubTerms.durationYears} ${clubTerms.durationYears === 1 ? "rok" : "lata"} i wynagrodzenie ${clubTerms.annualSalary.toLocaleString("pl-PL")} PLN rocznie.` : selectedTarget.ambitionLevel > negotiation.clubTerms.target.ambitionLevel ? "Zarz\u0105d docenia ambicj\u0119, ale proponuje ostro\u017Cniejszy cel i skorygowan\u0105 stawk\u0119." : selectedTarget.ambitionLevel < negotiation.clubTerms.target.ambitionLevel ? `Zarz\u0105d uwa\u017Ca cel \u201E${selectedTarget.label}\u201D za zbyt zachowawczy. Klub przedstawia kontrofert\u0119 opart\u0105 na celu \u201E${clubTerms.target.label}\u201D.` : "Zarz\u0105d nie zaakceptowa\u0142 wszystkich warunk\xF3w i przedstawi\u0142 now\u0105 ofert\u0119."
  };
}
function createSignedContract(negotiation, signedAt) {
  if (negotiation.status !== "AGREED" || !negotiation.agreedTerms) return null;
  return {
    id: `MANAGER_CONTRACT_${negotiation.clubId}_${signedAt.toISOString()}_${Math.random().toString(36).slice(2, 7)}`,
    clubId: negotiation.clubId,
    signedAt: signedAt.toISOString(),
    source: negotiation.source,
    status: "ACTIVE",
    terms: negotiation.agreedTerms,
    standardRenewalMonths: 3 + Math.floor(Math.random() * 4),
    earlyRenewalChecked: false
  };
}
function createLegacyContract(club2, clubs2, profile, seasonStartDate) {
  const stableSeed = `${club2.id}:${seasonStartDate.getFullYear()}`.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const terms = createTerms(club2, clubs2, profile, seasonStartDate, void 0, 2);
  return {
    id: `MANAGER_CONTRACT_LEGACY_${club2.id}_${seasonStartDate.getFullYear()}`,
    clubId: club2.id,
    signedAt: seasonStartDate.toISOString(),
    source: "CAREER_START",
    status: "ACTIVE",
    terms,
    standardRenewalMonths: 3 + stableSeed % 4,
    earlyRenewalChecked: false
  };
}
function getLeagueRank(club2, clubs2) {
  const leagueClubs = clubs2.filter((candidate) => candidate.leagueId === club2.leagueId);
  const sorted = [...leagueClubs].sort(
    (a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference || b.stats.goalsFor - a.stats.goalsFor
  );
  const rank = sorted.findIndex((candidate) => candidate.id === club2.id) + 1;
  return rank > 0 ? rank : getLeagueSize(club2, clubs2);
}
var getPolishCupState = (clubId, fixtures) => {
  const cupFixtures = fixtures.filter((fixture) => fixture.leagueId === "POLISH_CUP" /* POLISH_CUP */);
  if (cupFixtures.length === 0) return "NOT_STARTED";
  const final = cupFixtures.find((fixture) => fixture.status === "FINISHED" /* FINISHED */ && /FINAŁ|FINAL/i.test(fixture.id));
  if (final) {
    const winnerId = (final.homeScore ?? 0) !== (final.awayScore ?? 0) ? (final.homeScore ?? 0) > (final.awayScore ?? 0) ? final.homeTeamId : final.awayTeamId : (final.homePenaltyScore ?? 0) > (final.awayPenaltyScore ?? 0) ? final.homeTeamId : final.awayTeamId;
    return winnerId === clubId ? "WON" : "OUT";
  }
  if (cupFixtures.some((fixture) => fixture.status === "SCHEDULED" /* SCHEDULED */ && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return "ALIVE";
  if (cupFixtures.some((fixture) => fixture.status === "FINISHED" /* FINISHED */ && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return "OUT";
  return "NOT_STARTED";
};
function evaluateContractPerformance(contract, club2, clubs2, fixtures) {
  const rank = getLeagueRank(club2, clubs2);
  const target2 = contract.terms.target;
  const played = Math.max(0, club2.stats.played);
  const rankGap = rank - target2.leagueMaxRank;
  const leagueScore = played < 3 ? 55 : clamp(88 - rankGap * 10 + Math.max(0, -rankGap) * 3, 5, 100);
  const cupState = getPolishCupState(club2.id, fixtures);
  const cupScore = !target2.requiresPolishCup ? 100 : cupState === "WON" ? 100 : cupState === "ALIVE" ? 68 : cupState === "NOT_STARTED" ? 55 : 15;
  const score = target2.requiresPolishCup ? Math.round(leagueScore * 0.58 + cupScore * 0.42) : Math.round(leagueScore);
  const targetMet = rank <= target2.leagueMaxRank && (!target2.requiresPolishCup || cupState === "WON");
  return {
    score,
    rank,
    cupState,
    targetMet,
    summary: `Aktualna pozycja: ${rank}. Cel kontraktowy: ${target2.label}.`
  };
}
function shouldOfferRenewal(contract, club2, clubs2, fixtures, early) {
  const performance = evaluateContractPerformance(contract, club2, clubs2, fixtures);
  const patience = BOARD_LEVEL[club2.board?.cierpliwosc ?? "przecietna"];
  const ambition = BOARD_LEVEL[club2.board?.ambicja ?? "przecietna"];
  const competence = BOARD_LEVEL[club2.board?.kompetencja ?? "przecietna"];
  const threshold = early ? 78 : 48 + ambition * 4 - patience * 2;
  const rngChance = clamp(28 + performance.score * 0.58 + patience * 4 + competence * 3 - ambition * 3, 8, 96);
  return performance.score >= threshold && Math.random() * 100 <= rngChance;
}
function daysUntilContractEnd(contract, date) {
  return Math.ceil((new Date(contract.terms.endDate).getTime() - date.getTime()) / DAY_MS);
}
function getManagerContractRenegotiationEligibility(contract, date) {
  if (!contract || contract.status !== "ACTIVE") {
    return { eligible: false, reason: "Brak aktywnego kontraktu trenera." };
  }
  if (contract.renewalDecision) {
    return {
      eligible: false,
      reason: "Decyzja dotycz\u0105ca dalszej wsp\xF3\u0142pracy zosta\u0142a ju\u017C podj\u0119ta w ramach obecnego cyklu kontraktowego."
    };
  }
  const eligibleAt = new Date(contract.signedAt);
  eligibleAt.setFullYear(eligibleAt.getFullYear() + 1);
  if (date.getTime() < eligibleAt.getTime()) {
    return {
      eligible: false,
      eligibleAt,
      reason: `Renegocjacja b\u0119dzie mo\u017Cliwa po pe\u0142nym roku pracy, od ${eligibleAt.toLocaleDateString("pl-PL")}.`
    };
  }
  if (contract.lastRenegotiationRequestAt) {
    const retryAt = new Date(contract.lastRenegotiationRequestAt);
    retryAt.setDate(retryAt.getDate() + 90);
    if (date.getTime() < retryAt.getTime()) {
      return {
        eligible: false,
        retryAt,
        reason: `Zarz\u0105d wr\xF3ci do kolejnego wniosku najwcze\u015Bniej ${retryAt.toLocaleDateString("pl-PL")}.`
      };
    }
  }
  return { eligible: true, eligibleAt, reason: "Mo\u017Cesz wyst\u0105pi\u0107 do zarz\u0105du o renegocjacj\u0119 kontraktu." };
}
function shouldDismissManagerAfterRelegation(randomValue = Math.random()) {
  return clamp(randomValue, 0, 1) >= RELEGATION_MANAGER_SURVIVAL_CHANCE;
}
var ManagerContractService = {
  SALARY_MODEL_VERSION,
  MANAGER_SALARY_NEGOTIATION_STEP,
  RELEGATION_MANAGER_SURVIVAL_CHANCE,
  normalizeNegotiatedSalary,
  getManagerPolishChampionshipCount,
  calculateClubManagerSalaryBenchmark,
  calculateManagerNegotiationSalaryCeiling,
  getManagerSalaryLeverage,
  getManagerTenureSnapshot,
  getAvailableTargets,
  normalizeManagerContractTargets,
  normalizeManagerContractNegotiationTargets,
  getBoardPreferredTarget,
  getBoardMinimumTarget,
  calculateBaseSalary,
  calculateSalaryForTarget,
  createTerms,
  createNegotiation,
  negotiate,
  createSignedContract,
  createLegacyContract,
  getLeagueRank,
  evaluateContractPerformance,
  shouldOfferRenewal,
  daysUntilContractEnd,
  getManagerContractRenegotiationEligibility,
  shouldDismissManagerAfterRelegation
};

// tests/ManagerContractServiceTests.ts
var makeClub = (id, points = 0) => ({
  id,
  name: `Klub ${id}`,
  shortName: id,
  leagueId: "L_PL_1",
  tier: 1,
  reputation: 7,
  budget: 1e7,
  transferBudget: 2e6,
  colorsHex: ["#0f5ca8", "#f4c430"],
  stats: { played: 10, wins: 3, draws: 3, losses: 4, goalsFor: 12, goalsAgainst: 14, goalDifference: -2, points },
  board: {
    hojnosc: "wysoka",
    ambicja: "wysoka",
    cierpliwosc: "przecietna",
    chciwosc: "niska",
    oczekiwania: "wysoka",
    kompetencja: "wysoka"
  }
});
var clubs = Array.from({ length: 18 }, (_, index) => makeClub(`C${index + 1}`, 40 - index));
var club = clubs[0];
var start = /* @__PURE__ */ new Date("2026-07-01T12:00:00.000Z");
var originalRandom = Math.random;
try {
  Math.random = () => 0;
  const shortest = ManagerContractService.createNegotiation(club, clubs, null, start, "CAREER_START");
  import_strict.default.equal(shortest.maxRounds, 4, "ukryty limit negocjacji powinien zaczyna\u0107 si\u0119 od 4 tur");
  Math.random = () => 0.999999;
  const longest = ManagerContractService.createNegotiation(club, clubs, null, start, "JOB_MARKET");
  import_strict.default.equal(longest.maxRounds, 7, "ukryty limit negocjacji powinien ko\u0144czy\u0107 si\u0119 na 7 turach");
  const options = ManagerContractService.getAvailableTargets(club, clubs);
  const conservative = options.find((option) => option.type === "SURVIVAL");
  const champion = options.find((option) => option.type === "CHAMPION");
  const minimumTarget = ManagerContractService.getBoardMinimumTarget(club, clubs);
  import_strict.default.ok(minimumTarget.ambitionLevel > conservative.ambitionLevel, "ambitny zarz\u0105d musi mie\u0107 minimalny akceptowalny cel");
  import_strict.default.ok(
    ManagerContractService.calculateSalaryForTarget(club, clubs, null, champion) > ManagerContractService.calculateSalaryForTarget(club, clubs, null, conservative),
    "wy\u017Cszy deklarowany cel powinien podnosi\u0107 stawk\u0119 kontraktu"
  );
  options.forEach((option) => {
    const salary = ManagerContractService.calculateSalaryForTarget(club, clubs, null, option);
    import_strict.default.equal(salary % 5e5, 0, "ka\u017Cda stawka musi by\u0107 zaokr\u0105glona do 500 tys. PLN");
  });
  const firstLeagueClubs = clubs.map((candidate, index) => ({
    ...candidate,
    id: `FIRST_${index + 1}`,
    leagueId: "L_PL_2",
    tier: 2
  }));
  const firstLeagueTargets = ManagerContractService.getAvailableTargets(firstLeagueClubs[0], firstLeagueClubs);
  import_strict.default.equal(firstLeagueTargets.some((option) => option.type === "CHAMPION"), false, "1. liga nie mo\u017Ce oferowa\u0107 celu mistrzowskiego");
  import_strict.default.equal(firstLeagueTargets.some((option) => option.type === "LEAGUE_AND_CUP"), false, "1. liga nie mo\u017Ce oferowa\u0107 mistrzostwa po\u0142\u0105czonego z Pucharem Polski");
  import_strict.default.equal(firstLeagueTargets.find((option) => option.type === "PROMOTION")?.label, "Awans do Ekstraklasy");
  import_strict.default.equal(firstLeagueTargets.find((option) => option.type === "PROMOTION_AND_CUP")?.label, "Awans do Ekstraklasy i Puchar Polski");
  const secondLeagueClubs = clubs.map((candidate, index) => ({
    ...candidate,
    id: `SECOND_${index + 1}`,
    leagueId: "L_PL_3",
    tier: 3
  }));
  const secondLeagueTargets = ManagerContractService.getAvailableTargets(secondLeagueClubs[0], secondLeagueClubs);
  import_strict.default.equal(secondLeagueTargets.some((option) => option.type === "CHAMPION"), false, "2. liga nie mo\u017Ce oferowa\u0107 celu mistrzowskiego");
  import_strict.default.equal(secondLeagueTargets.some((option) => option.type === "LEAGUE_AND_CUP"), false, "2. liga nie mo\u017Ce oferowa\u0107 mistrzostwa po\u0142\u0105czonego z Pucharem Polski");
  import_strict.default.equal(secondLeagueTargets.find((option) => option.type === "PROMOTION")?.label, "Awans do 1. ligi");
  import_strict.default.equal(secondLeagueTargets.find((option) => option.type === "PROMOTION_AND_CUP")?.label, "Awans do 1. ligi i Puchar Polski");
  const staleLowerLeagueContract = {
    id: "STALE_LOWER_LEAGUE_CONTRACT",
    clubId: firstLeagueClubs[0].id,
    signedAt: start.toISOString(),
    source: "CAREER_START",
    status: "ACTIVE",
    terms: ManagerContractService.createTerms(firstLeagueClubs[0], firstLeagueClubs, null, start),
    standardRenewalMonths: 6
  };
  staleLowerLeagueContract.terms.target = champion;
  const normalizedLowerLeagueContract = ManagerContractService.normalizeManagerContractTargets(
    staleLowerLeagueContract,
    firstLeagueClubs[0],
    firstLeagueClubs
  );
  import_strict.default.equal(normalizedLowerLeagueContract.terms.target.type, "PROMOTION", "stary cel mistrzowski z 1. ligi powinien zosta\u0107 zmieniony na awans");
  const legia = { ...club, id: "PL_LEGIA_WARSZAWA", name: "Legia Warszawa", reputation: 10 };
  const wealthyLegia = { ...legia, budget: 217e6, transferBudget: 7e7 };
  const rookieProfile = { expPoints: 1, expHistory: [], careerHistory: [], achievements: [] };
  const decoratedProfile = {
    expPoints: 500,
    expHistory: [],
    careerHistory: [{}, {}, {}],
    achievements: [
      { id: "mp-1", seasonLabel: "2026/27", title: "Mistrz Polski 2026/27", competition: "Ekstraklasa" },
      { id: "mp-2", seasonLabel: "2027/28", title: "Mistrz Polski 2027/28", competition: "Ekstraklasa" },
      { id: "mp-3", seasonLabel: "2028/29", title: "Mistrz Polski 2028/29", competition: "Ekstraklasa" }
    ]
  };
  const legiaRookieSalary = ManagerContractService.calculateBaseSalary(legia, rookieProfile);
  const legiaDecoratedSalary = ManagerContractService.calculateBaseSalary(legia, decoratedProfile);
  import_strict.default.equal(ManagerContractService.calculateClubManagerSalaryBenchmark(legia), 5e6, "typowa stawka referencyjna Legii powinna wynosi\u0107 5 mln PLN");
  import_strict.default.equal(
    ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, rookieProfile),
    5e6,
    "pocz\u0105tkuj\u0105cy trener nie powinien automatycznie otrzymywa\u0107 dost\u0119pu do wy\u017Cszych stawek bogatego klubu"
  );
  import_strict.default.ok(
    ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, decoratedProfile) > 5e6,
    "dynamiczny pu\u0142ap negocjacji powinien przekracza\u0107 5 mln dla utytu\u0142owanego trenera w bogatym klubie"
  );
  import_strict.default.equal(legiaRookieSalary, 25e5, "pocz\u0105tkuj\u0105cy trener Legii powinien otrzyma\u0107 wyra\u017Anie ni\u017Csz\u0105 ofert\u0119 startow\u0105");
  import_strict.default.equal(legiaDecoratedSalary, 45e5, "trzykrotny mistrz Polski powinien otrzyma\u0107 ofert\u0119 zbli\u017Con\u0105 do klubowego maksimum");
  const lowExpLeverage = ManagerContractService.getManagerSalaryLeverage(legia, { expPoints: 1 });
  const highExpLeverage = ManagerContractService.getManagerSalaryLeverage(legia, decoratedProfile);
  import_strict.default.equal(lowExpLeverage.offerMultiplier, 0.5, "pocz\u0105tkuj\u0105cy trener powinien zaczyna\u0107 od po\u0142owy klubowego pu\u0142apu");
  import_strict.default.ok(highExpLeverage.offerMultiplier > lowExpLeverage.offerMultiplier, "du\u017Ce do\u015Bwiadczenie i sukcesy powinny podnosi\u0107 ofert\u0119 bazow\u0105");
  import_strict.default.equal(highExpLeverage.polishChampionships, 3, "model powinien rozpoznawa\u0107 zdobyte mistrzostwa Polski");
  import_strict.default.ok(
    highExpLeverage.maxNegotiatedPremium > lowExpLeverage.maxNegotiatedPremium,
    "do\u015Bwiadczony trener powinien m\xF3c negocjowa\u0107 wi\u0119ksz\u0105 podwy\u017Ck\u0119"
  );
  const discountedTerms = ManagerContractService.createTerms(legia, clubs, { expPoints: 1 }, start);
  import_strict.default.equal(discountedTerms.salaryReviewAfterOneSeason, true, "ni\u017Csza stawka powinna zawiera\u0107 mo\u017Cliwo\u015B\u0107 przegl\u0105du po sezonie");
  const tenureContract = {
    id: "TENURE_TEST",
    clubId: club.id,
    signedAt: "2026-12-08T12:00:00.000Z",
    source: "JOB_MARKET",
    status: "ACTIVE",
    terms: ManagerContractService.createTerms(club, clubs, rookieProfile, /* @__PURE__ */ new Date("2026-12-08T12:00:00.000Z")),
    standardRenewalMonths: 6
  };
  const tenureFixtures = Array.from({ length: 8 }, (_, index) => ({
    id: `TENURE_FIXTURE_${index + 1}`,
    leagueId: club.leagueId,
    homeTeamId: club.id,
    awayTeamId: clubs[index + 1].id,
    date: new Date(2026, 11, 9 + index * 8),
    status: "FINISHED",
    homeScore: 0,
    awayScore: 1
  }));
  const firstMatchTenure = ManagerContractService.getManagerTenureSnapshot(
    tenureContract,
    club,
    tenureFixtures.slice(0, 1),
    /* @__PURE__ */ new Date("2026-12-14T12:00:00.000Z")
  );
  import_strict.default.equal(firstMatchTenure.pressureStage, "NONE", "po pierwszym meczu nowy trener nie mo\u017Ce otrzyma\u0107 ostrze\u017Cenia zarz\u0105du");
  import_strict.default.equal(firstMatchTenure.dismissalEligible, false, "po pierwszym meczu nowy trener nie mo\u017Ce zosta\u0107 zwolniony");
  const earlyTenure = ManagerContractService.getManagerTenureSnapshot(
    tenureContract,
    club,
    tenureFixtures.slice(0, 4),
    /* @__PURE__ */ new Date("2027-01-08T12:00:00.000Z")
  );
  import_strict.default.equal(earlyTenure.pressureStage, "CONCERN", "po kilku meczach zarz\u0105d mo\u017Ce przekaza\u0107 jedynie \u0142agodn\u0105 uwag\u0119");
  import_strict.default.equal(earlyTenure.dismissalEligible, false);
  const establishedTenure = ManagerContractService.getManagerTenureSnapshot(
    tenureContract,
    club,
    tenureFixtures,
    /* @__PURE__ */ new Date("2027-02-15T12:00:00.000Z")
  );
  import_strict.default.equal(establishedTenure.pressureStage, "FULL", "pe\u0142na ocena zarz\u0105du powinna rozpocz\u0105\u0107 si\u0119 po odpowiednio d\u0142ugiej pracy");
  import_strict.default.equal(establishedTenure.dismissalEligible, true, "zwolnienie mo\u017Ce by\u0107 rozwa\u017Cane dopiero po 60 dniach i 8 meczach ligowych");
  Math.random = () => 0.999999;
  const rookieLegiaNegotiation = ManagerContractService.createNegotiation(legia, clubs, rookieProfile, start, "CAREER_START");
  const rookieHighDemandCounter = ManagerContractService.negotiate(
    rookieLegiaNegotiation,
    legia,
    clubs,
    rookieProfile,
    rookieLegiaNegotiation.clubTerms.target.id,
    2,
    5e6
  );
  import_strict.default.equal(rookieHighDemandCounter.status, "NEGOTIATING", "bardzo wysoka pro\u015Bba pocz\u0105tkuj\u0105cego trenera powinna wywo\u0142a\u0107 kontrofert\u0119");
  import_strict.default.equal(rookieHighDemandCounter.lastResponseType, "VETO");
  const rookieHighDemandRejected = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    5e6
  );
  import_strict.default.equal(rookieHighDemandRejected.status, "NEGOTIATING", "przy niekorzystnym RNG wyj\u0105tkowo wysoka stawka nie powinna zosta\u0107 zaakceptowana");
  Math.random = () => 0;
  const rookieExceptionalAgreement = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    5e6
  );
  import_strict.default.equal(rookieExceptionalAgreement.status, "AGREED", "minimalna szansa RNG powinna pozwala\u0107 na wyj\u0105tkow\u0105 zgod\u0119 zarz\u0105du");
  const aboveClubLimit = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    51e5
  );
  import_strict.default.notEqual(aboveClubLimit.status, "AGREED", "pocz\u0105tkuj\u0105cy trener nie powinien przekroczy\u0107 aktualnego pu\u0142apu uzasadnionego swoim dorobkiem");
  const decoratedWealthyNegotiation = ManagerContractService.createNegotiation(wealthyLegia, clubs, decoratedProfile, start, "JOB_MARKET");
  const decoratedDynamicCeiling = ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, decoratedProfile);
  import_strict.default.ok(decoratedDynamicCeiling > 5e6);
  Math.random = () => 0;
  const decoratedOpeningCounter = ManagerContractService.negotiate(
    decoratedWealthyNegotiation,
    wealthyLegia,
    clubs,
    decoratedProfile,
    decoratedWealthyNegotiation.clubTerms.target.id,
    2,
    decoratedDynamicCeiling
  );
  const decoratedExceptionalAgreement = ManagerContractService.negotiate(
    decoratedOpeningCounter,
    wealthyLegia,
    clubs,
    decoratedProfile,
    decoratedOpeningCounter.clubTerms.target.id,
    2,
    decoratedDynamicCeiling
  );
  import_strict.default.equal(decoratedExceptionalAgreement.status, "AGREED", "bogaty klub powinien m\xF3c wyj\u0105tkowo zaakceptowa\u0107 stawk\u0119 powy\u017Cej 5 mln dla utytu\u0142owanego trenera");
  Math.random = () => 0;
  const eliteNegotiation = ManagerContractService.createNegotiation(legia, clubs, null, start, "CAREER_START");
  const eliteVeto = ManagerContractService.negotiate(eliteNegotiation, legia, clubs, null, conservative.id, 2);
  import_strict.default.equal(eliteVeto.status, "NEGOTIATING", "veto nie powinno natychmiast ko\u0144czy\u0107 negocjacji");
  import_strict.default.equal(eliteVeto.lastResponseType, "VETO", "elity klub powinien zawetowa\u0107 cel utrzymania");
  import_strict.default.equal(eliteVeto.clubTerms.target.type, "CHAMPION", "po veto elitarny klub powinien podtrzyma\u0107 cel mistrzowski");
  import_strict.default.match(eliteVeto.message, /najniższy cel/i, "zarz\u0105d powinien wyja\u015Bni\u0107 granic\u0119 negocjacji");
  const salaryOpeningCounter = ManagerContractService.negotiate(
    shortest,
    club,
    clubs,
    null,
    shortest.clubTerms.target.id,
    shortest.clubTerms.durationYears,
    shortest.clubTerms.annualSalary + 1e5
  );
  import_strict.default.equal(salaryOpeningCounter.status, "NEGOTIATING", "podwy\u017Cszenie pensji powinno najpierw wywo\u0142a\u0107 kontrofert\u0119");
  import_strict.default.equal(salaryOpeningCounter.lastResponseType, "COUNTER");
  const requestedNegotiatedSalary = salaryOpeningCounter.clubTerms.annualSalary + 1e5;
  const salaryAgreement = ManagerContractService.negotiate(
    salaryOpeningCounter,
    club,
    clubs,
    null,
    salaryOpeningCounter.clubTerms.target.id,
    salaryOpeningCounter.clubTerms.durationYears,
    requestedNegotiatedSalary
  );
  import_strict.default.equal(salaryAgreement.status, "AGREED");
  import_strict.default.equal(salaryAgreement.agreedTerms?.annualSalary, requestedNegotiatedSalary);
  import_strict.default.equal(requestedNegotiatedSalary % ManagerContractService.MANAGER_SALARY_NEGOTIATION_STEP, 0);
  let rejected = { ...shortest, maxRounds: 4 };
  Math.random = () => 0.999999;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    rejected = ManagerContractService.negotiate(rejected, club, clubs, null, champion.id, 3);
  }
  import_strict.default.equal(rejected.status, "FAILED", "klub powinien zako\u0144czy\u0107 rozmowy najp\xF3\u017Aniej po ukrytym limicie");
  Math.random = () => 0;
  const openingCounter = ManagerContractService.negotiate(shortest, club, clubs, null, champion.id, 2);
  import_strict.default.equal(openingCounter.status, "NEGOTIATING", "zmieniona propozycja gracza powinna najpierw wywo\u0142a\u0107 kontrofert\u0119 klubu");
  import_strict.default.equal(openingCounter.lastResponseType, "COUNTER");
  const accepted = ManagerContractService.negotiate(openingCounter, club, clubs, null, openingCounter.clubTerms.target.id, openingCounter.clubTerms.durationYears);
  import_strict.default.equal(accepted.status, "AGREED");
  const signed = ManagerContractService.createSignedContract(accepted, start);
  import_strict.default.equal(signed?.terms.target.id, champion.id, "podpisany kontrakt musi zachowa\u0107 dok\u0142adnie uzgodniony cel");
  import_strict.default.equal(signed?.terms.annualSalary, accepted.agreedTerms?.annualSalary);
  const legacySeasonStart = /* @__PURE__ */ new Date("2026-07-01T12:00:00.000Z");
  const migrated = ManagerContractService.createLegacyContract(club, clubs, null, legacySeasonStart);
  const migratedAgain = ManagerContractService.createLegacyContract(club, clubs, null, legacySeasonStart);
  import_strict.default.equal(migrated.terms.startDate, legacySeasonStart.toISOString());
  import_strict.default.equal(new Date(migrated.terms.endDate).getFullYear(), 2028);
  import_strict.default.ok(migrated.terms.target.id, "migracja starego zapisu musi uzupe\u0142ni\u0107 cel kontraktowy");
  import_strict.default.ok(migrated.terms.annualSalary > 0, "migracja starego zapisu musi uzupe\u0142ni\u0107 wynagrodzenie");
  import_strict.default.equal(migrated.terms.salaryModelVersion, ManagerContractService.SALARY_MODEL_VERSION);
  import_strict.default.equal(migrated.standardRenewalMonths, migratedAgain.standardRenewalMonths, "migracja powinna by\u0107 deterministyczna");
  const renegotiationTooEarly = ManagerContractService.getManagerContractRenegotiationEligibility(
    migrated,
    /* @__PURE__ */ new Date("2027-06-30T11:59:59.000Z")
  );
  import_strict.default.equal(renegotiationTooEarly.eligible, false, "renegocjacja nie mo\u017Ce ruszy\u0107 przed pe\u0142nym rokiem pracy");
  const renegotiationAvailable = ManagerContractService.getManagerContractRenegotiationEligibility(
    migrated,
    /* @__PURE__ */ new Date("2027-07-01T12:00:00.000Z")
  );
  import_strict.default.equal(renegotiationAvailable.eligible, true, "po pe\u0142nym roku pracy renegocjacja powinna by\u0107 dost\u0119pna");
  const recentlyRequested = {
    ...migrated,
    lastRenegotiationRequestAt: "2027-07-01T12:00:00.000Z"
  };
  import_strict.default.equal(
    ManagerContractService.getManagerContractRenegotiationEligibility(recentlyRequested, /* @__PURE__ */ new Date("2027-08-01T12:00:00.000Z")).eligible,
    false,
    "po z\u0142o\u017Ceniu wniosku kolejna pr\xF3ba powinna by\u0107 zablokowana na 90 dni"
  );
  const renegotiation = ManagerContractService.createNegotiation(club, clubs, { expPoints: 20 }, /* @__PURE__ */ new Date("2027-07-02T12:00:00.000Z"), "RENEGOTIATION");
  import_strict.default.equal(renegotiation.source, "RENEGOTIATION");
  import_strict.default.match(renegotiation.message, /renegocjację/i);
  import_strict.default.equal(
    ManagerContractService.shouldDismissManagerAfterRelegation(0.049),
    false,
    "po spadku trener powinien mie\u0107 jedynie 5% szans na zachowanie pracy"
  );
  import_strict.default.equal(ManagerContractService.shouldDismissManagerAfterRelegation(0.05), true);
  import_strict.default.equal(ManagerContractService.shouldDismissManagerAfterRelegation(0.99), true);
  console.log("Manager contract service tests: OK");
} finally {
  Math.random = originalRandom;
}
