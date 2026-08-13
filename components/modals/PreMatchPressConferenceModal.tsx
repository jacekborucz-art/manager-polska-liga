import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Club } from '../../types';
import {
  PreMatchPressConferenceService,
  PressConferenceAnswer,
  PressConferenceFixture,
} from '../../services/PreMatchPressConferenceService';

interface Props {
  fixture: PressConferenceFixture;
  userClub: Club;
  opponent: Club;
}

/**
 * One continuous SVG scene provides the complete visual frame of the press room.
 * Interactive copy remains HTML so long Polish questions wrap naturally and stay accessible.
 */
export const ConferenceScene: React.FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1660 920"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="conference-shell" x1="50" y1="10" x2="1510" y2="920" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B2142" />
        <stop offset="0.42" stopColor="#08162D" />
        <stop offset="1" stopColor="#030815" />
      </linearGradient>
      <linearGradient id="conference-stage" x1="20" y1="80" x2="480" y2="850" gradientUnits="userSpaceOnUse">
        <stop stopColor="#123A67" />
        <stop offset="0.58" stopColor="#081A34" />
        <stop offset="1" stopColor="#040A16" />
      </linearGradient>
      <linearGradient id="conference-desk" x1="120" y1="680" x2="420" y2="880" gradientUnits="userSpaceOnUse">
        <stop stopColor="#17406A" />
        <stop offset="1" stopColor="#061122" />
      </linearGradient>
      <linearGradient id="conference-accent" x1="390" y1="70" x2="690" y2="850" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.52" stopColor="#2563EB" />
        <stop offset="1" stopColor="#22D3EE" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id="conference-light-beam" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#BAE6FD" stopOpacity="0.24" />
        <stop offset="1" stopColor="#BAE6FD" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="conference-blue-glow" cx="0" cy="0" r="1" gradientTransform="translate(1090 485) rotate(90) scale(520 760)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0EA5E9" stopOpacity="0.12" />
        <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="conference-camera-flash" cx="0" cy="0" r="1" gradientTransform="translate(1520 125) rotate(90) scale(150)" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.25" />
        <stop offset="1" stopColor="#67E8F9" stopOpacity="0" />
      </radialGradient>
      <pattern id="conference-media-wall" width="142" height="76" patternUnits="userSpaceOnUse">
        <path d="M13 15h116v46H13z" fill="#DDF4FF" fillOpacity="0.035" />
        <path d="M48 38h60" stroke="#DDF4FF" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
        <circle cx="31" cy="38" r="8" stroke="#67E8F9" strokeOpacity="0.16" strokeWidth="2" />
      </pattern>
      <pattern id="conference-fine-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#93C5FD" fillOpacity="0.08" />
      </pattern>
      <filter id="conference-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
      <filter id="conference-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.62" />
      </filter>
      <clipPath id="conference-clip">
        <rect x="2" y="2" width="1656" height="916" rx="48" />
      </clipPath>
    </defs>

    <g filter="url(#conference-shadow)">
      <rect x="2" y="2" width="1656" height="916" rx="48" fill="url(#conference-shell)" />
    </g>

    <g clipPath="url(#conference-clip)">
      <rect width="1660" height="920" fill="url(#conference-shell)" />
      <rect width="1660" height="920" fill="url(#conference-fine-dots)" />
      <rect x="475" width="1185" height="920" fill="url(#conference-blue-glow)" />

      {/* The left side is a press-room stage, not another UI panel. */}
      <path d="M0 0H510C482 186 491 325 532 454C570 573 556 738 478 920H0V0Z" fill="url(#conference-stage)" />
      <path d="M25 108H451V657H25Z" fill="url(#conference-media-wall)" opacity="0.88" />
      <path d="M477 0C448 188 458 330 503 462C539 570 527 735 447 920H500C574 718 585 568 548 450C508 321 503 180 536 0H477Z" fill="url(#conference-accent)" opacity="0.72" />
      <path d="M512 0C487 182 495 327 540 455C576 561 566 721 492 920" stroke="#A5F3FC" strokeOpacity="0.18" strokeWidth="2" />

      {/* Ceiling lighting rig and soft beams. */}
      <path d="M0 58H1660" stroke="#94A3B8" strokeOpacity="0.18" strokeWidth="4" />
      <path d="M36 30 132 87M132 30 36 87M218 30l96 57M314 30l-96 57M1390 30l96 57M1486 30l-96 57" stroke="#64748B" strokeOpacity="0.24" strokeWidth="3" />
      <g fill="#DDF4FF" stroke="#7DD3FC" strokeOpacity="0.35">
        <path d="M67 77h46l-7 25H74z" />
        <path d="M248 77h46l-7 25h-32z" />
        <path d="M1418 77h46l-7 25h-32z" />
      </g>
      <path d="M74 101H106L178 602H2Z" fill="url(#conference-light-beam)" opacity="0.35" />
      <path d="M255 101H287L430 614H140Z" fill="url(#conference-light-beam)" opacity="0.22" />
      <path d="M1425 101H1457L1658 600H1240Z" fill="url(#conference-light-beam)" opacity="0.12" />

      {/* Podium, desk and press microphones. */}
      <ellipse cx="255" cy="856" rx="242" ry="52" fill="#000814" fillOpacity="0.72" />
      <path d="M87 694H422L462 864H44L87 694Z" fill="url(#conference-desk)" stroke="#7DD3FC" strokeOpacity="0.17" strokeWidth="2" />
      <path d="M64 770H442" stroke="#38BDF8" strokeOpacity="0.27" strokeWidth="3" />
      <path d="M167 694 196 564M196 564l-21-28M196 564l35-17" stroke="#DDF4FF" strokeOpacity="0.68" strokeWidth="6" strokeLinecap="round" />
      <path d="M304 694 288 548M288 548l23-29M288 548l-35-13" stroke="#DDF4FF" strokeOpacity="0.58" strokeWidth="6" strokeLinecap="round" />
      <path d="M230 694V582M230 582l13-33h30l14 33Z" fill="#0B172A" stroke="#BAE6FD" strokeOpacity="0.5" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="198" cy="554" r="12" fill="#0B172A" stroke="#67E8F9" strokeOpacity="0.54" strokeWidth="4" />
      <circle cx="288" cy="539" r="12" fill="#0B172A" stroke="#67E8F9" strokeOpacity="0.5" strokeWidth="4" />

      {/* Camera silhouettes in the foreground give the SVG depth. */}
      <g fill="#02050C" stroke="#334155" strokeOpacity="0.45" strokeWidth="3">
        <path d="M0 836h96l22 84H0z" />
        <path d="M79 746h72l19 58H60zM142 755l52-24v73l-40-16z" />
        <path d="m111 804-23 116M126 804l28 116" />
        <path d="M386 785h81l21 65H366zM458 794l51-26v79l-40-17z" />
        <path d="m422 850-42 70M438 850l28 70" />
      </g>

      {/* Football identity is integrated into the quiet reading area. */}
      <g transform="translate(1458 735) rotate(-12)" opacity="0.055" stroke="#BAE6FD" strokeWidth="6">
        <circle r="190" />
        <path d="M0-190 110-154 176-59 176 59 110 154 0 190-110 154-176 59-176-59-110-154Z" />
        <path d="M0-72 68-22 42 58-42 58-68-22Z" fill="#BAE6FD" fillOpacity="0.16" />
        <path d="M0-72V-190M68-22l108-37M42 58l68 96M-42 58l-68 96M-68-22l-108-37" />
      </g>
      <g transform="translate(1180 488)" opacity="0.055" stroke="#38BDF8" strokeWidth="3">
        <rect x="-390" y="-206" width="780" height="412" rx="18" />
        <path d="M0-206V206" />
        <circle r="75" />
        <path d="M-390-101h116v202h-116M390-101H274v202h116" />
      </g>

      <circle cx="1518" cy="125" r="150" fill="url(#conference-camera-flash)" />
      <circle cx="1518" cy="125" r="8" fill="white" fillOpacity="0.7" />
      <circle cx="1518" cy="125" r="23" stroke="white" strokeOpacity="0.16" strokeWidth="2" />
      <ellipse cx="1120" cy="910" rx="490" ry="34" fill="#0EA5E9" fillOpacity="0.1" filter="url(#conference-blur)" />
      <path d="M525 873H1560" stroke="#38BDF8" strokeOpacity="0.16" />
      <path d="M525 878H955" stroke="#22D3EE" strokeOpacity="0.48" strokeWidth="3" />
    </g>

    <rect x="2" y="2" width="1656" height="916" rx="48" stroke="#BFDBFE" strokeOpacity="0.14" strokeWidth="2" />
  </svg>
);

export const PreMatchPressConferenceModal: React.FC<Props> = ({ fixture, userClub, opponent }) => {
  const { clubs, fixtures, completePreMatchPressConference } = useGame();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PressConferenceAnswer[]>([]);
  const conference = useMemo(
    () => PreMatchPressConferenceService.generate(fixture, userClub, opponent, clubs, fixtures),
    [clubs, fixture, fixtures, opponent, userClub],
  );
  const question = conference.questions[questionIndex];

  const handleAnswer = (answer: PressConferenceAnswer) => {
    const nextAnswers = [...selectedAnswers, answer];
    if (questionIndex < conference.questions.length - 1) {
      setSelectedAnswers(nextAnswers);
      setQuestionIndex(current => current + 1);
      return;
    }
    completePreMatchPressConference(fixture.id, nextAnswers);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in">
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <ConferenceScene />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-cyan-100">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-60 animate-ping" />
                  <span className="relative m-[3px] h-1.5 w-1.5 rounded-full bg-red-400" />
                </span>
                Konferencja prasowa
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-blue-200/60">Przed meczem</p>
            </div>

            <div className="mb-2 max-w-[315px]">
              <div className="mb-5 flex items-end gap-3">
                <span className="text-6xl font-light leading-none tracking-normal text-white">
                  {String(questionIndex + 1).padStart(2, '0')}
                </span>
                <span className="pb-1 text-xl font-normal tracking-normal text-blue-200/45">
                  / {String(conference.questions.length).padStart(2, '0')}
                </span>
              </div>
              <div className="flex gap-2">
                {conference.questions.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${index <= questionIndex ? 'bg-cyan-300' : 'bg-white/15'}`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm font-normal leading-relaxed tracking-normal text-slate-300/65">
                Wybierz odpowiedź, która najlepiej oddaje nastawienie zespołu przed spotkaniem.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-12 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-8">
              <p className="text-sm font-medium tracking-normal text-cyan-300/80">Przedmeczowe spotkanie z mediami</p>
              <h2 className="mt-2 max-w-[970px] text-[40px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                {conference.headline}
              </h2>
            </header>

            <section className="mt-8 flex min-h-0 flex-1 flex-col">
              {questionIndex === 0 && conference.opponentStatement && (
                <blockquote className="mb-6 max-w-[990px] border-l-2 border-amber-300/75 pl-5 text-[16px] font-normal leading-relaxed tracking-normal text-amber-100/85">
                  {conference.opponentStatement}
                </blockquote>
              )}

              <div className="shrink-0">
                <div className="flex items-center gap-3 text-[13px] font-medium tracking-normal text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.75)]" />
                  {question.journalist}
                </div>
                <p className="mt-3 max-w-[1020px] text-[27px] font-semibold leading-[1.3] tracking-[-0.015em] text-slate-50">
                  {question.text}
                </p>
              </div>

              <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-3">
                {question.answers.map((answer, answerIndex) => (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(answer)}
                    className="group relative flex min-h-[76px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t hover:border-cyan-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
                  >
                    <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/12 to-transparent transition-[width] duration-300 group-hover:w-full" />
                    <span className="relative w-14 shrink-0 text-[14px] font-medium tracking-normal text-cyan-300/70 transition-colors group-hover:text-cyan-200">
                      {String(answerIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="relative pr-12 text-[17px] font-medium leading-[1.45] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                      {answer.text}
                    </span>
                    <span className="relative ml-auto mr-2 text-xl font-light text-cyan-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300/80">→</span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
