
import React from 'react';
import {
  ClubAcademyDirector,
  ClubCEO,
  ClubCFO,
  ClubCOO,
  ClubMarketingDirector,
  ClubOwner,
} from '../../types';

export type MemberEntry =
  | { role: 'Właściciel';        data: ClubOwner }
  | { role: 'Prezes';            data: ClubCEO }
  | { role: 'Dyrektor finansowy';   data: ClubCFO }
  | { role: 'Dyrektor operacyjny';  data: ClubCOO }
  | { role: 'Dyrektor marketingu';  data: ClubMarketingDirector }
  | { role: 'Dyrektor akademii';    data: ClubAcademyDirector };

interface ManagementMemberModalProps {
  member: MemberEntry;
  onClose: () => void;
}

const SKIP_FIELDS = new Set(['id', 'firstName', 'lastName', 'age', 'nationality', 'nationalityCountry', 'monthlySalary']);

const ATTR_LABELS: Record<string, string> = {
  cierpliwosc:              'Cierpliwość',
  ambicja:                  'Ambicja',
  hojnosc:                  'Hojność',
  doswiadczenie:            'Doświadczenie',
  zdolnosciMarketingowe:    'Zdolności marketingowe',
  dyscyplinaFinansowa:      'Dyscyplina finansowa',
  organizacja:              'Organizacja',
  zarzadzanieInfrastruktura:'Zarządzanie infrastrukturą',
  efektywnoscKosztowa:      'Efektywność kosztowa',
  logistykaIPlanowanie:     'Logistyka i planowanie',
  rozwojMlodziezy:          'Rozwój młodzieży',
  zarzadzanie:              'Zarządzanie',
};

const attrColor = (v: number): string => {
  if (v >= 17) return '#34d399';
  if (v >= 12) return '#4ade80';
  if (v >= 7)  return '#facc15';
  if (v >= 4)  return '#fb923c';
  return '#ef4444';
};

export const ManagementMemberModal: React.FC<ManagementMemberModalProps> = ({ member, onClose }) => {
  const { data, role } = member;

  const attrs = Object.entries(data)
    .filter(([k, v]) => !SKIP_FIELDS.has(k) && typeof v === 'number')
    .map(([key, value]) => ({ key, value: value as number }));

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-md"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
        >
          ✕
        </button>
        <div className="mb-5 text-center">
          <p className="text-xs font-black italic uppercase tracking-tighter text-yellow-400">{role}</p>
          <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tighter text-white">
            {data.firstName} {data.lastName}
          </h2>
          <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
            {data.age} lat, {data.nationalityCountry}
          </p>
        </div>

        <div className="mb-4 border-t border-white/15" />

        <div className="space-y-2">
          {attrs.map(({ key, value }) => (
            <div key={key} className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">
                  {ATTR_LABELS[key] ?? key}
                </p>
                <p className="text-[10px] font-black italic uppercase tracking-tighter" style={{ color: attrColor(value) }}>
                  {value}
                </p>
              </div>
              <div className="h-0.5 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(value / 20) * 100}%`, backgroundColor: attrColor(value) }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
