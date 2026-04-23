import { PreMatchContext, StudioLine, CommentaryCategory, Referee } from '../types';
import { PREMATCH_COMMENTARY_DB, CommentaryTemplate } from '../data/prematch_commentary_pl';

const HOSTS = ['Mateusz Borek', 'Tomasz Smokowski', 'Tomasz Twarowski'];
const GUESTS = [
  'Andrzej Juskowiak',
  'Tomasz Hajto',
  'Andrzej Strejlau',
  'Jerzy Brzeczek',
  'Witt Zelasko',
  'Artur Wichniarek',
  'Jerzy Engel'
];

const getTableGapBand = (tableGap: number): 'CLOSE' | 'WIDE' | 'NONE' => {
  if (tableGap <= 3) return 'CLOSE';
  if (tableGap >= 10) return 'WIDE';
  return 'NONE';
};

const matchesTemplate = (context: PreMatchContext, template: CommentaryTemplate): boolean => {
  const { conditions } = template;
  const tableGapBand = getTableGapBand(context.tableGap);

  if (conditions.competitionType !== undefined && conditions.competitionType !== context.competitionType) return false;
  if (conditions.importanceTier !== undefined && context.importanceTier < conditions.importanceTier) return false;
  if (conditions.tableGap !== undefined && conditions.tableGap !== tableGapBand) return false;
  if (conditions.seasonPhase !== undefined && conditions.seasonPhase !== context.seasonPhase) return false;
  if (conditions.underdog !== undefined && conditions.underdog !== context.underdogFlag) return false;
  if (conditions.rivalryTier !== undefined) {
    if (conditions.rivalryTier === 'RIVALRY') {
      if (!context.rivalryTier || context.rivalryTier === 'NONE') return false;
    } else if (conditions.rivalryTier !== context.rivalryTier) {
      return false;
    }
  }

  return true;
};

const templateSpecificity = (template: CommentaryTemplate): number => {
  const { conditions } = template;
  let score = 0;

  if (conditions.competitionType !== undefined) score += 2;
  if (conditions.importanceTier !== undefined) score += 2;
  if (conditions.tableGap !== undefined) score += 1;
  if (conditions.seasonPhase !== undefined) score += 1;
  if (conditions.underdog !== undefined) score += 1;
  if (conditions.weather !== undefined) score += 1;
  if (conditions.rivalryTier !== undefined) score += conditions.rivalryTier === 'RIVALRY' ? 3 : 4;

  return score;
};

const buildClosingLine = (context: PreMatchContext): string => {
  if (context.rivalryTier === 'CLASSIC') {
    const label = context.rivalryLabel ?? 'wielki klasyk';
    return `Dziekuje panowie za kapitalne analizy. Wszystko wskazuje na to, ze przed nami ${label.toLowerCase()}, czyli mecz, w ktorym reputacja i duma waza niemal tyle samo co punkty. Za chwile oddajemy glos komentatorom, bo takie spotkania po prostu trzeba przezyc od pierwszego gwizdka.`;
  }

  if (context.rivalryTier === 'DERBY') {
    const label = context.rivalryLabel ?? 'derby';
    return `Dziekuje panowie za trafne spostrzezenia. Wiemy jedno: ${label.toLowerCase()} rzadza sie swoimi prawami, a dzis na trybunach i na boisku nie bedzie miejsca na polsrodki. Konczymy nasze studio i zapraszamy na mecz, w ktorym emocje czesto sa wazniejsze niz jakiekolwiek kalkulacje.`;
  }

  if (context.rivalryTier === 'RIVAL') {
    return 'Dziekuje panowie za te uwagi. Czuc, ze to nie jest zwyczajny mecz ligowy, bo historia i wzajemna niechec obu klubow tylko podkrecaja temperature tego widowiska. Oddajemy glos komentatorom i czekamy na wielkie emocje od pierwszej minuty.';
  }

  return 'Dziekuje panowie za te niezwykle trafne spostrzezenia. Jak widzimy, fani juz nie moga sie doczekac, a atmosfera na stadionie jest po prostu elektryzujaca. Czas konczyc nasze studio i oddac glos komentatorom na stanowiskach. Zapraszamy na wielkie emocje!';
};

export const CommentarySelectionEngine = {
  selectLines: (context: PreMatchContext, homeName: string, awayName: string, ref: Referee): StudioLine[] => {
    const transcript: StudioLine[] = [];

    const host = HOSTS[Math.floor(Math.random() * HOSTS.length)];
    const guest1 = GUESTS[Math.floor(Math.random() * GUESTS.length)];
    let guest2 = GUESTS[Math.floor(Math.random() * GUESTS.length)];
    while (guest2 === guest1) {
      guest2 = GUESTS[Math.floor(Math.random() * GUESTS.length)];
    }

    const getLine = (_speaker: string, categories: CommentaryCategory[]): string => {
      const pool = PREMATCH_COMMENTARY_DB.filter(template =>
        categories.includes(template.category) && matchesTemplate(context, template)
      );
      const bestScore = pool.reduce((max, template) => Math.max(max, templateSpecificity(template)), 0);
      const bestPool = pool.filter(template => templateSpecificity(template) === bestScore);
      const pick = bestPool.length > 0
        ? bestPool[Math.floor(Math.random() * bestPool.length)]
        : PREMATCH_COMMENTARY_DB[0];

      return pick.text
        .replace(/{HOME}/g, homeName)
        .replace(/{AWAY}/g, awayName)
        .replace(/{REF_NAME}/g, `${ref.firstName} ${ref.lastName}`);
    };

    transcript.push({
      speaker: host,
      category: CommentaryCategory.INTRO,
      text: getLine(host, [CommentaryCategory.INTRO])
    });

    transcript.push({
      speaker: guest1,
      category: CommentaryCategory.TACTICS,
      text: getLine(guest1, [CommentaryCategory.TACTICS, CommentaryCategory.FORM])
    });

    transcript.push({
      speaker: guest2,
      category: CommentaryCategory.KEY_PLAYERS,
      text: getLine(guest2, [CommentaryCategory.KEY_PLAYERS, CommentaryCategory.WEATHER, CommentaryCategory.REFEREE])
    });

    transcript.push({
      speaker: host,
      category: CommentaryCategory.PREDICTION,
      text: buildClosingLine(context)
    });

    return transcript;
  }
};
