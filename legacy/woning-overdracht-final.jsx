import { useState, useMemo } from "react";

const TX = {
  erfVrijKind: 26230, erfVrijPartner: 828035, schenkVrijKind: 6908, eenmalig: 33129,
  r1: .10, r2: .20, grens: 158669, ovb8: .08, rente: .06,
  box3Forfait: .06, box3Tarief: .36, box3Vrij: 59357, ewfPct: .0035,
};
const bel = b => b <= 0 ? 0 : b <= TX.grens ? b * TX.r1 : TX.grens * TX.r1 + (b - TX.grens) * TX.r2;
const f = n => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));
const C = { blauw: "#01689b", donker: "#154273", licht: "#e8f3f8", geel: "#ffb612", oranje: "#e17000", groen: "#39870c", rood: "#d52b1e", grijs: "#696969", lichtgrijs: "#f3f3f3", wit: "#fff", tekst: "#333", rand: "#c8c8c8", paars: "#6a1b9a" };

const Blok = ({ title, children, accent = C.blauw, sub }) => (
  <div style={{ background: C.wit, border: `1px solid ${C.rand}`, borderTop: `4px solid ${accent}`, marginBottom: 16 }}>
    {title && <div style={{ background: C.lichtgrijs, borderBottom: `1px solid ${C.rand}`, padding: "10px 14px" }}>
      <h3 style={{ margin: 0, fontSize: 14, color: C.donker, fontWeight: 700 }}>{title}</h3>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: C.grijs }}>{sub}</p>}
    </div>}
    <div style={{ padding: "12px 14px" }}>{children}</div>
  </div>
);
const Inp = ({ label, value: v, onChange: oc, help, min = 0, max, step = 1000, suffix }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 110 }}>
    <label style={{ fontSize: 10, fontWeight: 700, color: C.donker, textTransform: "uppercase" }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <input type="number" value={v} onChange={e => oc(Number(e.target.value))} min={min} max={max} step={step}
        style={{ padding: "7px 8px", border: `1px solid ${C.rand}`, fontSize: 14, fontWeight: 700, width: "100%", outline: "none", boxSizing: "border-box" }} />
      {suffix && <span style={{ fontSize: 11, color: C.grijs, whiteSpace: "nowrap" }}>{suffix}</span>}
    </div>
    {help && <span style={{ fontSize: 9, color: C.grijs }}>{help}</span>}
  </div>
);
const Rij = ({ l, r: rv, kleur, bold, border: bd }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: bd ? `2px solid ${C.rand}` : "none", marginTop: bd ? 3 : 0 }}>
    <span style={{ fontSize: 12, fontWeight: bold ? 700 : 400, color: kleur || C.tekst }}>{l}</span>
    <span style={{ fontSize: bold ? 14 : 12, fontWeight: 700, color: kleur || C.tekst, whiteSpace: "nowrap" }}>{rv}</span>
  </div>
);
const Btn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "5px 12px", background: active ? C.blauw : C.wit, color: active ? C.wit : C.tekst, border: `1px solid ${active ? C.blauw : C.rand}`, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{children}</button>
);
const Stat = ({ t, v: val, c = C.donker, accent }) => (
  <div style={{ background: C.licht, padding: "7px 9px", borderLeft: accent ? `3px solid ${C.blauw}` : "none" }}>
    <div style={{ fontSize: 9, color: C.blauw, fontWeight: 700, textTransform: "uppercase" }}>{t}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{val}</div>
  </div>
);
const Taart = ({ p1, p2, a1, a2 }) => {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="64" height="64" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e0e0e0" strokeWidth="14" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={C.groen} strokeWidth="14" strokeDasharray={`${c * p2} ${c}`} transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={C.rood} strokeWidth="14" strokeDasharray={`${c * p1} ${c}`} strokeDashoffset={`${-c * p2}`} transform="rotate(-90 50 50)" />
        <text x="50" y="47" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: C.donker }}>{Math.round(p2 * 100)}%</text>
        <text x="50" y="59" textAnchor="middle" style={{ fontSize: 7, fill: C.grijs }}>netto</text>
      </svg>
      <div style={{ fontSize: 9, lineHeight: 1.7 }}>
        <div><span style={{ display: "inline-block", width: 8, height: 8, background: C.groen, marginRight: 3 }} />Netto: <b>{a2}</b></div>
        <div><span style={{ display: "inline-block", width: 8, height: 8, background: C.rood, marginRight: 3 }} />Belasting: <b>{a1}</b></div>
      </div>
    </div>
  );
};

const TH = { padding: "5px 5px", borderBottom: `1px solid ${C.rand}`, fontSize: 9, whiteSpace: "nowrap", textAlign: "left" };
const TD = { padding: "3px 5px", fontSize: 9 };

function Tijdlijn({ rows, columns, footer }) {
  return (
    <div style={{ border: `1px solid ${C.rand}`, marginTop: 10, overflow: "auto" }}>
      <div style={{ background: C.lichtgrijs, padding: "6px 10px", borderBottom: `1px solid ${C.rand}` }}>
        <b style={{ fontSize: 11 }}>Tijdlijn per jaar</b>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: C.lichtgrijs }}>
          {columns.map((c, i) => <th key={i} style={{ ...TH, color: c.color || C.tekst }}>{c.label}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${C.lichtgrijs}` }}>
              {r.map((cell, ci) => (
                <td key={ci} style={{ ...TD, color: columns[ci]?.color || C.tekst, fontWeight: ci === 0 ? 700 : cell.bold ? 700 : 400 }}>
                  {typeof cell === "object" ? cell.v : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div style={{ padding: "6px 10px", background: C.lichtgrijs, borderTop: `1px solid ${C.rand}`, fontSize: 9, color: C.grijs, lineHeight: 1.6 }}>{footer}</div>}
    </div>
  );
}

export default function App() {
  const [woz, sW] = useState(700000);
  const [rest, sR] = useState(175000);
  const [hypoR, sHR] = useState(3.5);
  const [mndl, sML] = useState(900);
  const [aflVrij, sAV] = useState(true);
  const [nk, sK] = useState(2);
  const [jr, sJ] = useState(10);
  const [partner, sP] = useState(false);
  const [tab, sT] = useState(2);
  const [verd, setVerd] = useState([50, 50]);
  const [stijging, setSt] = useState(3);
  const [aftrekPct, setAP] = useState(36.97);
  const [partnerPct, setPartnerPct] = useState(0); // 0 = auto (wettelijke verdeling)

  const k = Math.max(nk, 1);
  const v = useMemo(() => {
    if (verd.length === k) return verd;
    const n = Array.from({ length: k }, (_, i) => i < verd.length ? verd[i] : Math.round(100 / k));
    const s = n.reduce((a, b) => a + b, 0); if (s !== 100) n[n.length - 1] += 100 - s; return n;
  }, [k, verd]);
  const setKP = (idx, val) => {
    const n = [...v]; n[idx] = Math.max(0, Math.min(100, val));
    const sr = n.filter((_, i) => i !== idx).reduce((a, b) => a + b, 0);
    const r2 = 100 - n[idx];
    n.forEach((_, i) => { if (i !== idx) n[i] = sr > 0 ? Math.round(n[i] / sr * r2) : Math.round(r2 / (k - 1)); });
    const t = n.reduce((a, b) => a + b, 0); if (t !== 100) n[n.length - 1] += 100 - t; setVerd(n);
  };

  const mndRente = rest * (hypoR / 100) / 12;
  const mndAfl = aflVrij ? 0 : Math.max(0, mndl - mndRente);
  const jrAfl = mndAfl * 12;
  const netto = Math.max(0, woz - rest);
  const ewf = woz * TX.ewfPct;
  const hraJaar = Math.max(0, mndRente * 12 - ewf) * (aftrekPct / 100);
  const aantalE = partner ? k + 1 : k;
  const effectiefPartnerPct = partner ? (partnerPct === 0 ? 100 / aantalE : partnerPct) : 0;
  const effectiefKindPctTotaal = 100 - effectiefPartnerPct;

  const calc = useMemo(() => {
    const pT_obj = partner ? (() => { const d = netto * effectiefPartnerPct / 100; return { deel: d, belasting: bel(Math.max(0, d - TX.erfVrijPartner)), pct: effectiefPartnerPct }; })() : null;
    const pTax = pT_obj?.belasting || 0;

    // Helper: bereken erfbelasting voor alle kinderen gegeven een netto bedrag
    const erfTaxAll = (netBedrag) => {
      const kindDeel = partner ? netBedrag * effectiefKindPctTotaal / 100 : netBedrag;
      let tot = 0;
      for (let i = 0; i < k; i++) {
        const pk = kindDeel * v[i] / 100;
        tot += bel(Math.max(0, pk - TX.erfVrijKind));
      }
      return tot;
    };

    // Box 3 helper: gegeven totale vordering/certificaten verdeeld over kinderen
    const box3All = (totaal) => {
      let b = 0;
      for (let i = 0; i < k; i++) {
        const vord = totaal * v[i] / 100;
        const grondslag = Math.max(0, vord - TX.box3Vrij);
        if (grondslag > 0) b += vord * TX.box3Forfait * (grondslag / vord) * TX.box3Tarief;
      }
      return b;
    };

    // ── TIMELINES ──
    const tl1 = [], tl2 = [], tl3 = [];
    let schuld3 = 0, totR3 = 0, totG3 = 0;
    let totG2 = 0;
    let totBox3_1 = 0, totBox3_2 = 0, totBox3_3 = 0;
    let totHRA1 = 0, totHRA2 = 0, totHRA3 = 0;

    const ovb2 = woz * TX.ovb8 + 4000;
    const eenmalig3 = TX.eenmalig * k;

    for (let j = 1; j <= Math.min(jr, 40); j++) {
      const restH = aflVrij ? rest : Math.max(0, rest - jrAfl * j);
      const wozJ = woz * Math.pow(1 + stijging / 100, j);
      const mndRenteJ = restH * (hypoR / 100) / 12;
      const ewfJ = wozJ * TX.ewfPct;
      const hraJ = Math.max(0, mndRenteJ * 12 - ewfJ) * (aftrekPct / 100);
      const nettoJ = Math.max(0, wozJ - restH);

      // ── OPTIE 1: Niks doen ──
      const erfTax1 = erfTaxAll(nettoJ) + pTax;
      totHRA1 += hraJ;
      // Geen box 3 (kinderen hebben niks)
      tl1.push({ j, wozJ, restH, nettoJ, erfTax: erfTax1, hraJ, box3: 0, totHRA: totHRA1, totBox3: 0 });

      // ── OPTIE 2: STAK ──
      const sPK2 = TX.schenkVrijKind * k;
      totG2 += sPK2;
      const kindNettoJ2 = partner ? nettoJ * effectiefKindPctTotaal / 100 : nettoJ;
      const rv2 = Math.max(0, kindNettoJ2 - totG2);
      let erfTax2 = pTax;
      for (let i = 0; i < k; i++) erfTax2 += bel(Math.max(0, rv2 * v[i] / 100 - TX.erfVrijKind));
      const b3_2 = box3All(totG2); // Certificaten = box 3
      totBox3_2 += b3_2;
      // STAK: ouder verliest HRA!
      totHRA2 += 0; // HRA = 0 bij STAK
      tl2.push({ j, wozJ, restH, geschonken: totG2, erfTax: erfTax2 + ovb2, hraJ: 0, hraVerlies: hraJ, box3: b3_2, totBox3: totBox3_2, totHRA: 0 });

      // ── OPTIE 3: Papieren schenking ──
      const s3 = TX.schenkVrijKind * k + (j === 1 ? eenmalig3 : 0);
      schuld3 += s3; totG3 += s3;
      const rj3 = schuld3 * TX.rente; totR3 += rj3;
      const kindNettoJ3 = partner ? nettoJ * effectiefKindPctTotaal / 100 : nettoJ;
      const rv3 = Math.max(0, kindNettoJ3 - totG3);
      let erfTax3 = 750 + pTax;
      for (let i = 0; i < k; i++) erfTax3 += bel(Math.max(0, rv3 * v[i] / 100 - TX.erfVrijKind));
      const b3_3 = box3All(totG3); // Vorderingen = box 3
      totBox3_3 += b3_3;
      totHRA3 += hraJ; // Ouder behoudt HRA
      tl3.push({ j, wozJ, restH, geschonken: totG3, rente: rj3, renteMnd: rj3 / 12, totRente: totR3, erfTax: erfTax3, hraJ, box3: b3_3, totBox3: totBox3_3, totHRA: totHRA3 });
    }

    // Eindresultaten
    const wozEind = woz * Math.pow(1 + stijging / 100, jr);
    const restEind = aflVrij ? rest : Math.max(0, rest - jrAfl * jr);
    const nettoEind = Math.max(0, wozEind - restEind);

    const tot1 = tl1[tl1.length - 1]?.erfTax || 0;
    const tot2 = tl2[tl2.length - 1]?.erfTax || 0;
    const tot3 = tl3[tl3.length - 1]?.erfTax || 0;

    // Per-kind berekeningen (voor de kaarten)
    const kindDeelNu = (partner ? netto * effectiefKindPctTotaal / 100 : netto);
    const kinderen = [];
    for (let i = 0; i < k; i++) {
      const pct = v[i] / 100;
      const deel = kindDeelNu * pct;
      const deelEind = (partner ? nettoEind * effectiefKindPctTotaal / 100 : nettoEind) * pct;

      const t1 = bel(Math.max(0, deelEind - TX.erfVrijKind));
      const n1 = deel - t1;

      const g2 = TX.schenkVrijKind * jr;
      const t2k = bel(Math.max(0, Math.max(0, deelEind - g2) - TX.erfVrijKind));
      const ovbPK = ovb2 / k;
      const totK2 = ovbPK + t2k; const n2 = deel - totK2;

      const g3 = TX.schenkVrijKind * jr + TX.eenmalig;
      const t3k = bel(Math.max(0, Math.max(0, deelEind - g3) - TX.erfVrijKind));
      const totK3 = 750 / k + t3k; const n3 = deel - totK3;

      kinderen.push({ i: i + 1, pct: v[i], deel, t1, n1, ovbPK, g2, t2k, totK2, n2, g3, t3k, totK3, n3 });
    }

    return { tl1, tl2, tl3, tot1, tot2, tot3, ovb2, kinderen, pT_obj, pTax, totR3, totBox3_2, totBox3_3, totHRA1: totHRA1, hraVerliesSTAK: totHRA1, mx: Math.max(tot1, tot2, tot3, 1) };
  }, [woz, rest, netto, k, jr, v, aflVrij, jrAfl, partner, effectiefPartnerPct, effectiefKindPctTotaal, stijging, hypoR, aftrekPct, ewf, mndRente, hraJaar]);

  const barW = val => `${Math.max(10, val / calc.mx * 100)}%`;
  const sc = [
    { id: 0, n: "Optie 1: Niks doen", v: calc.tot1, c: C.oranje },
    { id: 1, n: "Optie 2: STAK", v: calc.tot2, c: C.rood },
    { id: 2, n: "Optie 3: Papieren schenking", v: calc.tot3, c: C.groen },
  ];

  return (
    <div style={{ fontFamily: "'Calibri','Arial',sans-serif", background: C.wit, minHeight: "100vh" }}>
      <div style={{ background: C.blauw, padding: "10px 14px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Rekentool (niet-officieel)</div>
          <h1 style={{ margin: 0, color: C.wit, fontSize: 16, fontWeight: 700 }}>Woning overdragen aan uw kinderen — volledige berekening</h1>
        </div>
      </div>
      <div style={{ background: C.geel, padding: "5px 14px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", fontSize: 10, color: C.donker }}><b>Let op:</b> Indicatieve berekening (tarieven 2026). Geen fiscaal advies.</div>
      </div>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "12px 12px 40px" }}>

        {/* INPUTS */}
        <Blok title="Invoer">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            <Inp label="WOZ-waarde" value={woz} onChange={sW} />
            <Inp label="Hypotheek" value={rest} onChange={sR} />
            <Inp label="Hypo rente" value={hypoR} onChange={sHR} step={0.1} suffix="%" />
            <Inp label="Maandlasten" value={mndl} onChange={sML} step={50} suffix="€/mnd" />
            <Inp label="Waardestijging/jr" value={stijging} onChange={setSt} step={0.5} suffix="%" />
            <Inp label="HRA-tarief" value={aftrekPct} onChange={setAP} step={0.01} suffix="%" />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700 }}>Hypotheek:</span>
            <Btn active={aflVrij} onClick={() => sAV(true)}>Aflossingsvrij</Btn>
            <Btn active={!aflVrij} onClick={() => sAV(false)}>Annuïteit</Btn>
            <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 10 }}>Partner?</span>
            <Btn active={!partner} onClick={() => sP(false)}>Nee</Btn>
            <Btn active={partner} onClick={() => sP(true)}>Ja</Btn>
          </div>
          {partner && (
            <div style={{ background: C.licht, border: `1px solid ${C.blauw}`, padding: 10, marginBottom: 8, fontSize: 11, lineHeight: 1.7 }}>
              <b style={{ color: C.blauw }}>Wat erft de partner?</b>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <Btn active={partnerPct === 0} onClick={() => setPartnerPct(0)}>Wettelijke verdeling ({Math.round(100 / (k + 1))}%)</Btn>
                <Btn active={partnerPct > 0} onClick={() => setPartnerPct(50)}>Zelf instellen</Btn>
                {partnerPct > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="range" min={0} max={100} value={partnerPct} onChange={e => setPartnerPct(Number(e.target.value))} style={{ width: 100, accentColor: C.paars }} />
                    <input type="number" value={partnerPct} onChange={e => setPartnerPct(Number(e.target.value))} min={0} max={100} step={1}
                      style={{ width: 45, padding: "3px 4px", border: `1px solid ${C.rand}`, fontSize: 12, fontWeight: 700, textAlign: "center" }} />
                    <span style={{ fontSize: 11, color: C.grijs }}>%</span>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11 }}>
                <span><span style={{ color: C.paars, fontWeight: 700 }}>Partner:</span> {Math.round(effectiefPartnerPct)}% = {f(netto * effectiefPartnerPct / 100)} <span style={{ color: C.grijs }}>(vrijstelling {f(TX.erfVrijPartner)} → meestal €0 belasting)</span></span>
                <span><span style={{ color: C.blauw, fontWeight: 700 }}>Kinderen:</span> {Math.round(effectiefKindPctTotaal)}% = {f(netto * effectiefKindPctTotaal / 100)} <span style={{ color: C.grijs }}>(verdeeld volgens percentages hieronder)</span></span>
              </div>
              <div style={{ marginTop: 6, fontSize: 10, color: C.grijs }}>
                Bij de <b>wettelijke verdeling</b> krijgen partner en kinderen elk een gelijk deel (1/{k + 1}). De partner krijgt alle bezittingen in gebruik — kinderen krijgen een vordering die pas opeisbaar is bij overlijden van de partner. Via een <b>testament</b> kan de ouder een ander percentage aan de partner toewijzen.
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, alignItems: "end" }}>
            <Inp label="Kinderen" value={nk} onChange={val => { sK(val); setVerd(Array.from({ length: Math.max(val, 1) }, () => Math.round(100 / Math.max(val, 1)))); }} min={1} max={8} step={1} />
            <Inp label="Jaren schenken" value={jr} onChange={sJ} min={1} max={40} step={1} />
            {v.map((pct, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 80 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.donker }}>Kind {i + 1}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <input type="range" min={0} max={100} value={pct} onChange={e => setKP(i, Number(e.target.value))} style={{ width: 60, accentColor: C.blauw }} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 5 }}>
            <Stat t="Overwaarde nu" v={f(netto)} accent />
            <Stat t={`WOZ na ${jr} jr`} v={f(woz * Math.pow(1 + stijging / 100, jr))} c={C.groen} />
            <Stat t="HRA/jaar" v={f(hraJaar)} c={C.groen} />
            <Stat t="Maandlasten bank" v={`${f(mndl)}/mnd`} />
            {partner && <Stat t={`Partner ontvangt (${Math.round(effectiefPartnerPct)}%)`} v={f(netto * effectiefPartnerPct / 100)} c={C.paars} />}
            {partner && <Stat t={`Kinderen samen (${Math.round(effectiefKindPctTotaal)}%)`} v={f(netto * effectiefKindPctTotaal / 100)} c={C.blauw} />}
          </div>
        </Blok>

        {/* VERGELIJKING */}
        <Blok title="Vergelijking">
          {sc.map(s => (
            <button key={s.id} onClick={() => sT(s.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", marginBottom: 4, background: tab === s.id ? C.lichtgrijs : C.wit, border: `2px solid ${tab === s.id ? C.blauw : C.rand}`, cursor: "pointer", textAlign: "left" }}>
              <span style={{ minWidth: 155, fontSize: 11, fontWeight: 700 }}>{s.n}</span>
              <div style={{ flex: 1, height: 20, background: C.lichtgrijs, overflow: "hidden" }}>
                <div style={{ height: "100%", width: barW(s.v), background: s.c, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4, fontSize: 10, fontWeight: 700, color: C.wit, transition: "width 0.4s", minWidth: 45 }}>{f(s.v)}</div>
              </div>
            </button>
          ))}
          {sc[0].v - sc[2].v > 0 && <div style={{ background: "#e8f5e9", border: `1px solid ${C.groen}`, padding: "5px 10px", marginTop: 3, fontSize: 11 }}>✓ Papieren schenking bespaart <b>{f(sc[0].v - sc[2].v)}</b></div>}
        </Blok>

        {/* DETAIL OPTIE */}
        {sc.map(s => tab === s.id && (
          <Blok key={s.id} title={s.n} accent={s.c}>
            {/* Partner kaart */}
            {partner && calc.pT_obj && (
              <div style={{ border: `2px solid ${C.paars}`, padding: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.paars }}>Partner (langstlevende)</span>
                  <span style={{ fontSize: 10, background: "#f3e5f5", padding: "1px 6px", fontWeight: 700, color: C.paars }}>{Math.round(calc.pT_obj.pct)}%</span>
                </div>
                <Rij l="Erfdeel partner" r={f(calc.pT_obj.deel)} />
                <Rij l="Af: partnervrijstelling" r={`−${f(TX.erfVrijPartner)}`} />
                <Rij l="Erfbelasting partner" r={f(calc.pT_obj.belasting)} kleur={calc.pT_obj.belasting > 0 ? C.rood : C.groen} bold border />
                {calc.pT_obj.belasting === 0 && <div style={{ fontSize: 10, color: C.groen, marginTop: 2 }}>✓ Partner betaalt geen belasting — erfdeel valt binnen de vrijstelling.</div>}
                <div style={{ fontSize: 10, color: C.grijs, marginTop: 4 }}>De partner krijgt alle bezittingen in gebruik. Kinderen krijgen een vordering die pas opeisbaar is bij overlijden partner.</div>
              </div>
            )}
            {/* Kindkaarten */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {calc.kinderen.map((kd, i) => {
                const d = s.id === 0 ? { g: 0, tax: kd.t1, net: kd.n1, totK: kd.t1 }
                  : s.id === 1 ? { g: kd.g2, tax: kd.t2k, net: kd.n2, totK: kd.totK2 }
                    : { g: kd.g3, tax: kd.t3k, net: kd.n3, totK: kd.totK3 };
                const pT2 = d.totK / Math.max(kd.deel, 1), pK = Math.max(0, d.net / Math.max(kd.deel, 1));
                return (
                  <div key={i} style={{ border: `1px solid ${C.rand}`, padding: 8, flex: 1, minWidth: 175 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>Kind {kd.i}</span>
                      <span style={{ fontSize: 9, background: C.licht, padding: "1px 5px", fontWeight: 700, color: C.blauw }}>{kd.pct}%</span>
                    </div>
                    <Rij l="Bruto erfdeel" r={f(kd.deel)} />
                    {d.g > 0 && <Rij l="Al geschonken" r={`−${f(d.g)}`} kleur={C.groen} />}
                    {s.id === 1 && <Rij l="OVB-aandeel" r={`−${f(kd.ovbPK)}`} kleur={C.rood} />}
                    <Rij l="Erfbelasting" r={f(d.tax)} kleur={C.rood} bold border />
                    <Rij l="Netto" r={f(d.net)} kleur={C.groen} bold border />
                    <Taart p1={pT2} p2={pK} a1={f(d.totK)} a2={f(d.net)} />
                  </div>
                );
              })}
            </div>

            {/* Totaal */}
            <div style={{ background: s.id === 0 ? "#fff3e0" : s.id === 1 ? "#fce4ec" : "#e8f5e9", border: `1px solid ${s.c}`, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div><b>Totale erfbelasting</b></div>
              <span style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{f(s.v)}</span>
            </div>

            {/* ── TIJDLIJN OPTIE 1 ── */}
            {s.id === 0 && (
              <Tijdlijn
                columns={[
                  { label: "Jaar" }, { label: "WOZ-waarde" }, { label: "Hypotheek" },
                  { label: "Overwaarde" },
                  { label: "HRA ouder ✓", color: C.groen },
                  { label: "Box 3 kinderen", color: C.blauw },
                  { label: "Erfbelasting bij overlijden", color: C.rood },
                ]}
                rows={calc.tl1.map(t => [
                  t.j, f(t.wozJ), f(t.restH), f(t.nettoJ),
                  f(t.hraJ) + "/jr", "€ 0", f(t.erfTax)
                ])}
                footer={<>Totaal HRA-voordeel ouder over {jr} jaar: <b style={{ color: C.groen }}>{f(calc.totHRA1)}</b> · Kinderen betalen <b>geen</b> box 3 (hebben nog niks ontvangen). · Bij overlijden in jaar {jr}: erfbelasting <b style={{ color: C.rood }}>{f(calc.tot1)}</b> (bij WOZ {f(woz * Math.pow(1 + stijging / 100, jr))})</>}
              />
            )}

            {/* ── TIJDLIJN OPTIE 2 ── */}
            {s.id === 1 && (
              <>
                <div style={{ background: "#fce4ec", border: `1px solid ${C.rood}`, padding: 8, fontSize: 10, marginBottom: 6 }}>
                  <b>⚠ Direct betalen:</b> OVB {f(woz * TX.ovb8)} + notaris {f(4000)} = <b>{f(calc.ovb2)}</b><br />
                  <b>⚠ Ouder verliest HRA:</b> {f(hraJaar)}/jaar = <b>{f(calc.hraVerliesSTAK)}</b> over {jr} jaar
                </div>
                <Tijdlijn
                  columns={[
                    { label: "Jaar" }, { label: "WOZ-waarde" }, { label: "Geschonken cert." },
                    { label: "HRA verlies!", color: C.rood },
                    { label: "Box 3 kinderen/jr", color: C.blauw },
                    { label: "Bij overlijden (incl OVB)", color: C.rood },
                  ]}
                  rows={calc.tl2.map(t => [
                    t.j, f(t.wozJ), f(t.geschonken),
                    f(t.hraVerlies) + "/jr", f(t.box3), f(t.erfTax)
                  ])}
                  footer={<>Totaal HRA verloren: <b style={{ color: C.rood }}>{f(calc.hraVerliesSTAK)}</b> · Totaal box 3 kinderen: <b style={{ color: C.blauw }}>{f(calc.totBox3_2)}</b> · <b>Werkelijke totale kosten STAK zijn OVB + erfbelasting + HRA-verlies + box 3 = veel hoger dan alleen de {f(calc.tot2)} hierboven.</b></>}
                />
              </>
            )}

            {/* ── TIJDLIJN OPTIE 3 ── */}
            {s.id === 2 && (
              <>
                <div style={{ background: "#e8f5e9", border: `1px solid ${C.groen}`, padding: 8, fontSize: 10, marginBottom: 6, lineHeight: 1.7 }}>
                  <b>Rente:</b> Ouder betaalt 6%/jaar over de papieren schuld <b>aan de kinderen</b> (echt geld!). · <b>HRA:</b> Ouder behoudt hypotheekrenteaftrek. · <b>Box 3:</b> Kinderen betalen jaarlijks belasting over hun vordering.
                </div>
                <Tijdlijn
                  columns={[
                    { label: "Jaar" }, { label: "WOZ" }, { label: "Geschonken" },
                    { label: "Rente ouder→kind", color: C.oranje }, { label: "/maand", color: C.oranje },
                    { label: "Box 3/kind/jr", color: C.blauw },
                    { label: "HRA ouder ✓", color: C.groen },
                    { label: "Bij overlijden", color: C.rood },
                    { label: "Besparing", color: C.groen },
                  ]}
                  rows={calc.tl3.map(t => [
                    t.j, f(t.wozJ), f(t.geschonken),
                    f(t.rente) + "/jr", f(t.renteMnd),
                    f(t.box3 / k), f(t.hraJ) + "/jr",
                    f(t.erfTax), { v: f(calc.tot1 - t.erfTax), bold: true }
                  ])}
                  footer={<>Totalen {jr} jaar: Rente ouder→kinderen <b style={{ color: C.oranje }}>{f(calc.totR3)}</b> · Box 3 kinderen <b style={{ color: C.blauw }}>{f(calc.totBox3_3)}</b> · HRA ouder <b style={{ color: C.groen }}>{f(calc.tl3[calc.tl3.length - 1]?.totHRA || 0)}</b></>}
                />
              </>
            )}
          </Blok>
        ))}

        {/* BRONNEN */}
        <div style={{ borderTop: `1px solid ${C.rand}`, paddingTop: 10, fontSize: 8, color: C.grijs, lineHeight: 2 }}>
          <b style={{ color: C.donker, fontSize: 9 }}>Bronnen — tarieven 2026</b><br />
          {[
            ["Schenkingsvrijstelling: €6.908", "https://www.belastingdienst.nl/wps/wcm/connect/nl/schenken/content/hoeveel-mag-ik-mijn-kind-belastingvrij-schenken"],
            ["Eenmalige vrijstelling: €33.129", "https://www.belastingdienst.nl/wps/wcm/connect/nl/schenken/content/hoeveel-mag-ik-mijn-kind-belastingvrij-schenken"],
            ["Kindvrijstelling erf: €26.230", "https://www.belastingdienst.nl/wps/wcm/connect/nl/erfbelasting/content/hoeveel-erfbelasting-moet-ik-betalen"],
            ["Partnervrijstelling: €828.035", "https://www.belastingdienst.nl/wps/wcm/connect/nl/erfbelasting/content/hoeveel-erfbelasting-moet-ik-betalen"],
            ["Erf/schenk tarief: 10%/20%", "https://www.belastingdienst.nl/wps/wcm/connect/nl/erfbelasting/content/tarieven-702"],
            ["OVB: 2%/8%", "https://www.rijksoverheid.nl/onderwerpen/belasting-betalen/overdrachtsbelasting"],
            ["Papieren schenking: 6% rente", "https://www.belastingdienst.nl/wps/wcm/connect/nl/schenken/content/hoe-maak-ik-een-schenking-op-papier"],
            ["Box 3: 6% forfaitair, 36%, vrij €59.357", "https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026"],
            ["Eigenwoningforfait: 0,35%", "https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/eigenwoningforfait-702"],
            ["HRA max tarief: 36,97%", "https://www.rijksoverheid.nl/onderwerpen/inkomstenbelasting/vraag-en-antwoord/wat-is-het-tarief-voor-de-inkomstenbelasting"],
            ["Wettelijke verdeling", "https://www.rijksoverheid.nl/onderwerpen/erfenis/vraag-en-antwoord/wettelijke-verdeling-erfenis"],
          ].map(([t, u], i) => <span key={i}>* {t} — <a href={u} style={{ color: C.blauw }} target="_blank" rel="noopener">bron</a> · </span>)}
          <br /><b>Disclaimer:</b> Vereenvoudigd, indicatief, geen fiscaal advies. Niet meegenomen: Hillen-aftrek, overige bezittingen, testament, 2e overlijden partner, wetswijzigingen. Raadpleeg een fiscaal jurist.
        </div>
      </div>
    </div>
  );
}
