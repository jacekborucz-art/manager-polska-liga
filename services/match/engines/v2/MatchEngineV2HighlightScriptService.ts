import { MatchEventType } from '../../../../types';
import { stableHash } from '../cupV2';
import type {
  MatchEngineV2GroupBehaviorId,
  MatchEngineV2Point,
  MatchEngineV2Side,
  MatchEngineV2Snapshot,
  MatchEngineV2TransmissionMode,
  MatchEngineV2VisualCue,
  MatchEngineV2VisualCueKind,
} from './MatchEngineV2Types';

export type MatchEngineV2HighlightOutcome = 'GOAL' | 'OFFSIDE' | 'MISS' | 'SAVE' | 'FOUL' | 'CORNER_RESTART' | 'FREE_KICK_RESTART';
export type MatchEngineV2HighlightActor = 'SCORER' | 'FORWARD' | 'WINGER' | 'MIDFIELDER' | 'DEFENDER';
export type MatchEngineV2HighlightStepKind = 'PASS' | 'CONTROL' | 'DRIBBLE' | 'CROSS' | 'TACKLE' | 'BLOCK' | 'REBOUND' | 'SHOT' | 'FOUL' | 'OFFSIDE';

/**
 * A named, individually-choreographed run for a player who is neither this
 * step's actor nor its receiver (a decoy run, a third man dragging a marker,
 * a covering fullback). role/roleIndex are resolved against the same pool
 * actor/receiver use, so "the second midfielder" reliably means the same
 * real player across every step of one authored scenario.
 */
export type MatchEngineV2HighlightSupportingRun = {
  role: MatchEngineV2HighlightActor;
  roleIndex: number;
  side: 'ATTACKING' | 'DEFENDING';
  start: MatchEngineV2Point;
  end: MatchEngineV2Point;
};

export type MatchEngineV2HighlightStepBehaviors = {
  attackingGroupBehavior?: MatchEngineV2GroupBehaviorId;
  defendingGroupBehavior?: MatchEngineV2GroupBehaviorId;
  /** Commentary text for this step, with {actor}/{receiver} placeholders. */
  commentaryTemplate?: string;
  /**
   * Overrides the pool index normally derived from this step's position in
   * the sequence, so an author can pin "the first midfielder" and "the
   * second midfielder" to specific, consistent players across a hand-written
   * scenario instead of letting each step's position pick automatically.
   */
  actorRoleIndex?: number;
  receiverRoleIndex?: number;
  supportingRuns?: MatchEngineV2HighlightSupportingRun[];
};

export type MatchEngineV2HighlightStep = MatchEngineV2HighlightStepBehaviors & {
  kind: MatchEngineV2HighlightStepKind;
  actor: MatchEngineV2HighlightActor;
  receiver?: MatchEngineV2HighlightActor;
  start: MatchEngineV2Point;
  end: MatchEngineV2Point;
  durationMs: number;
};

export type MatchEngineV2HighlightScript = {
  id: string;
  outcome: MatchEngineV2HighlightOutcome;
  family: string;
  title: string;
  steps: MatchEngineV2HighlightStep[];
  /**
   * Set only for a GOAL/SAVE/MISS script authored specifically for a corner
   * or free kick. selectScript restricts itself to these whenever the real
   * cue's own setPieceKind matches, so a corner shot never plays a generic
   * open-play scene and vice versa.
   */
  requiredSetPieceKind?: 'CORNER' | 'FREE_KICK';
};

type ScriptFamily = {
  id: string;
  title: string;
  steps: (variant: number, outcome: MatchEngineV2HighlightOutcome) => MatchEngineV2HighlightStep[];
};

const point = (x: number, y: number, variant: number): MatchEngineV2Point => ({
  x: Math.max(2, Math.min(66, x + ((variant % 5) - 2) * 1.35)),
  y: Math.max(2, Math.min(103, y + (variant % 2 === 0 ? 0.8 : -0.8))),
});

const step = (
  kind: MatchEngineV2HighlightStepKind,
  actor: MatchEngineV2HighlightActor,
  receiver: MatchEngineV2HighlightActor | undefined,
  start: MatchEngineV2Point,
  end: MatchEngineV2Point,
  durationMs: number,
  behaviors?: MatchEngineV2HighlightStepBehaviors,
): MatchEngineV2HighlightStep => ({ kind, actor, receiver, start, end, durationMs, ...behaviors });

const finalShotKind = (outcome: MatchEngineV2HighlightOutcome): MatchEngineV2HighlightStepKind =>
  outcome === 'OFFSIDE' ? 'OFFSIDE' : outcome === 'FOUL' ? 'FOUL' : 'SHOT';

/**
 * The last step's own text still has to read correctly when the family is
 * reused for the OFFSIDE or FOUL pool, where that step isn't actually a shot.
 * Earlier build-up commentary is outcome-independent by design.
 */
const finalCommentary = (outcome: MatchEngineV2HighlightOutcome, shotTemplate: string): string =>
  outcome === 'FOUL' ? '{actor} zostaje sfaulowany, sędzia przerywa akcję!' :
  outcome === 'OFFSIDE' ? '{actor} wybiega za linię obrony — sędzia liniowy sygnalizuje spalone!' :
  shotTemplate;

const attackFamilies: ScriptFamily[] = [
  {
    id: 'DISTANCE_SHOT', title: 'STRZAŁ Z DYSTANSU', steps: (v, o) => [
      step('PASS', 'DEFENDER', 'MIDFIELDER', point(24, 38, v), point(31, 52, v), 720, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'MIDFIELD_SHIFT_LEFT',
        commentaryTemplate: '{actor} rozpoczyna akcję podaniem do {receiver}.',
      }),
      step('CONTROL', 'MIDFIELDER', undefined, point(31, 52, v), point(33, 57, v), 520, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} przyjmuje piłkę na środku pola.',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, point(33, 57, v), point(35, 72, v), 900, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} rusza z piłką w kierunku pola karnego.',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(35, 72, v), point(34, 104, v), 760, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: finalCommentary(o, '{actor} próbuje szczęścia strzałem z dystansu!'),
      }),
    ],
  },
  {
    id: 'BOX_COMBINATION', title: 'KOMBINACJA W POLU KARNYM', steps: (v, o) => [
      step('PASS', 'MIDFIELDER', 'FORWARD', point(22, 57, v), point(31, 75, v), 700, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} podaje do {receiver} pod polem karnym.',
      }),
      step('PASS', 'FORWARD', 'SCORER', point(31, 75, v), point(40, 86, v), 620, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} zagrywa do {receiver}!',
      }),
      step('CONTROL', 'SCORER', undefined, point(40, 86, v), point(39, 90, v), 430, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor} przyjmuje piłkę pod bramką.',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(39, 90, v), point(34, 104, v), 650, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA Z BLISKIEJ ODLEGŁOŚCI!'),
      }),
    ],
  },
  {
    id: 'CORNER_HEADER', title: 'DOŚRODKOWANIE Z RZUTU ROŻNEGO', steps: (v, o) => [
      step('CROSS', 'WINGER', 'FORWARD', point(v % 2 ? 67 : 1, 104, v), point(31, 94, v), 1050, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} dośrodkowuje w pole karne.',
      }),
      step('CONTROL', 'FORWARD', undefined, point(31, 94, v), point(34, 96, v), 380, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor} wychodzi w górę po piłkę...',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(34, 96, v), point(34, 104, v), 560, {
        commentaryTemplate: finalCommentary(o, '{actor} UDERZA GŁOWĄ!'),
      }),
    ],
  },
  {
    id: 'ONE_ON_ONE', title: 'SYTUACJA SAM NA SAM', steps: (v, o) => [
      step('PASS', 'MIDFIELDER', 'FORWARD', point(27, 48, v), point(35, 70, v), 820, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} zagrywa prostopadle do {receiver}!',
      }),
      step('DRIBBLE', 'FORWARD', undefined, point(35, 70, v), point(36, 88, v), 1050, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} sam na sam z bramkarzem!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(36, 88, v), point(34, 103, v), 620, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA!'),
      }),
    ],
  },
  {
    id: 'WING_CROSS', title: 'AKCJA SKRZYDŁEM', steps: (v, o) => {
      const right = v % 2 === 0;
      const x = right ? 59 : 9;
      return [
        step('PASS', 'DEFENDER', 'WINGER', point(right ? 47 : 21, 40, v), point(x, 59, v), 760, {
          attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
          defendingGroupBehavior: right ? 'MIDFIELD_SHIFT_RIGHT' : 'MIDFIELD_SHIFT_LEFT',
          commentaryTemplate: '{actor} zagrywa na skrzydło do {receiver}.',
        }),
        step('DRIBBLE', 'WINGER', undefined, point(x, 59, v), point(right ? 62 : 6, 83, v), 980, {
          attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
          defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
          commentaryTemplate: '{actor} mija obrońcę i rusza do przodu.',
        }),
        step('CROSS', 'WINGER', 'SCORER', point(right ? 62 : 6, 83, v), point(35, 93, v), 920, {
          defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
          commentaryTemplate: '{actor} dośrodkowuje do {receiver}!',
        }),
        step(finalShotKind(o), 'SCORER', undefined, point(35, 93, v), point(34, 104, v), 580, {
          commentaryTemplate: finalCommentary(o, '{actor} STRZELA!'),
        }),
      ];
    },
  },
  {
    id: 'SOLO_DRIBBLE', title: 'INDYWIDUALNY RAJD', steps: (v, o) => [
      step('CONTROL', 'SCORER', undefined, point(25, 48, v), point(27, 53, v), 480, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        commentaryTemplate: '{actor} przyjmuje piłkę na własnej połowie...',
      }),
      step('DRIBBLE', 'SCORER', undefined, point(27, 53, v), point(38, 69, v), 960, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} rusza indywidualnie!',
      }),
      step('DRIBBLE', 'SCORER', undefined, point(38, 69, v), point(33, 88, v), 920, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} mija kolejnego rywala!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(33, 88, v), point(34, 104, v), 610, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA!'),
      }),
    ],
  },
  {
    id: 'COUNTER_ATTACK', title: 'SZYBKI KONTRATAK', steps: (v, o) => [
      step('TACKLE', 'DEFENDER', undefined, point(29, 31, v), point(31, 35, v), 520, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} odbiera piłkę!',
      }),
      step('PASS', 'DEFENDER', 'MIDFIELDER', point(31, 35, v), point(42, 55, v), 760, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: 'Szybkie zagranie do {receiver}!',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', point(42, 55, v), point(36, 79, v), 820, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} pędzi z kontrą do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, point(36, 79, v), point(34, 91, v), 680, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} sam przed obrońcami!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(34, 91, v), point(34, 104, v), 590, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA!'),
      }),
    ],
  },
  {
    id: 'CUTBACK', title: 'WYCOFANIE PIŁKI', steps: (v, o) => {
      const x = v % 2 === 0 ? 58 : 10;
      return [
        step('PASS', 'MIDFIELDER', 'WINGER', point(34, 58, v), point(x, 76, v), 780, {
          attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
          defendingGroupBehavior: x > 34 ? 'MIDFIELD_SHIFT_RIGHT' : 'MIDFIELD_SHIFT_LEFT',
          commentaryTemplate: '{actor} zagrywa do {receiver} na skrzydle.',
        }),
        step('DRIBBLE', 'WINGER', undefined, point(x, 76, v), point(x, 94, v), 760, {
          attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
          defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
          commentaryTemplate: '{actor} wbiega w pole karne od linii końcowej.',
        }),
        step('PASS', 'WINGER', 'SCORER', point(x, 94, v), point(34, 87, v), 650, {
          defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
          commentaryTemplate: '{actor} cofa piłkę do {receiver}!',
        }),
        step(finalShotKind(o), 'SCORER', undefined, point(34, 87, v), point(34, 104, v), 620, {
          commentaryTemplate: finalCommentary(o, '{actor} STRZELA Z POWROTNEGO ZAGRANIA!'),
        }),
      ];
    },
  },
  {
    id: 'FREE_KICK', title: 'RZUT WOLNY', steps: (v, o) => [
      step('CONTROL', 'SCORER', undefined, point(31, 79, v), point(32, 80, v), 560, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor} ustawia piłkę na rzut wolny...',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(32, 80, v), point(34, 104, v), 900, {
        commentaryTemplate: finalCommentary(o, '{actor} UDERZA Z RZUTU WOLNEGO!'),
      }),
    ],
  },
  {
    id: 'SECOND_BALL', title: 'DOBITKA PO ODBITEJ PIŁCE', steps: (v, o) => [
      step('CROSS', 'WINGER', 'FORWARD', point(9, 78, v), point(36, 91, v), 900, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} dośrodkowuje w pole karne.',
      }),
      step('BLOCK', 'FORWARD', undefined, point(36, 91, v), point(31, 93, v), 520, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: 'Obrona blokuje uderzenie {actor}!',
      }),
      step('REBOUND', 'SCORER', undefined, point(31, 93, v), point(38, 91, v), 480, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        commentaryTemplate: '{actor} pierwszy dopada do odbitej piłki!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(38, 91, v), point(34, 104, v), 580, {
        commentaryTemplate: finalCommentary(o, '{actor} DOBIJA!'),
      }),
    ],
  },
  {
    id: 'THROUGH_BALL', title: 'PROSTOPADŁE PODANIE', steps: (v, o) => [
      step('CONTROL', 'MIDFIELDER', undefined, point(30, 44, v), point(30, 46, v), 460, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        commentaryTemplate: '{actor} rozgląda się w poszukiwaniu podania za linię obrony.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', point(30, 46, v), point(34, 78, v), 780, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} przebija obronę prostopadłym podaniem do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, point(34, 78, v), point(35, 92, v), 780, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} wychodzi sam na sam z obrońcami!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(35, 92, v), point(34, 104, v), 600, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA!'),
      }),
    ],
  },
  {
    id: 'HIGH_PRESS_TURNOVER', title: 'ODBIÓR WYSOKO NA BOISKU', steps: (v, o) => [
      step('TACKLE', 'MIDFIELDER', undefined, point(30, 76, v), point(32, 79, v), 480, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} odbiera piłkę wysoko na boisku po agresywnym pressingu!',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', point(32, 79, v), point(36, 88, v), 560, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: 'Błyskawiczne zagranie do {receiver}!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(36, 88, v), point(34, 104, v), 560, {
        commentaryTemplate: finalCommentary(o, '{actor} NATYCHMIAST STRZELA!'),
      }),
    ],
  },
  {
    id: 'LONG_BALL_HOLDUP', title: 'GRA NA DŁUGĄ PIŁKĘ', steps: (v, o) => [
      step('PASS', 'DEFENDER', 'FORWARD', point(30, 25, v), point(33, 68, v), 900, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} wybija długą piłkę w kierunku {receiver}.',
      }),
      step('CONTROL', 'FORWARD', undefined, point(33, 68, v), point(32, 70, v), 520, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor} broni się przy piłce plecami do bramki.',
      }),
      step('PASS', 'FORWARD', 'SCORER', point(32, 70, v), point(34, 78, v), 620, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        commentaryTemplate: '{actor} zgrywa piłkę do nadbiegającego {receiver}!',
      }),
      step(finalShotKind(o), 'SCORER', undefined, point(34, 78, v), point(34, 104, v), 680, {
        commentaryTemplate: finalCommentary(o, '{actor} STRZELA Z DRUGIEJ LINII!'),
      }),
    ],
  },
];

/** No jitter: these are hand-authored scenarios, not procedural variants. */
const p = (x: number, y: number): MatchEngineV2Point => ({ x, y });

/**
 * Five fully hand-authored goal scenarios, each describing not just the ball
 * carrier but named supporting runs and both sides' formation shape, exactly
 * as specified by the user. Deliberately kept separate from attackFamilies:
 * these replace only the GOAL pool (see MATCH_ENGINE_V2_GOAL_SCRIPTS below);
 * MISS/SAVE/OFFSIDE/FOUL still use the families above until replacements for
 * those outcomes are authored too.
 */
const authoredGoalFamilies: ScriptFamily[] = [
  {
    id: 'THROUGH_PASS_CENTRAL', title: 'PROSTOPADŁE PODANIE ŚRODKIEM', steps: () => [
      step('DRIBBLE', 'MIDFIELDER', undefined, p(34, 62), p(32, 68), 700, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 80), end: p(30, 84) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 80), end: p(48, 82) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę i szuka okazji do podania.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(32, 68), p(33, 86), 780, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(40, 66), end: p(38, 82) },
        ],
        commentaryTemplate: '{actor} przebija obronę prostopadłym podaniem do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(33, 86), p(34, 96), 650, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'WINGER', roleIndex: 0, side: 'ATTACKING', start: p(58, 66), end: p(56, 86) },
          { role: 'WINGER', roleIndex: 1, side: 'ATTACKING', start: p(10, 66), end: p(12, 86) },
        ],
        commentaryTemplate: '{actor} przyjmuje piłkę i rusza w kierunku bramki!',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 96), p(34, 104), 620, {
        commentaryTemplate: '{actor} STRZELA... GOOOL!',
      }),
    ],
  },
  {
    id: 'RIGHT_WING_CUTBACK', title: 'AKCJA PRAWYM SKRZYDŁEM I PODANIE W POLE KARNE', steps: () => [
      step('DRIBBLE', 'WINGER', undefined, p(50, 72), p(58, 80), 820, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 78), end: p(30, 88) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 80), end: p(46, 92) },
          { role: 'DEFENDER', roleIndex: 0, side: 'ATTACKING', start: p(50, 62), end: p(56, 76) },
        ],
        commentaryTemplate: '{actor} rusza prawą stroną w kierunku pola karnego.',
      }),
      step('CROSS', 'WINGER', 'SCORER', p(58, 80), p(34, 90), 720, {
        actorRoleIndex: 0,
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} zagrywa piłkę po ziemi w pole karne do {receiver}!',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 90), p(34, 104), 580, {
        commentaryTemplate: '{actor} STRZELA... GOL!',
      }),
    ],
  },
  {
    id: 'BOX_ONE_TWO', title: 'WYMIANA PODAŃ PRZED POLEM KARNYM', steps: () => [
      step('PASS', 'MIDFIELDER', 'MIDFIELDER', p(34, 80), p(32, 84), 650, {
        actorRoleIndex: 0,
        receiverRoleIndex: 1,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        commentaryTemplate: '{actor} rozpoczyna akcję, podanie do {receiver}.',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(32, 84), p(28, 85), 400, {
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 88), end: p(36, 82) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 88), end: p(40, 86) },
        ],
        commentaryTemplate: '{actor} przesuwa się z piłką.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(28, 85), p(36, 82), 550, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} podaje do cofającego się {receiver}.',
      }),
      step('PASS', 'SCORER', 'MIDFIELDER', p(36, 82), p(30, 84), 500, {
        receiverRoleIndex: 1,
        commentaryTemplate: '{actor} odgrywa do {receiver} i rusza do przodu!',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(30, 84), p(33, 90), 550, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} natychmiast znowu do {receiver}, który wychodzi przed obronę!',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 90), p(34, 104), 600, {
        commentaryTemplate: '{actor} STRZELA SPRZED POLA KARNEGO... GOOOL!',
      }),
    ],
  },
  {
    id: 'TURNOVER_COUNTER', title: 'PRZEJĘCIE PIŁKI I SZYBKI KONTRATAK', steps: () => [
      step('TACKLE', 'MIDFIELDER', undefined, p(34, 45), p(35, 48), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 60), end: p(34, 70) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 60), end: p(44, 70) },
        ],
        commentaryTemplate: '{actor} przejmuje piłkę!',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(35, 48), p(36, 54), 500, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} rusza do przodu z odzyskaną piłką.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(36, 54), p(34, 76), 700, {
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(44, 70), end: p(46, 78) },
        ],
        commentaryTemplate: '{actor} zagrywa do pędzącego {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(34, 76), p(34, 90), 600, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} pędzi środkiem boiska!',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 90), p(34, 104), 580, {
        commentaryTemplate: '{actor} STRZELA... GOL!',
      }),
    ],
  },
  {
    id: 'LONG_RANGE_STRIKE', title: 'STRZAŁ Z DYSTANSU', steps: () => [
      step('PASS', 'MIDFIELDER', 'SCORER', p(34, 75), p(32, 79), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 82), end: p(28, 90) },
          { role: 'FORWARD', roleIndex: 1, side: 'ATTACKING', start: p(38, 82), end: p(40, 90) },
        ],
        commentaryTemplate: '{actor} podaje do {receiver}.',
      }),
      step('CONTROL', 'SCORER', undefined, p(32, 79), p(33, 81), 400, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} przyjmuje piłkę i rusza kilka kroków do przodu.',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 81), p(34, 104), 750, {
        commentaryTemplate: '{actor} STRZELA Z DYSTANSU... GOOOOOL!',
      }),
    ],
  },
];

/**
 * Five hand-authored SAVE scenarios: the goalkeeper catches the ball and the
 * action ends there (no rebound). A rebound/parry that stays in play is a
 * separate, not-yet-authored category by the user's own design. Replaces
 * only the SAVE pool (see MATCH_ENGINE_V2_SAVE_SCRIPTS below); MISS/OFFSIDE/
 * FOUL still use the families above.
 */
const authoredSaveFamilies: ScriptFamily[] = [
  {
    id: 'CENTRAL_LAYOFF_SAVE', title: 'STRZAŁ NAPASTNIKA PO PODANIU ŚRODKIEM', steps: () => [
      step('DRIBBLE', 'MIDFIELDER', undefined, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 82), end: p(36, 76) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 82), end: p(48, 86) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę do przodu.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(33, 74), p(36, 76), 600, {
        actorRoleIndex: 0,
        commentaryTemplate: '{actor} zagrywa do {receiver}.',
      }),
      step('CONTROL', 'SCORER', undefined, p(36, 76), p(35, 78), 450, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} przyjmuje piłkę i odwraca się z nią w stronę bramki.',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(35, 78), p(34, 86), 500, {
        commentaryTemplate: '{actor} rusza z piłką sprzed pola karnego.',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 86), p(34, 101), 600, {
        commentaryTemplate: '{actor} STRZELA... pewna interwencja bramkarza!',
      }),
    ],
  },
  {
    id: 'LEFT_WING_SAVE', title: 'AKCJA LEWYM SKRZYDŁEM', steps: () => [
      step('DRIBBLE', 'WINGER', undefined, p(10, 75), p(12, 80), 780, {
        actorRoleIndex: 1,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 78), end: p(30, 88) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 78), end: p(46, 90) },
        ],
        commentaryTemplate: '{actor} rusza lewą stroną w kierunku pola karnego.',
      }),
      step('PASS', 'WINGER', 'SCORER', p(12, 80), p(30, 88), 700, {
        actorRoleIndex: 1,
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} zagrywa po ziemi do {receiver}!',
      }),
      step('SHOT', 'SCORER', undefined, p(30, 88), p(32, 101), 550, {
        commentaryTemplate: '{actor} STRZELA! Bramkarz broni!',
      }),
    ],
  },
  {
    id: 'TWO_FORWARD_COUNTER_SAVE', title: 'SZYBKI KONTRATAK DWÓCH NAPASTNIKÓW', steps: () => [
      step('TACKLE', 'MIDFIELDER', undefined, p(34, 42), p(35, 45), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(40, 55), end: p(44, 64) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 55), end: p(30, 64) },
        ],
        commentaryTemplate: '{actor} przejmuje piłkę!',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(35, 45), p(36, 50), 480, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} rusza do przodu z odzyskaną piłką.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(36, 50), p(46, 66), 680, {
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 64), end: p(32, 74) },
        ],
        commentaryTemplate: '{actor} zagrywa do {receiver} na prawą stronę!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(46, 66), p(36, 84), 700, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} prowadzi piłkę i schodzi z prawej strony do środka.',
      }),
      step('SHOT', 'SCORER', undefined, p(36, 84), p(33, 101), 580, {
        commentaryTemplate: '{actor} STRZELA! Bramkarz nie daje się zaskoczyć!',
      }),
    ],
  },
  {
    id: 'MIDFIELD_ONE_TWO_LONG_SHOT_SAVE', title: 'KOMBINACJA DWÓCH POMOCNIKÓW I STRZAŁ Z DYSTANSU', steps: () => [
      step('PASS', 'SCORER', 'MIDFIELDER', p(34, 75), p(40, 76), 550, {
        receiverRoleIndex: 1,
        commentaryTemplate: '{actor} podaje do {receiver}.',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(40, 76), p(44, 78), 450, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 76), end: p(30, 84) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(34, 84), end: p(28, 90) },
          { role: 'FORWARD', roleIndex: 1, side: 'ATTACKING', start: p(40, 84), end: p(46, 80) },
        ],
        commentaryTemplate: '{actor} przesuwa się z piłką w bok.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(44, 78), p(30, 84), 600, {
        receiverRoleIndex: 1,
        commentaryTemplate: '{actor} odgrywa do nadbiegającego {receiver}!',
      }),
      step('SHOT', 'SCORER', undefined, p(30, 84), p(32, 101), 720, {
        commentaryTemplate: '{actor} STRZELA Z DYSTANSU! Bramkarz łapie piłkę.',
      }),
    ],
  },
  {
    id: 'THROUGH_BALL_ONE_ON_ONE_SAVE', title: 'PODANIE POMIĘDZY OBROŃCÓW I SYTUACJA SAM NA SAM', steps: () => [
      step('DRIBBLE', 'MIDFIELDER', undefined, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 84), end: p(30, 88) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 84), end: p(48, 86) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę do przodu.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(33, 74), p(30, 88), 780, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} zagrywa prostopadłe podanie do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(30, 88), p(33, 96), 650, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} wychodzi sam na sam z bramkarzem!',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 96), p(34, 101), 600, {
        commentaryTemplate: '{actor} STRZELA! BRONI BRAMKARZ!',
      }),
    ],
  },
];

/**
 * Five hand-authored MISS scenarios: the shot goes wide or over, no keeper
 * intervention and no rebound. Replaces only the MISS pool (see
 * MATCH_ENGINE_V2_MISS_SCRIPTS below); OFFSIDE/FOUL still use the families
 * defined at the top of this file.
 */
const authoredMissFamilies: ScriptFamily[] = [
  {
    id: 'LONG_RANGE_MISS', title: 'STRZAŁ Z DYSTANSU', steps: () => [
      step('PASS', 'MIDFIELDER', 'SCORER', p(34, 75), p(32, 79), 600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(34, 84), end: p(30, 90) },
          { role: 'FORWARD', roleIndex: 1, side: 'ATTACKING', start: p(40, 84), end: p(44, 90) },
        ],
        commentaryTemplate: '{actor} podaje do {receiver}.',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(32, 79), p(33, 81), 450, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} rusza kilka metrów z piłką do przodu.',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 81), p(34, 104), 700, {
        commentaryTemplate: '{actor} STRZELA... niecelnie!',
      }),
    ],
  },
  {
    id: 'WING_ACTION_MISS', title: 'STRZAŁ PO AKCJI SKRZYDŁEM', steps: () => [
      step('DRIBBLE', 'WINGER', undefined, p(50, 72), p(58, 80), 750, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 78), end: p(30, 88) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 78), end: p(44, 86) },
        ],
        commentaryTemplate: '{actor} rusza prawą stroną.',
      }),
      step('PASS', 'WINGER', 'SCORER', p(58, 80), p(30, 88), 700, {
        actorRoleIndex: 0,
        commentaryTemplate: '{actor} zagrywa do {receiver}.',
      }),
      step('CONTROL', 'SCORER', undefined, p(30, 88), p(31, 89), 380, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} przyjmuje piłkę.',
      }),
      step('SHOT', 'SCORER', undefined, p(31, 89), p(34, 104), 500, {
        commentaryTemplate: '{actor} STRZELA! Obok bramki!',
      }),
    ],
  },
  {
    id: 'FAST_COUNTER_MISS', title: 'SZYBKI KONTRATAK', steps: () => [
      step('TACKLE', 'MIDFIELDER', undefined, p(34, 42), p(35, 45), 480, {
        actorRoleIndex: 1,
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 55), end: p(34, 65) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 55), end: p(44, 65) },
        ],
        commentaryTemplate: '{actor} przejmuje piłkę!',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(35, 45), p(34, 65), 650, {
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} podaje do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(34, 65), p(34, 80), 550, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(44, 65), end: p(40, 78) },
        ],
        commentaryTemplate: '{actor} rusza środkiem boiska.',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 80), p(34, 104), 600, {
        commentaryTemplate: '{actor} STRZELA! Nad bramką!',
      }),
    ],
  },
  {
    id: 'BOX_EDGE_COMBINATION_MISS', title: 'KOMBINACJA PRZED POLEM KARNYM', steps: () => [
      step('PASS', 'SCORER', 'FORWARD', p(34, 86), p(30, 82), 550, {
        commentaryTemplate: '{actor} podaje do {receiver}.',
      }),
      step('PASS', 'FORWARD', 'MIDFIELDER', p(30, 82), p(20, 84), 500, {
        receiverRoleIndex: 1,
        commentaryTemplate: '{actor} odgrywa do {receiver}.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(20, 84), p(30, 90), 550, {
        receiverRoleIndex: 1,
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 82), end: p(28, 92) },
        ],
        commentaryTemplate: '{actor} znowu do {receiver}!',
      }),
      step('SHOT', 'SCORER', undefined, p(30, 90), p(34, 104), 600, {
        commentaryTemplate: '{actor} STRZELA! Minimalnie obok bramki!',
      }),
    ],
  },
  {
    id: 'DEFENSE_SPLITTING_RUN_MISS', title: 'NAPASTNIK WYCHODZI ZA LINIĘ OBRONY', steps: () => [
      step('DRIBBLE', 'MIDFIELDER', undefined, p(34, 70), p(33, 74), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(34, 84), end: p(30, 88) },
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 84), end: p(48, 86) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę do przodu.',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(33, 74), p(30, 88), 780, {
        actorRoleIndex: 0,
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} świetnie zagrywa między obrońców do {receiver}!',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(30, 88), p(33, 96), 650, {
        commentaryTemplate: '{actor} wychodzi na pozycję i rusza na bramkę!',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 96), p(34, 104), 600, {
        commentaryTemplate: '{actor} STRZELA! Nie trafia w bramkę!',
      }),
    ],
  },
];

/**
 * Two hand-authored CORNER scenarios that end in an actual shot. Each is
 * added, tagged requiredSetPieceKind: 'CORNER', into the GOAL, SAVE and MISS
 * pools alike (see MATCH_ENGINE_V2_GOAL/SAVE/MISS_SCRIPTS below) because the
 * user's own scenario deliberately leaves the result to the engine — the
 * choreography up to the shot is identical, only terminalEnd's outcome-based
 * override differs. The final step's own text is therefore outcome-neutral
 * ("STRZAŁ!"), exactly as written, never "GOL!"/"OBRONA!"/"NIECELNY!".
 */
const cornerShotFamilies: ScriptFamily[] = [
  {
    id: 'CORNER_CROSS_AND_HEADER', title: 'DOŚRODKOWANIE I STRZAŁ Z RZUTU ROŻNEGO', steps: () => [
      step('CONTROL', 'WINGER', undefined, p(67, 104), p(67, 104), 2200, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: 'Zawodnicy wbiegają w pole karne, {actor} czeka z piłką przy rożniku...',
      }),
      step('CROSS', 'WINGER', 'SCORER', p(67, 104), p(31, 94), 1050, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(40, 88), end: p(46, 96) },
          { role: 'MIDFIELDER', roleIndex: 0, side: 'ATTACKING', start: p(34, 80), end: p(34, 86) },
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(34, 70), end: p(34, 76) },
          { role: 'DEFENDER', roleIndex: 0, side: 'ATTACKING', start: p(34, 50), end: p(34, 52) },
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(30, 86), end: p(31, 90) },
          { role: 'DEFENDER', roleIndex: 1, side: 'DEFENDING', start: p(42, 86), end: p(45, 92) },
          { role: 'MIDFIELDER', roleIndex: 0, side: 'DEFENDING', start: p(34, 80), end: p(34, 84) },
        ],
        commentaryTemplate: '{actor} wykonuje rzut rożny w pole karne...',
      }),
      step('CONTROL', 'SCORER', undefined, p(31, 94), p(33, 96), 450, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor}!',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 96), p(34, 104), 600, {
        commentaryTemplate: '{actor} — STRZAŁ!',
      }),
    ],
  },
  {
    id: 'CORNER_FAR_POST_CROSS', title: 'DOŚRODKOWANIE NA DALSZĄ CZĘŚĆ POLA KARNEGO', steps: () => [
      step('CONTROL', 'WINGER', undefined, p(1, 104), p(1, 104), 2200, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: 'Zawodnicy ustawiają się w polu karnym, {actor} czeka z piłką przy rożniku...',
      }),
      step('CROSS', 'WINGER', 'SCORER', p(1, 104), p(46, 92), 1050, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(34, 90), end: p(30, 96) },
          { role: 'MIDFIELDER', roleIndex: 0, side: 'ATTACKING', start: p(34, 80), end: p(34, 84) },
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(40, 86), end: p(44, 90) },
        ],
        commentaryTemplate: '{actor} zagrywa piłkę na dalszą stronę pola karnego...',
      }),
      step('CONTROL', 'SCORER', undefined, p(46, 92), p(44, 94), 450, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: '{actor} dochodzi do piłki...',
      }),
      step('SHOT', 'SCORER', undefined, p(44, 94), p(34, 104), 600, {
        commentaryTemplate: '{actor} — STRZAŁ!',
      }),
    ],
  },
];

/**
 * Three hand-authored FREE KICK scenarios that end in an actual shot, tagged
 * requiredSetPieceKind: 'FREE_KICK' and added to the GOAL/SAVE/MISS pools —
 * same outcome-neutral final commentary convention as cornerShotFamilies
 * above, for the same reason (the user's own text never names a result).
 */
const freeKickShotFamilies: ScriptFamily[] = [
  {
    id: 'FREE_KICK_DIRECT_SHOT', title: 'BEZPOŚREDNI STRZAŁ Z RZUTU WOLNEGO', steps: () => [
      step('CONTROL', 'SCORER', undefined, p(30, 80), p(30, 80), 2600, {
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(28, 90), end: p(28, 92) },
          { role: 'FORWARD', roleIndex: 1, side: 'ATTACKING', start: p(40, 90), end: p(40, 92) },
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(30, 84), end: p(30, 88) },
          { role: 'DEFENDER', roleIndex: 1, side: 'DEFENDING', start: p(33, 84), end: p(33, 88) },
          { role: 'DEFENDER', roleIndex: 2, side: 'DEFENDING', start: p(36, 84), end: p(36, 88) },
        ],
        commentaryTemplate: 'Obrona ustawia mur... {actor} czeka na gwizdek sędziego, będzie strzelał bezpośrednio...',
      }),
      step('CONTROL', 'SCORER', undefined, p(30, 80), p(31, 81), 500, {
        commentaryTemplate: 'Sędzia gwiżdże — {actor} rusza do piłki!',
      }),
      step('SHOT', 'SCORER', undefined, p(31, 81), p(34, 104), 700, {
        commentaryTemplate: '{actor} — STRZAŁ!',
      }),
    ],
  },
  {
    id: 'FREE_KICK_LAYOFF_SHOT', title: 'PODANIE DO DRUGIEGO ZAWODNIKA I STRZAŁ', steps: () => [
      step('CONTROL', 'MIDFIELDER', undefined, p(30, 75), p(30, 75), 2600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(27, 71), end: p(30, 75) },
          { role: 'DEFENDER', roleIndex: 1, side: 'DEFENDING', start: p(33, 71), end: p(33, 75) },
        ],
        commentaryTemplate: 'Obrona ustawia mur... {actor} czeka na gwizdek sędziego...',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(30, 75), p(38, 76), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'DEFENDER', roleIndex: 0, side: 'ATTACKING', start: p(20, 55), end: p(24, 64) },
          { role: 'DEFENDER', roleIndex: 1, side: 'ATTACKING', start: p(46, 55), end: p(42, 64) },
        ],
        commentaryTemplate: '{actor} nie strzela... podaje do {receiver}...',
      }),
      step('DRIBBLE', 'SCORER', undefined, p(38, 76), p(34, 82), 550, {
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'DEFENDER', roleIndex: 0, side: 'ATTACKING', start: p(24, 64), end: p(28, 74) },
          { role: 'DEFENDER', roleIndex: 1, side: 'ATTACKING', start: p(42, 64), end: p(38, 74) },
        ],
        commentaryTemplate: '{actor} ma miejsce...',
      }),
      step('SHOT', 'SCORER', undefined, p(34, 82), p(34, 104), 700, {
        commentaryTemplate: '{actor} — STRZAŁ!',
      }),
    ],
  },
  {
    id: 'FREE_KICK_CROSS_HEADER', title: 'DOŚRODKOWANIE W POLE KARNE Z RZUTU WOLNEGO', steps: () => [
      step('CONTROL', 'WINGER', undefined, p(8, 74), p(8, 74), 2600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: 'Zawodnicy ustawiają się w polu karnym, {actor} czeka na gwizdek sędziego...',
      }),
      step('CROSS', 'WINGER', 'SCORER', p(8, 74), p(31, 90), 900, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(42, 86), end: p(46, 92) },
          { role: 'MIDFIELDER', roleIndex: 0, side: 'ATTACKING', start: p(34, 78), end: p(34, 82) },
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(34, 68), end: p(34, 74) },
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(30, 84), end: p(31, 88) },
        ],
        commentaryTemplate: '{actor} z rzutu wolnego... zagranie w pole karne...',
      }),
      step('CONTROL', 'SCORER', undefined, p(31, 90), p(33, 93), 400, {
        commentaryTemplate: '{actor} dochodzi do piłki...',
      }),
      step('SHOT', 'SCORER', undefined, p(33, 93), p(34, 104), 600, {
        commentaryTemplate: '{actor} — STRZAŁ!',
      }),
    ],
  },
];

/**
 * Three hand-authored CORNER scenarios that do NOT end in a shot — the user
 * deliberately wanted some corners to stay open-ended (short combination,
 * defensive clearance, clearance into a counterattack) instead of always
 * resolving to GOL/OBRONA/NIECELNY, "for the naturalness of the animation".
 * These form their own CORNER_RESTART outcome/pool, selected whenever a
 * corner is taken and CupSetPieceResolver.createSetPieceChance produced no
 * shooting chance for it (see CupActionBuilder.resolveSetPieceDelivery).
 */
const cornerRestartFamilies: ScriptFamily[] = [
  {
    id: 'CORNER_SHORT_COMBINATION', title: 'KRÓTKO ROZEGRANY RZUT ROŻNY', steps: () => [
      step('CONTROL', 'SCORER', undefined, p(67, 104), p(67, 104), 2200, {
        commentaryTemplate: 'Zawodnicy ustawiają się do rzutu rożnego, {actor} czeka z piłką przy rożniku...',
      }),
      step('PASS', 'SCORER', 'MIDFIELDER', p(67, 104), p(60, 96), 550, {
        receiverRoleIndex: 0,
        commentaryTemplate: '{actor} rozgrywa rzut rożny krótko, do {receiver}...',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(60, 96), p(52, 92), 500, {
        actorRoleIndex: 0,
        supportingRuns: [
          { role: 'SCORER', roleIndex: 0, side: 'ATTACKING', start: p(66, 96), end: p(60, 88) },
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(50, 90), end: p(54, 92) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę kilka metrów w stronę środka...',
      }),
      step('PASS', 'MIDFIELDER', 'SCORER', p(52, 92), p(64, 90), 500, {
        actorRoleIndex: 0,
        commentaryTemplate: '{actor} odgrywa ponownie do {receiver}...',
      }),
      step('CROSS', 'SCORER', 'FORWARD', p(64, 90), p(31, 92), 750, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(40, 86), end: p(44, 90) },
        ],
        commentaryTemplate: '{actor} zagrywa piłkę w pole karne!',
      }),
    ],
  },
  {
    id: 'CORNER_DEFENSIVE_CLEARANCE', title: 'DOŚRODKOWANIE I WYBICIE PRZEZ OBROŃCĘ', steps: () => [
      step('CONTROL', 'SCORER', undefined, p(1, 104), p(1, 104), 2200, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        commentaryTemplate: 'Zawodnicy wbiegają w pole karne, {actor} czeka z piłką przy rożniku...',
      }),
      step('CROSS', 'SCORER', 'FORWARD', p(1, 104), p(32, 92), 950, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        supportingRuns: [
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(40, 88), end: p(44, 92) },
        ],
        commentaryTemplate: '{actor} wykonuje rzut rożny...',
      }),
      step('REBOUND', 'MIDFIELDER', undefined, p(32, 92), p(30, 84), 550, {
        actorRoleIndex: 0,
        supportingRuns: [
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(30, 90), end: p(28, 86) },
        ],
        commentaryTemplate: 'Obrona wybija piłkę, ale akcja jeszcze się nie kończy — {actor} rusza do niej!',
      }),
    ],
  },
  {
    id: 'CORNER_CLEARANCE_COUNTER', title: 'WYBICIE I KONTRA PRZECIWNIKA', steps: () => [
      step('CONTROL', 'SCORER', undefined, p(67, 104), p(67, 104), 2200, {
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        commentaryTemplate: 'Większość drużyny wbiega na połowę przeciwnika, {actor} czeka z piłką przy rożniku...',
      }),
      step('CROSS', 'SCORER', 'FORWARD', p(67, 104), p(32, 90), 950, {
        receiverRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENDERS_HOLD_LINE',
        commentaryTemplate: '{actor} wykonuje rzut rożny...',
      }),
      step('REBOUND', 'FORWARD', undefined, p(32, 90), p(52, 86), 650, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        defendingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'DEFENDING', start: p(46, 80), end: p(52, 84) },
          { role: 'MIDFIELDER', roleIndex: 0, side: 'ATTACKING', start: p(34, 80), end: p(34, 60) },
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(34, 70), end: p(34, 55) },
        ],
        commentaryTemplate: 'Obrona wybija piłkę na bok... zaczyna się kontratak drużyny przeciwnej!',
      }),
    ],
  },
];

/**
 * Two hand-authored FREE KICK scenarios that do NOT end in a shot — same
 * "no", forming their own FREE_KICK_RESTART outcome/pool. Unlike the shot
 * families above, resolveSetPieceDelivery never records a taker for a free
 * kick with no shooting chance, so these deliberately never use the SCORER
 * role — every actor here is a plain role/roleIndex pin instead.
 */
const freeKickRestartFamilies: ScriptFamily[] = [
  {
    id: 'FREE_KICK_SHORT_COMBINATION', title: 'KRÓTKIE ROZEGRANIE I AKCJA SKRZYDŁEM', steps: () => [
      step('CONTROL', 'MIDFIELDER', undefined, p(5, 69), p(5, 69), 2600, {
        actorRoleIndex: 0,
        defendingGroupBehavior: 'MIDFIELD_SHIFT_LEFT',
        commentaryTemplate: '{actor} czeka na gwizdek sędziego, zanim rozegra wolny krótko...',
      }),
      step('PASS', 'MIDFIELDER', 'MIDFIELDER', p(5, 69), p(10, 72), 500, {
        actorRoleIndex: 0,
        receiverRoleIndex: 1,
        commentaryTemplate: '{actor} rozgrywa wolny krótko, do {receiver}...',
      }),
      step('PASS', 'MIDFIELDER', 'MIDFIELDER', p(10, 72), p(14, 76), 500, {
        actorRoleIndex: 1,
        receiverRoleIndex: 0,
        commentaryTemplate: '{actor} odgrywa piłkę z powrotem do biegnącego {receiver}...',
      }),
      step('DRIBBLE', 'MIDFIELDER', undefined, p(14, 76), p(18, 82), 500, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
        defendingGroupBehavior: 'MIDFIELD_SHIFT_LEFT',
        supportingRuns: [
          { role: 'FORWARD', roleIndex: 0, side: 'ATTACKING', start: p(30, 86), end: p(28, 90) },
          { role: 'FORWARD', roleIndex: 1, side: 'ATTACKING', start: p(38, 86), end: p(40, 90) },
        ],
        commentaryTemplate: '{actor} prowadzi piłkę, jest miejsce na lewej stronie...',
      }),
      step('CROSS', 'MIDFIELDER', 'FORWARD', p(18, 82), p(30, 90), 700, {
        actorRoleIndex: 0,
        receiverRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        commentaryTemplate: '{actor} zagrywa piłkę w pole karne!',
      }),
    ],
  },
  {
    id: 'FREE_KICK_CLEARANCE_RECOVERY', title: 'DOŚRODKOWANIE I WYBICIE OBRONY', steps: () => [
      step('CONTROL', 'WINGER', undefined, p(60, 72), p(60, 72), 2600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        commentaryTemplate: 'Zawodnicy ustawiają się w polu karnym, {actor} czeka na gwizdek sędziego...',
      }),
      step('CROSS', 'WINGER', 'FORWARD', p(60, 72), p(38, 90), 850, {
        actorRoleIndex: 0,
        receiverRoleIndex: 0,
        attackingGroupBehavior: 'ATTACKERS_ENTER_BOX',
        defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        supportingRuns: [
          { role: 'MIDFIELDER', roleIndex: 1, side: 'ATTACKING', start: p(30, 86), end: p(28, 90) },
        ],
        commentaryTemplate: '{actor} zagrywa z rzutu wolnego... piłka w pole karne...',
      }),
      step('REBOUND', 'MIDFIELDER', undefined, p(38, 90), p(30, 80), 600, {
        actorRoleIndex: 0,
        attackingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
        defendingGroupBehavior: 'TEAM_PUSH_FORWARD',
        supportingRuns: [
          { role: 'DEFENDER', roleIndex: 0, side: 'DEFENDING', start: p(36, 88), end: p(32, 84) },
        ],
        commentaryTemplate: 'Obrona wybija piłkę przed pole karne... {actor} rusza do niej!',
      }),
    ],
  },
];

const offsideFamilies: ScriptFamily[] = attackFamilies.slice(0, 5);

const makeScripts = (
  outcome: MatchEngineV2HighlightOutcome,
  families: ScriptFamily[],
  variantsPerFamily: number,
): MatchEngineV2HighlightScript[] => families.flatMap(family =>
  Array.from({ length: variantsPerFamily }, (_, variant) => ({
    id: `${outcome}_${family.id}_${variant + 1}`,
    outcome,
    family: family.id,
    title: family.title,
    steps: family.steps(variant, outcome),
  }))
);

/** Adds families to a pool, tagged so selectScript only offers them for a matching real setPieceKind cue. */
const taggedScripts = (
  outcome: MatchEngineV2HighlightOutcome,
  families: ScriptFamily[],
  requiredSetPieceKind: 'CORNER' | 'FREE_KICK',
): MatchEngineV2HighlightScript[] =>
  makeScripts(outcome, families, 1).map(script => ({ ...script, requiredSetPieceKind }));

export const MATCH_ENGINE_V2_GOAL_SCRIPTS = [
  ...makeScripts('GOAL', authoredGoalFamilies, 1),
  ...taggedScripts('GOAL', cornerShotFamilies, 'CORNER'),
  ...taggedScripts('GOAL', freeKickShotFamilies, 'FREE_KICK'),
];
export const MATCH_ENGINE_V2_OFFSIDE_SCRIPTS = makeScripts('OFFSIDE', offsideFamilies, 2);
export const MATCH_ENGINE_V2_MISS_SCRIPTS = [
  ...makeScripts('MISS', authoredMissFamilies, 1),
  ...taggedScripts('MISS', cornerShotFamilies, 'CORNER'),
  ...taggedScripts('MISS', freeKickShotFamilies, 'FREE_KICK'),
];
export const MATCH_ENGINE_V2_SAVE_SCRIPTS = [
  ...makeScripts('SAVE', authoredSaveFamilies, 1),
  ...taggedScripts('SAVE', cornerShotFamilies, 'CORNER'),
  ...taggedScripts('SAVE', freeKickShotFamilies, 'FREE_KICK'),
];
export const MATCH_ENGINE_V2_FOUL_SCRIPTS = makeScripts('FOUL', attackFamilies, 2);
export const MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS = makeScripts('CORNER_RESTART', cornerRestartFamilies, 1);
export const MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS = makeScripts('FREE_KICK_RESTART', freeKickRestartFamilies, 1);

export const MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS: Record<MatchEngineV2HighlightOutcome, MatchEngineV2HighlightScript[]> = {
  GOAL: MATCH_ENGINE_V2_GOAL_SCRIPTS,
  OFFSIDE: MATCH_ENGINE_V2_OFFSIDE_SCRIPTS,
  MISS: MATCH_ENGINE_V2_MISS_SCRIPTS,
  SAVE: MATCH_ENGINE_V2_SAVE_SCRIPTS,
  FOUL: MATCH_ENGINE_V2_FOUL_SCRIPTS,
  CORNER_RESTART: MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS,
  FREE_KICK_RESTART: MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS,
};

const cueOutcome = (cue: MatchEngineV2VisualCue): MatchEngineV2HighlightOutcome | null => {
  if (cue.kind === 'GOAL') return 'GOAL';
  if (cue.sourceEventType === MatchEventType.OFFSIDE) return 'OFFSIDE';
  if (cue.kind === 'SAVE' || cue.sourceEventType === MatchEventType.ONE_ON_ONE_SAVE) return 'SAVE';
  if (cue.kind === 'FOUL') return 'FOUL';
  if (
    cue.sourceEventType === MatchEventType.SHOT ||
    cue.sourceEventType === MatchEventType.SHOT_POST ||
    cue.sourceEventType === MatchEventType.SHOT_BAR ||
    cue.sourceEventType === MatchEventType.ONE_ON_ONE_MISS ||
    cue.sourceEventType === MatchEventType.PENALTY_MISSED
  ) return 'MISS';
  // A corner actually being taken, or a free kick awarded, but with no shot
  // (yet) attached to the same sequence — the shot branch above already
  // claimed that case when one exists, since bestBySequence keeps whichever
  // cue in the sequence has the higher outcomePriority.
  if (cue.sourceEventType === MatchEventType.CORNER_TAKEN) return 'CORNER_RESTART';
  if (cue.sourceEventType === MatchEventType.FREE_KICK || cue.sourceEventType === MatchEventType.FREE_KICK_DANGEROUS) return 'FREE_KICK_RESTART';
  return null;
};

const outcomePriority: Record<MatchEngineV2HighlightOutcome, number> = {
  GOAL: 5,
  SAVE: 4,
  MISS: 3,
  OFFSIDE: 2,
  FOUL: 1,
  CORNER_RESTART: 0,
  FREE_KICK_RESTART: 0,
};

/** A standalone restart (corner/free kick/penalty award) has no shot outcome yet. */
const RESTART_ACTION_PRIORITY = 0;

/** Below this expected-goals value a miss or save is not dramatic enough to call "key" on its own. */
const KEY_MOMENT_XG_THRESHOLD = 0.30;

const isStandaloneRestartAction = (cue: MatchEngineV2VisualCue): boolean =>
  cue.sourceEventType === MatchEventType.CORNER ||
  cue.sourceEventType === MatchEventType.CORNER_TAKEN ||
  cue.sourceEventType === MatchEventType.FREE_KICK ||
  cue.sourceEventType === MatchEventType.FREE_KICK_DANGEROUS ||
  cue.sourceEventType === MatchEventType.PENALTY_AWARDED ||
  // Covers the initial kickoff, half-time restart and — the one the user
  // actually asked for — the conceding side kicking off again after a goal.
  // Without this a KICK_OFF cue matched no outcome and no other branch here,
  // so it was silently dropped and never shown as a scene at all.
  cue.sourceEventType === MatchEventType.KICK_OFF;

/**
 * KEY_MOMENTS is a strict subset of what ALL_ACTIONS shows: goals always
 * qualify, a penalty miss always qualifies, and an ordinary miss or save only
 * qualifies when the chance itself was clearly dangerous (high xG, or the
 * ball hit the post/bar). Fouls, offside and standalone restarts never do.
 */
const isKeyMoment = (cue: MatchEngineV2VisualCue, outcome: MatchEngineV2HighlightOutcome): boolean => {
  if (outcome === 'GOAL') return true;
  if (outcome === 'MISS') {
    return cue.sourceEventType === MatchEventType.PENALTY_MISSED ||
      cue.sourceEventType === MatchEventType.SHOT_POST ||
      cue.sourceEventType === MatchEventType.SHOT_BAR ||
      (cue.xG ?? 0) >= KEY_MOMENT_XG_THRESHOLD;
  }
  if (outcome === 'SAVE') return (cue.xG ?? 0) >= KEY_MOMENT_XG_THRESHOLD;
  return false;
};

const isKeyMomentCue = (cue: MatchEngineV2VisualCue): boolean => {
  const outcome = cueOutcome(cue);
  return Boolean(outcome && isKeyMoment(cue, outcome));
};

const priorityFor = (cue: MatchEngineV2VisualCue): number => {
  const outcome = cueOutcome(cue);
  return outcome ? outcomePriority[outcome] : RESTART_ACTION_PRIORITY;
};

const terminalCues = (
  mode: MatchEngineV2TransmissionMode,
  cues: readonly MatchEngineV2VisualCue[],
): MatchEngineV2VisualCue[] => {
  if (mode === 'COMMENTARY_ONLY') return [];
  // FULL_MATCH is intentionally not reduced to one terminal event per
  // sequence. It is the experimental mode in which every recorded pass,
  // control, dribble and restart may be presented.
  if (mode === 'FULL_MATCH') return [...cues];
  const candidates = cues.filter(cue => {
    if (mode === 'ALL_ACTIONS' && isStandaloneRestartAction(cue)) return true;
    const outcome = cueOutcome(cue);
    if (!outcome) return false;
    return mode === 'ALL_ACTIONS' || isKeyMoment(cue, outcome);
  });
  const bestBySequence = new Map<string, MatchEngineV2VisualCue>();
  candidates.forEach(cue => {
    const key = cue.sequenceId ?? `${cue.atSecond}:${cue.side ?? 'NONE'}`;
    const previous = bestBySequence.get(key);
    if (!previous || priorityFor(cue) >= priorityFor(previous)) bestBySequence.set(key, cue);
  });
  return [...bestBySequence.values()].sort((left, right) => left.atSecond - right.atSecond || left.id.localeCompare(right.id));
};

const mirroredPoint = (value: MatchEngineV2Point, away: boolean): MatchEngineV2Point =>
  away ? { x: 68 - value.x, y: 105 - value.y } : { ...value };

const terminalEnd = (
  outcome: MatchEngineV2HighlightOutcome,
  scriptStep: MatchEngineV2HighlightStep,
  salt: string,
): MatchEngineV2Point => {
  if (outcome === 'GOAL') return scriptStep.end;
  if (outcome === 'SAVE') {
    const keeperSide = stableHash(`${salt}:save-side`) % 2 === 0 ? -1 : 1;
    return { x: 34 + keeperSide * (2.5 + stableHash(`${salt}:save-width`) % 4), y: 101.5 };
  }
  if (outcome === 'MISS') {
    const missesLeft = stableHash(`${salt}:miss-side`) % 2 === 0;
    return { x: missesLeft ? 18 : 50, y: 105 };
  }
  if (outcome === 'OFFSIDE') {
    return { x: scriptStep.start.x, y: Math.min(96, scriptStep.start.y + 7) };
  }
  // CORNER_RESTART/FREE_KICK_RESTART have no shot to snap to — the ball
  // genuinely travels to wherever the author placed it (delivery, clearance,
  // short pass), same as GOAL.
  if (outcome === 'CORNER_RESTART' || outcome === 'FREE_KICK_RESTART') return scriptStep.end;
  return scriptStep.start;
};

const eventTypeForStep = (kind: MatchEngineV2HighlightStepKind): MatchEventType => {
  if (kind === 'CONTROL') return MatchEventType.BALL_CONTROL;
  if (kind === 'DRIBBLE') return MatchEventType.DRIBBLING;
  if (kind === 'CROSS') return MatchEventType.CROSS_NEAR_POST;
  if (kind === 'TACKLE') return MatchEventType.TACKLE_WON;
  if (kind === 'BLOCK') return MatchEventType.SHOT_BLOCKED;
  if (kind === 'REBOUND') return MatchEventType.REBOUND_WON;
  if (kind === 'FOUL') return MatchEventType.FOUL;
  if (kind === 'OFFSIDE') return MatchEventType.OFFSIDE;
  if (kind === 'SHOT') return MatchEventType.SHOT;
  return MatchEventType.PASS_COMPLETED;
};

const cueKindForStep = (kind: MatchEngineV2HighlightStepKind): MatchEngineV2VisualCueKind => {
  if (kind === 'CONTROL') return 'CONTROL';
  if (kind === 'DRIBBLE') return 'DRIBBLE';
  if (kind === 'CROSS') return 'CROSS';
  if (kind === 'TACKLE') return 'TACKLE';
  if (kind === 'BLOCK') return 'BLOCK';
  if (kind === 'REBOUND') return 'REBOUND';
  if (kind === 'FOUL') return 'FOUL';
  if (kind === 'OFFSIDE') return 'RESTART';
  if (kind === 'SHOT') return 'SHOT';
  return 'PASS';
};

export const MatchEngineV2HighlightScriptService = {
  outcomeForCue: cueOutcome,
  selectTerminalCues: terminalCues,
  isKeyMomentCue,

  selectScript: (cue: MatchEngineV2VisualCue): MatchEngineV2HighlightScript | null => {
    const outcome = cueOutcome(cue);
    if (!outcome) return null;
    const pool = MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS[outcome];
    // A GOAL/SAVE/MISS shot born from an actual corner or free kick only ever
    // picks among the scripts authored specifically for that set piece —
    // never a generic open-play scene — falling back to the untagged scripts
    // otherwise (including for outcomes that have no tagged scripts at all).
    const setPieceCategory: 'CORNER' | 'FREE_KICK' | undefined =
      cue.setPieceKind === 'CORNER' ? 'CORNER' :
      cue.setPieceKind === 'FREE_KICK_WIDE' || cue.setPieceKind === 'FREE_KICK_DIRECT' ? 'FREE_KICK' :
      undefined;
    const matchingSetPiece = setPieceCategory ? pool.filter(script => script.requiredSetPieceKind === setPieceCategory) : [];
    const candidates = matchingSetPiece.length > 0 ? matchingSetPiece : pool.filter(script => !script.requiredSetPieceKind);
    if (candidates.length === 0) return null;
    return candidates[stableHash(`${cue.sourceEventId}:${cue.sequenceId ?? ''}:${outcome}`) % candidates.length];
  },

  materialize: (
    terminal: MatchEngineV2VisualCue,
    snapshot: MatchEngineV2Snapshot,
  ): MatchEngineV2VisualCue[] => {
    const script = MatchEngineV2HighlightScriptService.selectScript(terminal);
    const outcome = cueOutcome(terminal);
    if (!script || !outcome) return [];
    const attackingSide: MatchEngineV2Side = outcome === 'FOUL'
      ? terminal.side === 'HOME' ? 'AWAY' : 'HOME'
      : terminal.side ?? 'HOME';
    const activePlayers = Object.values(snapshot.spatial.players).filter(player => player.isOnPitch && player.side === attackingSide);
    const defendingSide: MatchEngineV2Side = attackingSide === 'HOME' ? 'AWAY' : 'HOME';
    const defendingActivePlayers = Object.values(snapshot.spatial.players).filter(player => player.isOnPitch && player.side === defendingSide);
    const defendingGoalkeeper = defendingActivePlayers.find(player => player.role === 'GK');
    const byRole = {
      FORWARD: activePlayers.filter(player => player.role === 'FWD'),
      MIDFIELDER: activePlayers.filter(player => player.role === 'MID'),
      DEFENDER: activePlayers.filter(player => player.role === 'DEF'),
      WINGER: activePlayers.filter(player => player.role === 'MID' || player.role === 'FWD')
        .sort((left, right) => Math.abs(right.anchor.x - 34) - Math.abs(left.anchor.x - 34)),
    };
    // Only used to resolve named supportingRuns on the defending side — the
    // authoritative buildup never routes the ball through an opponent.
    const defendingByRole = {
      FORWARD: defendingActivePlayers.filter(player => player.role === 'FWD'),
      MIDFIELDER: defendingActivePlayers.filter(player => player.role === 'MID'),
      DEFENDER: defendingActivePlayers.filter(player => player.role === 'DEF'),
      WINGER: defendingActivePlayers.filter(player => player.role === 'MID' || player.role === 'FWD')
        .sort((left, right) => Math.abs(right.anchor.x - 34) - Math.abs(left.anchor.x - 34)),
    };
    const recordedAttackerId = outcome === 'FOUL' ? terminal.secondaryPlayerId : terminal.actorId;
    const scorer = recordedAttackerId && snapshot.spatial.players[recordedAttackerId]?.side === attackingSide
      ? recordedAttackerId
      : byRole.FORWARD[0]?.playerId ?? byRole.MIDFIELDER[0]?.playerId;
    const actorFor = (
      slot: MatchEngineV2HighlightActor,
      index: number,
      avoidId?: string,
    ): string | undefined => {
      if (slot === 'SCORER') return scorer;
      const pool = byRole[slot];
      return pool.find((player, poolIndex) => poolIndex >= index % Math.max(1, pool.length) && player.playerId !== avoidId)?.playerId
        ?? pool.find(player => player.playerId !== avoidId)?.playerId
        ?? scorer;
    };
    const resolveRunPlayer = (run: MatchEngineV2HighlightSupportingRun): string | undefined => {
      if (run.role === 'SCORER') return scorer;
      const rawPool = run.side === 'ATTACKING' ? byRole[run.role] : defendingByRole[run.role];
      // The real scorer can naturally belong to any role pool (e.g. a
      // "forward" role slot). Excluding them here stops a same-side decoy
      // run from ever resolving to the same player as the scorer.
      const pool = run.side === 'ATTACKING' ? rawPool.filter(player => player.playerId !== scorer) : rawPool;
      return pool[run.roleIndex]?.playerId ?? pool[0]?.playerId;
    };
    const away = attackingSide === 'AWAY';
    const sequenceId = `highlight_${terminal.id}_${script.id}`;

    let currentCarrierId: string | undefined;
    return script.steps.map((scriptStep, index) => {
      const last = index === script.steps.length - 1;
      const receivesLooseBall = scriptStep.kind === 'REBOUND' || scriptStep.kind === 'TACKLE';
      const actorId = last && scorer
        ? scorer
        : receivesLooseBall || !currentCarrierId
          ? actorFor(scriptStep.actor, scriptStep.actorRoleIndex ?? index)
          : currentCarrierId;
      const nextStep = script.steps[index + 1];
      const actionReceiverId = scriptStep.receiver
        ? nextStep?.actor === 'SCORER' && scorer && scorer !== actorId
          ? scorer
          : actorFor(scriptStep.receiver, scriptStep.receiverRoleIndex ?? (index + 1), actorId)
        : undefined;
      const secondaryPlayerId = last && outcome === 'SAVE'
        ? defendingGoalkeeper?.playerId
        : actionReceiverId;
      if (scriptStep.kind === 'PASS' || scriptStep.kind === 'CROSS') {
        currentCarrierId = actionReceiverId ?? actorId;
      } else if (scriptStep.kind !== 'BLOCK') {
        currentCarrierId = actorId;
      }
      return {
        id: `${sequenceId}_${index + 1}`,
        sourceEventId: last ? terminal.sourceEventId : `${terminal.sourceEventId}_script_${index + 1}`,
        sequenceId,
        sourceEventType: last ? terminal.sourceEventType : eventTypeForStep(scriptStep.kind),
        // Set-piece identity must survive materialisation. Without it a corner
        // or free-kick highlight was treated like open play, so defenders did
        // not form a wall/mark the box and player markers collapsed together.
        setPieceKind: terminal.setPieceKind,
        kind: last ? terminal.kind : cueKindForStep(scriptStep.kind),
        atSecond: terminal.atSecond,
        side: attackingSide,
        actorId,
        secondaryPlayerId,
        start: mirroredPoint(scriptStep.start, away),
        end: mirroredPoint(last ? terminalEnd(outcome, scriptStep, terminal.id) : scriptStep.end, away),
        durationMs: scriptStep.durationMs,
        highlightScriptId: script.id,
        highlightScriptTitle: script.title,
        highlightSceneIndex: index + 1,
        highlightSceneCount: script.steps.length,
        scriptedHighlight: true,
        attackingGroupBehavior: scriptStep.attackingGroupBehavior,
        defendingGroupBehavior: scriptStep.defendingGroupBehavior,
        commentaryTemplate: scriptStep.commentaryTemplate,
        supportingRuns: (scriptStep.supportingRuns ?? [])
          .map(run => {
            const playerId = resolveRunPlayer(run);
            return playerId
              ? { playerId, start: mirroredPoint(run.start, away), end: mirroredPoint(run.end, away) }
              : undefined;
          })
          .filter((run): run is { playerId: string; start: MatchEngineV2Point; end: MatchEngineV2Point } => Boolean(run)),
      };
    });
  },
};
