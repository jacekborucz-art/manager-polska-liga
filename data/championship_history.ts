// Historia zwycięzców konkurencji - SERWIS

export interface ChampionshipEntry {
  season: string;
  competition: ChampionshipCompetition;
  winner: string;
  runnerUp?: string;
  thirdPlace?: string;
  fourthPlace?: string;
  year: number;
}

export type ChampionshipCompetition =
  | 'EKSTRAKLASA'
  | 'PUCHAR_POLSKI'
  | 'SUPERPUCHAR_POLSKI'
  | 'SUPERPUCHAR_EUROPY'
  | 'LIGA_MISTRZOW'
  | 'LIGA_EUROPY'
  | 'LIGA_KONFERENCJI'
  | 'WORLD_CUP'
  | 'EURO_CHAMPIONSHIP';

// Przechowywanie w localStorage
const STORAGE_KEY = 'fm_championship_history';

type SeasonResult = [season: string, winner: string, runnerUp?: string];
type TournamentResult = [year: number, winner: string, runnerUp: string, thirdPlace?: string, fourthPlace?: string];

const buildSeasonHistory = (
  competition: ChampionshipCompetition,
  results: SeasonResult[],
): ChampionshipEntry[] => results.map(([season, winner, runnerUp]) => ({
  season,
  competition,
  winner,
  runnerUp,
  year: Number(season.split('/')[1]),
}));

const buildTournamentHistory = (
  competition: 'WORLD_CUP' | 'EURO_CHAMPIONSHIP',
  results: TournamentResult[],
): ChampionshipEntry[] => results.map(([year, winner, runnerUp, thirdPlace, fourthPlace]) => ({
  season: String(year),
  competition,
  winner,
  runnerUp,
  thirdPlace,
  fourthPlace,
  year,
}));

const HISTORICAL_CHAMPIONSHIP_ARCHIVE: ChampionshipEntry[] = [
  ...buildSeasonHistory('EKSTRAKLASA', [
    ['1999/2000', 'Polonia Warszawa', 'Wisła Kraków'],
    ['2000/2001', 'Wisła Kraków', 'Pogoń Szczecin'],
    ['2001/2002', 'Legia Warszawa', 'Wisła Kraków'],
    ['2002/2003', 'Wisła Kraków', 'Dyskobolia Grodzisk Wielkopolski'],
    ['2003/2004', 'Wisła Kraków', 'Legia Warszawa'],
    ['2004/2005', 'Wisła Kraków', 'Dyskobolia Grodzisk Wielkopolski'],
    ['2005/2006', 'Legia Warszawa', 'Wisła Kraków'],
    ['2006/2007', 'Zagłębie Lubin', 'GKS Bełchatów'],
    ['2007/2008', 'Wisła Kraków', 'Legia Warszawa'],
    ['2008/2009', 'Wisła Kraków', 'Legia Warszawa'],
    ['2009/2010', 'Lech Poznań', 'Wisła Kraków'],
    ['2010/2011', 'Wisła Kraków', 'Śląsk Wrocław'],
    ['2011/2012', 'Śląsk Wrocław', 'Ruch Chorzów'],
    ['2012/2013', 'Legia Warszawa', 'Lech Poznań'],
    ['2013/2014', 'Legia Warszawa', 'Lech Poznań'],
    ['2014/2015', 'Lech Poznań', 'Legia Warszawa'],
    ['2015/2016', 'Legia Warszawa', 'Piast Gliwice'],
    ['2016/2017', 'Legia Warszawa', 'Jagiellonia Białystok'],
    ['2017/2018', 'Legia Warszawa', 'Jagiellonia Białystok'],
    ['2018/2019', 'Piast Gliwice', 'Legia Warszawa'],
    ['2019/2020', 'Legia Warszawa', 'Lech Poznań'],
    ['2020/2021', 'Legia Warszawa', 'Raków Częstochowa'],
    ['2021/2022', 'Lech Poznań', 'Raków Częstochowa'],
    ['2022/2023', 'Raków Częstochowa', 'Legia Warszawa'],
    ['2023/2024', 'Jagiellonia Białystok', 'Śląsk Wrocław'],
    ['2024/2025', 'Lech Poznań', 'Raków Częstochowa'],
    ['2025/2026', 'Lech Poznań', 'Górnik Zabrze'],
  ]),
  ...buildSeasonHistory('PUCHAR_POLSKI', [
    ['1999/2000', 'Amica Wronki', 'Wisła Kraków'],
    ['2000/2001', 'Polonia Warszawa', 'Górnik Zabrze'],
    ['2001/2002', 'Wisła Kraków', 'Amica Wronki'],
    ['2002/2003', 'Wisła Kraków', 'Wisła Płock'],
    ['2003/2004', 'Lech Poznań', 'Legia Warszawa'],
    ['2004/2005', 'Dyskobolia Grodzisk Wielkopolski', 'Zagłębie Lubin'],
    ['2005/2006', 'Wisła Płock', 'Zagłębie Lubin'],
    ['2006/2007', 'Dyskobolia Grodzisk Wielkopolski', 'Korona Kielce'],
    ['2007/2008', 'Legia Warszawa', 'Wisła Kraków'],
    ['2008/2009', 'Lech Poznań', 'Ruch Chorzów'],
    ['2009/2010', 'Jagiellonia Białystok', 'Pogoń Szczecin'],
    ['2010/2011', 'Legia Warszawa', 'Lech Poznań'],
    ['2011/2012', 'Legia Warszawa', 'Ruch Chorzów'],
    ['2012/2013', 'Legia Warszawa', 'Śląsk Wrocław'],
    ['2013/2014', 'Zawisza Bydgoszcz', 'Zagłębie Lubin'],
    ['2014/2015', 'Legia Warszawa', 'Lech Poznań'],
    ['2015/2016', 'Legia Warszawa', 'Lech Poznań'],
    ['2016/2017', 'Arka Gdynia', 'Lech Poznań'],
    ['2017/2018', 'Legia Warszawa', 'Arka Gdynia'],
    ['2018/2019', 'Lechia Gdańsk', 'Jagiellonia Białystok'],
    ['2019/2020', 'Cracovia', 'Lechia Gdańsk'],
    ['2020/2021', 'Raków Częstochowa', 'Arka Gdynia'],
    ['2021/2022', 'Raków Częstochowa', 'Lech Poznań'],
    ['2022/2023', 'Legia Warszawa', 'Raków Częstochowa'],
    ['2023/2024', 'Wisła Kraków', 'Pogoń Szczecin'],
    ['2024/2025', 'Legia Warszawa', 'Pogoń Szczecin'],
    ['2025/2026', 'Górnik Zabrze', 'Raków Częstochowa'],
  ]),
  ...buildSeasonHistory('SUPERPUCHAR_POLSKI', [
    ['2000/2001', 'Polonia Warszawa', 'Amica Wronki'],
    ['2001/2002', 'Wisła Kraków', 'Polonia Warszawa'],
    ['2004/2005', 'Lech Poznań', 'Wisła Kraków'],
    ['2006/2007', 'Wisła Płock', 'Legia Warszawa'],
    ['2007/2008', 'Zagłębie Lubin', 'GKS Bełchatów'],
    ['2008/2009', 'Legia Warszawa', 'Wisła Kraków'],
    ['2009/2010', 'Lech Poznań', 'Wisła Kraków'],
    ['2010/2011', 'Jagiellonia Białystok', 'Lech Poznań'],
    ['2012/2013', 'Śląsk Wrocław', 'Legia Warszawa'],
    ['2014/2015', 'Zawisza Bydgoszcz', 'Legia Warszawa'],
    ['2015/2016', 'Lech Poznań', 'Legia Warszawa'],
    ['2016/2017', 'Lech Poznań', 'Legia Warszawa'],
    ['2017/2018', 'Arka Gdynia', 'Legia Warszawa'],
    ['2018/2019', 'Arka Gdynia', 'Legia Warszawa'],
    ['2019/2020', 'Lechia Gdańsk', 'Piast Gliwice'],
    ['2020/2021', 'Cracovia', 'Legia Warszawa'],
    ['2021/2022', 'Raków Częstochowa', 'Legia Warszawa'],
    ['2022/2023', 'Raków Częstochowa', 'Lech Poznań'],
    ['2023/2024', 'Legia Warszawa', 'Raków Częstochowa'],
    ['2024/2025', 'Jagiellonia Białystok', 'Wisła Kraków'],
    ['2025/2026', 'Legia Warszawa', 'Lech Poznań'],
  ]),
  ...buildSeasonHistory('LIGA_MISTRZOW', [
    ['1999/2000', 'Real Madryt', 'Valencia'],
    ['2000/2001', 'Bayern Monachium', 'Valencia'],
    ['2001/2002', 'Real Madryt', 'Bayer Leverkusen'],
    ['2002/2003', 'AC Milan', 'Juventus'],
    ['2003/2004', 'FC Porto', 'AS Monaco'],
    ['2004/2005', 'Liverpool', 'AC Milan'],
    ['2005/2006', 'FC Barcelona', 'Arsenal'],
    ['2006/2007', 'AC Milan', 'Liverpool'],
    ['2007/2008', 'Manchester United', 'Chelsea'],
    ['2008/2009', 'FC Barcelona', 'Manchester United'],
    ['2009/2010', 'Inter Mediolan', 'Bayern Monachium'],
    ['2010/2011', 'FC Barcelona', 'Manchester United'],
    ['2011/2012', 'Chelsea', 'Bayern Monachium'],
    ['2012/2013', 'Bayern Monachium', 'Borussia Dortmund'],
    ['2013/2014', 'Real Madryt', 'Atlético Madryt'],
    ['2014/2015', 'FC Barcelona', 'Juventus'],
    ['2015/2016', 'Real Madryt', 'Atlético Madryt'],
    ['2016/2017', 'Real Madryt', 'Juventus'],
    ['2017/2018', 'Real Madryt', 'Liverpool'],
    ['2018/2019', 'Liverpool', 'Tottenham Hotspur'],
    ['2019/2020', 'Bayern Monachium', 'Paris Saint-Germain'],
    ['2020/2021', 'Chelsea', 'Manchester City'],
    ['2021/2022', 'Real Madryt', 'Liverpool'],
    ['2022/2023', 'Manchester City', 'Inter Mediolan'],
    ['2023/2024', 'Real Madryt', 'Borussia Dortmund'],
    ['2024/2025', 'Paris Saint-Germain', 'Inter Mediolan'],
    ['2025/2026', 'Paris Saint-Germain', 'Arsenal'],
  ]),
  ...buildSeasonHistory('LIGA_EUROPY', [
    ['1999/2000', 'Galatasaray', 'Arsenal'],
    ['2000/2001', 'Liverpool', 'Deportivo Alavés'],
    ['2001/2002', 'Feyenoord', 'Borussia Dortmund'],
    ['2002/2003', 'FC Porto', 'Celtic'],
    ['2003/2004', 'Valencia', 'Olympique Marsylia'],
    ['2004/2005', 'CSKA Moskwa', 'Sporting CP'],
    ['2005/2006', 'Sevilla', 'Middlesbrough'],
    ['2006/2007', 'Sevilla', 'Espanyol'],
    ['2007/2008', 'Zenit Petersburg', 'Rangers'],
    ['2008/2009', 'Szachtar Donieck', 'Werder Brema'],
    ['2009/2010', 'Atlético Madryt', 'Fulham'],
    ['2010/2011', 'FC Porto', 'SC Braga'],
    ['2011/2012', 'Atlético Madryt', 'Athletic Bilbao'],
    ['2012/2013', 'Chelsea', 'Benfica'],
    ['2013/2014', 'Sevilla', 'Benfica'],
    ['2014/2015', 'Sevilla', 'Dnipro'],
    ['2015/2016', 'Sevilla', 'Liverpool'],
    ['2016/2017', 'Manchester United', 'Ajax'],
    ['2017/2018', 'Atlético Madryt', 'Olympique Marsylia'],
    ['2018/2019', 'Chelsea', 'Arsenal'],
    ['2019/2020', 'Sevilla', 'Inter Mediolan'],
    ['2020/2021', 'Villarreal', 'Manchester United'],
    ['2021/2022', 'Eintracht Frankfurt', 'Rangers'],
    ['2022/2023', 'Sevilla', 'AS Roma'],
    ['2023/2024', 'Atalanta', 'Bayer Leverkusen'],
    ['2024/2025', 'Tottenham Hotspur', 'Manchester United'],
    ['2025/2026', 'Aston Villa', 'SC Freiburg'],
  ]),
  ...buildSeasonHistory('LIGA_KONFERENCJI', [
    ['2021/2022', 'AS Roma', 'Feyenoord'],
    ['2022/2023', 'West Ham United', 'Fiorentina'],
    ['2023/2024', 'Olympiakos', 'Fiorentina'],
    ['2024/2025', 'Chelsea', 'Real Betis'],
    ['2025/2026', 'Crystal Palace', 'Rayo Vallecano'],
  ]),
  ...buildSeasonHistory('SUPERPUCHAR_EUROPY', [
    ['2000/2001', 'Galatasaray', 'Real Madryt'],
    ['2001/2002', 'Liverpool', 'Bayern Monachium'],
    ['2002/2003', 'Real Madryt', 'Feyenoord'],
    ['2003/2004', 'AC Milan', 'FC Porto'],
    ['2004/2005', 'Valencia', 'FC Porto'],
    ['2005/2006', 'Liverpool', 'CSKA Moskwa'],
    ['2006/2007', 'Sevilla', 'FC Barcelona'],
    ['2007/2008', 'AC Milan', 'Sevilla'],
    ['2008/2009', 'Zenit Petersburg', 'Manchester United'],
    ['2009/2010', 'FC Barcelona', 'Szachtar Donieck'],
    ['2010/2011', 'Atlético Madryt', 'Inter Mediolan'],
    ['2011/2012', 'FC Barcelona', 'FC Porto'],
    ['2012/2013', 'Atlético Madryt', 'Chelsea'],
    ['2013/2014', 'Bayern Monachium', 'Chelsea'],
    ['2014/2015', 'Real Madryt', 'Sevilla'],
    ['2015/2016', 'FC Barcelona', 'Sevilla'],
    ['2016/2017', 'Real Madryt', 'Sevilla'],
    ['2017/2018', 'Real Madryt', 'Manchester United'],
    ['2018/2019', 'Atlético Madryt', 'Real Madryt'],
    ['2019/2020', 'Liverpool', 'Chelsea'],
    ['2020/2021', 'Bayern Monachium', 'Sevilla'],
    ['2021/2022', 'Chelsea', 'Villarreal'],
    ['2022/2023', 'Real Madryt', 'Eintracht Frankfurt'],
    ['2023/2024', 'Manchester City', 'Sevilla'],
    ['2024/2025', 'Real Madryt', 'Atalanta'],
    ['2025/2026', 'Paris Saint-Germain', 'Tottenham Hotspur'],
  ]),
  ...buildTournamentHistory('WORLD_CUP', [
    [2002, 'Brazylia', 'Niemcy', 'Turcja', 'Korea Południowa'],
    [2006, 'Włochy', 'Francja', 'Niemcy', 'Portugalia'],
    [2010, 'Hiszpania', 'Holandia', 'Niemcy', 'Urugwaj'],
    [2014, 'Niemcy', 'Argentyna', 'Holandia', 'Brazylia'],
    [2018, 'Francja', 'Chorwacja', 'Belgia', 'Anglia'],
    [2022, 'Argentyna', 'Francja', 'Chorwacja', 'Maroko'],
    [2026, 'Hiszpania', 'Argentyna', 'Anglia', 'Francja'],
  ]),
  ...buildTournamentHistory('EURO_CHAMPIONSHIP', [
    [2000, 'Francja', 'Włochy'],
    [2004, 'Grecja', 'Portugalia'],
    [2008, 'Hiszpania', 'Niemcy'],
    [2012, 'Hiszpania', 'Włochy'],
    [2016, 'Portugalia', 'Francja'],
    [2020, 'Włochy', 'Anglia'],
    [2024, 'Hiszpania', 'Anglia'],
  ]),
];

export class ChampionshipHistoryService {
  private static getHistory(): ChampionshipEntry[] {
    try {
      const stored = localStorage?.getItem(STORAGE_KEY);
      console.log('📂 ChampionshipHistoryService.getHistory() - localStorage data:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✓ Parsed from localStorage:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load championship history:', e);
    }
    
    // Dane domyślne
    const defaultData: ChampionshipEntry[] = [
      {
        season: '2023/2024',
        competition: 'EKSTRAKLASA',
        winner: 'Jagiellonia Białystok',
        runnerUp: 'Śląsk Wrocław',
        year: 2024
      },
      {
        season: '2024/2025',
        competition: 'EKSTRAKLASA',
        winner: 'Lech Poznań',
        runnerUp: 'Raków Częstochowa',
        year: 2025
      },
      {
        season: '2023/2024',
        competition: 'PUCHAR_POLSKI',
        winner: 'Wisła Kraków',
        runnerUp: 'Pogoń Szczecin',
        year: 2024
      },
      {
        season: '2024/2025',
        competition: 'PUCHAR_POLSKI',
        winner: 'Legia Warszawa',
        runnerUp: 'Pogoń Szczecin',
        year: 2025
      },
      {
        season: '2023/2024',
        competition: 'LIGA_MISTRZOW',
        winner: 'Real Madryt',
        runnerUp: 'Borussia Dortmund',
        year: 2024
      },
      {
        season: '2024/2025',
        competition: 'LIGA_MISTRZOW',
        winner: 'Paris Saint-Germain',
        runnerUp: 'Inter Mediolan',
        year: 2025
      },
      // Superpuchar domyślny (będzie uzupełniony pełnym archiwum przy starcie kariery)
      {
        season: '2023/2024',
        competition: 'SUPERPUCHAR_POLSKI',
        winner: 'Legia Warszawa',
        runnerUp: 'Raków Częstochowa',
        year: 2024
      }
    ];

    // Wszystkie dane - ze localStorage będą automatycznie dodane gdy się zapisze nowy zwycięzca
    return defaultData;
  }

  private static saveHistory(history: ChampionshipEntry[]): void {
    try {
      const json = JSON.stringify(history);
      console.log('💾 saveHistory - saving to localStorage:', json);
      localStorage?.setItem(STORAGE_KEY, json);
      console.log('   ✓ Saved successfully');
    } catch (e) {
      console.error('Failed to save championship history:', e);
    }
  }

  static getAll(): ChampionshipEntry[] {
    return this.getHistory();
  }

  static getByCompetition(competition: ChampionshipCompetition): ChampionshipEntry[] {
    return this.getHistory()
      .filter(c => c.competition === competition)
      .sort((a, b) => b.year - a.year);
  }

  static addChampion(entry: ChampionshipEntry): void {
    console.log('🔹 addChampion called:', entry);
    const history = this.getHistory();
    console.log('   Current history before add:', history);
    
    // Sprawdź czy już istnieje wpis na ten sezon i konkurencję
    const existingIndex = history.findIndex(
      h => h.season === entry.season && h.competition === entry.competition
    );
    
    if (existingIndex >= 0) {
      console.log('   Updating existing entry at index', existingIndex);
      history[existingIndex] = entry;
    } else {
      console.log('   Adding new entry');
      history.push(entry);
    }
    
    console.log('   History after add:', history);
    this.saveHistory(history.sort((a, b) => b.year - a.year));
    console.log('   ✓ Saved');
  }

  static addChampionIfMissing(entry: ChampionshipEntry): void {
    const alreadyExists = this.getHistory().some(
      historyEntry => historyEntry.season === entry.season && historyEntry.competition === entry.competition
    );
    if (!alreadyExists) this.addChampion(entry);
  }

  static addEkstraklasaChampion(season: string, winner: string, runnerUp: string, year: number): void {
    this.addChampion({
      season,
      competition: 'EKSTRAKLASA',
      winner,
      runnerUp,
      year
    });
  }

  static addCupChampion(season: string, competition: 'PUCHAR_POLSKI' | 'SUPERPUCHAR_POLSKI', winner: string, year: number): void {
    console.log('🔸 addCupChampion called:', { season, competition, winner, year });
    this.addChampion({
      season,
      competition,
      winner,
      year
    });
  }

  static addCLChampion(season: string, winner: string, year: number, runnerUp?: string): void {
    this.addChampion({
      season,
      competition: 'LIGA_MISTRZOW',
      winner,
      runnerUp,
      year
    });
  }

  static addEuropeanClubChampion(
    season: string,
    competition: 'LIGA_MISTRZOW' | 'LIGA_EUROPY' | 'LIGA_KONFERENCJI',
    winner: string,
    year: number,
    runnerUp?: string,
  ): void {
    this.addChampion({
      season,
      competition,
      winner,
      runnerUp,
      year,
    });
  }

  static seedCareerStartDomesticHistory(startYear: number): void {
    const domesticCompetitions = new Set<ChampionshipCompetition>([
      'EKSTRAKLASA', 'PUCHAR_POLSKI', 'SUPERPUCHAR_POLSKI'
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE
      .filter(entry => entry.year <= startYear && domesticCompetitions.has(entry.competition))
      .forEach(entry => this.addChampionIfMissing(entry));
  }

  static seedCareerStartEuropeanClubHistory(startYear: number): void {
    const europeanCompetitions = new Set<ChampionshipCompetition>([
      'LIGA_MISTRZOW', 'LIGA_EUROPY', 'LIGA_KONFERENCJI', 'SUPERPUCHAR_EUROPY'
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE
      .filter(entry => entry.year <= startYear && europeanCompetitions.has(entry.competition))
      .forEach(entry => this.addChampionIfMissing(entry));
  }

  static seedCareerStartInternationalHistory(startYear: number): void {
    const internationalCompetitions = new Set<ChampionshipCompetition>([
      'WORLD_CUP', 'EURO_CHAMPIONSHIP'
    ]);
    HISTORICAL_CHAMPIONSHIP_ARCHIVE
      .filter(entry => entry.year <= startYear && internationalCompetitions.has(entry.competition))
      .forEach(entry => this.addChampionIfMissing(entry));
  }

  static addWorldCupResult(year: number, winner: string, runnerUp?: string, thirdPlace?: string, fourthPlace?: string): void {
    this.addChampion({
      season: String(year),
      competition: 'WORLD_CUP',
      winner,
      runnerUp,
      thirdPlace,
      fourthPlace,
      year
    });
  }

  static addEuroChampion(year: number, winner: string, runnerUp?: string): void {
    this.addChampion({
      season: String(year),
      competition: 'EURO_CHAMPIONSHIP',
      winner,
      runnerUp,
      year
    });
  }

  static restore(entries: ChampionshipEntry[]): void {
    try {
      localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to restore championship history:', e);
    }
  }

  static clear(): void {
    try {
      localStorage?.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear championship history:', e);
    }
  }
}

// Backward compatibility
export const championshipHistory = ChampionshipHistoryService.getAll();
export const getChampionsByCompetition = (competition: ChampionshipCompetition) => {
  return ChampionshipHistoryService.getByCompetition(competition);
};
export const getAllChampions = () => {
  return ChampionshipHistoryService.getAll();
};
