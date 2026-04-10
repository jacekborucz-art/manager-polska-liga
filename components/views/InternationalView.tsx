import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { NT_SCHEDULE_BY_YEAR } from '../../resources/NationalTeamSchedule';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import polskaBgImg from '../../Graphic/themes/polska.png';

const SUBHEADING = 'text-[10px] font-black uppercase tracking-[0.25em] text-slate-500';
const POLAND_GROUP_LABEL = 'Grupa G';

interface Tournament {
  id: string;
  label: string;
}

interface PlayedMatch {
  round: number;
  dateLabel: string;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
}

interface ScheduledMatch {
  round: number;
  dateLabel: string;
  home: string;
  away: string;
}

interface GroupTeam {
  name: string;
  M: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  pts: number;
}

const TOURNAMENTS: Tournament[] = [
  { id: 'wcq2026', label: 'Kwalifikacje do MŚ 2026' },
];

const WCQ_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '21 MAR', home: 'Malta', away: 'Finlandia', homeGoals: 0, awayGoals: 1 },
  { round: 1, dateLabel: '21 MAR', home: 'Polska', away: 'Litwa', homeGoals: 1, awayGoals: 0 },
  { round: 2, dateLabel: '24 MAR', home: 'Polska', away: 'Malta', homeGoals: 2, awayGoals: 0 },
  { round: 2, dateLabel: '24 MAR', home: 'Litwa', away: 'Finlandia', homeGoals: 2, awayGoals: 2 },
  { round: 3, dateLabel: '7 CZE', home: 'Finlandia', away: 'Holandia', homeGoals: 0, awayGoals: 2 },
  { round: 3, dateLabel: '7 CZE', home: 'Malta', away: 'Litwa', homeGoals: 0, awayGoals: 0 },
  { round: 4, dateLabel: '10 CZE', home: 'Finlandia', away: 'Polska', homeGoals: 2, awayGoals: 1 },
  { round: 4, dateLabel: '10 CZE', home: 'Holandia', away: 'Malta', homeGoals: 8, awayGoals: 0 },
];

const WCQ_GROUP_A_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_A_TEAMS = ['Niemcy', 'Słowacja', 'Irlandia Północna', 'Luksemburg'];

const WCQ_GROUP_B_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_B_TEAMS = ['Szwajcaria', 'Kosowo', 'Słowenia', 'Szwecja'];

const WCQ_GROUP_C_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_C_TEAMS = ['Szkocja', 'Dania', 'Grecja', 'Białoruś'];

const WCQ_GROUP_D_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_D_TEAMS = ['Francja', 'Ukraina', 'Islandia', 'Azerbejdżan'];

const WCQ_GROUP_E_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_E_TEAMS = ['Hiszpania', 'Turcja', 'Gruzja', 'Bułgaria'];

const WCQ_GROUP_F_PLAYED: PlayedMatch[] = [
  // Wyniki kolejek 1–4 rozegranych przed startem gry — do uzupełnienia
];

const GROUP_F_TEAMS = ['Portugalia', 'Irlandia', 'Węgry', 'Armenia'];

// ─── Terminarze A–F (wszystkie kolejki przyszłe, start od września 2025) ──────

const WCQ_GROUP_A_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Luksemburg',        away: 'Irlandia Północna'  },
  { round: 1, dateLabel: '4 WRZ',  home: 'Słowacja',          away: 'Niemcy'             },
  { round: 2, dateLabel: '7 WRZ',  home: 'Luksemburg',        away: 'Słowacja'           },
  { round: 2, dateLabel: '7 WRZ',  home: 'Niemcy',            away: 'Irlandia Północna'  },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Irlandia Północna', away: 'Słowacja'           },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Niemcy',            away: 'Luksemburg'         },
  { round: 4, dateLabel: '11 PAŹ', home: 'Irlandia Północna', away: 'Niemcy'             },
  { round: 4, dateLabel: '11 PAŹ', home: 'Słowacja',          away: 'Luksemburg'         },
  { round: 5, dateLabel: '14 LIS', home: 'Luksemburg',        away: 'Niemcy'             },
  { round: 5, dateLabel: '14 LIS', home: 'Słowacja',          away: 'Irlandia Północna'  },
  { round: 6, dateLabel: '17 LIS', home: 'Irlandia Północna', away: 'Luksemburg'         },
  { round: 6, dateLabel: '17 LIS', home: 'Niemcy',            away: 'Słowacja'           },
];

const WCQ_GROUP_B_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Szwecja',    away: 'Słowenia'   },
  { round: 1, dateLabel: '4 WRZ',  home: 'Kosowo',     away: 'Szwajcaria' },
  { round: 2, dateLabel: '7 WRZ',  home: 'Szwecja',    away: 'Kosowo'     },
  { round: 2, dateLabel: '7 WRZ',  home: 'Szwajcaria', away: 'Słowenia'   },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Słowenia',   away: 'Kosowo'     },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Szwajcaria', away: 'Szwecja'    },
  { round: 4, dateLabel: '11 PAŹ', home: 'Słowenia',   away: 'Szwajcaria' },
  { round: 4, dateLabel: '11 PAŹ', home: 'Kosowo',     away: 'Szwecja'    },
  { round: 5, dateLabel: '14 LIS', home: 'Szwecja',    away: 'Szwajcaria' },
  { round: 5, dateLabel: '14 LIS', home: 'Kosowo',     away: 'Słowenia'   },
  { round: 6, dateLabel: '17 LIS', home: 'Słowenia',   away: 'Szwecja'    },
  { round: 6, dateLabel: '17 LIS', home: 'Szwajcaria', away: 'Kosowo'     },
];

const WCQ_GROUP_C_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Białoruś',  away: 'Grecja'   },
  { round: 1, dateLabel: '4 WRZ',  home: 'Dania',     away: 'Szkocja'  },
  { round: 2, dateLabel: '7 WRZ',  home: 'Białoruś',  away: 'Dania'    },
  { round: 2, dateLabel: '7 WRZ',  home: 'Szkocja',   away: 'Grecja'   },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Grecja',    away: 'Dania'    },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Szkocja',   away: 'Białoruś' },
  { round: 4, dateLabel: '11 PAŹ', home: 'Grecja',    away: 'Szkocja'  },
  { round: 4, dateLabel: '11 PAŹ', home: 'Dania',     away: 'Białoruś' },
  { round: 5, dateLabel: '14 LIS', home: 'Białoruś',  away: 'Szkocja'  },
  { round: 5, dateLabel: '14 LIS', home: 'Dania',     away: 'Grecja'   },
  { round: 6, dateLabel: '17 LIS', home: 'Grecja',    away: 'Białoruś' },
  { round: 6, dateLabel: '17 LIS', home: 'Szkocja',   away: 'Dania'    },
];

const WCQ_GROUP_D_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Azerbejdżan', away: 'Islandia'     },
  { round: 1, dateLabel: '4 WRZ',  home: 'Ukraina',     away: 'Francja'      },
  { round: 2, dateLabel: '7 WRZ',  home: 'Azerbejdżan', away: 'Ukraina'      },
  { round: 2, dateLabel: '7 WRZ',  home: 'Francja',     away: 'Islandia'     },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Islandia',    away: 'Ukraina'      },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Francja',     away: 'Azerbejdżan'  },
  { round: 4, dateLabel: '11 PAŹ', home: 'Islandia',    away: 'Francja'      },
  { round: 4, dateLabel: '11 PAŹ', home: 'Ukraina',     away: 'Azerbejdżan'  },
  { round: 5, dateLabel: '14 LIS', home: 'Azerbejdżan', away: 'Francja'      },
  { round: 5, dateLabel: '14 LIS', home: 'Ukraina',     away: 'Islandia'     },
  { round: 6, dateLabel: '17 LIS', home: 'Islandia',    away: 'Azerbejdżan'  },
  { round: 6, dateLabel: '17 LIS', home: 'Francja',     away: 'Ukraina'      },
];

const WCQ_GROUP_E_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Bułgaria',  away: 'Gruzja'    },
  { round: 1, dateLabel: '4 WRZ',  home: 'Turcja',    away: 'Hiszpania' },
  { round: 2, dateLabel: '7 WRZ',  home: 'Bułgaria',  away: 'Turcja'    },
  { round: 2, dateLabel: '7 WRZ',  home: 'Hiszpania', away: 'Gruzja'    },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Gruzja',    away: 'Turcja'    },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Hiszpania', away: 'Bułgaria'  },
  { round: 4, dateLabel: '11 PAŹ', home: 'Gruzja',    away: 'Hiszpania' },
  { round: 4, dateLabel: '11 PAŹ', home: 'Turcja',    away: 'Bułgaria'  },
  { round: 5, dateLabel: '14 LIS', home: 'Bułgaria',  away: 'Hiszpania' },
  { round: 5, dateLabel: '14 LIS', home: 'Turcja',    away: 'Gruzja'    },
  { round: 6, dateLabel: '17 LIS', home: 'Gruzja',    away: 'Bułgaria'  },
  { round: 6, dateLabel: '17 LIS', home: 'Hiszpania', away: 'Turcja'    },
];

const WCQ_GROUP_F_SCHEDULE: ScheduledMatch[] = [
  { round: 1, dateLabel: '4 WRZ',  home: 'Armenia',    away: 'Węgry'      },
  { round: 1, dateLabel: '4 WRZ',  home: 'Irlandia',   away: 'Portugalia' },
  { round: 2, dateLabel: '7 WRZ',  home: 'Armenia',    away: 'Irlandia'   },
  { round: 2, dateLabel: '7 WRZ',  home: 'Portugalia', away: 'Węgry'      },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Węgry',      away: 'Irlandia'   },
  { round: 3, dateLabel: '8 PAŹ',  home: 'Portugalia', away: 'Armenia'    },
  { round: 4, dateLabel: '11 PAŹ', home: 'Węgry',      away: 'Portugalia' },
  { round: 4, dateLabel: '11 PAŹ', home: 'Irlandia',   away: 'Armenia'    },
  { round: 5, dateLabel: '14 LIS', home: 'Armenia',    away: 'Portugalia' },
  { round: 5, dateLabel: '14 LIS', home: 'Irlandia',   away: 'Węgry'      },
  { round: 6, dateLabel: '17 LIS', home: 'Węgry',      away: 'Armenia'    },
  { round: 6, dateLabel: '17 LIS', home: 'Portugalia', away: 'Irlandia'   },
];

const WCQ_GROUP_H_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '21 MAR', home: 'Cypr',                  away: 'San Marino',            homeGoals: 2, awayGoals: 0 },
  { round: 1, dateLabel: '21 MAR', home: 'Rumunia',               away: 'Bośnia i Hercegowina',  homeGoals: 0, awayGoals: 1 },
  { round: 2, dateLabel: '24 MAR', home: 'Bośnia i Hercegowina',  away: 'Cypr',                  homeGoals: 2, awayGoals: 1 },
  { round: 2, dateLabel: '24 MAR', home: 'San Marino',            away: 'Rumunia',               homeGoals: 1, awayGoals: 5 },
  { round: 3, dateLabel: '7 CZE',  home: 'Bośnia i Hercegowina',  away: 'San Marino',            homeGoals: 1, awayGoals: 0 },
  { round: 3, dateLabel: '7 CZE',  home: 'Austria',               away: 'Rumunia',               homeGoals: 2, awayGoals: 1 },
  { round: 4, dateLabel: '10 CZE', home: 'Rumunia',               away: 'Cypr',                  homeGoals: 2, awayGoals: 0 },
  { round: 4, dateLabel: '10 CZE', home: 'San Marino',            away: 'Austria',               homeGoals: 0, awayGoals: 4 },
];

const GROUP_H_TEAMS = ['Austria', 'Bośnia i Hercegowina', 'Rumunia', 'Cypr', 'San Marino'];

const WCQ_GROUP_H_SCHEDULE: ScheduledMatch[] = [
  { round: 5, dateLabel: '4 WRZ',  home: 'San Marino',           away: 'Austria'              },
  { round: 5, dateLabel: '4 WRZ',  home: 'Cypr',                 away: 'Rumunia'              },
  { round: 6, dateLabel: '7 WRZ',  home: 'Austria',              away: 'Cypr'                 },
  { round: 6, dateLabel: '7 WRZ',  home: 'Bośnia i Hercegowina', away: 'San Marino'           },
  { round: 7, dateLabel: '8 PAŹ',  home: 'Rumunia',              away: 'Austria'              },
  { round: 7, dateLabel: '8 PAŹ',  home: 'Cypr',                 away: 'Bośnia i Hercegowina' },
  { round: 8, dateLabel: '11 PAŹ', home: 'Austria',              away: 'Bośnia i Hercegowina' },
  { round: 8, dateLabel: '11 PAŹ', home: 'San Marino',           away: 'Rumunia'              },
  { round: 9, dateLabel: '14 LIS', home: 'Bośnia i Hercegowina', away: 'Rumunia'              },
  { round: 9, dateLabel: '14 LIS', home: 'Austria',              away: 'San Marino'           },
  { round: 10, dateLabel: '17 LIS', home: 'Rumunia',             away: 'Cypr'                 },
  { round: 10, dateLabel: '17 LIS', home: 'San Marino',          away: 'Bośnia i Hercegowina' },
];

const WCQ_GROUP_I_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '22 MAR', home: 'Mołdawia', away: 'Norwegia', homeGoals: 0, awayGoals: 5 },
  { round: 1, dateLabel: '22 MAR', home: 'Izrael',    away: 'Estonia',  homeGoals: 2, awayGoals: 1 },
  { round: 2, dateLabel: '25 MAR', home: 'Izrael',    away: 'Norwegia', homeGoals: 2, awayGoals: 4 },
  { round: 2, dateLabel: '25 MAR', home: 'Mołdawia', away: 'Estonia',  homeGoals: 2, awayGoals: 3 },
  { round: 3, dateLabel: '6 CZE',  home: 'Estonia',  away: 'Izrael',   homeGoals: 1, awayGoals: 3 },
  { round: 3, dateLabel: '6 CZE',  home: 'Norwegia', away: 'Włochy',   homeGoals: 3, awayGoals: 0 },
  { round: 4, dateLabel: '9 CZE',  home: 'Estonia',  away: 'Norwegia', homeGoals: 0, awayGoals: 1 },
  { round: 4, dateLabel: '9 CZE',  home: 'Włochy',   away: 'Mołdawia', homeGoals: 2, awayGoals: 0 },
];

const GROUP_I_TEAMS = ['Norwegia', 'Włochy', 'Izrael', 'Estonia', 'Mołdawia'];

const WCQ_GROUP_I_SCHEDULE: ScheduledMatch[] = [
  { round: 5,  dateLabel: '4 WRZ',  home: 'Mołdawia', away: 'Norwegia' },
  { round: 5,  dateLabel: '4 WRZ',  home: 'Estonia',  away: 'Izrael'   },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Norwegia', away: 'Włochy'   },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Izrael',   away: 'Mołdawia' },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Włochy',   away: 'Estonia'  },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Mołdawia', away: 'Izrael'   },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Estonia',  away: 'Norwegia' },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Włochy',   away: 'Mołdawia' },
  { round: 9,  dateLabel: '14 LIS', home: 'Norwegia', away: 'Izrael'   },
  { round: 9,  dateLabel: '14 LIS', home: 'Estonia',  away: 'Mołdawia' },
  { round: 10, dateLabel: '17 LIS', home: 'Izrael',   away: 'Włochy'   },
  { round: 10, dateLabel: '17 LIS', home: 'Mołdawia', away: 'Estonia'  },
];

const WCQ_GROUP_J_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '22 MAR', home: 'Liechtenstein',       away: 'Macedonia Północna', homeGoals: 0, awayGoals: 3 },
  { round: 1, dateLabel: '22 MAR', home: 'Walia',               away: 'Kazachstan',          homeGoals: 3, awayGoals: 1 },
  { round: 2, dateLabel: '25 MAR', home: 'Liechtenstein',       away: 'Kazachstan',          homeGoals: 0, awayGoals: 2 },
  { round: 2, dateLabel: '25 MAR', home: 'Macedonia Północna', away: 'Walia',               homeGoals: 1, awayGoals: 1 },
  { round: 3, dateLabel: '6 CZE',  home: 'Macedonia Północna', away: 'Belgia',              homeGoals: 1, awayGoals: 1 },
  { round: 3, dateLabel: '6 CZE',  home: 'Walia',               away: 'Liechtenstein',       homeGoals: 3, awayGoals: 0 },
  { round: 4, dateLabel: '9 CZE',  home: 'Kazachstan',          away: 'Macedonia Północna', homeGoals: 0, awayGoals: 1 },
  { round: 4, dateLabel: '9 CZE',  home: 'Belgia',              away: 'Walia',               homeGoals: 4, awayGoals: 3 },
];

const GROUP_J_TEAMS = ['Belgia', 'Walia', 'Macedonia Północna', 'Kazachstan', 'Liechtenstein'];

const WCQ_GROUP_J_SCHEDULE: ScheduledMatch[] = [
  { round: 5,  dateLabel: '4 WRZ',  home: 'Liechtenstein',       away: 'Walia'               },
  { round: 5,  dateLabel: '4 WRZ',  home: 'Kazachstan',          away: 'Macedonia Północna'  },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Belgia',              away: 'Liechtenstein'       },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Walia',               away: 'Kazachstan'          },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Macedonia Północna', away: 'Belgia'              },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Kazachstan',          away: 'Liechtenstein'       },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Walia',               away: 'Macedonia Północna'  },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Belgia',              away: 'Kazachstan'          },
  { round: 9,  dateLabel: '14 LIS', home: 'Liechtenstein',       away: 'Macedonia Północna'  },
  { round: 9,  dateLabel: '14 LIS', home: 'Walia',               away: 'Belgia'              },
  { round: 10, dateLabel: '17 LIS', home: 'Kazachstan',          away: 'Walia'               },
  { round: 10, dateLabel: '17 LIS', home: 'Macedonia Północna', away: 'Liechtenstein'       },
];

const WCQ_GROUP_K_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '21 MAR', home: 'Andora',  away: 'Łotwa',   homeGoals: 0, awayGoals: 1 },
  { round: 1, dateLabel: '21 MAR', home: 'Anglia',  away: 'Albania', homeGoals: 2, awayGoals: 0 },
  { round: 2, dateLabel: '24 MAR', home: 'Albania', away: 'Andora',  homeGoals: 3, awayGoals: 0 },
  { round: 2, dateLabel: '24 MAR', home: 'Anglia',  away: 'Łotwa',   homeGoals: 3, awayGoals: 0 },
  { round: 3, dateLabel: '7 CZE',  home: 'Andora',  away: 'Anglia',  homeGoals: 0, awayGoals: 1 },
  { round: 3, dateLabel: '7 CZE',  home: 'Albania', away: 'Serbia',  homeGoals: 0, awayGoals: 0 },
  { round: 4, dateLabel: '10 CZE', home: 'Łotwa',   away: 'Albania', homeGoals: 1, awayGoals: 1 },
  { round: 4, dateLabel: '10 CZE', home: 'Serbia',  away: 'Andora',  homeGoals: 3, awayGoals: 0 },
];

const GROUP_K_TEAMS = ['Anglia', 'Albania', 'Serbia', 'Łotwa', 'Andora'];

const WCQ_GROUP_K_SCHEDULE: ScheduledMatch[] = [
  { round: 5,  dateLabel: '4 WRZ',  home: 'Andora',  away: 'Serbia'  },
  { round: 5,  dateLabel: '4 WRZ',  home: 'Łotwa',   away: 'Albania' },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Anglia',  away: 'Andora'  },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Albania', away: 'Serbia'  },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Serbia',  away: 'Łotwa'   },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Andora',  away: 'Albania' },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Albania', away: 'Anglia'  },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Łotwa',   away: 'Serbia'  },
  { round: 9,  dateLabel: '14 LIS', home: 'Serbia',  away: 'Albania' },
  { round: 9,  dateLabel: '14 LIS', home: 'Anglia',  away: 'Łotwa'   },
  { round: 10, dateLabel: '17 LIS', home: 'Andora',  away: 'Łotwa'   },
  { round: 10, dateLabel: '17 LIS', home: 'Albania', away: 'Anglia'  },
];

const WCQ_GROUP_L_PLAYED: PlayedMatch[] = [
  { round: 1, dateLabel: '22 MAR', home: 'Czarnogóra',   away: 'Gibraltar',    homeGoals: 3, awayGoals: 1 },
  { round: 1, dateLabel: '22 MAR', home: 'Czechy',       away: 'Wyspy Owcze', homeGoals: 2, awayGoals: 1 },
  { round: 2, dateLabel: '25 MAR', home: 'Gibraltar',    away: 'Czechy',       homeGoals: 0, awayGoals: 4 },
  { round: 2, dateLabel: '25 MAR', home: 'Czarnogóra',   away: 'Wyspy Owcze', homeGoals: 1, awayGoals: 0 },
  { round: 3, dateLabel: '6 CZE',  home: 'Czechy',       away: 'Czarnogóra',   homeGoals: 2, awayGoals: 0 },
  { round: 3, dateLabel: '6 CZE',  home: 'Gibraltar',    away: 'Chorwacja',    homeGoals: 0, awayGoals: 7 },
  { round: 4, dateLabel: '9 CZE',  home: 'Wyspy Owcze', away: 'Gibraltar',    homeGoals: 2, awayGoals: 1 },
  { round: 4, dateLabel: '9 CZE',  home: 'Chorwacja',    away: 'Czechy',       homeGoals: 5, awayGoals: 1 },
];

const GROUP_L_TEAMS = ['Chorwacja', 'Czechy', 'Wyspy Owcze', 'Czarnogóra', 'Gibraltar'];

const WCQ_GROUP_L_SCHEDULE: ScheduledMatch[] = [
  { round: 5,  dateLabel: '4 WRZ',  home: 'Gibraltar',    away: 'Wyspy Owcze'  },
  { round: 5,  dateLabel: '4 WRZ',  home: 'Czarnogóra',   away: 'Czechy'        },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Chorwacja',    away: 'Gibraltar'    },
  { round: 6,  dateLabel: '7 WRZ',  home: 'Wyspy Owcze', away: 'Czarnogóra'   },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Czechy',       away: 'Chorwacja'    },
  { round: 7,  dateLabel: '8 PAŹ',  home: 'Czarnogóra',   away: 'Gibraltar'    },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Wyspy Owcze', away: 'Czechy'        },
  { round: 8,  dateLabel: '11 PAŹ', home: 'Chorwacja',    away: 'Czarnogóra'   },
  { round: 9,  dateLabel: '14 LIS', home: 'Czechy',       away: 'Wyspy Owcze'  },
  { round: 9,  dateLabel: '14 LIS', home: 'Gibraltar',    away: 'Czarnogóra'   },
  { round: 10, dateLabel: '17 LIS', home: 'Czarnogóra',   away: 'Chorwacja'    },
  { round: 10, dateLabel: '17 LIS', home: 'Wyspy Owcze', away: 'Gibraltar'    },
];

const MONTH_SHORT: Record<number, string> = {
  0: 'STY',
  1: 'LUT',
  2: 'MAR',
  3: 'KWI',
  4: 'MAJ',
  5: 'CZE',
  6: 'LIP',
  7: 'SIE',
  8: 'WRZ',
  9: 'PAŹ',
  10: 'LIS',
  11: 'GRU',
};

const fixtureKey = (home: string, away: string) => `${home}__${away}`;

function computeStandings(played: PlayedMatch[], allTeams?: string[]): GroupTeam[] {
  const map: Record<string, GroupTeam> = {};

  const ensure = (name: string) => {
    if (!map[name]) {
      map[name] = { name, M: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, pts: 0 };
    }
  };

  (allTeams ?? []).forEach(ensure);

  for (const match of played) {
    ensure(match.home);
    ensure(match.away);

    const home = map[match.home];
    const away = map[match.away];

    home.M += 1;
    away.M += 1;
    home.GF += match.homeGoals;
    home.GA += match.awayGoals;
    away.GF += match.awayGoals;
    away.GA += match.homeGoals;

    if (match.homeGoals > match.awayGoals) {
      home.W += 1;
      away.L += 1;
      home.pts += 3;
    } else if (match.homeGoals < match.awayGoals) {
      away.W += 1;
      home.L += 1;
      away.pts += 3;
    } else {
      home.D += 1;
      away.D += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  return Object.values(map).sort(
    (a, b) => b.pts - a.pts || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF
  );
}

const formatDateLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()] ?? '???'}`;
};

const StandingRow: React.FC<{ team: GroupTeam; rank: number }> = ({ team, rank }) => {
  const isPoland = team.name === 'Polska';
  const gd = team.GF - team.GA;
  const gdDisplay = gd > 0 ? `+${gd}` : `${gd}`;
  const rowCellClass =
    rank === 1 ? 'bg-amber-400/30' :
    rank === 2 ? 'bg-sky-400/20' :
    '';
  const firstCellClass =
    rank === 1 ? 'border-l-4 border-amber-300' :
    rank === 2 ? 'border-l-4 border-sky-400' :
    '';
  const rankColor =
    rank === 1 ? 'text-amber-300' :
    rank === 2 ? 'text-sky-400' :
    'text-slate-500';

  return (
    <tr className="h-12 transition-all hover:bg-white/[0.02]">
      <td className={`pl-6 w-12 ${rowCellClass} ${firstCellClass}`}>
        <span className={`font-black font-mono text-sm ${rankColor}`}>
          {String(rank).padStart(2, '0')}
        </span>
      </td>
      <td className={`text-left min-w-[140px] ${rowCellClass}`}>
        <span className={`text-sm font-black uppercase italic tracking-tight ${isPoland ? 'text-amber-300' : 'text-slate-300'}`}>
          {team.name}
        </span>
      </td>
      <td className={`text-center font-bold text-slate-400 font-mono text-sm w-10 ${rowCellClass}`}>{team.M}</td>
      <td className={`text-center font-bold text-slate-500 font-mono text-xs w-10 ${rowCellClass}`}>{team.W}</td>
      <td className={`text-center font-bold text-slate-500 font-mono text-xs w-10 ${rowCellClass}`}>{team.D}</td>
      <td className={`text-center font-bold text-slate-500 font-mono text-xs w-10 ${rowCellClass}`}>{team.L}</td>
      <td className={`text-center font-bold text-slate-600 font-mono text-[10px] w-16 ${rowCellClass}`}>{team.GF}:{team.GA}</td>
      <td className={`text-center font-bold text-slate-500 font-mono text-xs w-14 ${rowCellClass}`}>{gdDisplay}</td>
      <td className={`text-center pr-6 w-16 ${rowCellClass}`}>
        <span className={`text-lg font-black font-mono tabular-nums ${isPoland ? 'text-amber-300' : 'text-slate-300'}`}>
          {team.pts}
        </span>
      </td>
    </tr>
  );
};

interface ScheduleCardProps {
  home: string;
  away: string;
  dateLabel: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ home, away, dateLabel, played, homeGoals, awayGoals }) => {
  const isPolandGame = home === 'Polska' || away === 'Polska';

  return (
    <div
      className={`flex items-center h-16 px-6 rounded-2xl mb-2 border transition-all ${
        isPolandGame ? 'bg-white/[0.07] border-white/15' : 'bg-white/[0.02] border-white/[0.04]'
      }`}
    >
      <div className="w-20 shrink-0 text-left">
        <p className={`text-[9px] font-black uppercase tracking-widest ${played ? 'text-slate-400' : 'text-blue-500'}`}>
          {dateLabel}
        </p>
        <p className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${played ? 'text-slate-600' : 'text-slate-700'}`}>
          {played ? 'FT' : '–'}
        </p>
      </div>

      <div className="flex-1 text-right pr-4">
        <span className={`text-sm font-black uppercase italic tracking-tight ${home === 'Polska' ? 'text-white' : 'text-slate-300'}`}>
          {home}
        </span>
      </div>

      <div className="w-24 flex justify-center items-center shrink-0">
        {played ? (
          <div className="bg-black/50 px-4 py-1.5 rounded-xl border border-white/10">
            <span className="text-base font-black font-mono text-emerald-400 tabular-nums tracking-tight">
              {homeGoals} : {awayGoals}
            </span>
          </div>
        ) : (
          <span className="text-xs font-black italic text-slate-700 tracking-widest">VS</span>
        )}
      </div>

      <div className="flex-1 text-left pl-4">
        <span className={`text-sm font-black uppercase italic tracking-tight ${away === 'Polska' ? 'text-white' : 'text-slate-300'}`}>
          {away}
        </span>
      </div>
    </div>
  );
};

const GROUP_TABS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const;
type GroupTab = typeof GROUP_TABS[number];

const InternationalView: React.FC = () => {
  const { nationalTeams, currentDate, lastNTMatchResults } = useGame();
  const [activeTournament, setActiveTournament] = useState<string>('wcq2026');
  const [activeGroup, setActiveGroup] = useState<GroupTab>('G');
  const upcomingSchedule = NT_SCHEDULE_BY_YEAR[2025] ?? [];

  const { standings, playedRounds, scheduledResults, maxPlayedRound } = useMemo(() => {
    const scheduleMeta = new Map<string, { round: number; dateLabel: string }>();
    upcomingSchedule.forEach((matchDay, roundOffset) => {
      const round = 5 + roundOffset;
      const dateLabel = `${matchDay.day} ${MONTH_SHORT[matchDay.month] ?? '???'}`;
      matchDay.matches.forEach(match => {
        scheduleMeta.set(fixtureKey(match.home, match.away), { round, dateLabel });
      });
    });

    const groupTeams = new Set<string>();
    WCQ_PLAYED.forEach(match => {
      groupTeams.add(match.home);
      groupTeams.add(match.away);
    });
    upcomingSchedule.forEach(matchDay => {
      matchDay.matches.forEach(match => {
        groupTeams.add(match.home);
        groupTeams.add(match.away);
      });
    });

    const ntNameById = new Map(nationalTeams.map(team => [team.id, team.name]));
    const historyMatches = MatchHistoryService.getAll()
      .filter(entry =>
        entry.competition.includes('Kwalifikacje') &&
        groupTeams.has(ntNameById.get(entry.homeTeamId) ?? '') &&
        groupTeams.has(ntNameById.get(entry.awayTeamId) ?? '')
      )
      .map<PlayedMatch | null>(entry => {
        const home = ntNameById.get(entry.homeTeamId) ?? '';
        const away = ntNameById.get(entry.awayTeamId) ?? '';
        if (!home || !away) return null;

        const meta = scheduleMeta.get(fixtureKey(home, away));
        return {
          round: meta?.round ?? 0,
          dateLabel: meta?.dateLabel ?? formatDateLabel(entry.date),
          home,
          away,
          homeGoals: entry.homeScore,
          awayGoals: entry.awayScore,
        };
      })
      .filter((match): match is PlayedMatch => !!match);

    const playedByKey = new Map<string, PlayedMatch>();
    [...WCQ_PLAYED, ...historyMatches].forEach(match => {
      playedByKey.set(fixtureKey(match.home, match.away), match);
    });

    const groupedPlayed: Record<number, PlayedMatch[]> = {};
    [...playedByKey.values()].forEach(match => {
      if (!groupedPlayed[match.round]) groupedPlayed[match.round] = [];
      groupedPlayed[match.round].push(match);
    });

    const roundsPlayed = [...playedByKey.values()].map(match => match.round).filter(round => round > 0);

    return {
      standings: computeStandings([...playedByKey.values()]),
      playedRounds: groupedPlayed,
      scheduledResults: playedByKey,
      maxPlayedRound: roundsPlayed.length ? Math.max(...roundsPlayed) : 4,
    };
  }, [nationalTeams, currentDate, lastNTMatchResults, upcomingSchedule]);

  const activeGroupData = useMemo(() => {
    if (activeGroup === 'G') return null;

    const groupStaticData: Record<string, { played: PlayedMatch[]; teams: string[]; schedule?: ScheduledMatch[] }> = {
      A: { played: WCQ_GROUP_A_PLAYED, teams: GROUP_A_TEAMS, schedule: WCQ_GROUP_A_SCHEDULE },
      B: { played: WCQ_GROUP_B_PLAYED, teams: GROUP_B_TEAMS, schedule: WCQ_GROUP_B_SCHEDULE },
      C: { played: WCQ_GROUP_C_PLAYED, teams: GROUP_C_TEAMS, schedule: WCQ_GROUP_C_SCHEDULE },
      D: { played: WCQ_GROUP_D_PLAYED, teams: GROUP_D_TEAMS, schedule: WCQ_GROUP_D_SCHEDULE },
      E: { played: WCQ_GROUP_E_PLAYED, teams: GROUP_E_TEAMS, schedule: WCQ_GROUP_E_SCHEDULE },
      F: { played: WCQ_GROUP_F_PLAYED, teams: GROUP_F_TEAMS, schedule: WCQ_GROUP_F_SCHEDULE },
      H: { played: WCQ_GROUP_H_PLAYED, teams: GROUP_H_TEAMS, schedule: WCQ_GROUP_H_SCHEDULE },
      I: { played: WCQ_GROUP_I_PLAYED, teams: GROUP_I_TEAMS, schedule: WCQ_GROUP_I_SCHEDULE },
      J: { played: WCQ_GROUP_J_PLAYED, teams: GROUP_J_TEAMS, schedule: WCQ_GROUP_J_SCHEDULE },
      K: { played: WCQ_GROUP_K_PLAYED, teams: GROUP_K_TEAMS, schedule: WCQ_GROUP_K_SCHEDULE },
      L: { played: WCQ_GROUP_L_PLAYED, teams: GROUP_L_TEAMS, schedule: WCQ_GROUP_L_SCHEDULE },
    };

    const group = groupStaticData[activeGroup];
    if (!group) return null;

    // fixture key -> round/dateLabel lookup from static played + full schedule
    const fixtureMeta = new Map<string, { round: number; dateLabel: string }>();
    group.played.forEach(m => fixtureMeta.set(fixtureKey(m.home, m.away), { round: m.round, dateLabel: m.dateLabel }));
    (group.schedule ?? []).forEach(m => fixtureMeta.set(fixtureKey(m.home, m.away), { round: m.round, dateLabel: m.dateLabel }));

    const ntNameById = new Map(nationalTeams.map(t => [t.id, t.name]));
    const groupTeamSet = new Set(group.teams);

    // dynamically fetch already-simulated matches from game engine
    const historyMatches = MatchHistoryService.getAll()
      .filter(entry =>
        entry.competition.includes('Kwalifikacje') &&
        groupTeamSet.has(ntNameById.get(entry.homeTeamId) ?? '') &&
        groupTeamSet.has(ntNameById.get(entry.awayTeamId) ?? '')
      )
      .map<PlayedMatch | null>(entry => {
        const home = ntNameById.get(entry.homeTeamId) ?? '';
        const away = ntNameById.get(entry.awayTeamId) ?? '';
        if (!home || !away) return null;
        const meta = fixtureMeta.get(fixtureKey(home, away));
        if (!meta) return null;
        return { round: meta.round, dateLabel: meta.dateLabel, home, away, homeGoals: entry.homeScore, awayGoals: entry.awayScore };
      })
      .filter((m): m is PlayedMatch => m !== null);

    // merge static + dynamic, deduplication by fixture key
    const playedByKey = new Map<string, PlayedMatch>();
    [...group.played, ...historyMatches].forEach(m => playedByKey.set(fixtureKey(m.home, m.away), m));

    const groupedPlayed: Record<number, PlayedMatch[]> = {};
    [...playedByKey.values()].forEach(m => {
      if (!groupedPlayed[m.round]) groupedPlayed[m.round] = [];
      groupedPlayed[m.round].push(m);
    });

    // schedule: only matches not yet played
    const groupedSchedule: Record<number, ScheduledMatch[]> = {};
    (group.schedule ?? []).forEach(m => {
      if (!playedByKey.has(fixtureKey(m.home, m.away))) {
        if (!groupedSchedule[m.round]) groupedSchedule[m.round] = [];
        groupedSchedule[m.round].push(m);
      }
    });

    return {
      standings: computeStandings([...playedByKey.values()], group.teams),
      groupedPlayed,
      groupedSchedule,
    };
  }, [activeGroup, nationalTeams, lastNTMatchResults]);

  return (
    <div className="relative flex-1 bg-slate-900/30 rounded-[40px] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.22] pointer-events-none"
        style={{ backgroundImage: `url(${polskaBgImg})` }}
      />
      <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

      <div className="relative z-10 flex gap-2 px-6 pt-5 pb-0 shrink-0 border-b border-white/5">
        {TOURNAMENTS.map(tournament => (
          <button
            key={tournament.id}
            onClick={() => setActiveTournament(tournament.id)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-px rounded-t-xl ${
              activeTournament === tournament.id
                ? 'border-amber-400 text-white bg-white/[0.04]'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tournament.label}
          </button>
        ))}
      </div>

      {activeTournament === 'wcq2026' && (
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 px-6 pt-4 pb-4 shrink-0 flex-wrap border-b border-white/5">
            {GROUP_TABS.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                style={activeGroup === g ? {
                  boxShadow: g === 'G'
                    ? '0 4px 0 0 #92400e, 0 6px 20px 0 rgba(251,191,36,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : '0 4px 0 0 #1e293b, 0 6px 16px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                } : {
                  boxShadow: '0 3px 0 0 #0f172a, 0 4px 8px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                className={`px-4 h-11 text-[11px] font-black uppercase tracking-[0.18em] rounded-xl transition-all border flex items-center justify-center whitespace-nowrap ${
                  activeGroup === g
                    ? g === 'G'
                      ? 'bg-gradient-to-b from-amber-500/30 to-amber-700/20 border-amber-400/60 text-amber-300'
                      : 'bg-gradient-to-b from-slate-600/60 to-slate-800/60 border-slate-400/40 text-amber-300'
                    : 'bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-white/10 text-amber-400/60 hover:text-amber-300 hover:border-white/20'
                }`}
              >
                Grupa {g}{g === 'G' ? ' ★' : ''}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-8">

              {activeGroup === 'G' && (
                <>
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={SUBHEADING}>{POLAND_GROUP_LABEL}</span>
                      <div className="flex-1 h-px bg-white/5" />
                      <span className={SUBHEADING}>Po kolejce {maxPlayedRound} z 10</span>
                    </div>

                    <div className="bg-black/20 rounded-[28px] border border-white/5 overflow-hidden">
                      <table className="w-full text-left border-separate border-spacing-y-0 table-fixed">
                        <thead>
                          <tr className={`${SUBHEADING} h-10`}>
                            <th className="pl-6 w-12">#</th>
                            <th className="text-left min-w-[140px]">Drużyna</th>
                            <th className="text-center w-10">M</th>
                            <th className="text-center w-10">W</th>
                            <th className="text-center w-10">R</th>
                            <th className="text-center w-10">P</th>
                            <th className="text-center w-16">Bramki</th>
                            <th className="text-center w-14">+/-</th>
                            <th className="text-center w-16 pr-6 text-amber-400">Pkt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team, index) => (
                            <StandingRow key={team.name} team={team} rank={index + 1} />
                          ))}
                        </tbody>
                      </table>

                      <div className="flex gap-6 px-6 py-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-amber-300/20 border border-amber-300/50" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bezpośredni awans (1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-sky-400/20 border border-sky-400/40" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Baraże (2)</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={SUBHEADING}>Terminarz — {POLAND_GROUP_LABEL}</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {Object.entries(playedRounds)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([roundNum, matches]) => (
                        <div key={roundNum} className="mb-6">
                          <p className={`${SUBHEADING} mb-3`}>Kolejka {roundNum}</p>
                          {matches.map(match => (
                            <ScheduleCard
                              key={fixtureKey(match.home, match.away)}
                              home={match.home}
                              away={match.away}
                              dateLabel={match.dateLabel}
                              played={true}
                              homeGoals={match.homeGoals}
                              awayGoals={match.awayGoals}
                            />
                          ))}
                        </div>
                      ))}

                    {upcomingSchedule.map((matchDay, roundOffset) => {
                      const roundNum = 5 + roundOffset;
                      const dateLabel = `${matchDay.day} ${MONTH_SHORT[matchDay.month] ?? '???'}`;
                      const matchesForRound = matchDay.matches.filter(match => !scheduledResults.has(fixtureKey(match.home, match.away)));
                      if (!matchesForRound.length) return null;

                      return (
                        <div key={roundNum} className="mb-6">
                          <p className={`${SUBHEADING} mb-3`}>Kolejka {roundNum}</p>
                          {matchesForRound.map(match => (
                            <ScheduleCard
                              key={fixtureKey(match.home, match.away)}
                              home={match.home}
                              away={match.away}
                              dateLabel={dateLabel}
                              played={false}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </section>
                </>
              )}

              {activeGroup !== 'G' && activeGroupData && (
                <>
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={SUBHEADING}>Grupa {activeGroup}</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="bg-black/20 rounded-[28px] border border-white/5 overflow-hidden">
                      <table className="w-full text-left border-separate border-spacing-y-0 table-fixed">
                        <thead>
                          <tr className={`${SUBHEADING} h-10`}>
                            <th className="pl-6 w-12">#</th>
                            <th className="text-left min-w-[140px]">Drużyna</th>
                            <th className="text-center w-10">M</th>
                            <th className="text-center w-10">W</th>
                            <th className="text-center w-10">R</th>
                            <th className="text-center w-10">P</th>
                            <th className="text-center w-16">Bramki</th>
                            <th className="text-center w-14">+/-</th>
                            <th className="text-center w-16 pr-6 text-amber-400">Pkt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeGroupData.standings.map((team, index) => (
                            <StandingRow key={team.name} team={team} rank={index + 1} />
                          ))}
                        </tbody>
                      </table>

                      <div className="flex gap-6 px-6 py-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-amber-300/20 border border-amber-300/50" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bezpośredni awans (1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-sky-400/20 border border-sky-400/40" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Baraże (2)</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {(Object.keys(activeGroupData.groupedPlayed).length > 0 || Object.keys(activeGroupData.groupedSchedule).length > 0) && (
                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={SUBHEADING}>Terminarz — Grupa {activeGroup}</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>

                      {Object.entries(activeGroupData.groupedPlayed)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([roundNum, matches]) => (
                          <div key={`played-${roundNum}`} className="mb-6">
                            <p className={`${SUBHEADING} mb-3`}>Kolejka {roundNum}</p>
                            {matches.map(match => (
                              <ScheduleCard
                                key={fixtureKey(match.home, match.away)}
                                home={match.home}
                                away={match.away}
                                dateLabel={match.dateLabel}
                                played={true}
                                homeGoals={match.homeGoals}
                                awayGoals={match.awayGoals}
                              />
                            ))}
                          </div>
                        ))}

                      {Object.entries(activeGroupData.groupedSchedule)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([roundNum, matches]) => (
                          <div key={`sched-${roundNum}`} className="mb-6">
                            <p className={`${SUBHEADING} mb-3`}>Kolejka {roundNum}</p>
                            {matches.map(match => (
                              <ScheduleCard
                                key={fixtureKey(match.home, match.away)}
                                home={match.home}
                                away={match.away}
                                dateLabel={match.dateLabel}
                                played={false}
                              />
                            ))}
                          </div>
                        ))}
                    </section>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalView;
