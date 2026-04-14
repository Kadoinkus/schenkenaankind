/* ============================
   Woning Overdracht Calculator
   Pure vanilla JS — no frameworks
   ============================ */

// ── Tax constants (2026) ──
const TX = {
  erfVrijKind: 26230, erfVrijPartner: 828035, schenkVrijKind: 6908, eenmalig: 33129,
  r1: 0.10, r2: 0.20, grens: 158669, ovb8: 0.08, rente: 0.06,
  box3Forfait: 0.06, box3Tarief: 0.36, box3Vrij: 59357, ewfPct: 0.0035,
};

// ── Helpers ──
const bel = b => b <= 0 ? 0 : b <= TX.grens ? b * TX.r1 : TX.grens * TX.r1 + (b - TX.grens) * TX.r2;
const f = n => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));

// ── State ──
const state = {
  woz: 700000,
  rest: 175000,
  hypoR: 3.5,
  mndl: 900,
  aflVrij: true,
  nk: 2,
  jr: 10,
  partner: false,
  tab: 2,
  verd: [50, 50],
  stijging: 3,
  aftrekPct: 36.97,
  partnerPct: 0, // 0 = wettelijke verdeling
};

function set(key, val) {
  state[key] = val;
  render();
}

// ── Derived values ──
function derived() {
  const k = Math.max(state.nk, 1);

  // Normalize verd array
  let v = state.verd;
  if (v.length !== k) {
    v = Array.from({ length: k }, (_, i) => i < v.length ? v[i] : Math.round(100 / k));
    const s = v.reduce((a, b) => a + b, 0);
    if (s !== 100) v[v.length - 1] += 100 - s;
    state.verd = v;
  }

  const mndRente = state.rest * (state.hypoR / 100) / 12;
  const mndAfl = state.aflVrij ? 0 : Math.max(0, state.mndl - mndRente);
  const jrAfl = mndAfl * 12;
  const netto = Math.max(0, state.woz - state.rest);
  const ewf = state.woz * TX.ewfPct;
  const hraJaar = Math.max(0, mndRente * 12 - ewf) * (state.aftrekPct / 100);
  const aantalE = state.partner ? k + 1 : k;
  const effectiefPartnerPct = state.partner ? (state.partnerPct === 0 ? 100 / aantalE : state.partnerPct) : 0;
  const effectiefKindPctTotaal = 100 - effectiefPartnerPct;

  return { k, v, mndRente, jrAfl, netto, ewf, hraJaar, effectiefPartnerPct, effectiefKindPctTotaal };
}

// ── Calculation engine ──
function calculate() {
  const d = derived();
  const { k, v, jrAfl, netto, hraJaar, effectiefPartnerPct, effectiefKindPctTotaal } = d;

  const pT_obj = state.partner ? (() => {
    const deel = netto * effectiefPartnerPct / 100;
    return { deel, belasting: bel(Math.max(0, deel - TX.erfVrijPartner)), pct: effectiefPartnerPct };
  })() : null;
  const pTax = pT_obj?.belasting || 0;

  const erfTaxAll = (netBedrag) => {
    const kindDeel = state.partner ? netBedrag * effectiefKindPctTotaal / 100 : netBedrag;
    let tot = 0;
    for (let i = 0; i < k; i++) tot += bel(Math.max(0, kindDeel * v[i] / 100 - TX.erfVrijKind));
    return tot;
  };

  const box3All = (totaal) => {
    let b = 0;
    for (let i = 0; i < k; i++) {
      const vord = totaal * v[i] / 100;
      const grondslag = Math.max(0, vord - TX.box3Vrij);
      if (grondslag > 0) b += vord * TX.box3Forfait * (grondslag / vord) * TX.box3Tarief;
    }
    return b;
  };

  const tl1 = [], tl2 = [], tl3 = [];
  let schuld3 = 0, totR3 = 0, totG3 = 0, totG2 = 0;
  let totBox3_2 = 0, totBox3_3 = 0;
  let totHRA1 = 0, totHRA2 = 0, totHRA3 = 0;
  const ovb2 = state.woz * TX.ovb8 + 4000;
  const eenmalig3 = TX.eenmalig * k;

  for (let j = 1; j <= Math.min(state.jr, 40); j++) {
    const restH = state.aflVrij ? state.rest : Math.max(0, state.rest - jrAfl * j);
    const wozJ = state.woz * Math.pow(1 + state.stijging / 100, j);
    const mndRenteJ = restH * (state.hypoR / 100) / 12;
    const ewfJ = wozJ * TX.ewfPct;
    const hraJ = Math.max(0, mndRenteJ * 12 - ewfJ) * (state.aftrekPct / 100);
    const nettoJ = Math.max(0, wozJ - restH);

    // Optie 1
    const erfTax1 = erfTaxAll(nettoJ) + pTax;
    totHRA1 += hraJ;
    tl1.push({ j, wozJ, restH, nettoJ, erfTax: erfTax1, hraJ, box3: 0, totHRA: totHRA1, totBox3: 0 });

    // Optie 2
    const sPK2 = TX.schenkVrijKind * k;
    totG2 += sPK2;
    const kindNettoJ2 = state.partner ? nettoJ * effectiefKindPctTotaal / 100 : nettoJ;
    const rv2 = Math.max(0, kindNettoJ2 - totG2);
    let erfTax2 = pTax;
    for (let i = 0; i < k; i++) erfTax2 += bel(Math.max(0, rv2 * v[i] / 100 - TX.erfVrijKind));
    const b3_2 = box3All(totG2);
    totBox3_2 += b3_2;
    tl2.push({ j, wozJ, restH, geschonken: totG2, erfTax: erfTax2 + ovb2, hraJ: 0, hraVerlies: hraJ, box3: b3_2, totBox3: totBox3_2, totHRA: 0 });

    // Optie 3
    const s3 = TX.schenkVrijKind * k + (j === 1 ? eenmalig3 : 0);
    schuld3 += s3; totG3 += s3;
    const rj3 = schuld3 * TX.rente; totR3 += rj3;
    const kindNettoJ3 = state.partner ? nettoJ * effectiefKindPctTotaal / 100 : nettoJ;
    const rv3 = Math.max(0, kindNettoJ3 - totG3);
    let erfTax3 = 750 + pTax;
    for (let i = 0; i < k; i++) erfTax3 += bel(Math.max(0, rv3 * v[i] / 100 - TX.erfVrijKind));
    const b3_3 = box3All(totG3);
    totBox3_3 += b3_3;
    totHRA3 += hraJ;
    tl3.push({ j, wozJ, restH, geschonken: totG3, rente: rj3, renteMnd: rj3 / 12, totRente: totR3, erfTax: erfTax3, hraJ, box3: b3_3, totBox3: totBox3_3, totHRA: totHRA3 });
  }

  const wozEind = state.woz * Math.pow(1 + state.stijging / 100, state.jr);
  const restEind = state.aflVrij ? state.rest : Math.max(0, state.rest - jrAfl * state.jr);
  const nettoEind = Math.max(0, wozEind - restEind);

  const tot1 = tl1[tl1.length - 1]?.erfTax || 0;
  const tot2 = tl2[tl2.length - 1]?.erfTax || 0;
  const tot3 = tl3[tl3.length - 1]?.erfTax || 0;

  const kindDeelNu = state.partner ? netto * effectiefKindPctTotaal / 100 : netto;
  const kinderen = [];
  for (let i = 0; i < k; i++) {
    const pct = v[i] / 100;
    const deel = kindDeelNu * pct;
    const deelEind = (state.partner ? nettoEind * effectiefKindPctTotaal / 100 : nettoEind) * pct;
    const t1 = bel(Math.max(0, deelEind - TX.erfVrijKind));
    const n1 = deel - t1;
    const g2 = TX.schenkVrijKind * state.jr;
    const t2k = bel(Math.max(0, Math.max(0, deelEind - g2) - TX.erfVrijKind));
    const ovbPK = ovb2 / k;
    const totK2 = ovbPK + t2k; const n2 = deel - totK2;
    const g3 = TX.schenkVrijKind * state.jr + TX.eenmalig;
    const t3k = bel(Math.max(0, Math.max(0, deelEind - g3) - TX.erfVrijKind));
    const totK3 = 750 / k + t3k; const n3 = deel - totK3;
    kinderen.push({ i: i + 1, pct: v[i], deel, t1, n1, ovbPK, g2, t2k, totK2, n2, g3, t3k, totK3, n3 });
  }

  const mx = Math.max(tot1, tot2, tot3, 1);
  return { d, tl1, tl2, tl3, tot1, tot2, tot3, ovb2, kinderen, pT_obj, pTax, totR3, totBox3_2, totBox3_3, totHRA1, hraVerliesSTAK: totHRA1, mx };
}

// ── HTML builders ──
function inp(label, value, key, opts = {}) {
  const { step = 1000, suffix = '', min = 0, max = '' } = opts;
  return `<div class="inp">
    <label>${label}</label>
    <div class="inp-wrap">
      <input type="number" value="${value}" min="${min}" ${max !== '' ? `max="${max}"` : ''} step="${step}" data-key="${key}">
      ${suffix ? `<span class="inp-suffix">${suffix}</span>` : ''}
    </div>
  </div>`;
}

function rij(l, r, opts = {}) {
  const { kleur = '', bold = false, border = false } = opts;
  const cls = [bold ? 'bold' : '', border ? 'border' : ''].filter(Boolean).join(' ');
  const colorCls = kleur ? kleur : '';
  return `<div class="rij ${cls}">
    <span class="rij-left ${colorCls}">${l}</span>
    <span class="rij-right ${colorCls}">${r}</span>
  </div>`;
}

function stat(t, v, opts = {}) {
  const { accent = false, colorCls = '' } = opts;
  return `<div class="stat ${accent ? 'accent' : ''}">
    <div class="stat-title">${t}</div>
    <div class="stat-value ${colorCls}">${v}</div>
  </div>`;
}

function taart(p1, p2, a1, a2) {
  const r = 30, c = 2 * Math.PI * r;
  return `<div class="taart">
    <svg width="64" height="64" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="14"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--groen)" stroke-width="14" stroke-dasharray="${c * p2} ${c}" transform="rotate(-90 50 50)"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--rood)" stroke-width="14" stroke-dasharray="${c * p1} ${c}" stroke-dashoffset="${-c * p2}" transform="rotate(-90 50 50)"/>
      <text x="50" y="47" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--donker)">${Math.round(p2 * 100)}%</text>
      <text x="50" y="59" text-anchor="middle" style="font-size:7px;fill:var(--grijs)">netto</text>
    </svg>
    <div class="taart-legend">
      <div><span class="swatch groen"></span>Netto: <b>${a2}</b></div>
      <div><span class="swatch rood"></span>Belasting: <b>${a1}</b></div>
    </div>
  </div>`;
}

function tijdlijn(columns, rows, footer) {
  const ths = columns.map(c => `<th class="${c.colorCls || ''}">${c.label}</th>`).join('');
  const trs = rows.map(r => {
    const tds = r.map((cell, ci) => {
      const cls = [columns[ci]?.colorCls || '', cell?.bold ? 'cell-bold' : ''].filter(Boolean).join(' ');
      const val = typeof cell === 'object' ? cell.v : cell;
      return `<td class="${cls}">${val}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  return `<div class="tijdlijn">
    <div class="tijdlijn-header"><b>Tijdlijn per jaar</b></div>
    <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
    ${footer ? `<div class="tijdlijn-footer">${footer}</div>` : ''}
  </div>`;
}

// ── Main render ──
function render() {
  const calc = calculate();
  const { d } = calc;
  const { k, v, netto, hraJaar, effectiefPartnerPct, effectiefKindPctTotaal } = d;

  // ── Input row 1 ──
  document.getElementById('inputs-row1').innerHTML =
    inp('WOZ-waarde', state.woz, 'woz') +
    inp('Hypotheek', state.rest, 'rest') +
    inp('Hypo rente', state.hypoR, 'hypoR', { step: 0.1, suffix: '%' }) +
    inp('Maandlasten', state.mndl, 'mndl', { step: 50, suffix: '€/mnd' }) +
    inp('Waardestijging/jr', state.stijging, 'stijging', { step: 0.5, suffix: '%' }) +
    inp('HRA-tarief', state.aftrekPct, 'aftrekPct', { step: 0.01, suffix: '%' });

  // ── Toggle row ──
  document.getElementById('toggle-row').innerHTML =
    `<span class="toggle-label">Hypotheek:</span>
     <button class="btn ${state.aflVrij ? 'active' : ''}" data-action="aflVrij-true">Aflossingsvrij</button>
     <button class="btn ${!state.aflVrij ? 'active' : ''}" data-action="aflVrij-false">Annuïteit</button>
     <span class="toggle-label toggle-spacer">Partner?</span>
     <button class="btn ${!state.partner ? 'active' : ''}" data-action="partner-false">Nee</button>
     <button class="btn ${state.partner ? 'active' : ''}" data-action="partner-true">Ja</button>`;

  // ── Partner box ──
  if (state.partner) {
    const autoP = Math.round(100 / (k + 1));
    document.getElementById('partner-box').innerHTML = `<div class="partner-box">
      <b class="partner-title">Wat erft de partner?</b>
      <div class="partner-controls">
        <button class="btn ${state.partnerPct === 0 ? 'active' : ''}" data-action="partnerPct-auto">Wettelijke verdeling (${autoP}%)</button>
        <button class="btn ${state.partnerPct > 0 ? 'active' : ''}" data-action="partnerPct-custom">Zelf instellen</button>
        ${state.partnerPct > 0 ? `<div class="partner-slider-wrap">
          <input type="range" min="0" max="100" value="${state.partnerPct}" data-key="partnerPctSlider">
          <input type="number" value="${state.partnerPct}" min="0" max="100" step="1" data-key="partnerPctNum">
          <span style="font-size:11px;color:var(--grijs)">%</span>
        </div>` : ''}
      </div>
      <div class="partner-info">
        <span><span style="color:var(--paars);font-weight:700">Partner:</span> ${Math.round(effectiefPartnerPct)}% = ${f(netto * effectiefPartnerPct / 100)} <span style="color:var(--grijs)">(vrijstelling ${f(TX.erfVrijPartner)} → meestal €0 belasting)</span></span>
        <span><span style="color:var(--blauw);font-weight:700">Kinderen:</span> ${Math.round(effectiefKindPctTotaal)}% = ${f(netto * effectiefKindPctTotaal / 100)} <span style="color:var(--grijs)">(verdeeld volgens percentages hieronder)</span></span>
      </div>
      <div class="partner-explain">Bij de <b>wettelijke verdeling</b> krijgen partner en kinderen elk een gelijk deel (1/${k + 1}). De partner krijgt alle bezittingen in gebruik — kinderen krijgen een vordering die pas opeisbaar is bij overlijden van de partner. Via een <b>testament</b> kan de ouder een ander percentage aan de partner toewijzen.</div>
    </div>`;
  } else {
    document.getElementById('partner-box').innerHTML = '';
  }

  // ── Input row 2 (children + sliders) ──
  let row2 = inp('Kinderen', state.nk, 'nk', { min: 1, max: 8, step: 1 }) +
    inp('Jaren schenken', state.jr, 'jr', { min: 1, max: 40, step: 1 });
  for (let i = 0; i < k; i++) {
    row2 += `<div class="kind-slider">
      <label>Kind ${i + 1}</label>
      <div class="slider-wrap">
        <input type="range" min="0" max="100" value="${v[i]}" data-kind-slider="${i}">
        <span class="slider-val">${v[i]}%</span>
      </div>
    </div>`;
  }
  document.getElementById('inputs-row2').innerHTML = row2;

  // ── Stats grid ──
  let statsHtml =
    stat('Overwaarde nu', f(netto), { accent: true }) +
    stat(`WOZ na ${state.jr} jr`, f(state.woz * Math.pow(1 + state.stijging / 100, state.jr)), { colorCls: 'groen' }) +
    stat('HRA/jaar', f(hraJaar), { colorCls: 'groen' }) +
    stat('Maandlasten bank', `${f(state.mndl)}/mnd`);
  if (state.partner) {
    statsHtml += stat(`Partner ontvangt (${Math.round(effectiefPartnerPct)}%)`, f(netto * effectiefPartnerPct / 100), { colorCls: 'paars' });
    statsHtml += stat(`Kinderen samen (${Math.round(effectiefKindPctTotaal)}%)`, f(netto * effectiefKindPctTotaal / 100), { colorCls: 'blauw' });
  }
  document.getElementById('stats-grid').innerHTML = statsHtml;

  // ── Vergelijking ──
  const sc = [
    { id: 0, n: "Optie 1: Niks doen", v: calc.tot1, c: 'oranje' },
    { id: 1, n: "Optie 2: STAK", v: calc.tot2, c: 'rood' },
    { id: 2, n: "Optie 3: Papieren schenking", v: calc.tot3, c: 'groen' },
  ];
  const barW = val => `${Math.max(10, val / calc.mx * 100)}%`;

  let vergHtml = sc.map(s =>
    `<button class="vergelijk-btn ${state.tab === s.id ? 'active' : ''}" data-tab="${s.id}">
      <span class="bar-label">${s.n}</span>
      <div class="bar-track"><div class="bar-fill ${s.c}" style="width:${barW(s.v)}">${f(s.v)}</div></div>
    </button>`
  ).join('');
  if (sc[0].v - sc[2].v > 0) {
    vergHtml += `<div class="besparing-box">&#10003; Papieren schenking bespaart <b>${f(sc[0].v - sc[2].v)}</b></div>`;
  }
  document.getElementById('vergelijking').innerHTML = vergHtml;

  // ── Detail section ──
  const s = sc[state.tab];
  let detailHtml = `<section class="blok" data-accent="${s.c}">
    <div class="blok-header"><h3>${s.n}</h3></div>
    <div class="blok-body">`;

  // Partner card
  if (state.partner && calc.pT_obj) {
    const pt = calc.pT_obj;
    detailHtml += `<div class="partner-card">
      <div class="partner-card-head">
        <span class="pc-name">Partner (langstlevende)</span>
        <span class="pc-pct">${Math.round(pt.pct)}%</span>
      </div>
      ${rij('Erfdeel partner', f(pt.deel))}
      ${rij('Af: partnervrijstelling', `−${f(TX.erfVrijPartner)}`)}
      ${rij('Erfbelasting partner', f(pt.belasting), { kleur: pt.belasting > 0 ? 'rood' : 'groen', bold: true, border: true })}
      ${pt.belasting === 0 ? `<div class="pc-note">&#10003; Partner betaalt geen belasting — erfdeel valt binnen de vrijstelling.</div>` : ''}
      <div class="pc-explain">De partner krijgt alle bezittingen in gebruik. Kinderen krijgen een vordering die pas opeisbaar is bij overlijden partner.</div>
    </div>`;
  }

  // Kind cards
  detailHtml += '<div class="kind-cards">';
  calc.kinderen.forEach(kd => {
    const dd = s.id === 0 ? { g: 0, tax: kd.t1, net: kd.n1, totK: kd.t1 }
      : s.id === 1 ? { g: kd.g2, tax: kd.t2k, net: kd.n2, totK: kd.totK2 }
        : { g: kd.g3, tax: kd.t3k, net: kd.n3, totK: kd.totK3 };
    const pT2 = dd.totK / Math.max(kd.deel, 1);
    const pK = Math.max(0, dd.net / Math.max(kd.deel, 1));
    detailHtml += `<div class="kind-card">
      <div class="kind-card-head">
        <span class="kc-name">Kind ${kd.i}</span>
        <span class="kc-pct">${kd.pct}%</span>
      </div>
      ${rij('Bruto erfdeel', f(kd.deel))}
      ${dd.g > 0 ? rij('Al geschonken', `−${f(dd.g)}`, { kleur: 'groen' }) : ''}
      ${s.id === 1 ? rij('OVB-aandeel', `−${f(kd.ovbPK)}`, { kleur: 'rood' }) : ''}
      ${rij('Erfbelasting', f(dd.tax), { kleur: 'rood', bold: true, border: true })}
      ${rij('Netto', f(dd.net), { kleur: 'groen', bold: true, border: true })}
      ${taart(pT2, pK, f(dd.totK), f(dd.net))}
    </div>`;
  });
  detailHtml += '</div>';

  // Totaal box
  const colorNames = ['oranje', 'rood', 'groen'];
  detailHtml += `<div class="totaal-box ${colorNames[s.id]}">
    <div><b>Totale erfbelasting</b></div>
    <span class="totaal-val ${colorNames[s.id]}">${f(s.v)}</span>
  </div>`;

  // Tijdlijn per optie
  if (s.id === 0) {
    detailHtml += tijdlijn(
      [{ label: 'Jaar' }, { label: 'WOZ-waarde' }, { label: 'Hypotheek' }, { label: 'Overwaarde' },
       { label: 'HRA ouder ✓', colorCls: 'col-groen' }, { label: 'Box 3 kinderen', colorCls: 'col-blauw' },
       { label: 'Erfbelasting bij overlijden', colorCls: 'col-rood' }],
      calc.tl1.map(t => [t.j, f(t.wozJ), f(t.restH), f(t.nettoJ), f(t.hraJ) + '/jr', '€ 0', f(t.erfTax)]),
      `Totaal HRA-voordeel ouder over ${state.jr} jaar: <b style="color:var(--groen)">${f(calc.totHRA1)}</b> · Kinderen betalen <b>geen</b> box 3 (hebben nog niks ontvangen). · Bij overlijden in jaar ${state.jr}: erfbelasting <b style="color:var(--rood)">${f(calc.tot1)}</b> (bij WOZ ${f(state.woz * Math.pow(1 + state.stijging / 100, state.jr))})`
    );
  }

  if (s.id === 1) {
    detailHtml += `<div class="alert rood">
      <b>&#9888; Direct betalen:</b> OVB ${f(state.woz * TX.ovb8)} + notaris ${f(4000)} = <b>${f(calc.ovb2)}</b><br>
      <b>&#9888; Ouder verliest HRA:</b> ${f(d.hraJaar)}/jaar = <b>${f(calc.hraVerliesSTAK)}</b> over ${state.jr} jaar
    </div>`;
    detailHtml += tijdlijn(
      [{ label: 'Jaar' }, { label: 'WOZ-waarde' }, { label: 'Geschonken cert.' },
       { label: 'HRA verlies!', colorCls: 'col-rood' }, { label: 'Box 3 kinderen/jr', colorCls: 'col-blauw' },
       { label: 'Bij overlijden (incl OVB)', colorCls: 'col-rood' }],
      calc.tl2.map(t => [t.j, f(t.wozJ), f(t.geschonken), f(t.hraVerlies) + '/jr', f(t.box3), f(t.erfTax)]),
      `Totaal HRA verloren: <b style="color:var(--rood)">${f(calc.hraVerliesSTAK)}</b> · Totaal box 3 kinderen: <b style="color:var(--blauw)">${f(calc.totBox3_2)}</b> · <b>Werkelijke totale kosten STAK zijn OVB + erfbelasting + HRA-verlies + box 3 = veel hoger dan alleen de ${f(calc.tot2)} hierboven.</b>`
    );
  }

  if (s.id === 2) {
    detailHtml += `<div class="alert groen">
      <b>Rente:</b> Ouder betaalt 6%/jaar over de papieren schuld <b>aan de kinderen</b> (echt geld!). · <b>HRA:</b> Ouder behoudt hypotheekrenteaftrek. · <b>Box 3:</b> Kinderen betalen jaarlijks belasting over hun vordering.
    </div>`;
    detailHtml += tijdlijn(
      [{ label: 'Jaar' }, { label: 'WOZ' }, { label: 'Geschonken' },
       { label: 'Rente ouder→kind', colorCls: 'col-oranje' }, { label: '/maand', colorCls: 'col-oranje' },
       { label: 'Box 3/kind/jr', colorCls: 'col-blauw' }, { label: 'HRA ouder ✓', colorCls: 'col-groen' },
       { label: 'Bij overlijden', colorCls: 'col-rood' }, { label: 'Besparing', colorCls: 'col-groen' }],
      calc.tl3.map(t => [
        t.j, f(t.wozJ), f(t.geschonken),
        f(t.rente) + '/jr', f(t.renteMnd),
        f(t.box3 / k), f(t.hraJ) + '/jr',
        f(t.erfTax), { v: f(calc.tot1 - t.erfTax), bold: true }
      ]),
      `Totalen ${state.jr} jaar: Rente ouder→kinderen <b style="color:var(--oranje)">${f(calc.totR3)}</b> · Box 3 kinderen <b style="color:var(--blauw)">${f(calc.totBox3_3)}</b> · HRA ouder <b style="color:var(--groen)">${f(calc.tl3[calc.tl3.length - 1]?.totHRA || 0)}</b>`
    );
  }

  detailHtml += '</div></section>';
  document.getElementById('detail-section').innerHTML = detailHtml;

  // ── Bronnen ──
  const bronnen = [
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
  ];
  document.getElementById('bronnen').innerHTML =
    `<b class="bronnen-title">Bronnen — tarieven 2026</b><br>` +
    bronnen.map(([t, u]) => `* ${t} — <a href="${u}" target="_blank" rel="noopener">bron</a> · `).join('') +
    `<br><b>Disclaimer:</b> Vereenvoudigd, indicatief, geen fiscaal advies. Niet meegenomen: Hillen-aftrek, overige bezittingen, testament, 2e overlijden partner, wetswijzigingen. Raadpleeg een fiscaal jurist.`;
}

// ── Event delegation ──
document.getElementById('app').addEventListener('input', e => {
  const el = e.target;
  // Numeric inputs
  if (el.dataset.key) {
    const key = el.dataset.key;
    if (key === 'partnerPctSlider' || key === 'partnerPctNum') {
      set('partnerPct', Number(el.value));
    } else if (key === 'nk') {
      const val = Number(el.value);
      state.nk = val;
      state.verd = Array.from({ length: Math.max(val, 1) }, () => Math.round(100 / Math.max(val, 1)));
      render();
    } else {
      set(key, Number(el.value));
    }
    return;
  }
  // Kind sliders
  if (el.dataset.kindSlider !== undefined) {
    const idx = Number(el.dataset.kindSlider);
    const val = Math.max(0, Math.min(100, Number(el.value)));
    const v = [...state.verd];
    const k = Math.max(state.nk, 1);
    v[idx] = val;
    const sr = v.filter((_, i) => i !== idx).reduce((a, b) => a + b, 0);
    const r2 = 100 - val;
    v.forEach((_, i) => { if (i !== idx) v[i] = sr > 0 ? Math.round(v[i] / sr * r2) : Math.round(r2 / (k - 1)); });
    const t = v.reduce((a, b) => a + b, 0);
    if (t !== 100) v[v.length - 1] += 100 - t;
    state.verd = v;
    render();
  }
});

document.getElementById('app').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) {
    const action = btn.dataset.action;
    if (action === 'aflVrij-true') set('aflVrij', true);
    if (action === 'aflVrij-false') set('aflVrij', false);
    if (action === 'partner-true') set('partner', true);
    if (action === 'partner-false') set('partner', false);
    if (action === 'partnerPct-auto') set('partnerPct', 0);
    if (action === 'partnerPct-custom') set('partnerPct', 50);
    return;
  }
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn) {
    set('tab', Number(tabBtn.dataset.tab));
  }
});

// ── Initial render ──
render();
