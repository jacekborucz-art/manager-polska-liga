import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MysteryAgentService } from '../../services/MysteryAgentService';
import { ViewState } from '../../types';

export const MysteryAgentNegotiationView: React.FC = () => {
  const {
    mysteryAgentOffer,
    clubs,
    userTeamId,
    players,
    navigateTo,
    submitMysteryAgentOffer,
    requestMysteryAgentBoardFunds,
    declineMysteryAgentOffer,
  } = useGame();

  const userClub = useMemo(() => clubs.find(club => club.id === userTeamId) ?? null, [clubs, userTeamId]);
  const userSquad = useMemo(() => userTeamId ? players[userTeamId] || [] : [], [players, userTeamId]);
  const highestSalary = useMemo(
    () => Math.max(80_000, ...userSquad.map(player => player.annualSalary || 0)),
    [userSquad]
  );

  const initialSalary = mysteryAgentOffer?.askingSalary ?? highestSalary;
  const initialSigningFee = mysteryAgentOffer?.askingSigningFee ?? Math.round(highestSalary * 0.75);

  const [salary, setSalary] = useState(initialSalary);
  const [signingFee, setSigningFee] = useState(initialSigningFee);
  const [years, setYears] = useState(3);
  const [goalBonus, setGoalBonus] = useState(0);
  const [assistBonus, setAssistBonus] = useState(0);
  const [cleanSheetBonus, setCleanSheetBonus] = useState(0);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultTone, setResultTone] = useState<'info' | 'success' | 'error'>('info');

  if (!mysteryAgentOffer || !userClub) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
          <h1 className="font-black italic uppercase tracking-tighter text-3xl text-amber-300">
            Brak aktywnych rozmów
          </h1>
          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="mt-6 rounded-2xl bg-white px-6 py-3 font-black uppercase text-black"
          >
            Wróć
          </button>
        </div>
      </div>
    );
  }

  const player = mysteryAgentOffer.player;
  const isGK = player.position === 'GK';
  const availableBudget = userClub.transferBudget + (mysteryAgentOffer.boardSupportAmount ?? 0);
  const contract = {
    signingFee,
    salary,
    years,
    goalBonus: isGK ? undefined : goalBonus || undefined,
    assistBonus: isGK ? undefined : assistBonus || undefined,
    cleanSheetBonus: isGK ? cleanSheetBonus || undefined : undefined,
  };
  const totalCost = MysteryAgentService.getTotalCost(contract);
  const missingBudget = Math.max(0, totalCost - availableBudget);
  const attemptsLeft = Math.max(0, mysteryAgentOffer.maxAttempts - mysteryAgentOffer.attemptsUsed);
  const maxSalary = Math.max(mysteryAgentOffer.askingSalary * 2, highestSalary * 3, salary);
  const maxSigningFee = Math.max(mysteryAgentOffer.askingSigningFee * 2, highestSalary * 3, signingFee);

  const handleSubmit = () => {
    const result = submitMysteryAgentOffer(contract);
    setResultMessage(result.message);
    setResultTone(result.accepted ? 'success' : result.ended ? 'error' : 'info');
  };

  const handleBoardRequest = () => {
    const result = requestMysteryAgentBoardFunds(contract);
    setResultMessage(result.message);
    setResultTone(result.approved ? 'success' : result.ended ? 'error' : 'info');
  };

  const isEnded = mysteryAgentOffer.status !== 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.20),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.95),transparent_45%)]" />
      <div className="relative z-10 max-w-6xl mx-auto py-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <p className="font-black italic uppercase tracking-tighter text-amber-300 text-sm">
              Tajemniczy agent
            </p>
            <h1 className="font-black italic uppercase tracking-tighter text-4xl md:text-6xl text-white">
              Talent bez papierów
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Agent pokazuje tylko podstawowe dane. Overall jest ukryty. Wiesz tylko, że zawodnik ma talent 99.
            </p>
          </div>
          <button
            onClick={() => navigateTo(ViewState.DASHBOARD)}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase text-slate-300 hover:bg-white/10"
          >
            Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="rounded-[32px] border border-amber-300/20 bg-slate-900/90 p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Klient agenta</p>
                <h2 className="font-black italic uppercase tracking-tighter text-3xl text-white mt-2">
                  {player.firstName} {player.lastName}
                </h2>
              </div>
              <div className="rounded-2xl bg-amber-300 px-4 py-3 text-center text-black">
                <div className="text-[9px] font-black uppercase">Talent</div>
                <div className="font-black text-3xl leading-none">99</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <InfoBox label="Wiek" value={`${player.age} lat`} />
              <InfoBox label="Pozycja" value={player.position} />
              <InfoBox label="Narodowość" value={player.nationalityCountry || player.nationality} />
              <InfoBox label="Overall" value="Ukryty" accent />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-black italic uppercase tracking-tighter text-amber-200 text-xl">
                "{mysteryAgentOffer.lastAgentMessage}"
              </p>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Agent nie pokaże raportu OVR. Jeśli rozmowy upadną, zawodnik trafi do ukrytej puli i będzie go można odnaleźć tylko przez skauting.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <InfoBox label="Próby" value={`${attemptsLeft}/${mysteryAgentOffer.maxAttempts}`} />
              <InfoBox label="Budżet" value={`${availableBudget.toLocaleString('pl-PL')} PLN`} />
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-slate-900/90 p-7 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <MoneyControl
                label="Kwota za podpis"
                value={signingFee}
                max={maxSigningFee}
                step={5_000}
                color="text-blue-300"
                onChange={setSigningFee}
              />
              <MoneyControl
                label="Kwota kontraktu"
                value={salary}
                max={maxSalary}
                step={5_000}
                color="text-emerald-300"
                onChange={setSalary}
              />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-black italic uppercase tracking-tighter text-sm text-slate-400 mb-3">
                Długość kontraktu
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(yearOption => (
                  <button
                    key={yearOption}
                    onClick={() => setYears(yearOption)}
                    disabled={isEnded}
                    className={`rounded-2xl py-3 font-black uppercase transition ${
                      years === yearOption
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {yearOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {isGK ? (
                <MoneyControl
                  label="Bonus za czyste konto"
                  value={cleanSheetBonus}
                  max={50_000}
                  step={500}
                  color="text-violet-300"
                  onChange={setCleanSheetBonus}
                />
              ) : (
                <>
                  <MoneyControl
                    label="Bonus bramkowy"
                    value={goalBonus}
                    max={50_000}
                    step={500}
                    color="text-amber-300"
                    onChange={setGoalBonus}
                  />
                  <MoneyControl
                    label="Bonus za asystę"
                    value={assistBonus}
                    max={35_000}
                    step={500}
                    color="text-sky-300"
                    onChange={setAssistBonus}
                  />
                </>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase text-slate-500">Łączny pakiet</span>
                <span className="font-black text-2xl text-white">{totalCost.toLocaleString('pl-PL')} PLN</span>
              </div>
              {missingBudget > 0 && (
                <p className="text-xs font-black uppercase text-red-300">
                  Brakuje {missingBudget.toLocaleString('pl-PL')} PLN
                </p>
              )}
              {mysteryAgentOffer.boardSupportAmount ? (
                <p className="text-xs font-black uppercase text-emerald-300">
                  Zarząd dołożył {mysteryAgentOffer.boardSupportAmount.toLocaleString('pl-PL')} PLN
                </p>
              ) : null}
            </div>

            {resultMessage && (
              <div className={`mt-6 rounded-3xl border p-5 ${
                resultTone === 'success'
                  ? 'border-emerald-400/40 bg-emerald-950/30 text-emerald-100'
                  : resultTone === 'error'
                    ? 'border-red-400/40 bg-red-950/30 text-red-100'
                    : 'border-amber-400/40 bg-amber-950/30 text-amber-100'
              }`}>
                <p className="font-black italic uppercase tracking-tighter text-lg">
                  {resultMessage}
                </p>
              </div>
            )}

            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleSubmit}
                disabled={isEnded}
                className="md:col-span-2 rounded-2xl bg-emerald-600 px-5 py-4 font-black italic uppercase tracking-tighter text-white hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500"
              >
                Wyślij ofertę
              </button>
              <button
                onClick={handleBoardRequest}
                disabled={isEnded || missingBudget <= 0 || mysteryAgentOffer.boardRequestUsed}
                className="rounded-2xl bg-amber-600 px-5 py-4 font-black italic uppercase tracking-tighter text-white hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500"
              >
                Do zarządu
              </button>
              <button
                onClick={declineMysteryAgentOffer}
                disabled={isEnded}
                className="md:col-span-3 rounded-2xl border border-red-400/30 bg-red-950/20 px-5 py-3 text-xs font-black uppercase text-red-200 hover:bg-red-900/30 disabled:opacity-40"
              >
                Zrezygnuj z rozmów
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoBox: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    <p className={`mt-1 font-black italic uppercase tracking-tighter text-lg ${accent ? 'text-amber-300' : 'text-white'}`}>
      {value}
    </p>
  </div>
);

const MoneyControl: React.FC<{
  label: string;
  value: number;
  max: number;
  step: number;
  color: string;
  onChange: (value: number) => void;
}> = ({ label, value, max, step, color, onChange }) => (
  <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
    <div className="flex items-center justify-between gap-3">
      <span className="font-black italic uppercase tracking-tighter text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          step={step}
          onChange={event => onChange(Math.max(0, Math.min(max, parseInt(event.target.value, 10) || 0)))}
          className={`w-32 bg-transparent text-right font-black outline-none ${color}`}
        />
        <span className="text-[10px] font-black text-slate-500">PLN</span>
      </div>
    </div>
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value}
      onChange={event => onChange(parseInt(event.target.value, 10) || 0)}
      className="mt-4 w-full accent-amber-400"
    />
  </div>
);
