import React from "react";
import "./PlayerReport.css";

const stats = [
  ["6", "MECZE", 72],
  ["540", "MINUTY", 82],
  ["2", "BRAMKI", 58],
  ["1", "ASYSTY", 52],
  ["83%", "PODANIA", 83],
  ["2.1", "KL. PODAŃ / 90", 64],
];

export default function PlayerReport() {
  return (
    <div className="pr-page">
      <aside className="pr-sidebar">
        <button className="pr-back">‹</button>
        <Nav active icon={<HomeIcon />} label="PODSUMOWANIE" />
        <Nav icon={<TargetIcon />} label="ANALIZA SZCZEGÓŁOWA" />
        <Nav icon={<TrendIcon />} label="TRENDY" />
        <Nav icon={<CompareIcon />} label="PORÓWNANIA" />
        <Nav icon={<HistoryIcon />} label="HISTORIA" />
        <Nav icon={<NoteIcon />} label="NOTATKI" />

        <div className="pr-sidebox">
          <span>DATA RAPORTU</span>
          <b>21 MAJ 2024</b>
          <span>RAPORT WYGENEROWAŁ</span>
          <b>Asystent AI</b>
          <button>EKSPORT PDF</button>
        </div>
      </aside>

      <main className="pr-main">
        <header className="pr-topbar">
          <h1>RAPORT ZAWODNIKA</h1>
          <div className="pr-controls">
            <button>SEZON 2023/24⌄</button>
            <button>WERSJA 1.2⌄</button>
            <button className="pr-x">×</button>
          </div>
        </header>

        <section className="pr-grid">
          <section className="pr-card pr-hero">
            <div className="pr-photo">
              <PhotoPlaceholder />
            </div>
            <div className="pr-hero-content">
              <h2>OLIWIER<br />WOJCIECHOWSKI</h2>
              <div className="pr-badges"><b>MID</b><span>OVR 68</span><span>21 LAT</span><em>TALENT 75</em></div>
              <div className="pr-meta"><p><span>KLUB</span>WISŁA KRAKÓW</p><p><span>KONTRAKT</span>30.06.2026</p></div>
              <Donut value={70} label="POZ. EFEKTYWNOŚCI" size={178} />
              <div className="pr-ministats"><b>6</b><span>MECZE</span><b>540</b><span>MINUTY</span><b>2</b><span>BRAMKI</span><b>1</b><span>ASYSTY</span></div>
              <div className="pr-rising">▲ FORMA ROŚNIE</div>
            </div>
          </section>

          <Metric type="value" icon={<CoinsIcon />} title="WARTOŚĆ" value="WYSOKA" sub="POTENCJALNY TRANSFER" range="1.2 – 2.0 MLN €" />
          <Metric type="potential" icon={<BrainIcon />} title="POTENCJAŁ" value="WYSOKI" sub="DALSZY ROZWÓJ" range="75 – 85 OVR" />

          <section className="pr-card pr-position">
            <span className="pr-kicker">POZYCJA</span>
            <strong>70</strong>
            <small>POZ. EFEKTYWNOŚCI</small>
            <b>ŚRODKOWY POMOCNIK</b>
            <PitchMini />
          </section>

          <section className="pr-card pr-assistant">
            <h3>OGÓLNA OCENA ASYSTENTA</h3>
            <div className="pr-grade">B+</div>
            <p>Perspektywiczny zawodnik z dużym talentem. Właściwie teraz, w tym oknie, możemy go ukształtować na miarę naszego modelu gry.</p>
          </section>

          <section className="pr-card pr-attrs">
            <div>
              <h3>KLUCZOWE ATUTY</h3>
              <Attr icon={<PassIcon />} label="PODANIA" value={71} />
              <Attr icon={<EyeIcon />} label="WIZJA" value={69} />
              <Attr icon={<NodesIcon />} label="TECHNIKA" value={70} />
            </div>
            <div>
              <h3 className="pr-pink">OBSZARY DO ROZWOJU</h3>
              <Attr bad icon={<CounterIcon />} label="KONTRATAK" value={40} />
              <Attr bad icon={<ShieldIcon />} label="GRA W OBRONIE" value={45} />
              <Attr bad icon={<PulseIcon />} label="SIŁA FIZYCZNA" value={48} />
            </div>
          </section>

          <section className="pr-card pr-form"><h3>FORMA — OSTATNIE 6 MECZÓW</h3><FormChart /><div className="pr-score">8.1<span>ŚREDNIA</span></div><button>▲ TREND WZROSTOWY</button></section>

          <section className="pr-card pr-recs"><h3>REKOMENDACJE</h3><Rec icon={<TargetBadge />} title="FOCUS INDYWIDUALNY" text="WIZJA I PODEJMOWANIE DECYZJI" /><Rec icon={<GymBadge />} title="PROGRAM TRENINGOWY" text="KONTRATAK I GRA W PRZEJŚCIU" /><Rec icon={<ShieldBadge />} title="PRIORYTET ROZWOJU" text="SIŁA FIZYCZNA I DYNAMIKA" /></section>

          <section className="pr-card pr-season"><h3>STATYSTYKI SEZONOWE</h3><div className="pr-donuts">{stats.map(([v,l,p]) => <MiniDonut key={l} value={v} label={l} percent={p} />)}</div></section>
          <section className="pr-card pr-heat"><h3>MAPA DZIAŁAŃ NA BOISKU</h3><HeatMap /><span>KIERUNEK ATAKU →</span></section>
          <section className="pr-card pr-rank"><h3>PORÓWNANIE NA POZYCJI TOP 5</h3>{["K. BARGIEL|76|92","M. KOWALSKI|72|78","O. WOJCIECHOWSKI|70|70","T. NOWAK|67|58","P. ZIÓŁKOWSKI|65|52"].map((r,i)=>{const [n,s,w]=r.split("|");return <div className={i===2?"pr-rankrow active":"pr-rankrow"} key={n}><b>{i+1}. {n}</b><span>{s}</span><i><em style={{width:`${w}%`}} /></i></div>})}</section>
          <section className="pr-card pr-invest"><div><InvestIcon /></div><p>Obiecujący młody zawodnik z wysokim potencjałem wzrostu. Zdecydowanie warto inwestować, potencjał na kluczową rolę w zespole.</p></section>
          <section className="pr-card pr-general"><h3>OCENA OGÓLNA</h3><div className="pr-grade small">B+</div><p>Najlepszy zawodnik w naszym składzie na swojej pozycji. Warto podkreślić jego dojrzałość taktyczną i inteligencję na boisku.</p><div className="pr-tags"><span>TAKTYKA</span><span>TECHNIKA</span><span>INTELIGENCJA</span><span>POTENCJAŁ</span></div></section>
          <section className="pr-card pr-eff"><h3>SKUTECZNOŚĆ NA POZYCJI</h3><Gauge value={70} /><p>Nieznacznie powyżej średniej dla tej pozycji w kluczowych atrybutach. Solidna skuteczność.</p></section>
          <section className="pr-card pr-history"><h3>HISTORIA TRENDÓW</h3><MiniLine /></section>
          <section className="pr-card pr-next"><h3>NAJBLIŻSZE KROKI</h3>{["Zwiększyć intensywność treningu fizycznego","Pracować nad szybkością w kontrataku","Regularne minuty w meczach o wysokiej intensywności","Monitorować rozwój co 4 tygodnie"].map(x=><p key={x}>✓ {x}</p>)}</section>
          <section className="pr-card pr-motor"><h3>TRENER PRZYGOTOWANIA MOTORYCZNEGO</h3><div className="pr-motor-circles"><MiniDonut value="72" label="KONDYCJA" percent={72}/><MiniDonut value="68" label="SIŁA" percent={68}/><MiniDonut value="69" label="SZYBKOŚĆ" percent={69}/></div><p>PARAMETRY MOTORYCZNE NA STABILNYM POZIOMIE.</p><button>UTRZYMAĆ OBECNY PLAN</button></section>
        </section>
      </main>
    </div>
  );
}

function Nav({icon,label,active}){return <div className={active?"pr-nav active":"pr-nav"}>{icon}<span>{label}</span></div>}
function Metric({icon,title,value,sub,range,type}){return <section className={`pr-card pr-metric ${type}`}>{icon}<div><span className="pr-kicker">{title}</span><strong>{value}</strong><small>{sub}</small><b>{range}</b></div><MiniSpark /></section>}
function Attr({icon,label,value,bad}){return <div className={bad?"pr-attr bad":"pr-attr"}><i>{icon}</i><b>{label}</b><span><em style={{width:`${value}%`}} /></span><strong>{value}<small>/100</small></strong></div>}
function Rec({icon,title,text}){return <div className="pr-rec"><i>{icon}</i><p><span>{title}</span><b>{text}</b></p></div>}

function Donut({value,label,size=170}){const r=68,c=2*Math.PI*r,d=value/100*c;return <svg className="pr-donut" width={size} height={size} viewBox="0 0 170 170"><defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="85" cy="85" r="68" fill="none" stroke="#172136" strokeWidth="14"/><circle cx="85" cy="85" r="68" fill="none" stroke="#21f5a8" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${d} ${c-d}`} transform="rotate(-90 85 85)" filter="url(#glow)"/><text x="85" y="84" textAnchor="middle" className="v">{value}</text><text x="85" y="108" textAnchor="middle" className="l">{label}</text></svg>}
function MiniDonut({value,label,percent}){const r=30,c=2*Math.PI*r,d=percent/100*c;return <svg className="pr-mini-donut" viewBox="0 0 82 82"><circle cx="41" cy="41" r={r} fill="none" stroke="#172136" strokeWidth="8"/><circle cx="41" cy="41" r={r} fill="none" stroke="#21f5a8" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${d} ${c-d}`} transform="rotate(-90 41 41)"/><text x="41" y="39" textAnchor="middle">{value}</text><text x="41" y="57" textAnchor="middle">{label}</text></svg>}
function Gauge({value}){return <svg className="pr-gauge" viewBox="0 0 220 140"><path d="M35 115 A75 75 0 0 1 185 115" fill="none" stroke="#172136" strokeWidth="18" strokeLinecap="round"/><path d="M35 115 A75 75 0 0 1 158 58" fill="none" stroke="#20f4a6" strokeWidth="18" strokeLinecap="round"/><text x="110" y="112" textAnchor="middle">{value}%</text><text x="110" y="132" textAnchor="middle">POWYŻEJ ŚREDNIEJ</text></svg>}

function FormChart(){const xs=[30,135,240,345,450,555],ys=[145,95,120,56,42,82],pts=xs.map((x,i)=>`${x},${ys[i]}`).join(" ");return <svg className="pr-formchart" viewBox="0 0 600 190"><defs><linearGradient id="formfill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#19f5a3" stopOpacity=".44"/><stop offset="1" stopColor="#19f5a3" stopOpacity="0"/></linearGradient></defs>{[40,80,120,160].map(y=><line key={y} x1="26" x2="570" y1={y} y2={y} stroke="#263450" strokeDasharray="4 7"/>)}<path d={`M${pts} L555 170 L30 170 Z`} fill="url(#formfill)"/><polyline points={pts} fill="none" stroke="#18f5a3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{xs.map((x,i)=><circle key={x} cx={x} cy={ys[i]} r="6" fill="#18f5a3" stroke="#06111e" strokeWidth="3"/>)}{xs.map((x,i)=><text key={`t${x}`} x={x} y="184" textAnchor="middle">{i+1}</text>)}</svg>}
function MiniSpark(){return <svg className="pr-spark" viewBox="0 0 180 70"><path d="M5 45 C35 38,45 55,70 43 S105 42,120 30 S150 18,174 4" fill="none" stroke="#1df5a6" strokeWidth="3"/><path d="M5 45 C35 38,45 55,70 43 S105 42,120 30 S150 18,174 4 L174 70 L5 70 Z" fill="#1df5a6" opacity=".13"/></svg>}
function MiniLine(){return <svg className="pr-miniline" viewBox="0 0 340 145"><path d="M20 110 L70 78 L115 84 L160 68 L205 73 L250 55 L300 42" fill="none" stroke="#20f4a6" strokeWidth="4"/><path d="M20 110 L70 78 L115 84 L160 68 L205 73 L250 55 L300 42 L300 130 L20 130 Z" fill="#20f4a6" opacity=".16"/></svg>}
function PitchMini(){return <svg className="pr-pitch" viewBox="0 0 220 100"><rect x="4" y="4" width="212" height="92" fill="#07101d" stroke="#536177"/><line x1="110" y1="4" x2="110" y2="96" stroke="#536177"/><circle cx="110" cy="50" r="22" fill="none" stroke="#536177"/><rect x="4" y="27" width="28" height="46" fill="none" stroke="#536177"/><rect x="188" y="27" width="28" height="46" fill="none" stroke="#536177"/><circle cx="118" cy="48" r="28" fill="url(#posgrad)"/><defs><radialGradient id="posgrad"><stop stopColor="#afff23"/><stop offset=".45" stopColor="#17d56d" stopOpacity=".8"/><stop offset="1" stopColor="#17d56d" stopOpacity="0"/></radialGradient></defs></svg>}
function HeatMap(){return <svg className="pr-heatmap" viewBox="0 0 520 260"><defs><radialGradient id="heat"><stop stopColor="#ff201b" stopOpacity=".96"/><stop offset=".34" stopColor="#ffd829" stopOpacity=".85"/><stop offset=".66" stopColor="#51ff60" stopOpacity=".38"/><stop offset="1" stopColor="#51ff60" stopOpacity="0"/></radialGradient></defs><rect x="10" y="20" width="500" height="220" rx="4" fill="#071120" stroke="#536177"/><line x1="260" y1="20" x2="260" y2="240" stroke="#536177"/><circle cx="260" cy="130" r="42" fill="none" stroke="#536177"/><rect x="10" y="78" width="58" height="104" fill="none" stroke="#536177"/><rect x="452" y="78" width="58" height="104" fill="none" stroke="#536177"/><rect x="10" y="102" width="25" height="56" fill="none" stroke="#536177"/><rect x="485" y="102" width="25" height="56" fill="none" stroke="#536177"/><circle cx="218" cy="130" r="62" fill="url(#heat)"/><circle cx="300" cy="138" r="72" fill="url(#heat)" opacity=".92"/><circle cx="365" cy="96" r="48" fill="url(#heat)" opacity=".86"/><circle cx="165" cy="92" r="44" fill="url(#heat)" opacity=".78"/><circle cx="112" cy="162" r="36" fill="url(#heat)" opacity=".55"/><circle cx="410" cy="178" r="34" fill="url(#heat)" opacity=".45"/></svg>}
function PhotoPlaceholder(){return <svg className="pr-face" viewBox="0 0 300 470"><defs><linearGradient id="phbg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7e38ff" stopOpacity=".6"/><stop offset=".55" stopColor="#07101f"/><stop offset="1" stopColor="#12e99b" stopOpacity=".25"/></linearGradient></defs><rect width="300" height="470" fill="url(#phbg)"/><path d="M70 420 C95 260,205 260,230 420" fill="#10192b" opacity=".95"/><circle cx="150" cy="150" r="74" fill="#1b263d"/><path d="M80 135 C85 55,210 38,225 136 C185 95,125 96,80 135Z" fill="#253653"/><text x="150" y="250" textAnchor="middle" fill="#63708c" fontSize="16" fontWeight="800">PLAYER PHOTO</text></svg>}
function InvestIcon(){return <svg className="pr-investicon" viewBox="0 0 150 150"><circle cx="75" cy="75" r="58" fill="none" stroke="#ffd329" strokeWidth="9"/><text x="75" y="84" textAnchor="middle">8</text><text x="101" y="84">/10</text></svg>}

const iconProps={width:26,height:26,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
function HomeIcon(){return <svg {...iconProps}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>}
function TargetIcon(){return <svg {...iconProps}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>}
function TrendIcon(){return <svg {...iconProps}><path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/></svg>}
function CompareIcon(){return <svg {...iconProps}><path d="M5 7h14M5 17h14"/><path d="M8 4v6M16 14v6"/></svg>}
function HistoryIcon(){return <svg {...iconProps}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/><path d="M12 7v5l4 2"/></svg>}
function NoteIcon(){return <svg {...iconProps}><path d="M4 20h16"/><path d="M6 16l10-10 3 3-10 10H6z"/></svg>}
function CoinsIcon(){return <svg className="pr-bigicon" viewBox="0 0 64 64"><ellipse cx="28" cy="14" rx="17" ry="8" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M11 14v28c0 5 8 9 17 9s17-4 17-9V14" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M45 25c9 0 16 4 16 9s-7 9-16 9" fill="none" stroke="currentColor" strokeWidth="4"/></svg>}
function BrainIcon(){return <svg className="pr-bigicon" viewBox="0 0 64 64"><path d="M26 10c-8 0-13 6-13 13-5 2-8 6-8 12 0 7 5 12 12 13 2 5 7 8 13 6V10zM38 10c8 0 13 6 13 13 5 2 8 6 8 12 0 7-5 12-12 13-2 5-7 8-13 6V10z" fill="none" stroke="currentColor" strokeWidth="4"/></svg>}
function PassIcon(){return <svg {...iconProps}><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>}
function EyeIcon(){return <svg {...iconProps}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>}
function NodesIcon(){return <svg {...iconProps}><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="12" cy="6" r="3"/><path d="M8 16l3-7M16 16l-3-7M9 18h6"/></svg>}
function CounterIcon(){return <svg {...iconProps}><path d="M4 17l6-6 4 4 6-8"/></svg>}
function ShieldIcon(){return <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
function PulseIcon(){return <svg {...iconProps}><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>}
function TargetBadge(){return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#151c34" stroke="#ff335f" strokeWidth="3"/><circle cx="24" cy="24" r="8" fill="none" stroke="#ff335f" strokeWidth="3"/><path d="M24 24l11-11" stroke="#ff335f" strokeWidth="4"/></svg>}
function GymBadge(){return <svg viewBox="0 0 48 48"><rect x="8" y="20" width="32" height="8" rx="3" fill="none" stroke="#ff4d93" strokeWidth="4"/><path d="M5 15v18M43 15v18M16 12v24M32 12v24" stroke="#ff4d93" strokeWidth="4"/></svg>}
function ShieldBadge(){return <svg viewBox="0 0 48 48"><path d="M24 4l17 7v12c0 12-8 18-17 21C15 41 7 35 7 23V11z" fill="#162138" stroke="#ffd329" strokeWidth="3"/><path d="M17 24l5 5 10-12" fill="none" stroke="#ffd329" strokeWidth="4"/></svg>}
