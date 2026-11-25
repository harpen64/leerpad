/* Leerpad – lesinhoud. Elke unit heeft vaste vragen (qs) en/of generatoren (gen)
   die elke keer nieuwe getallen maken. Vraagtypen:
   mc  : meerkeuze  {t:'mc', q, options:[...], a:indexGoed, why}
   num : getal      {t:'num', q, a, unit, tolAbs, tolRel, why}
   text: tekst      {t:'text', q, a:[geaccepteerde antwoorden], why}            */
(function (root) {
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const P = arr => arr[Math.floor(Math.random() * arr.length)];
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
  const fmt = (n, d) => {
    let s = d === undefined ? String(Math.round(n * 1e6) / 1e6) : n.toFixed(d);
    return s.replace('.', ',').replace('-', '−');
  };
  const neg = n => (n < 0 ? '−' + -n : '' + n);
  const par = n => (n < 0 ? '(' + neg(n) + ')' : '' + n);

  const num = (q, a, unit, why, o) => Object.assign({ t: 'num', q, a, unit: unit || '', why: why || '' }, o || {});
  // M(vraag, goed antwoord, [fout...], uitleg)
  const M = (q, right, wrongs, why) => ({ t: 'mc', q, options: [right, ...wrongs], a: 0, why: why || '' });

  /* ---------------- GENERATOREN ---------------- */
  const G = {};

  // --- Wiskunde ---
  G.neg = () => {
    const k = R(0, 3);
    let a = R(-15, 15) || 3, b = R(-15, 15) || -4, ans, q;
    if (k === 0) { ans = a + b; q = `Bereken: ${neg(a)} + ${par(b)}`; }
    else if (k === 1) { ans = a - b; q = `Bereken: ${neg(a)} − ${par(b)}`; }
    else if (k === 2) { a = R(-9, 9) || 5; b = R(-9, 9) || -3; ans = a * b; q = `Bereken: ${par(a)} × ${par(b)}`; }
    else { b = R(2, 9) * (Math.random() < .5 ? -1 : 1); const r = R(-9, 9) || 4; a = r * b; ans = r; q = `Bereken: ${neg(a)} ÷ ${par(b)}`; }
    return num(q, ans, '', `Het antwoord is ${neg(ans)}. Min × min = plus, min × plus = min.`);
  };
  G.fracOf = () => {
    const d = P([2, 3, 4, 5, 8, 10]), n = R(1, d - 1), whole = d * R(2, 12);
    return num(`Bereken ${n}/${d} van ${whole}.`, whole / d * n, '', `Eerst delen door ${d} (= ${whole / d}), dan keer ${n}.`);
  };
  G.pct = () => {
    const [p, step] = P([[10, 10], [20, 5], [25, 4], [50, 2], [75, 4], [5, 20]]);
    const whole = step * R(2, 20);
    return num(`Hoeveel is ${p}% van ${whole}?`, whole * p / 100, '', `${p}% van ${whole} = ${whole} × ${fmt(p / 100)}.`);
  };
  G.lin1 = () => {
    const x = R(-6, 12), a = R(2, 9), b = R(1, 20) * (Math.random() < .5 ? -1 : 1), c = a * x + b;
    return num(`Los op: ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${neg(c)}`, x, '',
      `Haal eerst ${neg(b)} aan beide kanten weg: ${a}x = ${neg(c - b)}. Deel dan door ${a}: x = ${neg(x)}.`);
  };
  const fmtLin = (a, b) => `y = ${a === 1 ? '' : a === -1 ? '−' : neg(a)}x${b ? ` ${b > 0 ? '+' : '−'} ${Math.abs(b)}` : ''}`;
  G.linFunc = () => {
    let a = R(-5, 5); if (a === 0) a = 2;
    const b = R(-9, 9), k = R(0, 2);
    if (k === 0) { const x = R(-5, 8), y = a * x + b;
      return num(`Gegeven: ${fmtLin(a, b)}. Bereken y als x = ${neg(x)}.`, y, '', `Vul x = ${neg(x)} in: y = ${neg(a)} × ${par(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${neg(y)}.`); }
    if (k === 1) { const x = R(-5, 8), y = a * x + b;
      return num(`Gegeven: ${fmtLin(a, b)}. Voor welke x is y = ${neg(y)}?`, x, '', `Los op: ${neg(a)}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${neg(y)}, dus x = ${neg(x)}.`); }
    const x1 = R(-4, 4), x2 = x1 + R(1, 4), y1 = a * x1 + b, y2 = a * x2 + b;
    return num(`Een rechte lijn gaat door (${neg(x1)}, ${neg(y1)}) en (${neg(x2)}, ${neg(y2)}). Wat is de richtingscoëfficiënt?`, a, '',
      `rc = Δy / Δx = (${neg(y2)} − ${par(y1)}) / (${neg(x2)} − ${par(x1)}) = ${neg(a)}.`);
  };
  const poly = (b, c) => 'x²' + (b ? ` ${b > 0 ? '+' : '−'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x` : '') + (c ? ` ${c > 0 ? '+' : '−'} ${Math.abs(c)}` : '');
  const fac = p => (p === 0 ? 'x' : `(x ${p > 0 ? '−' : '+'} ${Math.abs(p)})`);
  G.quad = () => {
    let p, q; do { p = R(-8, 8); q = R(-8, 8); } while (p === q);
    const lo = Math.min(p, q), hi = Math.max(p, q), b = -(p + q), c = p * q, k = R(0, 3);
    if (k === 0) return num(`Los op: ${poly(b, c)} = 0. Wat is de grootste oplossing?`, hi, '', `Ontbind in factoren: ${fac(p)}${fac(q)} = 0, dus x = ${neg(lo)} of x = ${neg(hi)}.`);
    if (k === 1) return num(`Los op: ${poly(b, c)} = 0. Wat is de kleinste oplossing?`, lo, '', `Ontbind: ${fac(p)}${fac(q)} = 0, dus x = ${neg(lo)} of x = ${neg(hi)}.`);
    if (k === 2) return num(`Los op: ${fac(p)}${fac(q)} = 0. Wat is de kleinste oplossing?`, lo, '', `Een product is 0 als één factor 0 is: x = ${neg(p)} of x = ${neg(q)}.`);
    return num(`De vergelijking ${poly(b, c)} = 0 heeft twee oplossingen. Wat is hun som?`, p + q, '', `Oplossingen: ${neg(lo)} en ${neg(hi)}. Som = ${neg(p + q)}. (Dit is ook −b.)`);
  };
  G.growthFactor = () => {
    if (Math.random() < .5) { const p = P([2, 3, 5, 8, 12, 15, 25]);
      return num(`Een hoeveelheid neemt elk jaar met ${p}% toe. Wat is de groeifactor per jaar?`, 1 + p / 100, '', `Groeifactor = 1 + ${p}/100 = ${fmt(1 + p / 100)}.`, { tolAbs: 1e-4 }); }
    const p = P([5, 10, 20, 30, 40]);
    return num(`Een hoeveelheid neemt elk jaar met ${p}% af. Wat is de groeifactor per jaar?`, 1 - p / 100, '', `Groeifactor = 1 − ${p}/100 = ${fmt(1 - p / 100)}.`, { tolAbs: 1e-4 });
  };
  G.compound = () => {
    const s = P([100, 200, 500, 1000]), p = P([10, 20]), n = P([2, 3]), ans = s * Math.pow(1 + p / 100, n);
    return num(`Je zet €${s} op een rekening met ${p}% rente per jaar (samengesteld). Hoeveel euro staat er na ${n} jaar?`, Math.round(ans * 100) / 100, '€',
      `Eindbedrag = ${s} × ${fmt(1 + p / 100)}${sup(n)} = ${fmt(ans, 2)}.`, { tolAbs: 0.02 });
  };
  G.powerRule = () => {
    const a = P([2, 3, 5, 10]), k = R(0, 2);
    if (k === 0) { const m = R(2, 6), n = R(2, 6);
      return num(`Schrijf ${a}${sup(m)} · ${a}${sup(n)} als één macht van ${a}. Welke exponent krijg je?`, m + n, '', `Bij vermenigvuldigen tel je de exponenten op: ${m} + ${n} = ${m + n}.`); }
    if (k === 1) { const n = R(2, 5), m = n + R(1, 5);
      return num(`Schrijf ${a}${sup(m)} ÷ ${a}${sup(n)} als één macht van ${a}. Welke exponent krijg je?`, m - n, '', `Bij delen trek je de exponenten af: ${m} − ${n} = ${m - n}.`); }
    const m = R(2, 4), n = R(2, 4);
    return num(`Schrijf (${a}${sup(m)})${sup(n)} als één macht van ${a}. Welke exponent krijg je?`, m * n, '', `Macht van een macht: exponenten vermenigvuldigen: ${m} × ${n} = ${m * n}.`);
  };
  G.log = () => {
    const k = R(0, 3);
    if (k === 0) { const b = P([2, 3, 5]), e = R(1, 5);
      return num(`Bereken: ${sup(b)}log(${Math.pow(b, e)})`, e, '', `${sup(b)}log(${Math.pow(b, e)}) = ${e}, want ${b}${sup(e)} = ${Math.pow(b, e)}.`); }
    if (k === 1) { const b = P([2, 3, 4, 5, 10]), e = R(2, 4);
      return num(`Los op: ${b}${'ˣ'} = ${Math.pow(b, e)}. Wat is x?`.replace('ˣ', '^x'), e, '', `${b}^${e} = ${Math.pow(b, e)}, dus x = ${e}.`); }
    if (k === 2) { const [x, y, r] = P([[2, 50, 2], [4, 25, 2], [5, 20, 2], [10, 100, 3], [20, 50, 3], [8, 125, 3], [4, 250, 3]]);
      return num(`Bereken: ¹⁰log(${x}) + ¹⁰log(${y})`, r, '', `log(a) + log(b) = log(a·b). Hier ¹⁰log(${x * y}) = ${r}.`); }
    const e = R(1, 3);
    return num(`Bereken: ¹⁰log(${fmt(Math.pow(10, -e))})`, -e, '', `${fmt(Math.pow(10, -e))} = 10${sup(-e)}, dus de logaritme is ${neg(-e)}.`);
  };

  // --- Wiskunde A: statistiek en kansrekening ---
  G.stat = () => {
    const n = P([5, 7, 9]), xs = Array.from({ length: n }, () => R(2, 20)).sort((a, b) => a - b), k = R(0, 3);
    const list = shuffleLocal(xs).join(', ');
    if (k === 0) { const sum = xs.reduce((s, x) => s + x, 0);
      return num(`Bereken het gemiddelde van deze getallen: ${list}. (Rond af op 1 decimaal.)`, Math.round(sum / n * 10) / 10, '', `Som = ${sum}, aantal = ${n}, gemiddelde = ${fmt(sum / n, 1)}.`, { tolAbs: 0.06 }); }
    if (k === 1) return num(`Wat is de mediaan van: ${list}?`, xs[(n - 1) / 2], '', `Zet de getallen op volgorde (${xs.join(', ')}); de middelste is ${xs[(n - 1) / 2]}.`);
    if (k === 2) return num(`Wat is de range (spreidingsbreedte) van: ${list}?`, xs[n - 1] - xs[0], '', `Range = grootste − kleinste = ${xs[n - 1]} − ${xs[0]} = ${xs[n - 1] - xs[0]}.`);
    const m = R(3, 12), cnt = R(3, 5), rest = Array.from({ length: n - 1 }, () => R(1, 20)).filter(x => x !== m).slice(0, 4);
    const all = shuffleLocal([...Array(cnt).fill(m), ...rest]);
    return num(`Wat is de modus van: ${all.join(', ')}?`, m, '', `De modus is het getal dat het vaakst voorkomt: ${m}.`);
  };
  const shuffleLocal = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const fracStr = (n, d) => { const g = gcd(n, d); return `${n / g}/${d / g}`; };
  G.prob = () => {
    const k = R(0, 4);
    if (k === 0) { const t = R(1, 5);
      return num(`Je gooit één dobbelsteen. Wat is de kans op een getal kleiner dan ${t + 1}? (in %, rond af op 1 decimaal)`, Math.round(t / 6 * 1000) / 10, '%', `Gunstig: ${t} van de 6 uitkomsten, dus ${t}/6 = ${fmt(t / 6 * 100, 1)}%.`, { tolAbs: 0.06 }); }
    if (k === 1) { const sh = R(3, 6), tr = R(2, 5), sk = R(2, 4);
      return num(`Je hebt ${sh} T-shirts, ${tr} broeken en ${sk} petten. Hoeveel verschillende outfits (een van elk) kun je maken?`, sh * tr * sk, '', `Vermenigvuldigregel: ${sh} × ${tr} × ${sk} = ${sh * tr * sk}.`); }
    if (k === 2) { const n = R(3, 6), f = [1, 1, 2, 6, 24, 120, 720][n];
      return num(`Op hoeveel manieren kun je ${n} verschillende boeken naast elkaar op een plank zetten?`, f, '', `${n}! = ${f}.`); }
    if (k === 3) { const r = R(2, 6), b = R(2, 6), t = r + b, pr = r / t * (r - 1) / (t - 1);
      return num(`In een vaas zitten ${r} rode en ${b} blauwe knikkers. Je pakt er zonder terugleggen twee. Wat is de kans dat ze allebei rood zijn? (in %, rond af op 1 decimaal)`, Math.round(pr * 1000) / 10, '%', `P = ${r}/${t} × ${r - 1}/${t - 1} = ${fmt(pr * 100, 1)}%.`, { tolAbs: 0.06 }); }
    const n = R(5, 9), r = 2, c = n * (n - 1) / 2;
    return num(`Uit een klas van ${n} leerlingen kies je 2 afgevaardigden (volgorde maakt niet uit). Hoeveel mogelijke keuzes zijn er?`, c, '', `Combinaties: ${n}×${n - 1}/2 = ${c}.`);
  };

  // --- Natuurkunde ---
  G.density = () => {
    const mats = [['hout', .8], ['water', 1.0], ['aluminium', 2.7], ['ijzer', 7.9], ['lood', 11.3]];
    const [name, rho] = P(mats), V = P([10, 20, 25, 40, 50, 100]), m = Math.round(rho * V * 10) / 10;
    if (Math.random() < .5) return num(`Een blokje heeft een massa van ${fmt(m)} g en een volume van ${V} cm³. Bereken de dichtheid.`, rho, 'g/cm³', `ρ = m / V = ${fmt(m)} / ${V} = ${fmt(rho)} g/cm³.`, { tolAbs: 0.01 });
    return num(`Een blokje ${name} (dichtheid ${fmt(rho)} g/cm³) heeft een volume van ${V} cm³. Bereken de massa.`, m, 'g', `m = ρ × V = ${fmt(rho)} × ${V} = ${fmt(m)} g.`, { tolAbs: 0.05 });
  };
  G.speedKmh = () => {
    const k = R(0, 3);
    if (k === 0) { const v = P([5, 10, 15, 20, 25, 30]);
      return num(`Reken om: ${v} m/s in km/h.`, v * 3.6, 'km/h', `Van m/s naar km/h vermenigvuldig je met 3,6: ${v} × 3,6 = ${fmt(v * 3.6)}.`, { tolAbs: .05 }); }
    if (k === 1) { const v = P([36, 54, 72, 90, 108]);
      return num(`Reken om: ${v} km/h in m/s.`, v / 3.6, 'm/s', `Van km/h naar m/s deel je door 3,6: ${v} / 3,6 = ${fmt(v / 3.6)}.`, { tolAbs: .05 }); }
    if (k === 2) { const v = P([30, 40, 60, 80, 100, 120]), t = P([0.5, 1, 2, 3, 4]);
      return num(`Een auto rijdt ${t === 0.5 ? 'een half uur' : t + ' uur'} met een constante snelheid van ${v} km/h. Hoeveel km legt hij af?`, v * t, 'km', `s = v × t = ${v} × ${fmt(t)} = ${fmt(v * t)} km.`, { tolAbs: .05 }); }
    const v = P([4, 5, 10, 20]), t = P([2, 3, 5, 6]);
    return num(`Een fietser legt ${v * t} km af met een snelheid van ${v} km/h. Hoeveel uur doet hij erover?`, t, 'uur', `t = s / v = ${v * t} / ${v} = ${t} uur.`);
  };
  G.weight = (gs) => () => {
    const [g, label] = P(gs), m = P([2, 5, 10, 20, 50, 60]);
    const Fz = Math.round(m * g * 100) / 100;
    return num(`Bereken de zwaartekracht op een voorwerp van ${m} kg ${label}. Gebruik g = ${fmt(g)} N/kg.`, Fz, 'N', `Fz = m × g = ${m} × ${fmt(g)} = ${fmt(Fz)} N.`, { tolRel: 0.01 });
  };
  G.vavg = () => {
    const k = R(0, 5), t = P([2, 4, 5, 8, 10]), v = P([3, 4, 5, 6, 8, 10, 12, 15]), s = v * t;
    if (k === 0) return num(`Een fietser legt ${s} m af in ${t} s. Wat is zijn gemiddelde snelheid?`, v, 'm/s', `v = s / t = ${s} / ${t} = ${v} m/s.`);
    if (k === 1) return num(`Een auto rijdt ${t} s lang met ${v} m/s. Welke afstand legt hij af?`, s, 'm', `s = v × t = ${v} × ${t} = ${s} m.`);
    if (k === 2) return num(`Hoe lang duurt het om ${s} m af te leggen met een snelheid van ${v} m/s?`, t, 's', `t = s / v = ${s} / ${v} = ${t} s.`);
    const a = R(1, 5), t2 = R(2, 10);
    if (k === 3) return num(`Een auto trekt vanuit stilstand op tot ${a * t2} m/s in ${t2} s. Wat is de gemiddelde versnelling?`, a, 'm/s²', `a = Δv / Δt = ${a * t2} / ${t2} = ${a} m/s².`);
    if (k === 4) return num(`Een scooter heeft een versnelling van ${a} m/s². Welke snelheid heeft hij na ${t2} s vanuit stilstand?`, a * t2, 'm/s', `v = a × t = ${a} × ${t2} = ${a * t2} m/s.`);
    const aa = P([1, 2, 4]), tt = P([2, 4, 6, 10]);
    return num(`Een trein trekt op vanuit stilstand met een constante versnelling van ${aa} m/s². Welke afstand legt hij in ${tt} s af?`, 0.5 * aa * tt * tt, 'm', `s = ½ · a · t² = ½ × ${aa} × ${tt}² = ${fmt(0.5 * aa * tt * tt)} m.`);
  };
  G.force = () => {
    const m = P([2, 5, 10, 20, 50, 100]), a = R(1, 5), F = m * a, k = R(0, 2);
    if (k === 0) return num(`Een voorwerp van ${m} kg krijgt een versnelling van ${a} m/s². Hoe groot is de resulterende kracht?`, F, 'N', `F = m × a = ${m} × ${a} = ${F} N.`);
    if (k === 1) return num(`Een resulterende kracht van ${F} N werkt op een voorwerp van ${m} kg. Wat is de versnelling?`, a, 'm/s²', `a = F / m = ${F} / ${m} = ${a} m/s².`);
    return num(`Een resulterende kracht van ${F} N geeft een voorwerp een versnelling van ${a} m/s². Wat is de massa?`, m, 'kg', `m = F / a = ${F} / ${a} = ${m} kg.`);
  };
  G.Ek = () => {
    const m = P([2, 4, 6, 10, 50, 70, 1000]), v = P([2, 4, 6, 10, 20]), E = 0.5 * m * v * v;
    return num(`Bereken de kinetische energie van een voorwerp van ${m} kg dat met ${v} m/s beweegt.`, E, 'J', `Ek = ½ · m · v² = ½ × ${m} × ${v}² = ${fmt(E)} J.`, { tolRel: 0.005 });
  };
  G.Ez = () => {
    const m = P([2, 5, 10, 20, 50]), h = P([2, 5, 10, 20]), E = Math.round(m * 9.81 * h * 100) / 100;
    return num(`Een voorwerp van ${m} kg hangt op ${h} m hoogte. Bereken de zwaarte-energie (g = 9,81 m/s²).`, E, 'J', `Ez = m · g · h = ${m} × 9,81 × ${h} = ${fmt(E, 1)} J.`, { tolRel: 0.01 });
  };

  // --- Scheikunde (havo 4) ---
  const AM = { H: 1.008, C: 12.01, N: 14.01, O: 16.00, Na: 22.99, Cl: 35.45 };
  const COMP = [
    ['H₂O', { H: 2, O: 1 }], ['CO₂', { C: 1, O: 2 }], ['NaCl', { Na: 1, Cl: 1 }], ['CH₄', { C: 1, H: 4 }],
    ['NH₃', { N: 1, H: 3 }], ['HCl', { H: 1, Cl: 1 }], ['NaOH', { Na: 1, O: 1, H: 1 }], ['O₂', { O: 2 }], ['N₂', { N: 2 }],
  ];
  const massOf = c => Object.entries(c).reduce((s, [e, n]) => s + AM[e] * n, 0);
  const amTable = c => Object.keys(c).map(e => `${e} = ${fmt(AM[e])}`).join('; ');
  G.molarMass = () => {
    const [f, c] = P(COMP), M_ = massOf(c), k = R(0, 2), n = R(1, 5);
    const hint = `Atoommassa's (u): ${amTable(c)}.`;
    if (k === 0) return num(`Bereken de molaire massa van ${f}. ${hint}`, Math.round(M_ * 100) / 100, 'g/mol', `Tel de atoommassa's op: M(${f}) ≈ ${fmt(M_, 2)} g/mol.`, { tolAbs: 0.1 });
    if (k === 1) return num(`Hoeveel gram weegt ${n} mol ${f}? ${hint}`, Math.round(n * M_ * 100) / 100, 'g', `m = n × M = ${n} × ${fmt(M_, 2)} = ${fmt(n * M_, 2)} g.`, { tolRel: 0.01 });
    const m = Math.round(n * M_ * 100) / 100;
    return num(`Hoeveel mol is ${fmt(m, 2)} g ${f}? ${hint}`, n, 'mol', `n = m / M = ${fmt(m, 2)} / ${fmt(M_, 2)} = ${n} mol.`, { tolAbs: 0.03 });
  };
  G.pH = () => {
    const k = R(0, 2);
    if (k === 0) { const e = R(1, 13);
      return num(`In een oplossing is [H₃O⁺] = 1,0·10${sup(-e)} mol/L. Wat is de pH?`, e, '', `pH = −log[H₃O⁺] = −log(10${sup(-e)}) = ${e}.`); }
    if (k === 1) { const e = R(2, 12);
      return num(`Een oplossing heeft pH = ${e} (bij 25 °C). Wat is de pOH?`, 14 - e, '', `pH + pOH = 14, dus pOH = 14 − ${e} = ${14 - e}.`); }
    const e = R(1, 5);
    return num(`Een zure oplossing heeft pH = ${e}. Door verdunnen wordt de pH 1 hoger. Met welke factor wordt [H₃O⁺] kleiner?`, 10, '', `Elke pH-stap is een factor 10 in [H₃O⁺] (logaritmische schaal).`);
  };

  // --- Aardrijkskunde / Biologie ---
  G.scale = () => {
    const S = P([25000, 50000, 100000]), per = 100000 / S, km = R(1, 8), cm = km * per;
    return num(`Op een kaart met schaal 1 : ${S.toLocaleString('nl-NL')} meet je ${cm} cm tussen twee plaatsen. Hoeveel km is dat in het echt?`, km, 'km',
      `${cm} cm × ${S.toLocaleString('nl-NL')} = ${(cm * S).toLocaleString('nl-NL')} cm = ${km} km.`);
  };
  G.natGrowth = () => {
    const gc = R(10, 40), sc = R(5, 12);
    return num(`In een land is het geboortecijfer ${gc}‰ en het sterftecijfer ${sc}‰. Hoe groot is de natuurlijke aanwas (in ‰)?`, gc - sc, '‰', `Natuurlijke aanwas = geboortecijfer − sterftecijfer = ${gc} − ${sc} = ${gc - sc}‰.`);
  };
  G.magnify = () => {
    const oc = P([10, 15]), ob = P([4, 10, 40]);
    return num(`Een microscoop heeft een oculair van ${oc}× en een objectief van ${ob}×. Wat is de totale vergroting?`, oc * ob, '×', `Totale vergroting = oculair × objectief = ${oc} × ${ob} = ${oc * ob}×.`);
  };
  G.tenPct = () => {
    const start = P([5000, 10000, 20000, 50000]), k = R(1, 3), ans = start / Math.pow(10, k);
    const lvl = ['eerste', 'tweede', 'derde'][k - 1] + '-orde consument';
    return num(`Een producent bevat ${start.toLocaleString('nl-NL')} kJ energie. Volgens de 10%-regel: hoeveel kJ komt in de ${lvl} terecht?`, ans, 'kJ', `Elke stap in de voedselketen houdt ~10% over: ${start.toLocaleString('nl-NL')} × 0,1${k > 1 ? sup(k) : ''} = ${fmt(ans)} kJ.`);
  };

  /* ---------------- VASTE VRAGEN ---------------- */
  const prov = [['Friesland', 'Leeuwarden'], ['Drenthe', 'Assen'], ['Overijssel', 'Zwolle'], ['Gelderland', 'Arnhem'], ['Flevoland', 'Lelystad'],
    ['Noord-Holland', 'Haarlem'], ['Zuid-Holland', 'Den Haag'], ['Zeeland', 'Middelburg'], ['Noord-Brabant', "'s-Hertogenbosch"], ['Limburg', 'Maastricht'], ['Groningen', 'Groningen'], ['Utrecht', 'Utrecht']];
  const provQs = n => {
    const picks = prov.slice().sort(() => Math.random() - .5).slice(0, n);
    return picks.map(([p, c]) => M(`Wat is de hoofdstad van de provincie ${p}?`, c, prov.filter(x => x[1] !== c).sort(() => Math.random() - .5).slice(0, 3).map(x => x[1]), `${c} is de hoofdstad van ${p}.`));
  };

  const U = (id, title, icon, desc, o) => Object.assign({ id, title, icon, desc, qs: [], gen: null }, o);

  const vwo1 = {
    label: 'VWO 1',
    subjects: [
      { id: 'wi', name: 'Wiskunde', icon: '📐', color: '#1cb0f6', units: [
        U('v1-wi1', 'Negatieve getallen', '➖', 'Optellen, aftrekken, vermenigvuldigen en delen', { gen: [G.neg] }),
        U('v1-wi2', 'Breuken en procenten', '🍕', 'Deel van een hoeveelheid', { gen: [G.fracOf, G.pct] }),
        U('v1-wi3', 'Vergelijkingen oplossen', '⚖️', 'Los x op', { gen: [G.lin1] }),
      ] },
      { id: 'na', name: 'Natuurkunde', icon: '⚡', color: '#a560e8', units: [
        U('v1-na1', 'Dichtheid', '🧊', 'Massa, volume en dichtheid', { gen: [G.density] }),
        U('v1-na2', 'Snelheid', '🚲', 'Snelheid, afstand en tijd', { gen: [G.speedKmh] }),
        U('v1-na3', 'Kracht en gewicht', '🍎', 'Newton, massa en zwaartekracht', { gen: [G.weight([[9.8, 'op aarde'], [1.6, 'op de maan'], [3.7, 'op Mars']])], qs: [
          M('In welke eenheid meet je een kracht?', 'newton (N)', ['kilogram (kg)', 'joule (J)', 'watt (W)'], 'Kracht meet je in newton.'),
          M('Welk instrument gebruik je om een kracht te meten?', 'een veerunster', ['een thermometer', 'een maatcilinder', 'een stopwatch'], 'Een veerunster rekt uit door de kracht: hoe verder, hoe groter de kracht.'),
          M('Wat verandert er niet als je naar de maan gaat?', 'je massa', ['de zwaartekracht op jou', 'je gewicht in newton', 'de valversnelling'], 'Massa (in kg) is overal gelijk; de zwaartekracht (in N) hangt af van de planeet.'),
        ] }),
      ] },
      { id: 'sk', name: 'Scheikunde', icon: '🧪', color: '#58cc02', units: [
        U('v1-sk1', 'Stoffen en mengsels', '🥣', 'Scheiden en toestanden', { qs: [
          M('Welke van deze is een zuivere stof?', 'gedestilleerd water', ['zeewater', 'melk', 'lucht'], 'Een zuivere stof bestaat maar uit één soort deeltje. De rest zijn mengsels.'),
          M('Hoe scheid je zand van water?', 'filtreren', ['indampen', 'een magneet gebruiken', 'destilleren'], 'Zand blijft achter op het filter, water gaat erdoor.'),
          M('Je wilt het zout terugkrijgen uit zout water. Wat doe je?', 'het water laten indampen', ['filtreren', 'een magneet gebruiken', 'zeven'], 'Water verdampt, zout blijft over.'),
          M('Hoe haal je ijzerpoeder uit een mengsel met zand?', 'met een magneet', ['filtreren', 'indampen', 'bezinken'], 'IJzer is magnetisch, zand niet.'),
          M('Hoe heet de overgang van gas naar vloeistof?', 'condenseren', ['verdampen', 'stollen', 'smelten'], 'Gas → vloeistof is condenseren.'),
          M('Hoe heet de overgang van vloeistof naar vast?', 'stollen', ['smelten', 'sublimeren', 'condenseren'], 'Vloeistof → vast is stollen.'),
          M('Bij welke temperatuur kookt zuiver water (bij normale luchtdruk)?', '100 °C', ['0 °C', '50 °C', '212 °C'], 'Het kookpunt van water is 100 °C.'),
          M('In suikerwater is water het…', 'oplosmiddel', ['opgeloste stof', 'residu', 'filtraat'], 'Wat oplost is de opgeloste stof (suiker), waarin het oplost is het oplosmiddel (water).'),
        ] }),
        U('v1-sk2', 'Atomen en moleculen', '⚛️', 'Bouwstenen van stoffen', { qs: [
          M('Wat is het kleinste deeltje van een element?', 'een atoom', ['een molecuul', 'een cel', 'een kristal'], 'Elementen bestaan uit atomen van één soort.'),
          M('Waaruit bestaat een molecuul H₂O?', '2 waterstofatomen en 1 zuurstofatoom', ['1 waterstofatoom en 2 zuurstofatomen', '2 zuurstofatomen', '3 waterstofatomen'], 'Het getal ₂ staat bij het atoom ervoor: H₂ = 2 waterstofatomen.'),
          M('Wat is het symbool van natrium?', 'Na', ['N', 'Ne', 'Nt'], 'Na komt van Natrium.'),
          M('Wat is het symbool van ijzer?', 'Fe', ['I', 'Ij', 'Ir'], 'Fe komt van het Latijnse ferrum.'),
          M('Wat bevat de kern van een atoom?', 'protonen en neutronen', ['alleen elektronen', 'elektronen en neutronen', 'alleen protonen'], 'Elektronen bewegen om de kern heen.'),
          M('Welke lading heeft een elektron?', 'negatief', ['positief', 'neutraal (geen lading)', 'wisselend'], 'Elektronen zijn negatief, protonen positief, neutronen neutraal.'),
          M('Welke verandering is een chemische reactie?', 'hout verbranden', ['ijs smelten', 'suiker oplossen in water', 'water koken'], 'Bij een chemische reactie ontstaan nieuwe stoffen (as, rook).'),
          M('Wat is een verbinding?', 'een stof van meerdere soorten atomen, zoals water', ['een stof van één soort atoom, zoals zuurstofgas', 'een mengsel van twee stoffen', 'een oplossing'], 'Water (H₂O) heeft waterstof én zuurstof.'),
        ] }),
      ] },
      { id: 'ak', name: 'Aardrijkskunde', icon: '🌍', color: '#ff9600', units: [
        U('v1-ak1', 'Nederland en kaarten', '🗺️', 'Provincies, schaal en kompas', { gen: [G.scale], get qs() { return [...provQs(4),
          M('Wat ligt tegenover het noorden op een kompas?', 'het zuiden', ['het oosten', 'het westen', 'het noordoosten'], 'N en Z liggen tegenover elkaar.'),
          M('Waar ligt het hoogste punt van Nederland (de Vaalserberg)?', 'in Limburg', ['in Gelderland', 'in Friesland', 'in Zeeland'], 'De Vaalserberg ligt in het uiterste zuiden van Limburg.')]; } }),
        U('v1-ak2', 'Wereld, weer en klimaat', '🌦️', 'Continenten, breedtegraden en klimaat', { qs: [
          M('Hoeveel continenten telt de aarde (volgens de gebruikelijke indeling)?', '7', ['5', '6', '9'], 'Afrika, Antarctica, Azië, Australië/Oceanië, Europa, Noord-Amerika, Zuid-Amerika.'),
          M('Wat is de grootste oceaan?', 'de Grote (Stille) Oceaan', ['de Atlantische Oceaan', 'de Indische Oceaan', 'de Noordelijke IJszee'], 'De Grote Oceaan beslaat bijna een derde van de aarde.'),
          M('Op welke breedtegraad ligt de evenaar?', '0°', ['23,5°', '45°', '90°'], 'De evenaar is breedtegraad 0°.'),
          M('Door welke plaats loopt de nulmeridiaan (lengtegraad 0°)?', 'Greenwich (Londen)', ['Parijs', 'Amsterdam', 'Rome'], 'De nulmeridiaan loopt door Greenwich bij Londen.'),
          M('Wat is het verschil tussen weer en klimaat?', 'weer is kortdurend, klimaat is het gemiddelde over lange tijd (30 jaar)', ['weer is het gemiddelde, klimaat is wat er nu is', 'er is geen verschil', 'klimaat gaat alleen over temperatuur'], 'Weer: nu en vandaag. Klimaat: gemiddelden over decennia.'),
          M('Welk klimaat heeft Nederland?', 'gematigd zeeklimaat', ['tropisch regenwoudklimaat', 'woestijnklimaat', 'poolklimaat'], 'De zee zorgt voor milde winters en koele zomers.'),
          M('Uit welke richting waait de wind in Nederland het vaakst?', 'zuidwest', ['noordoost', 'oost', 'noord'], 'Overheersend zuidwestenwind, vochtig van de Atlantische Oceaan.'),
          M('Waardoor krijgen we seizoenen?', 'doordat de aardas schuin staat', ['doordat de aarde dichter bij of verder van de zon staat', 'door de maan', 'door de zeestromen'], 'Door de scheve stand van de aardas valt zonlicht in de zomer steiler op ons halfrond.'),
        ] }),
      ] },
      { id: 'ge', name: 'Geschiedenis', icon: '🏛️', color: '#c0803a', units: [
        U('v1-ge1', 'Jagers, boeren en de Oudheid', '🏺', 'Tijdvak 1 en 2', { qs: [
          M('Waarvan leefden jagers-verzamelaars?', 'van jagen en het verzamelen van planten en vruchten', ['van landbouw', 'van handel', 'van het bouwen van steden'], 'Ze trokken rond (nomaden) op zoek naar voedsel.'),
          M('Wat veranderde er toen mensen landbouw gingen bedrijven?', 'ze werden vast op één plek wonen', ['ze gingen meer rondtrekken', 'ze stopten met voedsel verbouwen', 'ze gingen alleen nog jagen'], 'Landbouw maakt een vaste woonplaats mogelijk: dorpen, later steden.'),
          M('Welke twee dingen horen bij het begin van tijdvak 2 (ca. 3000 v.Chr.)?', 'steden en schrift', ['kastelen en ridders', 'boekdrukkunst en kerken', 'stoommachines en fabrieken'], 'In Mesopotamië en Egypte ontstonden de eerste steden en het schrift.'),
          M('Welk schrift ontstond in Mesopotamië?', 'spijkerschrift', ['hiërogliefen', 'het Latijnse alfabet', 'runen'], 'Hiërogliefen zijn van de Egyptenaren.'),
          M('Aan welke rivier ontstond de Egyptische beschaving?', 'de Nijl', ['de Tigris', 'de Rijn', 'de Donau'], 'De jaarlijkse overstroming van de Nijl maakte de grond vruchtbaar.'),
          M('In welke Griekse stad ontstond de eerste democratie?', 'Athene', ['Sparta', 'Rome', 'Troje'], 'In Athene mochten (vrije, mannelijke) burgers meebeslissen.'),
          M('Waar lag de grens (limes) van het Romeinse Rijk in Nederland?', 'langs de Rijn', ['langs de Maas', 'langs de Waddenzee', 'langs de IJssel'], 'De limes liep langs de Rijn.'),
          M('In welk jaar viel het West-Romeinse Rijk?', '476 na Christus', ['44 voor Christus', '1000 na Christus', '1492'], 'In 476 werd de laatste West-Romeinse keizer afgezet; dat is het einde van tijdvak 2.'),
        ] }),
        U('v1-ge2', 'De tien tijdvakken', '⏳', 'Namen en jaartallen', { qs: [
          M('Hoe heet tijdvak 1?', 'Tijd van jagers en boeren', ['Tijd van Grieken en Romeinen', 'Tijd van monniken en ridders', 'Tijd van steden en staten'], ''),
          M('Hoe heet tijdvak 2?', 'Tijd van Grieken en Romeinen', ['Tijd van jagers en boeren', 'Tijd van regenten en vorsten', 'Tijd van burgers en stoommachines'], 'Van 3000 v.Chr. tot 500 n.Chr.'),
          M('Hoe heet tijdvak 3 (500–1000)?', 'Tijd van monniken en ridders', ['Tijd van steden en staten', 'Tijd van ontdekkers en hervormers', 'Tijd van pruiken en revoluties'], ''),
          M('Hoe heet tijdvak 4 (1000–1500)?', 'Tijd van steden en staten', ['Tijd van monniken en ridders', 'Tijd van regenten en vorsten', 'Tijd van wereldoorlogen'], ''),
          M('In welk tijdvak valt de Gouden Eeuw?', 'tijdvak 6 (regenten en vorsten, 1600–1700)', ['tijdvak 5', 'tijdvak 7', 'tijdvak 8'], 'De Gouden Eeuw is de 17e eeuw.'),
          M('In welk tijdvak valt de Franse Revolutie (1789)?', 'tijdvak 7 (pruiken en revoluties)', ['tijdvak 6', 'tijdvak 8', 'tijdvak 9'], ''),
          M('In welk tijdvak begon de industriële revolutie in Nederland (burgers en stoommachines)?', 'tijdvak 8 (1800–1900)', ['tijdvak 6', 'tijdvak 7', 'tijdvak 9'], ''),
          M('Welke periode noemen we tijdvak 9?', 'de tijd van wereldoorlogen (1900–1950)', ['de tijd van televisie en computer', 'de tijd van pruiken en revoluties', 'de tijd van steden en staten'], ''),
        ] }),
      ] },
      { id: 'bi', name: 'Biologie', icon: '🌱', color: '#2bb673', units: [
        U('v1-bi1', 'Cellen en levenskenmerken', '🔬', 'Wat leeft er en waar is het van gemaakt?', { gen: [G.magnify], qs: [
          M('Welke eigenschap hoort niet bij levende wezens?', 'roesten', ['groeien', 'voortplanten', 'reageren op prikkels'], 'Roesten is een chemische reactie van ijzer, geen levenskenmerk.'),
          M('Welk onderdeel heeft een plantencel wel, maar een dierlijke cel niet?', 'celwand (en chloroplasten)', ['celkern', 'celmembraan', 'cytoplasma'], 'Plantencellen hebben een stevige celwand en bladgroenkorrels.'),
          M('Wat zit er in de celkern?', 'het erfelijk materiaal (DNA)', ['bladgroen', 'water en zout', 'het celmembraan'], ''),
          M('Wat doet het celmembraan?', 'het bepaalt welke stoffen de cel in en uit gaan', ['het maakt energie uit licht', 'het bewaart het DNA', 'het geeft de cel stevigheid'], ''),
          M('Wat is de juiste volgorde van klein naar groot?', 'cel → weefsel → orgaan → organisme', ['orgaan → cel → weefsel → organisme', 'weefsel → cel → orgaan → organisme', 'cel → orgaan → weefsel → organisme'], ''),
          M('Welk organisme bestaat uit één cel?', 'een bacterie', ['een regenworm', 'een eik', 'een vlieg'], ''),
        ] }),
        U('v1-bi2', 'Planten en fotosynthese', '🌿', 'Hoe planten voedsel maken', { qs: [
          M('Welke stoffen ontstaan bij fotosynthese?', 'glucose en zuurstof', ['koolstofdioxide en water', 'glucose en koolstofdioxide', 'zuurstof en water'], 'Koolstofdioxide + water + licht → glucose + zuurstof.'),
          M('Welke stoffen heeft een plant nodig voor fotosynthese?', 'koolstofdioxide, water en licht', ['zuurstof, water en warmte', 'glucose en zuurstof', 'stikstof en zout'], ''),
          M('In welk celonderdeel vindt fotosynthese plaats?', 'chloroplasten (bladgroenkorrels)', ['celkern', 'celwand', 'vacuole'], 'Chloroplasten bevatten bladgroen (chlorofyl).'),
          M('Wat doen de huidmondjes in een blad?', 'gassen in en uit laten gaan', ['licht opvangen', 'water opnemen', 'zaden maken'], ''),
          M('Wat is de taak van de wortels?', 'water en mineralen opnemen', ['licht opvangen', 'suiker maken', 'stuifmeel maken'], ''),
          M('Wat is bestuiving?', 'stuifmeel overbrengen op de stempel', ['een zaadje dat ontkiemt', 'een vrucht die rijp wordt', 'water opnemen via de wortels'], ''),
          M('Wanneer ademt een plant?', 'dag én nacht', ['alleen overdag', 'alleen ’s nachts', 'nooit'], 'Ademhaling (verbranding) gaat altijd door; fotosynthese alleen met licht.'),
        ] }),
      ] },
    ],
  };

  const havo4 = {
    label: 'HAVO 4',
    subjects: [
      { id: 'wi', name: 'Wiskunde A', icon: '📐', color: '#1cb0f6', units: [
        U('h4-wi5', 'Statistiek', '📊', 'Gemiddelde, mediaan, modus en range', { gen: [G.stat], qs: [
          M('Welk centraliteitsmaat wordt het minst beïnvloed door uitschieters?', 'de mediaan', ['het gemiddelde', 'de range', 'de som'], 'Eén extreem getal verandert de middelste waarde niet of nauwelijks.'),
          M('In een boxplot zit de helft van de waarnemingen tussen…', 'het eerste en derde kwartiel', ['het minimum en het maximum', 'het gemiddelde en de mediaan', 'de modus en de mediaan'], 'Q1 tot Q3 bevat 50% van de data.'),
          M('Wat meet de standaardafwijking?', 'hoe sterk de waarnemingen om het gemiddelde spreiden', ['wat de middelste waarneming is', 'hoe vaak een waarde voorkomt', 'het verschil tussen max en min'], ''),
        ] }),
        U('h4-wi6', 'Kansrekening', '🎲', 'Kansen en telproblemen', { gen: [G.prob], qs: [
          M('Welke waarde kan een kans nooit hebben?', '1,3', ['0', '0,5', '1'], 'Een kans ligt altijd tussen 0 en 1.'),
          M('Bij onafhankelijke gebeurtenissen A en B geldt P(A en B) =', 'P(A) × P(B)', ['P(A) + P(B)', 'P(A) − P(B)', 'P(A) ÷ P(B)'], ''),
          M('Je gooit twee keer met een dobbelsteen. Wat is de kans op twee keer een zes?', '1/36', ['1/6', '1/12', '2/6'], '1/6 × 1/6 = 1/36.'),
        ] }),
        U('h4-wi1', 'Lineaire formules', '📈', 'Formules, rc en snijpunten', { gen: [G.linFunc] }),
        U('h4-wi2', 'Kwadratische vergelijkingen', '🎯', 'Ontbinden in factoren', { gen: [G.quad] }),
        U('h4-wi3', 'Groei en machten', '🌱', 'Groeifactoren en rekenregels', { gen: [G.growthFactor, G.compound, G.powerRule] }),
        U('h4-wi4', 'Logaritmen', '🧮', 'Rekenen met logaritmen', { gen: [G.log] }),
      ] },
      { id: 'na', name: 'Natuurkunde', icon: '⚡', color: '#a560e8', units: [
        U('h4-na1', 'Bewegen', '🏃', 'Snelheid en versnelling', { gen: [G.vavg] }),
        U('h4-na2', 'Kracht en beweging', '🚀', 'F = m·a en zwaartekracht', { gen: [G.force, G.weight([[9.81, 'op aarde'], [1.62, 'op de maan'], [3.71, 'op Mars']])] }),
        U('h4-na3', 'Energie', '🔋', 'Kinetische en zwaarte-energie', { gen: [G.Ek, G.Ez], qs: [
          M('Wat gebeurt er met de kinetische energie als de snelheid 2 keer zo groot wordt?', 'hij wordt 4 keer zo groot', ['hij wordt 2 keer zo groot', 'hij blijft gelijk', 'hij wordt 8 keer zo groot'], 'Ek = ½mv², dus v² geeft factor 2² = 4.'),
          M('In welke eenheid meet je energie?', 'joule (J)', ['newton (N)', 'watt (W)', 'pascal (Pa)'], ''),
          M('Een bal valt van een tafel. Welke omzetting vindt plaats (zonder wrijving)?', 'zwaarte-energie wordt kinetische energie', ['kinetische energie wordt zwaarte-energie', 'chemische energie wordt warmte', 'er is geen omzetting'], ''),
        ] }),
      ] },
      { id: 'sk', name: 'Scheikunde', icon: '🧪', color: '#58cc02', units: [
        U('h4-sk1', 'Mol en molaire massa', '⚖️', 'Rekenen met stofhoeveelheden', { gen: [G.molarMass] }),
        U('h4-sk2', 'Reactievergelijkingen', '🔥', 'Kloppend maken', { qs: [
          M('CH₄ + _ O₂ → CO₂ + _ H₂O. Welke coëfficiënten komen voor O₂ en H₂O?', '2 en 2', ['1 en 2', '2 en 1', '3 en 2'], 'Links: C=1, H=4, O=4. Rechts moet hetzelfde zijn: 2 O₂ en 2 H₂O.'),
          M('_ H₂ + O₂ → _ H₂O. Welke coëfficiënten komen voor H₂ en H₂O?', '2 en 2', ['1 en 1', '2 en 1', '1 en 2'], '2 H₂ + O₂ → 2 H₂O.'),
          M('N₂ + _ H₂ → _ NH₃. Welke coëfficiënten komen voor H₂ en NH₃?', '3 en 2', ['2 en 3', '1 en 1', '3 en 3'], 'N₂ + 3 H₂ → 2 NH₃.'),
          M('_ Mg + O₂ → _ MgO. Welke coëfficiënten?', '2 en 2', ['1 en 1', '2 en 1', '1 en 2'], '2 Mg + O₂ → 2 MgO.'),
          M('4 Fe + _ O₂ → 2 Fe₂O₃. Welke coëfficiënt komt voor O₂?', '3', ['2', '4', '1'], 'Rechts zijn 6 O-atomen, dus 3 O₂.'),
          M('C₃H₈ + _ O₂ → 3 CO₂ + 4 H₂O. Welke coëfficiënt komt voor O₂?', '5', ['3', '4', '6'], 'Rechts: 6 + 4 = 10 O-atomen, dus 5 O₂.'),
          M('Wat betekent (aq) achter een formule?', 'opgelost in water', ['vast', 'vloeibaar', 'gasvormig'], '(s) vast, (l) vloeistof, (g) gas, (aq) opgelost in water.'),
          M('Wat blijft gelijk bij elke chemische reactie?', 'de totale massa en het aantal atomen van elk element', ['het aantal moleculen', 'de stoffen', 'het volume'], 'Wet van behoud van massa.'),
        ] }),
        U('h4-sk3', 'Zuren, basen en pH', '🧴', 'pH-schaal en reacties', { gen: [G.pH], qs: [
          M('Wat is de pH van een neutrale oplossing bij 25 °C?', '7', ['0', '10', '14'], ''),
          M('Een oplossing heeft pH 3. Wat is het?', 'een zure oplossing', ['een basische oplossing', 'een neutrale oplossing', 'zuiver water'], 'pH < 7 is zuur.'),
          M('Welke stof is een base?', 'natronloog (NaOH)', ['zoutzuur (HCl)', 'azijnzuur', 'koolzuur'], ''),
          M('Wat doet een zuur volgens Brønsted?', 'een H⁺ (H₃O⁺) afstaan', ['een H⁺ opnemen', 'elektronen afstaan', 'een OH⁻ afstaan'], 'Een base neemt een H⁺ op.'),
          M('Wat ontstaat er bij de reactie van een zuur met een base (neutralisatie)?', 'een zout en water', ['een gas en een metaal', 'alleen water', 'alleen een zout'], ''),
          M('pH daalt van 5 naar 3. Wat gebeurt er met [H₃O⁺]?', 'het wordt 100 keer zo groot', ['het wordt 2 keer zo groot', 'het wordt 100 keer zo klein', 'het blijft gelijk'], 'Twee pH-stappen = 10² = 100.'),
        ] }),
      ] },
      { id: 'ak', name: 'Aardrijkskunde', icon: '🌍', color: '#ff9600', units: [
        U('h4-ak1', 'Platentektoniek', '🌋', 'Aardbevingen en vulkanen', { qs: [
          M('Wat drijft de beweging van de aardplaten aan?', 'stromingen (convectie) in de aardmantel', ['de zwaartekracht van de maan', 'de wind', 'de zeestromen'], ''),
          M('Wat gebeurt er bij een divergente plaatgrens?', 'platen bewegen uit elkaar en er ontstaat nieuwe korst', ['platen botsen', 'platen schuiven langs elkaar', 'platen smelten'], 'Voorbeeld: de Mid-Atlantische Rug.'),
          M('Hoe is de Himalaya ontstaan?', 'door botsing van de Indische en Euraziatische plaat', ['door vulkanen op een hotspot', 'door subductie van oceaanbodem', 'door erosie'], 'Twee continentale platen botsen: plooiing van gebergte.'),
          M('Wat is subductie?', 'een zwaardere oceanische plaat duikt onder een lichtere plaat', ['twee platen schuiven langs elkaar', 'nieuwe korst ontstaat', 'een vulkaan barst uit'], ''),
          M('De San Andreasbreuk (Californië) is een…', 'transforme grens: platen schuiven langs elkaar', ['divergente grens', 'convergente grens', 'hotspot'], ''),
          M('Hoe is de Ring of Fire te herkennen?', 'veel vulkanen en aardbevingen rond de Grote Oceaan', ['een rij vulkanen in de Atlantische Oceaan', 'woestijnen rond de evenaar', 'een gebergte door Europa'], ''),
          M('Een aardbeving van magnitude 7 is vergeleken met magnitude 6…', '10 keer zo sterk qua amplitude van de trillingen', ['1 keer zo sterk', '2 keer zo sterk', '7 keer zo sterk'], 'De magnitudeschaal is logaritmisch.'),
          M('Hawaï ligt midden in een plaat. Hoe zijn de vulkanen daar ontstaan?', 'boven een hotspot (mantelpluim)', ['bij een plaatgrens', 'door een meteorietinslag', 'door subductie'], ''),
        ] }),
        U('h4-ak2', 'Klimaat en bevolking', '🌡️', 'Broeikaseffect en demografie', { gen: [G.natGrowth], qs: [
          M('Welk gas is géén belangrijk broeikasgas?', 'stikstof (N₂)', ['koolstofdioxide (CO₂)', 'methaan (CH₄)', 'waterdamp'], ''),
          M('Wat is het versterkte broeikaseffect?', 'extra opwarming door menselijke uitstoot van broeikasgassen', ['het natuurlijke broeikaseffect', 'afkoeling door vulkanen', 'het gat in de ozonlaag'], ''),
          M('Een oppervlak met een hoog albedo…', 'weerkaatst veel zonlicht (bijv. sneeuw)', ['neemt veel zonlicht op', 'is altijd donker', 'geeft veel warmte af'], ''),
          M('Welke fase van het demografisch transitiemodel heeft hoog geboortecijfer én hoog sterftecijfer?', 'fase 1', ['fase 2', 'fase 3', 'fase 4'], 'In fase 2 daalt het sterftecijfer eerst: sterke groei.'),
          M('Een bevolkingspiramide met een smalle basis en brede top wijst op…', 'vergrijzing en laag geboortecijfer', ['snelle bevolkingsgroei', 'veel jonge mensen', 'hoge kindersterfte'], ''),
          M('Wat betekent natuurlijke aanwas?', 'geboorten minus sterfgevallen', ['immigratie minus emigratie', 'geboorten plus immigratie', 'sterfgevallen minus geboorten'], ''),
        ] }),
      ] },
      { id: 'ge', name: 'Geschiedenis', icon: '🏛️', color: '#c0803a', units: [
        U('h4-ge1', 'Eerste Wereldoorlog', '🪖', '1914–1918', { qs: [
          M('Wat was de directe aanleiding voor de Eerste Wereldoorlog?', 'de moord op aartshertog Frans Ferdinand in Sarajevo (1914)', ['de inval in Polen', 'de Russische Revolutie', 'de aanval op Pearl Harbor'], ''),
          M('Welke landen vormden de Centrale Mogendheden?', 'Duitsland en Oostenrijk-Hongarije (met o.a. het Ottomaanse Rijk)', ['Frankrijk en Groot-Brittannië', 'Rusland en de VS', 'Italië en Spanje'], ''),
          M('Wat deed Nederland in de Eerste Wereldoorlog?', 'neutraal blijven', ['meevechten met Duitsland', 'meevechten met Frankrijk', 'bezet worden door Duitsland'], ''),
          M('Wat kenmerkt de oorlog aan het Westfront?', 'loopgravenoorlog', ['snelle bewegingsoorlog', 'zeeslagen', 'guerrilla'], ''),
          M('Wanneer eindigde de oorlog met een wapenstilstand?', '11 november 1918', ['28 juni 1914', '5 mei 1945', '1 september 1939'], ''),
          M('Wat beschuldigde het Verdrag van Versailles Duitsland van?', 'de schuld aan de oorlog (met herstelbetalingen)', ['niets, het was een eerlijk verdrag', 'het stichten van de Volkenbond', 'het bezetten van Nederland'], ''),
          M('Welke organisatie werd na de oorlog opgericht om oorlog te voorkomen?', 'de Volkenbond', ['de NAVO', 'de EU', 'het Warschaupact'], ''),
        ] }),
        U('h4-ge2', 'Interbellum en Tweede Wereldoorlog', '🕊️', '1919–1945', { qs: [
          M('Welke gebeurtenis (1929) leidde tot de Grote Depressie?', 'de beurskrach op Wall Street', ['de Duitse inval in Polen', 'het Verdrag van Versailles', 'de val van de Muur'], ''),
          M('Wanneer werd Hitler kanselier van Duitsland?', '1933', ['1919', '1939', '1945'], ''),
          M('Welke gebeurtenis zorgde voor het begin van de Tweede Wereldoorlog in Europa?', 'de Duitse inval in Polen (1 september 1939)', ['de moord in Sarajevo', 'de aanval op Pearl Harbor', 'D-Day'], ''),
          M('Wanneer viel Duitsland Nederland binnen?', '10 mei 1940', ['1 september 1939', '6 juni 1944', '5 mei 1945'], ''),
          M('Welke stad werd op 14 mei 1940 gebombardeerd?', 'Rotterdam', ['Amsterdam', 'Den Haag', 'Arnhem'], 'Daarna capituleerde Nederland.'),
          M('Hoe heet het systematisch vermoorden van Joden en andere groepen door de nazi’s?', 'de Holocaust (Shoah)', ['de Hongerwinter', 'de Blitz', 'de Februaristaking'], ''),
          M('Wat was D-Day (6 juni 1944)?', 'de geallieerde landing in Normandië', ['de Duitse inval in Nederland', 'de bevrijding van Nederland', 'de capitulatie van Japan'], ''),
          M('Wanneer is Nederland (officieel) bevrijd?', '5 mei 1945', ['6 juni 1944', '15 mei 1940', '8 mei 1945'], 'Op 5 mei 1945 capituleerden de Duitse troepen in Nederland.'),
        ] }),
        U('h4-ge3', 'Koude Oorlog en dekolonisatie', '🧱', '1945–1991', { qs: [
          M('Tussen welke twee supermachten speelde de Koude Oorlog?', 'de VS en de Sovjet-Unie', ['de VS en China', 'Duitsland en Frankrijk', 'Groot-Brittannië en Rusland'], ''),
          M('Wat was het Marshallplan?', 'Amerikaanse hulp voor de wederopbouw van West-Europa', ['een Russisch invasieplan', 'een verdrag over kernwapens', 'het plan voor een Europese munt'], ''),
          M('Wat is de NAVO?', 'een westers militair bondgenootschap (1949)', ['een Oostblok-bondgenootschap', 'een economische unie', 'een raad van de VN'], 'Het Oostblok-tegenstuk was het Warschaupact (1955).'),
          M('Wanneer werd de Berlijnse Muur gebouwd?', '1961', ['1945', '1949', '1989'], 'De Muur viel op 9 november 1989.'),
          M('Waarover ging de Cubacrisis (1962)?', 'Sovjet-kernraketten op Cuba', ['een Amerikaanse invasie van Rusland', 'de blokkade van Berlijn', 'een opstand in Hongarije'], ''),
          M('Wat bedoelt men met wapenwedloop?', 'beide kampen bouwden steeds meer en betere (kern)wapens', ['de verkoop van wapens aan de VN', 'een sportwedstrijd', 'afspraken om wapens af te schaffen'], ''),
          M('Wanneer riep Soekarno de onafhankelijkheid van Indonesië uit?', '17 augustus 1945', ['27 december 1949', '10 mei 1940', '9 november 1989'], 'Nederland erkende de soevereiniteit pas op 27 december 1949.'),
          M('Hoe worden de Nederlandse militaire acties in Indonesië (1947 en 1948) genoemd?', 'politionele acties', ['Slag bij Verdun', 'Operatie Market Garden', 'Cubacrisis'], ''),
        ] }),
      ] },
      { id: 'bi', name: 'Biologie', icon: '🧬', color: '#2bb673', units: [
        U('h4-bi1', 'DNA en erfelijkheid', '🧬', 'Genen, kruisingen en delingen', { qs: [
          M('Welke base paart in DNA met adenine (A)?', 'thymine (T)', ['cytosine (C)', 'guanine (G)', 'uracil (U)'], 'A–T en C–G.'),
          M('Welke base paart in DNA met cytosine (C)?', 'guanine (G)', ['adenine (A)', 'thymine (T)', 'uracil (U)'], 'A–T en C–G.'),
          M('Hoeveel chromosomen heeft een menselijke lichaamscel?', '46', ['23', '48', '92'], '23 paren.'),
          M('Wat is een gen?', 'een stukje DNA dat codeert voor een eigenschap (eiwit)', ['een hele cel', 'een soort eiwit dat reacties versnelt', 'een celorganel'], ''),
          M('Wat is het verschil tussen genotype en fenotype?', 'genotype = combinatie van allelen, fenotype = zichtbare eigenschap', ['genotype = zichtbaar, fenotype = allelen', 'ze betekenen hetzelfde', 'genotype is voor planten, fenotype voor dieren'], ''),
          M('Twee ouders met genotype Aa (A dominant). Hoe groot is de kans op een kind met aa?', '25%', ['0%', '50%', '75%'], 'AA 25%, Aa 50%, aa 25%.'),
          M('Ouders Aa × aa. Hoe groot is de kans op een kind met aa?', '50%', ['25%', '0%', '100%'], 'Helft Aa, helft aa.'),
          M('Wat is het resultaat van meiose?', 'vier genetisch verschillende geslachtscellen met een half aantal chromosomen', ['twee identieke lichaamscellen', 'een zygote', 'een zaadcel met 46 chromosomen'], 'Mitose geeft twee identieke diploïde cellen.'),
        ] }),
        U('h4-bi2', 'Enzymen en stofwisseling', '⚙️', 'Biokatalysatoren en energie', { qs: [
          M('Wat is een enzym?', 'een eiwit dat een reactie versnelt', ['een vet dat energie opslaat', 'een suiker', 'een deel van het DNA'], 'Een biokatalysator.'),
          M('Wat betekent het dat een enzym specifiek is?', 'het werkt alleen op één bepaald substraat (sleutel-slot)', ['het werkt bij alle temperaturen', 'het gaat nooit stuk', 'het werkt op alle stoffen'], ''),
          M('Wat gebeurt er met een enzym bij een te hoge temperatuur?', 'het denatureert en werkt niet meer', ['het werkt sneller', 'het blijft hetzelfde', 'het wordt een ander enzym'], ''),
          M('Wat is het substraat van amylase?', 'zetmeel', ['eiwit', 'vet', 'cellulose'], 'Amylase breekt zetmeel af.'),
          M('Wat is dissimilatie?', 'afbraak van stoffen waarbij energie vrijkomt', ['opbouw van stoffen met energie', 'verplaatsing van stoffen', 'celdeling'], 'Glucose + O₂ → CO₂ + H₂O + energie.'),
          M('Waar vindt de dissimilatie vooral plaats?', 'in de mitochondriën', ['in de celkern', 'in de chloroplasten', 'in het celmembraan'], ''),
          M('Wat is ATP?', 'de energiedrager van de cel', ['een enzym', 'een deel van het DNA', 'een soort vet'], ''),
          M('Fotosynthese is een voorbeeld van…', 'assimilatie (opbouw)', ['dissimilatie (afbraak)', 'diffusie', 'osmose'], 'Het kost energie (licht) en bouwt glucose op.'),
        ] }),
        U('h4-bi3', 'Ecologie', '🦊', 'Voedselketens en kringlopen', { gen: [G.tenPct], qs: [
          M('Welke factor is abiotisch?', 'temperatuur', ['roofdieren', 'schimmels', 'planten'], 'Abiotisch = niet levend.'),
          M('Wie zijn de reducenten?', 'bacteriën en schimmels die dood materiaal afbreken', ['planten', 'roofdieren', 'plantenetende dieren'], ''),
          M('In de keten gras → konijn → vos is het konijn…', 'een eerste-orde consument', ['een producent', 'een reducent', 'een tweede-orde consument'], ''),
          M('Wat gebeurt er met de hoeveelheid energie in een voedselketen?', 'per schakel blijft ongeveer 10% over', ['hij neemt per schakel toe', 'hij blijft gelijk', 'hij is bij de top het grootst'], ''),
          M('Wat is eutrofiëring?', 'een overmaat aan voedingsstoffen in water, met algenbloei en zuurstoftekort', ['een tekort aan zuurstof door droogte', 'het uitsterven van soorten', 'het opwarmen van het water'], ''),
          M('Wat is mutualisme?', 'een samenleving waarbij beide soorten voordeel hebben', ['een samenleving waarbij één soort schade lijdt', 'één soort eet de ander op', 'twee soorten die elkaar negeren'], 'Voorbeeld: knolletjesbacteriën en vlinderbloemigen.'),
        ] }),
      ] },
    ],
  };

  /* ============ HAVO 4 C&M: Duits, Nederlands, Kunst & CKV + extra units ============ */
  const T = (q, answers, why) => ({ t: 'text', q, a: answers, why: why || '' });

  // --- Duits: werkwoorden in de tegenwoordige tijd ---
  const VP = {
    machen: ['mache', 'machst', 'macht', 'machen', 'macht', 'machen'], spielen: ['spiele', 'spielst', 'spielt', 'spielen', 'spielt', 'spielen'],
    wohnen: ['wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt', 'wohnen'], lernen: ['lerne', 'lernst', 'lernt', 'lernen', 'lernt', 'lernen'],
    kaufen: ['kaufe', 'kaufst', 'kauft', 'kaufen', 'kauft', 'kaufen'], arbeiten: ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten'],
    reisen: ['reise', 'reist', 'reist', 'reisen', 'reist', 'reisen'], fahren: ['fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren'],
    sprechen: ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'], sehen: ['sehe', 'siehst', 'sieht', 'sehen', 'seht', 'sehen'],
    essen: ['esse', 'isst', 'isst', 'essen', 'esst', 'essen'], lesen: ['lese', 'liest', 'liest', 'lesen', 'lest', 'lesen'],
    nehmen: ['nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt', 'nehmen'], geben: ['gebe', 'gibst', 'gibt', 'geben', 'gebt', 'geben'],
    schlafen: ['schlafe', 'schläfst', 'schläft', 'schlafen', 'schlaft', 'schlafen'], laufen: ['laufe', 'läufst', 'läuft', 'laufen', 'lauft', 'laufen'],
    sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'], haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
    werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'], können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
    müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'], wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
    dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'], sollen: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'],
  };
  const PRON = ['ich', 'du', 'er', 'wir', 'ihr', 'sie (zij, meervoud)'];
  G.verbPres = () => {
    const inf = P(Object.keys(VP)), f = VP[inf], i = R(0, 5);
    return T(`Vul de juiste vorm in: ${PRON[i]} ___ (${inf})`, [f[i]], `${PRON.map((p, k) => `${p.split(' ')[0]} ${f[k]}`).join(', ')}.`);
  };
  const PERF = [['machen', 'gemacht', 'haben'], ['spielen', 'gespielt', 'haben'], ['gehen', 'gegangen', 'sein'], ['fahren', 'gefahren', 'sein'], ['essen', 'gegessen', 'haben'],
    ['sehen', 'gesehen', 'haben'], ['kommen', 'gekommen', 'sein'], ['sprechen', 'gesprochen', 'haben'], ['lesen', 'gelesen', 'haben'], ['schreiben', 'geschrieben', 'haben'],
    ['trinken', 'getrunken', 'haben'], ['nehmen', 'genommen', 'haben'], ['schlafen', 'geschlafen', 'haben'], ['bleiben', 'geblieben', 'sein'], ['arbeiten', 'gearbeitet', 'haben'],
    ['wohnen', 'gewohnt', 'haben'], ['lernen', 'gelernt', 'haben'], ['sein', 'gewesen', 'sein'], ['aufstehen', 'aufgestanden', 'sein'], ['anrufen', 'angerufen', 'haben'], ['besuchen', 'besucht', 'haben']];
  G.perfekt = () => {
    const [inf, part, aux] = P(PERF);
    if (Math.random() < .35) return M(`Welk hulpwerkwoord hoort bij "${inf}" in het Perfekt (voltooid tegenwoordige tijd)?`, aux, [aux === 'haben' ? 'sein' : 'haben'],
      `${inf} → ${part} met ${aux}. Met "sein" staan meestal werkwoorden van beweging of verandering van toestand (gehen, fahren, kommen, bleiben, sein).`);
    return T(`Vul het voltooid deelwoord in: Ich ${aux === 'haben' ? 'habe' : 'bin'} gestern ___ (${inf}).`, [part], `Perfekt: ich ${aux === 'haben' ? 'habe' : 'bin'} ${part}.`);
  };

  // --- Nederlands: werkwoordspelling ---
  const DT = [['werken', 'werk'], ['worden', 'word'], ['vinden', 'vind'], ['zitten', 'zit'], ['praten', 'praat'], ['rijden', 'rijd'], ['antwoorden', 'antwoord'], ['eten', 'eet'], ['lopen', 'loop'], ['maken', 'maak'], ['gebeuren', 'gebeur'], ['wachten', 'wacht']];
  const hijForm = st => (/t$/.test(st) ? st : st + 't');
  G.dtPres = () => {
    const [inf, st] = P(DT), k = R(0, 2);
    if (k === 0) return T(`Vul de juiste vorm in: Mijn broer ___ (${inf}) elke dag.`, [hijForm(st)], `Bij hij/zij/het hoort stam + t: ${st}${/t$/.test(st) ? ' (de stam eindigt al op t, dus geen extra t)' : ' + t'}.`);
    if (k === 1) return T(`Vul de juiste vorm in: ___ jij (${inf}) vandaag?`, [st], `Bij inversie (werkwoord voor "jij") valt de -t weg: ${st} jij.`);
    return T(`Vul de juiste vorm in: Jij ___ (${inf}) nooit op tijd.`, [hijForm(st)], `Jij + werkwoord vooraan de zin niet omgedraaid: stam + t = ${hijForm(st)}.`);
  };
  const DP = [['werken', 'gewerkt'], ['maken', 'gemaakt'], ['praten', 'gepraat'], ['horen', 'gehoord'], ['spelen', 'gespeeld'], ['wonen', 'gewoond'], ['leven', 'geleefd'], ['reizen', 'gereisd'],
    ['verhuizen', 'verhuisd'], ['bellen', 'gebeld'], ['kloppen', 'geklopt'], ['fietsen', 'gefietst'], ['koken', 'gekookt'], ['vragen', 'gevraagd'], ['leren', 'geleerd'], ['bakken', 'gebakken']];
  G.dtPart = () => {
    const [inf, part] = P(DP);
    return T(`Vul het voltooid deelwoord in: Ik heb gisteren ___ (${inf}).`, [part], `Voltooid deelwoord van ${inf} = ${part}. Let op de 't kofschip: eindigt de stam van de hele werkwoordsvorm (infinitief minus -en) op t, k, f, s, ch of p, dan -t; anders -d.`);
  };

  /* ---------------- DUITS ---------------- */
  const duits = { id: 'du', name: 'Duits', icon: '🇩🇪', color: '#e0a000', units: [
    U('h4-du1', 'Woordenschat: school en vrije tijd', '🏫', 'Typ het Duitse woord (met lidwoord)', { qs: [
      T('Wat is het Duits voor "het huiswerk"?', ['die Hausaufgaben'], 'Hausaufgaben is altijd meervoud: die Hausaufgaben.'),
      T('Wat is het Duits voor "de leraar"?', ['der Lehrer'], ''),
      T('Wat is het Duits voor "de pauze"?', ['die Pause'], ''),
      T('Wat is het Duits voor "het schoolvak"?', ['das Fach'], ''),
      T('Wat is het Duits voor "het examen"?', ['die Prüfung'], 'Eén lidwoord vergeten? Bij Duitse zelfstandige naamwoorden hoort altijd het lidwoord erbij.'),
      T('Wat is het Duits voor "het weekend"?', ['das Wochenende'], ''),
      T('Wat is het Duits voor "de vrije tijd"?', ['die Freizeit'], ''),
      T('Wat is het Duits voor "het rooster"?', ['der Stundenplan'], ''),
      T('Wat is het Duits voor "het cijfer" (op school)?', ['die Note'], ''),
      T('Wat is het Duits voor "leren"?', ['lernen'], ''),
      M('Wat betekent "die Klasse"?', 'de klas', ['de les', 'de school', 'het schoolbord'], 'Het schoolbord is die Tafel; de les is die Stunde.'),
      M('Wat betekent "die Freunde treffen"?', 'vrienden ontmoeten', ['vrienden bellen', 'vrienden uitnodigen', 'vrienden helpen'], 'treffen = ontmoeten.'),
    ] }),
    U('h4-du2', 'Woordenschat: reizen en stad', '🚉', 'Station, richting vragen, overnachten', { qs: [
      T('Wat is het Duits voor "het station"?', ['der Bahnhof'], ''),
      T('Wat is het Duits voor "het vliegveld"?', ['der Flughafen'], ''),
      T('Wat is het Duits voor "de bushalte"?', ['die Bushaltestelle', 'die Haltestelle'], ''),
      T('Wat is het Duits voor "het kaartje" (trein of bus)?', ['die Fahrkarte', 'das Ticket'], ''),
      T('Wat is het Duits voor "de bagage"?', ['das Gepäck'], ''),
      T('Wat is het Duits voor "de bezienswaardigheid"?', ['die Sehenswürdigkeit'], ''),
      T('Wat is het Duits voor "de jeugdherberg"?', ['die Jugendherberge'], ''),
      T('Wat is het Duits voor "overnachten"?', ['übernachten'], ''),
      T('Wat is het Duits voor "rechtdoor"?', ['geradeaus'], ''),
      M('Wat betekent "Entschuldigung, wo ist der Bahnhof?"', 'Pardon, waar is het station?', ['Sorry, wanneer vertrekt de trein?', 'Pardon, hoe laat is het?', 'Waar kan ik een kaartje kopen?'], ''),
      M('Wat betekent "Ich möchte ein Zimmer reservieren"?', 'Ik wil graag een kamer reserveren', ['Ik wil graag een kamer huren voor een jaar', 'Ik heb een kamer gereserveerd', 'Is er een kamer vrij?'], 'möchten = graag willen.'),
    ] }),
    U('h4-du3', 'Lidwoorden en naamvallen', '🔤', 'Nominativ, Akkusativ, Dativ, Genitiv', { qs: [
      M('Ich sehe ___ Mann.', 'den', ['der', 'dem', 'des'], 'Lijdend voorwerp (Akkusativ), mannelijk: der Mann → den Mann.'),
      M('___ Hund von meiner Schwester ist klein.', 'Der', ['Den', 'Dem', 'Des'], 'Onderwerp = Nominativ: der Hund.'),
      M('Ich gebe ___ Frau das Buch.', 'der', ['die', 'den', 'das'], 'Meewerkend voorwerp (Dativ), vrouwelijk: der Frau.'),
      M('Er schenkt ___ Kind einen Ball.', 'dem', ['das', 'den', 'des'], 'Dativ onzijdig: dem Kind.'),
      M('Wir kaufen ___ Auto.', 'das', ['dem', 'den', 'des'], 'Akkusativ onzijdig blijft das.'),
      M('Das ist das Haus ___ Lehrers.', 'des', ['dem', 'den', 'der'], 'Genitiv mannelijk/onzijdig: des + naamwoord op -s.'),
      M('Ich kenne ___ Lehrerin.', 'die', ['der', 'den', 'dem'], 'Akkusativ vrouwelijk blijft die.'),
      M('Met welke vraag vind je het meewerkend voorwerp (Dativ)?', 'Wem?', ['Wen?', 'Wessen?', 'Wer?'], 'Nominativ: wer? · Akkusativ: wen? · Dativ: wem? · Genitiv: wessen?'),
      M('Welk lidwoord verandert alleen in de Akkusativ (vergeleken met de Nominativ)?', 'der → den (alleen mannelijk)', ['die → den', 'das → dem', 'alle lidwoorden'], 'Alleen het mannelijke lidwoord verandert: der → den.'),
    ] }),
    U('h4-du4', 'Voorzetsels', '📍', 'Dativ, Akkusativ en wisselvoorzetsels', { qs: [
      M('Welk voorzetsel krijgt altijd de Dativ?', 'mit', ['für', 'durch', 'ohne'], 'Altijd Dativ: aus, bei, mit, nach, seit, von, zu.'),
      M('Welk voorzetsel krijgt altijd de Akkusativ?', 'durch', ['mit', 'bei', 'zu'], 'Altijd Akkusativ: durch, für, gegen, ohne, um.'),
      M('Ich fahre mit ___ Bus.', 'dem', ['den', 'der', 'das'], 'mit + Dativ, der Bus → dem Bus.'),
      M('Das Geschenk ist für ___ Mutter.', 'die', ['der', 'den', 'dem'], 'für + Akkusativ: die Mutter.'),
      M('Er geht ohne ___ Mantel.', 'den', ['dem', 'der', 'des'], 'ohne + Akkusativ: den Mantel.'),
      M('Nach ___ Unterricht gehen wir nach Hause.', 'dem', ['den', 'das', 'des'], 'nach + Dativ: dem Unterricht.'),
      M('Ich gehe in ___ Schule. (richting: waarheen?)', 'die', ['der', 'den', 'dem'], 'Bij beweging naar een plek (wohin?) volgt de Akkusativ.'),
      M('Ich bin in ___ Schule. (plaats: waar?)', 'der', ['die', 'den', 'dem'], 'Bij een plek (wo?) volgt de Dativ: in der Schule.'),
      M('Das Buch liegt auf ___ Tisch. (waar?)', 'dem', ['den', 'der', 'das'], 'wo? → Dativ.'),
      M('Ich lege das Buch auf ___ Tisch. (waarheen?)', 'den', ['dem', 'der', 'das'], 'wohin? → Akkusativ.'),
    ] }),
    U('h4-du5', 'Werkwoorden: tegenwoordige tijd', '🔁', 'Vervoegen, ook onregelmatig', { gen: [G.verbPres] }),
    U('h4-du6', 'Perfekt', '⏪', 'Voltooid deelwoord en haben/sein', { gen: [G.perfekt] }),
    U('h4-du7', 'Woordvolgorde', '🧩', 'Plaats van het werkwoord', { qs: [
      M('Welke zin is juist?', 'Ich weiß, dass er morgen kommt.', ['Ich weiß, dass er kommt morgen.', 'Ich weiß, dass kommt er morgen.', 'Ich weiß, er dass morgen kommt.'], 'In een bijzin met dass staat de persoonsvorm aan het eind.'),
      M('Welke zin is juist?', 'Heute gehe ich ins Kino.', ['Heute ich gehe ins Kino.', 'Heute ins Kino gehe ich.', 'Heute gehe ins Kino ich.'], 'In de hoofdzin staat de persoonsvorm altijd op plaats 2; het onderwerp volgt na "heute".'),
      M('Welke zin is juist?', 'Ich habe gestern Pizza gegessen.', ['Ich habe gegessen gestern Pizza.', 'Ich gegessen habe gestern Pizza.', 'Ich habe gestern gegessen Pizza.'], 'Perfekt: hulpwerkwoord op plaats 2, voltooid deelwoord aan het eind.'),
      M('Welke zin is juist?', 'Ich muss heute lernen.', ['Ich muss lernen heute.', 'Ich lernen muss heute.', 'Ich heute muss lernen.'], 'Modaal werkwoord op plaats 2, infinitief aan het eind.'),
      M('Welke zin is juist?', 'Ich bleibe zu Hause, weil ich krank bin.', ['Ich bleibe zu Hause, weil ich bin krank.', 'Ich bleibe zu Hause, weil bin ich krank.', 'Ich bleibe zu Hause, weil krank ich bin.'], 'Na weil gaat de persoonsvorm naar het eind.'),
      M('Welke vraag is juist?', 'Wann kommst du?', ['Wann du kommst?', 'Wann kommt du?', 'Kommst wann du?'], 'Bij een vraagwoord staat de persoonsvorm direct erna.'),
      M('Welk voegwoord verplaatst de persoonsvorm NIET naar het eind?', 'denn', ['weil', 'dass', 'wenn'], 'Nevenschikkend: und, aber, oder, denn, sondern. Die veranderen de woordvolgorde niet.'),
      M('Ich glaube, dass er nach Hause ___.', 'gegangen ist', ['ist gegangen', 'gegangen', 'geht gegangen'], 'In de bijzin staat het hulpwerkwoord helemaal achteraan: gegangen ist.'),
    ] }),
  ] };

  /* ---------------- NEDERLANDS ---------------- */
  const nederlands = { id: 'ne', name: 'Nederlands', icon: '🇳🇱', color: '#f26b3a', units: [
    U('h4-ne1', 'Werkwoordspelling', '✍️', 'dt-regels en het voltooid deelwoord', { gen: [G.dtPres, G.dtPart], qs: [
      M('Ik geef ___ het boek. (de kinderen)', 'hun', ['hen', 'ze', 'zij'], 'Meewerkend voorwerp (aan wie?) → hun. Ik geef aan hun.'),
      M('Ik zie ___ elke dag. (de kinderen)', 'hen', ['hun', 'zij', 'hunnen'], 'Lijdend voorwerp of na een voorzetsel → hen. Vervang door "mij/ons": ik zie ons → hen.'),
      M('Welke vorm is juist: "Het meisje ___ een boek."', 'leest', ['leesd', 'leest zij', 'lees'], 'Stam lees + t.'),
    ] }),
    U('h4-ne2', 'Taalverzorging', '📝', 'Meervoud, hoofdletters, samenstellingen', { qs: [
      M('Wat is het meervoud van "foto"?', "foto's", ['fotos', 'fotoos', 'fotoën'], "Woorden op -o krijgen 's in het meervoud."),
      M('Wat is het meervoud van "idee"?', 'ideeën', ['idees', 'ideen', 'ideëen'], 'Op -ee met trema in het meervoud: ideeën.'),
      M('Welke zin heeft juist hoofdlettergebruik?', 'Ik spreek Nederlands en Duits.', ['ik spreek nederlands en duits.', 'Ik spreek nederlands en Duits.', 'Ik Spreek Nederlands En Duits.'], 'Talen schrijf je met een hoofdletter; werkwoorden niet.'),
      M('Welke schrijfwijze is juist?', 'maandag 3 november', ['Maandag 3 November', 'maandag 3 November', 'Maandag 3 november'], 'Dagen en maanden schrijf je met een kleine letter.'),
      M('Welk woord schrijf je aan elkaar?', 'fietsenstalling', ['fietsen stalling', 'fietsen-stalling', 'fietsen Stalling'], 'Samenstellingen schrijf je in één woord.'),
      M('Welke zin is juist?', 'Hij heeft een mooi huis.', ['Hij heeft een mooie huis.', 'Hij heeft een mooien huis.', 'Hij heeft een mooi hùis.'], 'Onbepaald + het-woord (een huis): geen -e.'),
      M('Welke zin is juist?', 'Het mooie huis is groot.', ['Het mooi huis is groot.', 'Het mooien huis is groot.', 'Het mooi-e huis is groot.'], 'Bepaald lidwoord (het): wel -e.'),
      M('Hij is groter ___ ik.', 'dan', ['als', 'dat', 'dun'], 'Ongelijkheid: dan. Gelijkheid: net zo groot als.'),
      M('Het boek ___ ik las, was spannend.', 'dat', ['die', 'wat', 'dit'], 'Betrekkelijk voornaamwoord bij een het-woord: dat. Bij de-woorden: die.'),
    ] }),
    U('h4-ne3', 'Stijlfiguren en begrippen', '🎭', 'Metafoor, ironie en meer', { qs: [
      M('"Het leven is een reis." Welke stijlfiguur is dit?', 'metafoor', ['vergelijking', 'personificatie', 'hyperbool'], 'Een metafoor vergelijkt zonder "als" of "zoals".'),
      M('"Zo sterk als een beer." Welke stijlfiguur is dit?', 'vergelijking', ['metafoor', 'ironie', 'alliteratie'], 'Met "als" of "zoals".'),
      M('"De wind fluistert door de bomen." Welke stijlfiguur is dit?', 'personificatie', ['metafoor', 'hyperbool', 'ironie'], 'Een niet-levend iets krijgt menselijke eigenschappen.'),
      M('"Ik heb het al duizend keer gezegd!" Welke stijlfiguur is dit?', 'hyperbool', ['ironie', 'eufemisme', 'metafoor'], 'Overdrijving.'),
      M('Het regent en iemand zegt: "Wat een heerlijk weer!" Welke stijlfiguur is dit?', 'ironie', ['hyperbool', 'personificatie', 'alliteratie'], 'Je bedoelt het tegenovergestelde van wat je zegt.'),
      M('"Milde maan, mooie mist." Welke stijlfiguur is dit?', 'alliteratie', ['assonantie', 'metafoor', 'ironie'], 'Herhaling van beginklanken (hier de m).'),
      M('"Hij is heengegaan" in plaats van "hij is dood". Welke stijlfiguur is dit?', 'eufemisme', ['hyperbool', 'ironie', 'vergelijking'], 'Een mildere omschrijving van iets onaangenaams.'),
      M('Wat is een antoniem van "hoog"?', 'laag', ['groot', 'hoger', 'lang'], 'Antoniem = tegenovergestelde. Synoniem = woord met dezelfde betekenis.'),
      M('Wat betekent "figuurlijk"?', 'in overdrachtelijke betekenis', ['woordelijk', 'met afbeeldingen', 'in cijfers'], 'Letterlijk = in de eigenlijke betekenis.'),
    ] }),
    U('h4-ne4', 'Argumentatie en tekstsoorten', '🗣️', 'Standpunt, argument, drogreden', { qs: [
      M('Wat is een standpunt?', 'de mening van de schrijver over een kwestie', ['een bewijs voor een mening', 'een voorbeeld', 'de samenvatting van een tekst'], 'Een argument onderbouwt het standpunt.'),
      M('Welk signaalwoord leidt meestal een argument in?', 'omdat', ['daarom', 'dus', 'kortom'], 'Daarom/dus/kortom leiden een conclusie in.'),
      M('Wat is een betoog?', 'een tekst waarin de schrijver een standpunt verdedigt', ['een tekst die alleen informatie geeft', 'een tekst met instructies', 'een verhaal'], ''),
      M('Wat is een tegenargument?', 'een argument dat tegen het eigen standpunt pleit', ['een argument voor het eigen standpunt', 'een voorbeeld', 'een conclusie'], 'Een goede schrijver weerlegt het daarna.'),
      M('"Je kunt hem niet geloven, hij is toch maar een leerling." Welke drogreden is dit?', 'persoonlijke aanval (ad hominem)', ['cirkelredenering', 'generalisatie', 'autoriteitsargument'], 'Je valt de persoon aan, niet het argument.'),
      M('"Iedereen die ik ken vindt dit mooi, dus iedereen vindt het mooi." Welke drogreden is dit?', 'generalisatie (te snel concluderen)', ['persoonlijke aanval', 'cirkelredenering', 'valse tegenstelling'], 'Een paar gevallen zijn geen bewijs voor alles.'),
      M('Welke tekstsoort laat meerdere kanten van een onderwerp zien zonder één standpunt op te dringen?', 'beschouwing', ['betoog', 'instructie', 'reclame'], ''),
      M('Waar staat het standpunt vaak in een betoog?', 'in de inleiding of aan het slot', ['alleen in het midden', 'in de titel van elke alinea', 'nergens'], ''),
    ] }),
    U('h4-ne5', 'Literatuurgeschiedenis', '📚', 'Perioden, schrijvers en boeken', { qs: [
      M('Wie schreef "Max Havelaar" (1860)?', 'Multatuli', ['Willem Elsschot', 'Harry Mulisch', 'Gerard Reve'], 'Multatuli = Eduard Douwes Dekker. Het boek kritiseert het koloniale stelsel.'),
      M('Wie schreef "De aanslag" (1982)?', 'Harry Mulisch', ['Gerard Reve', 'W.F. Hermans', 'Nescio'], 'Het verhaal speelt in en na de Tweede Wereldoorlog.'),
      M('Wie schreef "De avonden" (1947)?', 'Gerard Reve', ['Harry Mulisch', 'Nescio', 'Multatuli'], ''),
      M('Wie schreef "De donkere kamer van Damokles"?', 'W.F. Hermans', ['Gerard Reve', 'Willem Elsschot', 'Bernlef'], ''),
      M('Wie schreef "Het Achterhuis"?', 'Anne Frank', ['Etty Hillesum', 'Annie M.G. Schmidt', 'Miep Gies'], 'Het dagboek uit de onderduik in Amsterdam.'),
      M('Welke schrijver wordt verbonden met de Gouden Eeuw?', 'Vondel', ['Multatuli', 'Reve', 'Mulisch'], 'Joost van den Vondel, o.a. "Gijsbrecht van Aemstel" (1637).'),
      M('Wat is kenmerkend voor de Tachtigers (vanaf ca. 1880)?', 'individualisme en nadruk op persoonlijke gevoelens en schoonheid van de taal', ['maatschappijkritiek van de arbeidersklasse', 'religieuze verhalen', 'ridderverhalen'], 'Bekend: Willem Kloos, Frederik van Eeden, Albert Verwey.'),
      M('Welke periode kenmerkt zich door experimentele poëzie vlak na de Tweede Wereldoorlog?', 'de Vijftigers', ['de Tachtigers', 'de Romantiek', 'de Verlichting'], 'Bekend: Lucebert.'),
      M('"Van den vos Reynaerde" hoort bij…', 'de Middeleeuwen', ['de Romantiek', 'het Realisme', 'de Verlichting'], 'Een dierenepos uit de 13e eeuw.'),
    ] }),
  ] };

  /* ---------------- KUNST EN CKV ---------------- */
  const kunst = { id: 'ku', name: 'Kunst en CKV', icon: '🎨', color: '#e04b8b', units: [
    U('h4-ku1', 'Kunststromingen', '🖼️', 'Van renaissance tot pop-art', { qs: [
      M('Welke kunstenaar hoort bij de renaissance?', 'Leonardo da Vinci', ['Claude Monet', 'Andy Warhol', 'Piet Mondriaan'], 'Renaissance: herleving van de klassieke oudheid, perspectief, ideaal van de mens.'),
      M('Welke stroming is bekend om sterke licht-donkercontrasten en drama?', 'barok', ['impressionisme', 'De Stijl', 'pop-art'], 'Bijvoorbeeld Caravaggio en Rembrandt (clair-obscur).'),
      M('Welke stroming schilderde vluchtige lichtindrukken, vaak buiten?', 'impressionisme', ['kubisme', 'realisme', 'barok'], 'Monet, Renoir, Degas.'),
      M('Welke schilder maakte "De sterrennacht"?', 'Vincent van Gogh', ['Claude Monet', 'Edvard Munch', 'Rembrandt'], 'Van Gogh hoort bij het postimpressionisme.'),
      M('Welke schilder maakte "De schreeuw" en hoort bij het expressionisme?', 'Edvard Munch', ['Salvador Dalí', 'Pablo Picasso', 'Roy Lichtenstein'], 'Expressionisme: gevoelens, felle kleuren, vervorming.'),
      M('Welke stroming toont meerdere gezichtspunten tegelijk in één werk?', 'kubisme', ['surrealisme', 'impressionisme', 'romantiek'], 'Picasso en Braque.'),
      M('Welke stroming is bekend om dromerige, onwaarschijnlijke beelden?', 'surrealisme', ['realisme', 'kubisme', 'De Stijl'], 'Dalí en Magritte.'),
      M('Welke stroming gebruikte vooral primaire kleuren en horizontale en verticale lijnen?', 'De Stijl', ['expressionisme', 'barok', 'pop-art'], 'Piet Mondriaan, Theo van Doesburg, Gerrit Rietveld.'),
      M('Welke kunstenaar hoort bij de pop-art?', 'Andy Warhol', ['Paul Cézanne', 'Rubens', 'Kirchner'], 'Pop-art gebruikt consumptie en reclame als onderwerp.'),
      M('Welke schilder maakte "De Nachtwacht"?', 'Rembrandt van Rijn', ['Johannes Vermeer', 'Frans Hals', 'Jan Steen'], 'Te zien in het Rijksmuseum, Amsterdam.'),
    ] }),
    U('h4-ku2', 'Beeldende begrippen', '📐', 'Kleur, vorm, compositie', { qs: [
      M('Welke kleuren zijn de primaire kleuren (bij schilderen)?', 'rood, geel en blauw', ['rood, groen en blauw', 'oranje, groen en paars', 'zwart, wit en grijs'], 'Secundair: oranje, groen, paars.'),
      M('Welke kleur is de complementaire kleur van blauw?', 'oranje', ['groen', 'geel', 'paars'], 'Complementair: rood-groen, blauw-oranje, geel-paars.'),
      M('Wat is perspectief?', 'een manier om ruimte en diepte op een plat vlak weer te geven', ['de kleur van een schilderij', 'de dikte van de verf', 'het onderwerp van een werk'], ''),
      M('Wat is een triptiek?', 'een werk in drie delen', ['een werk met drie kleuren', 'een beeld van drie personen', 'een tekening met drie lijnen'], 'Bijvoorbeeld een altaarstuk.'),
      M('Wat is een ready-made (Duchamp)?', 'een gewoon gebruiksvoorwerp dat tot kunst wordt verklaard', ['een snel gemaakte schets', 'een kopie van een oud schilderij', 'een gebeeldhouwd portret'], 'Bijvoorbeeld "Fountain" (1917).'),
      M('Wat is een mozaïek?', 'een beeld gemaakt van kleine stukjes steen of glas', ['een tekening met houtskool', 'een gegoten beeld', 'een foto'], ''),
      M('Wat is een ets?', 'een grafische techniek waarbij lijnen in een metalen plaat worden geëtst', ['een schilderij met waterverf', 'een soort beeldhouwwerk', 'een digitale tekening'], 'Rembrandt maakte veel etsen.'),
      M('Wat bedoelt men met compositie?', 'de opbouw en de plaatsing van elementen in een werk', ['de prijs van een werk', 'de gebruikte verfsoort', 'de naam van de maker'], ''),
      M('Wat is abstracte kunst?', 'kunst die geen herkenbare werkelijkheid uitbeeldt', ['kunst die alleen uit portretten bestaat', 'kunst uit de oudheid', 'kunst met veel tekst'], 'Voorbeelden: Mondriaan, Kandinsky.'),
    ] }),
    U('h4-ku3', 'Kunstvormen en cultuur', '🎭', 'Disciplines, beroepen en instellingen', { qs: [
      M('Wie leidt een orkest?', 'de dirigent', ['de regisseur', 'de choreograaf', 'de curator'], ''),
      M('Wie bedenkt de bewegingen in een dansvoorstelling?', 'de choreograaf', ['de dirigent', 'de regisseur', 'de componist'], ''),
      M('Wie zorgt voor een tentoonstelling en de collectie van een museum?', 'de curator', ['de regisseur', 'de recensent', 'de dramaturg'], ''),
      M('Wat is een opera?', 'een muziektheaterstuk waarin vrijwel alles gezongen wordt', ['een toneelstuk zonder muziek', 'een dansvoorstelling', 'een concert zonder zang'], ''),
      M('Wat is cabaret?', 'een voorstelling met sketches, liedjes en vaak maatschappijkritiek', ['een klassiek orkestconcert', 'een film', 'een stomme dans'], ''),
      M('Wat is een recensie?', 'een beoordeling van een kunstwerk of voorstelling', ['een samenvatting van een boek', 'een programmaboekje', 'een kaartje'], ''),
      M('In welk museum hangt "Meisje met de parel" van Vermeer?', 'Mauritshuis (Den Haag)', ['Rijksmuseum (Amsterdam)', 'Van Gogh Museum', 'Kröller-Müller Museum'], ''),
      M('Waar staat een grote collectie werk van Van Gogh in het midden van het land?', 'Kröller-Müller Museum (Otterlo)', ['Mauritshuis', 'Stedelijk Museum', 'Boijmans Van Beuningen'], 'Het Van Gogh Museum zelf staat in Amsterdam.'),
      M('Wat is populaire cultuur?', 'cultuur gemaakt voor een groot publiek, zoals popmuziek en series', ['alleen oude kunst', 'cultuur van een kleine elite', 'alleen musea'], ''),
      M('Wat is cultureel erfgoed?', 'gebouwen, voorwerpen en tradities die we bewaren voor de toekomst', ['alleen schilderijen', 'nieuwe kunst', 'geld voor kunstenaars'], ''),
    ] }),
    U('h4-ku4', 'Architectuur en vormgeving', '🏛️', 'Gotiek tot De Stijl', { qs: [
      M('Wat is kenmerkend voor de gotiek?', 'spitsbogen, steunberen en grote glas-in-loodramen', ['ronde bogen en kleine ramen', 'platte daken en veel glas en staal', 'rijk versierde gevels met krullen'], 'Voorbeeld: kathedraal van Reims.'),
      M('Wat is kenmerkend voor de romaanse bouwstijl?', 'ronde bogen en dikke muren', ['spitsbogen', 'betonnen kubussen', 'koepels van glas'], ''),
      M('Wie bouwde het Rietveld Schröderhuis in Utrecht?', 'Gerrit Rietveld', ['Antoni Gaudí', 'Rem Koolhaas', 'Walter Gropius'], 'Een icoon van De Stijl (1924).'),
      M('Welke architect bouwde de Sagrada Família in Barcelona?', 'Antoni Gaudí', ['Le Corbusier', 'Rietveld', 'Gropius'], ''),
      M('Waar staat de Bauhaus-school voor?', 'functioneel ontwerp waarin kunst, architectuur en techniek samenkomen', ['rijke versieringen en krullen', 'schilderen in de open lucht', 'alleen beeldhouwkunst'], 'Opgericht door Walter Gropius in 1919.'),
      M('Welke Amsterdamse bouwstijl gebruikt baksteen met golvende, expressieve vormen (zoals Het Schip)?', 'Amsterdamse School', ['De Stijl', 'Bauhaus', 'gotiek'], ''),
      M('Wat betekent functionalisme?', 'de vorm volgt de functie', ['de vorm is belangrijker dan de functie', 'alles moet versierd zijn', 'alles moet ouderwets zijn'], ''),
      M('Waar is "form follows function" een uitgangspunt van?', 'het modernisme in architectuur en design', ['de barok', 'de renaissance', 'de romantiek'], ''),
    ] }),
  ] };

  /* ---------------- extra units voor bestaande vakken ---------------- */
  const geH = havo4.subjects.find(s => s.id === 'ge'), akH = havo4.subjects.find(s => s.id === 'ak');
  geH.units.push(
    U('h4-ge4', 'Gouden Eeuw en VOC', '⛵', 'Tijdvak 6 (1600–1700)', { qs: [
      M('Wat was de VOC?', 'de Verenigde Oostindische Compagnie, een handelsonderneming (1602)', ['een Nederlandse oorlogsvloot', 'een politieke partij', 'een Spaanse handelsbank'], 'De eerste grote naamloze onderneming ter wereld.'),
      M('Waar handelde de VOC vooral?', 'in Azië (specerijen, textiel, thee)', ['in Noord-Amerika', 'in Zuid-Amerika', 'alleen in Europa'], 'De WIC (1621) was actief in de Atlantische wereld.'),
      M('Wat betekende de Vrede van Münster (1648)?', 'het einde van de Tachtigjarige Oorlog en erkenning van de Republiek', ['het begin van de Tachtigjarige Oorlog', 'het einde van de Eerste Wereldoorlog', 'de oprichting van de VOC'], ''),
      M('Wie had het meeste politieke gezag in de Republiek?', 'de gewesten en de regenten (stadsbestuurders)', ['een koning', 'één alleenheerser', 'de paus'], 'Het gezag was verdeeld over gewesten en steden.'),
      M('Wat kenmerkt het regentenpatriciaat?', 'rijke handelsfamilies die het bestuur in steden bezetten', ['de adel van de Spaanse koning', 'boeren die zelf bestuurden', 'soldaten van de Staatse legers'], ''),
      M('Wat gebeurde er in de Republiek met godsdienst?', 'er was relatieve verdraagzaamheid, maar de gereformeerde kerk had een bevoorrechte positie', ['alleen katholieken waren toegestaan', 'geen enkele kerk was toegestaan', 'iedereen werd verplicht lutheraan'], ''),
      M('Wat was de rol van de Nederlandse slavenhandel?', 'Nederlanders namen deel aan de handel in tot slaaf gemaakte Afrikanen (o.a. via de WIC)', ['Nederland deed nooit mee', 'alleen Spanje deed mee', 'het verbod bestond al in 1600'], 'Pas in 1863 werd de slavernij in Suriname en de Antillen afgeschaft.'),
    ] }),
    U('h4-ge5', 'Democratie en verzuiling', '🗳️', 'Nederland 1848–1960', { qs: [
      M('Wat veranderde er met de grondwet van 1848?', 'Nederland werd een constitutionele monarchie met meer macht voor het parlement', ['Nederland werd een republiek', 'de koning kreeg absolute macht', 'het kiesrecht werd algemeen'], 'Thorbecke was de bekendste ontwerper.'),
      M('Wat is verzuiling?', 'de samenleving verdeeld in aparte groepen (zuilen) naar religie of levensovertuiging', ['het verdwijnen van kerken', 'de bouw van torens', 'de scheiding van Nederland en België'], 'Katholiek, protestants, liberaal en socialistisch.'),
      M('Wat regelde de Pacificatie van 1917?', 'gelijke financiering van openbaar en bijzonder onderwijs, en algemeen mannenkiesrecht', ['het vrouwenkiesrecht', 'de afschaffing van de adel', 'de onafhankelijkheid van Indonesië'], 'Vrouwenkiesrecht volgde in 1919.'),
      M('In welk jaar kregen vrouwen in Nederland kiesrecht (actief)?', '1919', ['1848', '1917', '1945'], 'Passief kiesrecht (zich verkiesbaar stellen) kregen ze al in 1917.'),
      M('Wat was de Sociale Kwestie in de 19e eeuw?', 'de slechte leefomstandigheden van arbeiders in de industrialisatie', ['de strijd om de macht tussen koningen', 'een oorlog met België', 'een tekort aan scholen voor de adel'], ''),
      M('Wat deed het "Kinderwetje van Van Houten" (1874)?', 'het verbood kinderarbeid onder twaalf jaar in fabrieken', ['het verplichtte alle kinderen naar de universiteit', 'het gaf vrouwen kiesrecht', 'het schafte de slavernij af'], ''),
      M('Wat is de verzorgingsstaat?', 'de overheid zorgt voor sociale zekerheid zoals AOW en uitkeringen', ['een staat zonder overheid', 'een staat die alleen belasting int', 'een staat van alleen kerken'], 'De AOW kwam in 1957.'),
    ] }),
    U('h4-ge6', 'Europese samenwerking', '🇪🇺', 'Van EGKS tot Brexit', { qs: [
      M('Waarom begon de Europese samenwerking na 1945?', 'om nieuwe oorlogen te voorkomen en economisch te herstellen', ['om Amerika te verslaan', 'om koloniën te veroveren', 'om het communisme te steunen'], ''),
      M('Wat was de EGKS (1951)?', 'een samenwerking voor kolen en staal', ['een militair bondgenootschap', 'een munt', 'een rechtbank'], 'Zes landen deden mee, o.a. Nederland.'),
      M('Welk verdrag (1957) richtte de EEG op?', 'het Verdrag van Rome', ['het Verdrag van Versailles', 'het Verdrag van Maastricht', 'het Verdrag van Münster'], ''),
      M('Welk verdrag (1992) vormde de Europese Unie en bereidde de euro voor?', 'het Verdrag van Maastricht', ['het Verdrag van Rome', 'het Verdrag van Utrecht', 'het Verdrag van Lissabon'], ''),
      M('Wanneer kwamen euromunten en -biljetten in omloop?', '2002', ['1992', '1999', '2008'], 'Girale betalingen in euro begonnen al in 1999.'),
      M('Wat is Brexit?', 'het vertrek van het Verenigd Koninkrijk uit de EU', ['de toetreding van Groot-Brittannië tot de EU', 'een nieuw EU-verdrag', 'een handelsoorlog met de VS'], 'Referendum in 2016; vertrek op 31 januari 2020.'),
    ] }),
  );
  akH.units.push(
    U('h4-ak3', 'Water en Nederland', '🌊', 'Deltawerken, polders en rivieren', { qs: [
      M('Welke ramp leidde tot de Deltawerken?', 'de Watersnoodramp van 1953', ['de overstroming van 1995', 'de Elfstedentocht', 'de val van de Muur'], ''),
      M('Wat is een polder?', 'een gebied dat kunstmatig droog gehouden wordt en lager ligt dan het omringende water', ['een berggebied', 'een woestijn', 'een natuurgebied zonder mensen'], ''),
      M('Waar is de Afsluitdijk een verbinding tussen?', 'Noord-Holland en Friesland', ['Zeeland en Brabant', 'Texel en Vlieland', 'Groningen en Drenthe'], 'Gebouwd in 1932; zo ontstond het IJsselmeer.'),
      M('Wat is Ruimte voor de Rivier?', 'maatregelen om rivieren meer ruimte te geven om hoog water veilig af te voeren', ['een plan voor meer scheepvaart', 'het droogleggen van rivieren', 'een nieuw kanaal naar Duitsland'], ''),
      M('In welke provincie liggen Lelystad en Almere?', 'Flevoland', ['Zeeland', 'Noord-Holland', 'Friesland'], 'Flevoland is grotendeels drooggelegd uit het IJsselmeer.'),
      M('Welke twee rivieren vormen samen met de Schelde een delta in Nederland?', 'Rijn en Maas', ['Donau en Rijn', 'Seine en Maas', 'Rijn en Elbe'], ''),
    ] }),
    U('h4-ak4', 'Globalisering en wereldeconomie', '🌐', 'Handel, ontwikkeling en haven', { qs: [
      M('Wat is globalisering?', 'het wereldwijd toenemen van verbindingen op het gebied van handel, cultuur en communicatie', ['het sluiten van landsgrenzen', 'het kleiner worden van de wereld in oppervlak', 'alleen het gebruik van internet'], ''),
      M('Wat is een multinational?', 'een bedrijf dat in meerdere landen vestigingen heeft', ['een bedrijf dat alleen exporteert', 'een buitenlands ministerie', 'een bank van de overheid'], ''),
      M('Wat is outsourcing?', 'werk of productie uitbesteden, vaak naar een land met lagere kosten', ['bedrijven die samen één bedrijf worden', 'het sluiten van een fabriek', 'het verhogen van het loon'], ''),
      M('Waaruit bestaat de HDI (Human Development Index)?', 'levensverwachting, onderwijs en inkomen', ['alleen inkomen', 'alleen bevolkingsgrootte', 'geboorte- en sterftecijfer'], ''),
      M('Wat is de grootste haven van Europa?', 'Rotterdam', ['Antwerpen', 'Hamburg', 'Amsterdam'], ''),
      M('Wat is een voordeel van containervervoer?', 'goederen laden en lossen gaat snel en goedkoop', ['er zijn minder schepen nodig dan ooit', 'het is langzamer maar duurzamer', 'goederen kunnen niet beschadigen'], ''),
      M('Waar staat Fairtrade voor?', 'eerlijke prijzen en omstandigheden voor producenten in ontwikkelingslanden', ['de goedkoopste producten', 'handel zonder belasting', 'alleen biologische producten'], ''),
    ] }),
  );

  // Extra-vakken (geen C&M): blijven beschikbaar onderaan
  havo4.subjects.forEach(s => { if (['na', 'sk', 'bi'].includes(s.id)) s.extra = true; });
  havo4.subjects.push(duits, nederlands, kunst);
  const ORDER = ['wi', 'du', 'ne', 'ge', 'ak', 'ku', 'na', 'sk', 'bi'];
  havo4.subjects.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  havo4.profile = 'C&M';

  /* ============ VWO 1 aardrijkskunde, volgens De Geo 1 havo/vwo (hoofdstuk 1 en 2) ============ */
  const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const CLIM = [
    { name: 'tropisch regenwoud', T: [26, 26, 26, 27, 27, 26, 26, 27, 27, 27, 27, 26], P: [260, 290, 310, 300, 250, 150, 110, 90, 110, 150, 190, 240] },
    { name: 'woestijn', T: [14, 16, 20, 25, 30, 33, 34, 34, 31, 26, 19, 15], P: [1, 1, 1, 0, 0, 0, 0, 0, 1, 2, 1, 1] },
    { name: 'gematigd zeeklimaat (zoals Nederland)', T: [3, 4, 7, 10, 14, 17, 19, 19, 15, 11, 7, 4], P: [65, 50, 55, 40, 60, 70, 80, 80, 75, 75, 80, 75] },
    { name: 'poolklimaat (toendra)', T: [-30, -31, -28, -20, -9, 0, 3, 1, -8, -17, -24, -28], P: [10, 10, 10, 10, 10, 15, 20, 25, 20, 15, 10, 10] },
  ];
  const sum = a => a.reduce((s, x) => s + x, 0);
  G.climateDiagram = () => {
    const c = P(CLIM), k = R(0, 4), tTxt = c.T.map(neg).join(', '), data = `Voorbeeldcijfers (januari t/m december). Temperatuur in °C: ${tTxt}. Neerslag in mm: ${c.P.join(', ')}.`;
    if (k === 0) { const m = Math.max(...c.T); return T(`${data} Welke maand is het warmst?`, c.T.map((v, i) => v === m ? MONTHS[i] : null).filter(Boolean), `De hoogste temperatuur is ${neg(m)} °C.`); }
    if (k === 1) { const avg = Math.round(sum(c.T) / 12 * 10) / 10; return num(`${data} Wat is de gemiddelde jaartemperatuur? (Rond af op 1 decimaal.)`, avg, '°C', `Alle 12 temperaturen optellen (${neg(sum(c.T))}) en delen door 12 = ${fmt(sum(c.T) / 12, 1)} °C.`, { tolAbs: 0.06 }); }
    if (k === 2) return num(`${data} Hoeveel mm neerslag valt er in een jaar in totaal?`, sum(c.P), 'mm', `Tel de 12 maandwaarden op: ${sum(c.P)} mm.`);
    if (k === 3) { const a = Math.max(...c.T) - Math.min(...c.T); return num(`${data} Hoe groot is het verschil tussen de warmste en de koudste maand (temperatuurverschil)?`, a, '°C', `${neg(Math.max(...c.T))} − ${par(Math.min(...c.T))} = ${a} °C.`); }
    const opts = [c.name, ...CLIM.filter(x => x !== c).map(x => x.name)];
    return M(`${data} Bij welke landschapszone of klimaat hoort dit?`, opts[0], opts.slice(1), 'Kijk naar de temperatuur (warm of koud?) en de neerslag (veel of weinig?).');
  };
  G.dens = () => {
    const k = R(0, 3), area = P([100, 200, 400, 500, 800, 1000, 2000]), d = P([2, 5, 10, 25, 50, 100, 250]), tot = area * d;
    if (k === 0) return num(`Een gebied van ${area} km² heeft ${tot.toLocaleString('nl-NL')} inwoners. Wat is de bevolkingsdichtheid (inw/km²)?`, d, 'inw/km²', `${tot.toLocaleString('nl-NL')} ÷ ${area} = ${d} inwoners per km².`);
    if (k === 1 || k === 3) return num(`In een gebied van ${area} km² is de bevolkingsdichtheid ${d} inw/km². Hoeveel inwoners heeft het gebied?`, tot, 'inwoners', `${area} × ${d} = ${tot.toLocaleString('nl-NL')}.`);
    return num(`Een gebied heeft ${tot.toLocaleString('nl-NL')} inwoners en een bevolkingsdichtheid van ${d} inw/km². Hoe groot is de oppervlakte (km²)?`, area, 'km²', `${tot.toLocaleString('nl-NL')} ÷ ${d} = ${area} km².`);
  };
  G.altTemp = () => {
    const h0 = P([0, 500, 1000]), T0 = P([10, 12, 15, 18, 20]), k = R(1, 6), H = h0 + 500 * k, k2 = R(0, 2);
    if (k2 === 0) return num(`Het is op ${h0} m hoogte ${T0} °C. Per 100 m hoger wordt het gemiddeld 0,6 °C kouder. Hoeveel graden is het op ${H} m?`, T0 - 3 * k, '°C', `${H - h0} m hoger = ${H - h0} / 100 × 0,6 = ${3 * k} °C kouder. ${T0} − ${3 * k} = ${T0 - 3 * k} °C.`);
    if (k2 === 1) return num(`Per 100 m hoger wordt het gemiddeld 0,6 °C kouder. Hoeveel graden kouder is het op ${H} m dan op ${h0} m?`, 3 * k, '°C', `${H - h0} m / 100 × 0,6 = ${3 * k} °C.`);
    return num(`Op ${h0} m hoogte is het ${T0} °C. Per 100 m hoger wordt het 0,6 °C kouder. Op welke hoogte (in m) is het ${T0 - 3 * k} °C?`, H, 'm', `Verschil ${3 * k} °C = ${3 * k} / 0,6 × 100 = ${500 * k} m hoger. ${h0} + ${500 * k} = ${H} m.`);
  };
  G.timeDiff = () => {
    const h = R(0, 23), d = R(1, 11), east = Math.random() < .5, ans = ((east ? h + d : h - d) % 24 + 24) % 24;
    return num(`Het is in Nederland ${h}:00 uur. Een plaats ligt ${d} tijdzones naar het ${east ? 'oosten' : 'westen'}. Hoe laat is het daar? (24-uurs klok, vul alleen het uur in)`, ans, 'uur',
      east ? `Naar het oosten wordt het later: ${h} + ${d} = ${h + d}${h + d >= 24 ? ' → ' + ans : ''}.` : `Naar het westen is het eerder: ${h} − ${d}${h - d < 0 ? ' → ' + ans : ' = ' + ans}.`);
  };
  G.scaleBig = () => {
    const S = P([1000000, 5000000, 10000000, 20000000, 50000000]), cm = R(1, 8), km = cm * S / 100000;
    return num(`Op een atlaskaart met schaal 1 : ${S.toLocaleString('nl-NL')} meet je ${cm} cm. Hoeveel km is dat in het echt?`, km, 'km', `${cm} cm × ${S.toLocaleString('nl-NL')} = ${(cm * S).toLocaleString('nl-NL')} cm = ${km.toLocaleString('nl-NL')} km.`);
  };

  const akV = vwo1.subjects.find(s => s.id === 'ak');
  akV.units.push(
    U('v1-ak3', 'H1 Australië en kaartvaardigheden', '🦘', 'Atlas, schaal, kaarten en tijdsverschil', { gen: [G.scaleBig, G.timeDiff], qs: [
      M('Wat is de hoofdstad van Australië?', 'Canberra', ['Sydney', 'Melbourne', 'Perth'], 'Sydney is de grootste stad, maar Canberra is de hoofdstad.'),
      M('Waar ligt het Great Barrier Reef?', 'voor de noordoostkust van Australië', ['voor de westkust van Australië', 'midden in de Outback', 'bij Nieuw-Zeeland'], 'Het is het grootste koraalrif ter wereld.'),
      M('Wat is de Outback?', 'het droge, dunbevolkte binnenland van Australië', ['de kustlijn met de grote steden', 'een bergketen in het oosten', 'een eiland bij Australië'], ''),
      M('Welke vier dingen horen op een goede kaart?', 'titel, legenda, schaal en noordpijl', ['titel, kleurenschema, jaartal en afstand', 'legenda, windroos, hoogte en jaartal', 'schaal, kleur, rand en bron'], ''),
      M('Waar dient de legenda op een kaart voor?', 'hij legt uit wat de kleuren en tekens betekenen', ['hij geeft de schaal aan', 'hij toont de noordrichting', 'hij is de titel van de kaart'], ''),
      M('Waar zoek je in de atlas eerst als je een plaats wilt vinden?', 'in het register (plaatsnamenregister)', ['bij de legenda', 'op de wereldkaart', 'bij de schaal'], 'Het register geeft de kaartpagina en het vakje (bijvoorbeeld C3).'),
      M('Een kaart met schaal 1 : 50.000 heeft een…', 'grote schaal (veel detail, klein gebied)', ['kleine schaal (weinig detail, groot gebied)', 'schaal van 1 op 50 cm', 'onbekende schaal'], 'Kleine schaal = groot gebied, bijvoorbeeld 1 : 50.000.000.'),
      M('Waarom is het in Australië op een ander tijdstip dan bij ons?', 'door de draaiing van de aarde zijn er tijdzones', ['omdat Australië dichter bij de zon ligt', 'omdat de klok daar anders loopt', 'door de seizoenen'], 'Hoe verder naar het oosten, hoe eerder de zon opkomt, dus hoe later het is.'),
      M('In december is het in Australië…', 'zomer', ['winter', 'herfst', 'lente'], 'Australië ligt op het zuidelijk halfrond: de seizoenen zijn omgekeerd.'),
      M('Welke breedte geeft de plaats ten opzichte van de evenaar aan?', 'de breedtegraad', ['de lengtegraad', 'de hoogtelijn', 'de schaal'], 'Breedtegraden lopen noord-zuid gemeten, lengtegraden oost-west.'),
    ] }),
    U('v1-ak4', 'H2 Landschapszones en klimaat', '🌐', 'Waar liggen de grote natuurlandschappen en waarom?', { gen: [G.climateDiagram], qs: [
      M('Wat is een landschapszone?', 'een groot gebied met hetzelfde klimaat, dezelfde begroeiing en bodem', ['een gebied met dezelfde taal', 'een land met dezelfde grenzen', 'een provincie'], 'Voorbeelden: tropisch regenwoud, woestijn, toendra.'),
      M('Welke twee factoren bepalen vooral het klimaat van een gebied?', 'temperatuur en neerslag', ['hoogte en schaal', 'bevolking en wind', 'bodem en kaart'], ''),
      M('Waarom is het bij de evenaar warm?', 'de zon staat er hoog en het zonlicht valt steil binnen', ['de aarde ligt er dichter bij de zon', 'er is veel zee', 'er waait weinig wind'], 'Bij de polen valt het licht schuin in en verdeelt zich over een groter oppervlak, dus is het er koud.'),
      M('Wat zijn de tropen?', 'het gebied rond de evenaar, tussen de beide keerkringen', ['het gebied rond de polen', 'het gebied tussen de poolcirkels en keerkringen', 'het gebied van Zuid-Europa'], 'Tussen ongeveer 23,5° noorderbreedte en 23,5° zuiderbreedte.'),
      M('Op ongeveer welke breedte ligt de poolcirkel?', '66,5° noord en zuid', ['23,5° noord en zuid', '45° noord en zuid', '90° noord en zuid'], ''),
      M('Welke landschapszone hoort bij het hele jaar warm en erg veel neerslag?', 'tropisch regenwoud', ['woestijn', 'toendra', 'hooggebergte'], ''),
      M('Welke landschapszone hoort bij extreem weinig neerslag?', 'woestijn', ['tropisch regenwoud', 'naaldbos', 'toendra'], 'Meestal minder dan ongeveer 250 mm per jaar.'),
      M('Welke zone hoort bij lange koude winters, boomloze vlaktes en permafrost?', 'toendra', ['savanne', 'woestijn', 'regenwoud'], ''),
      M('Welke gebieden zijn het lastigst bewoonbaar?', 'te koude, te droge en te hoge gebieden (pool, woestijn, hooggebergte)', ['gebieden langs rivieren', 'kustgebieden', 'vlakke gebieden met vruchtbare grond'], 'Mensen wonen vooral waar water, vruchtbare grond en een gematigd klimaat zijn.'),
      M('Wat bedoel je met "wisselen van schaalniveau"?', 'van een klein gebied (regio) uitzoomen naar een groter gebied of de hele wereld, en andersom', ['een kaart met een andere kleur maken', 'een nieuwe atlas pakken', 'een andere schaalbalk tekenen'], 'Bijvoorbeeld: een regio vergelijken met de wereldkaart van landschapszones.'),
      M('Welke vraag hoort bij "beschrijven en verklaren"?', 'Waar ligt de zone? en Waarom ligt de zone daar?', ['Wie heeft de kaart gemaakt?', 'Hoeveel inwoners heeft de zone?', 'Hoe groot is de schaal?'], 'Eerst beschrijf je de ligging, daarna verklaar je met klimaat, ligging en hoogte.'),
    ] }),
    U('v1-ak5', '2.1 Ontbossing in het Amazonegebied', '🌳', 'Tropisch regenwoud: ligging, etages, ontbossing, duurzaam', { gen: [G.dens], qs: [
      M('Welke rivier geeft het Amazonegebied zijn naam, en hoe lang is hij vergeleken met andere rivieren?', 'de Amazone, de één-na-langste rivier ter wereld', ['de Nijl, de langste rivier ter wereld', 'de Orinoco, de kortste rivier van Zuid-Amerika', 'de Rijn, de langste van Europa'], 'Het Amazoneregenwoud is het grootste regenwoud ter wereld.'),
      M('Waar liggen tropische regenwouden?', 'in de tropen, rond de evenaar tussen de keerkringen', ['rond de poolcirkels', 'tussen de keerkringen en poolcirkels', 'alleen in Zuid-Amerika'], 'Ze liggen op lage breedte; ze komen ook voor in Afrika en Zuidoost-Azië.'),
      M('Wat is de breedteligging van de tropen?', 'tussen 23½° N.B. en 23½° Z.B.', ['tussen 66½° N.B. en 66½° Z.B.', 'tussen 0° en 90° N.B.', 'tussen 30° en 60° N.B.'], 'De keerkringen zijn de grens van de tropen.'),
      M('Hoe is de temperatuur in het tropisch regenwoud?', 'het hele jaar warm: overdag ruim 30 °C, ’s nachts een paar graden lager', ['warm in de zomer, koud in de winter', 'het hele jaar rond het vriespunt', 'overdag koud en ’s nachts heet'], 'Dat zie je in het klimaatdiagram van Tefé: een bijna rechte temperatuurlijn.'),
      M('Hoeveel neerslag valt er gemiddeld per jaar in het tropisch regenwoud?', 'meer dan 2000 mm', ['minder dan 250 mm', 'ongeveer 850 mm (zoals in De Bilt)', 'ongeveer 500 mm'], 'In Nederland (De Bilt) valt ongeveer 850 mm.'),
      M('Wat is stijgingsregen?', 'regen bij de evenaar: warme lucht stijgt op, koelt af en de waterdamp condenseert', ['regen doordat wind tegen een gebergte op wordt gestuwd', 'regen door sneeuw die smelt', 'regen alleen in de winter'], 'Bijna elke dag valt er een stevige regenbui.'),
      M('Wat is biodiversiteit?', 'de variatie aan levensvormen in de natuur', ['het aantal mensen in een gebied', 'de hoeveelheid regen', 'het aantal bomen per hectare'], 'Bio = leven, diversiteit = verscheidenheid.'),
      M('Wat zijn etages in het tropisch regenwoud?', 'verdiepingen van plantengroei, van de bosbodem tot de woudreuzen', ['regenbuien op verschillende hoogtes', 'lagen in de bodem', 'steden in het bos'], 'Vanwege het dichte bladerdek is het onderin schemerig.'),
      M('Hoe hoog worden de allerhoogste bomen (woudreuzen)?', 'meer dan 35 m', ['ongeveer 3 m', 'ongeveer 10 m', 'precies 100 m'], 'Andere bomen zijn 10–15 m of 20–35 m hoog.'),
      M('Waarom noem je het Amazonegebied een natuurlandschap?', 'er wonen weinig mensen en het landschap is nauwelijks ingericht', ['er zijn veel steden en akkers', 'het is een plantage', 'het is een cultuurlandschap'], 'Een groot deel is niet door mensen ingericht.'),
      M('Wat is een ingericht landschap (cultuurlandschap)?', 'een landschap waar mensen huizen, wegen, akkers en weilanden hebben aangelegd', ['een landschap zonder mensen', 'een landschap met alleen bos', 'een landschap met alleen water'], 'Het tegenovergestelde van een natuurlandschap.'),
      M('Wat is ontbossing?', 'het kappen van bossen', ['het planten van bomen', 'het verbranden van afval', 'het aanleggen van een park'], 'Het tegenovergestelde is herbebossing.'),
      M('Welke twee dingen noemt het boek als oorzaken van ontbossing?', 'winning van natuurlijke hulpbronnen en het aanleggen van akkers, plantages en veeteelt', ['toerisme en visserij', 'overstromingen en aardbevingen', 'skigebieden en luchthavens'], 'Voorbeelden: goud, ijzererts, hout, soja, suikerriet en vee.'),
      M('Wat is een natuurlijke hulpbron?', 'een product uit de natuur dat mensen goed kunnen gebruiken, zoals goud of hout', ['een soort regenwoud', 'een rivier met veel water', 'een dier dat in het bos woont'], ''),
      M('Waarom zijn er wegen zoals de Transamazônica aangelegd?', 'om grondstoffen naar zeehavens en fabrieken te vervoeren', ['voor toeristen uit Europa', 'om regenwater af te voeren', 'om het bos te beschermen'], 'Zulke wegen maken ook illegale ontbossing en nieuwe landbouwbedrijven mogelijk.'),
      M('Wat is een plantage?', 'een landbouwbedrijf waar op grote schaal één product wordt verbouwd', ['een klein akkertje voor eigen gebruik', 'een natuurpark', 'een bos zonder bomen'], 'Bijvoorbeeld cacao, suikerriet of soja.'),
      M('Waarvoor wordt soja uit het Amazonegebied vooral gebruikt?', 'als veevoer, bijvoorbeeld voor koeien, varkens en kippen', ['als brandstof voor auto’s in Brazilië', 'als bouwmateriaal', 'als medicijn voor inwoners'], 'Een deel wordt geëxporteerd naar bijvoorbeeld Nederland.'),
      M('Wat is intensieve veeteelt?', 'veeteelt met veel vee per hectare grond', ['veeteelt met weinig vee per hectare', 'veeteelt zonder grond', 'het verzamelen van wilde dieren'], 'Het tegenovergestelde is extensieve veeteelt.'),
      M('Wat zegt het boek over de omvang van de ontbossing?', 'ongeveer een vijfde van het Braziliaanse bosoppervlak is verdwenen, ongeveer 25 keer Nederland', ['de helft van het bos is verdwenen', 'er is nog niets gekapt', 'alleen 1% is gekapt'], 'Gemiddeld verdwijnt er elke minuut een stuk bos ter grootte van vier voetbalvelden.'),
      M('Hoeveel oorspronkelijke bevolkingsgroepen wonen volgens het boek in de tropische bossen van het Amazonegebied?', 'meer dan 300', ['ongeveer 3', 'precies 10', 'er wonen geen mensen'], 'Ongeveer 1,5 miljoen mensen behoren tot deze groepen.'),
      M('Hoe verbouwden de oorspronkelijke bewoners eeuwenlang hun voedsel?', 'op kleine stukken bos die ze na een paar jaar verlieten, zodat het bos zich kon herstellen', ['op grote plantages met machines', 'op irrigatielandbouw in de woestijn', 'ze verbouwden niets'], 'Dat is een duurzame manier van gebruik.'),
      M('Welke gassen nemen bomen en planten op en geven ze af?', 'ze halen CO₂ uit de lucht en brengen zuurstof (O₂) terug', ['ze halen zuurstof uit de lucht en geven CO₂ af', 'ze nemen alleen stikstof op', 'ze produceren geen gassen'], 'Daarom noemt men het regenwoud “de longen van de aarde”.'),
      M('Wat betekent duurzaam?', 'zo met de aarde omgaan dat die ook voor toekomstige generaties leefbaar is', ['zo snel mogelijk veel geld verdienen', 'alles verbieden', 'alleen hout gebruiken'], ''),
      M('Wat is herbebossing?', 'het aanplanten van jonge bomen na houtkap', ['het kappen van oude bomen', 'het verplaatsen van een bos', 'het aanleggen van akkers'], 'Het helpt de natuur te herstellen.'),
      M('Wat kun je zelf doen voor duurzaam gebruik van het regenwoud?', 'producten kopen van duurzaam geproduceerd hout', ['zo veel mogelijk tropisch hout kopen', 'plantages uitbreiden', 'bossen laten verbranden'], 'Bijvoorbeeld hout met een duurzaamheidskeurmerk.'),
    ] }),
    U('v1-ak6', '2.2 Droge gebieden in Afrika', '🏜️', 'Tropen, savanne, steppe, woestijn en landbouw', { gen: [G.climateDiagram], qs: [
      M('Hoe groot is Afrika vergeleken met Nederland?', 'ongeveer 700 keer zo groot', ['ongeveer 7 keer zo groot', 'ongeveer even groot', 'ongeveer 70 keer zo groot'], 'Afrika is een enorm continent.'),
      M('Tussen welke breedtes ligt Afrika ongeveer?', 'tussen 38° N.B. en 33° Z.B.', ['tussen 66° N.B. en 66° Z.B.', 'tussen 0° en 10° N.B.', 'tussen 50° N.B. en 70° N.B.'], 'Daardoor liggen er verschillende natuurlandschappen.'),
      M('Waardoor zijn er in Afrika verschillende natuurlandschappen?', 'door verschillen in neerslag (van meer dan 3000 mm tot minder dan 60 mm)', ['door verschillen in bevolking', 'door verschillen in taal', 'door de grote steden'], 'In de Sahara valt minder dan 60 mm.'),
      M('Welke volgorde klopt als je van de evenaar naar het noorden (of zuiden) reist?', 'regenwoud, savanne, steppe, woestijn', ['woestijn, steppe, savanne, regenwoud', 'savanne, regenwoud, woestijn, steppe', 'steppe, woestijn, regenwoud, savanne'], 'Verder van de evenaar wordt het steeds droger.'),
      M('Wat is een savanne?', 'een overgangsgebied tussen tropische bossen en grasland met lange grassen en groepjes bomen', ['een boomloze, droge vlakte', 'een dicht regenwoud', 'een woestijn met cactussen'], 'Het is er het hele jaar warm, maar een paar maanden valt er geen neerslag.'),
      M('Wat gebeurt er met de savanne in de droge tijd?', 'het gras wordt geel en de bomen verliezen hun bladeren', ['alles blijft groen', 'er ligt sneeuw', 'het gebied overstroomt'], 'Hoog gras en bomen bieden voedsel en schaduw voor dieren.'),
      M('Welke dieren leven op de savanne?', 'leeuwen, giraffen, olifanten, zebra’s en antilopen', ['ijsberen en walrussen', 'kamelen en slangen alleen', 'zeehonden en pinguïns'], ''),
      M('Hoeveel neerslag valt er per jaar in de steppe?', 'minder dan 500 mm, in ongeveer drie maanden regen', ['meer dan 2000 mm', 'meer dan 3000 mm', 'helemaal geen neerslag'], 'De rest van de tijd is het droog.'),
      M('Wat is een steppe?', 'een boomloze grasvlakte met hier en daar doornige struiken', ['een dichte jungle', 'een zandwoestijn', 'een bevroren vlakte'], 'Bijvoorbeeld de Masai Mara in Kenia.'),
      M('Hoeveel neerslag valt er per jaar in de woestijn?', 'minder dan 250 mm', ['ongeveer 500 mm', 'meer dan 1000 mm', 'precies 850 mm'], 'Woestijnen bestaan vooral uit zand, stenen en rotsen.'),
      M('Wat is een oase?', 'een plek in de woestijn waar water aan het oppervlak is', ['een zandverstuiving', 'een boomloze steppe', 'een diep dal zonder water'], 'Het water kan rivierwater zijn, maar ook bronwater (grondwater dat omhoogkomt).'),
      M('Hoe heet water dat uit de grond omhoogkomt bij een oase?', 'bronwater (grondwater)', ['regenwater', 'zeewater', 'smeltwater van een gletsjer'], ''),
      M('Wat is het verschil tussen het klimaatdiagram van Tefé en dat van Tamenghasset?', 'Tefé is warm en erg nat; Tamenghasset is warm met bijna geen neerslag', ['Tefé is koud; Tamenghasset is nat', 'ze zijn precies gelijk', 'Tefé heeft geen neerslag; Tamenghasset veel'], 'Let op de blauwe staafjes (neerslag).'),
      M('Welke landbouw hoort bij het tropisch regenwoud (volgens het boek)?', 'plantages met exportgewassen zoals cacao, koffie, thee en noten', ['nomadische veeteelt', 'irrigatielandbouw', 'olijfbomen en citroenen'], 'Daarvoor wordt regenwoud gekapt.'),
      M('Wat is zelfvoorzienende landbouw?', 'mensen verbouwen vooral voedsel voor eigen gebruik', ['alleen verbouwen voor de export', 'landbouw met machines op plantages', 'jagen op dieren'], 'Wat overblijft verkopen ze op regionale markten.'),
      M('Wat is nomadische veeteelt?', 'veehouders trekken met hun dieren rond zonder vaste woonplaats, op zoek naar gras en water', ['veeteelt op één boerderij', 'veeteelt in een stad', 'het houden van vee in een stal'], 'Nomaden wonen in tenten.'),
      M('Welk soort veeteelt is het nomadische vee houden op de steppe?', 'extensieve veeteelt (weinig vee per hectare)', ['intensieve veeteelt (veel vee per hectare)', 'plantagelandbouw', 'irrigatielandbouw'], 'Er is weinig gras, dus weinig dieren per hectare.'),
      M('Welke dieren houden nomaden in droge gebieden?', 'kamelen, schapen en geiten', ['koeien en varkens in stallen', 'rendieren', 'paarden voor wedstrijden'], ''),
      M('Wat is irrigatie?', 'het kunstmatig nathouden van landbouwgronden', ['het kappen van bos', 'het bemesten van akkers', 'het planten van jonge bomen'], 'Bijvoorbeeld via kanalen of waterpompen.'),
      M('Welke gewassen verbouwen mensen bij een oase?', 'graan, groenten en dadels', ['rijst en suikerriet', 'soja en cacao', 'koffie en thee'], ''),
      M('Waar woont meer dan de helft van de Afrikaanse bevolking en waarvan leeft die?', 'op het platteland, van de landbouw', ['in miljoenensteden, van industrie', 'in de woestijn, van de jacht', 'op zee, van de visserij'], 'Toch heeft Afrika ook steden met miljoenen inwoners.'),
      M('Welk gewas hoort bij de mediterrane landbouw op de kaart van Afrika?', 'olijven, citroenen en sinaasappels', ['cacao en koffie', 'rijst en thee', 'rendiervlees'], 'Dat zijn kustgebieden bij de Middellandse Zee.'),
      M('Waarom liggen er in de Sahara plekken met bomen?', 'daar komt water naar boven, bij een oase', ['het regent er dagelijks', 'de zon is er zwak', 'er smelt gletsjerijs'], ''),
    ] }),
    U('v1-ak7', '2.3 De Inuit in het noordpoolgebied', '🧊', 'Hoge breedte, toendra, permafrost, klimaatverandering', { qs: [
      M('Wat is de breedtegraad van de noordpoolcirkel?', '66½° N.B.', ['23½° N.B.', '90° N.B.', '45° N.B.'], 'Het gebied binnen de poolcirkel heet het noordpoolgebied.'),
      M('Wat is de hoge breedte?', 'de ligging ver van de evenaar (hoger dan 60° N.B. en Z.B.)', ['de ligging dicht bij de evenaar', 'de hoogte van een berg', 'de lengte van een rivier'], 'Het tegenovergestelde is lage breedte.'),
      M('Hoe komt het dat het in het noordpoolgebied altijd koud is?', 'de zon staat laag aan de hemel, het zonlicht valt schuin in', ['de zon staat er hoog', 'er is geen zon', 'de aarde is er dichter bij de zon'], 'Ze liggen op hoge breedte.'),
      M('Wat is zee-ijs?', 'bevroren zeewater', ['ijs dat door sneeuw op land is ontstaan', 'ijs in een gletsjer', 'ijs in een meer'], 'De Noordelijke IJszee is het hele jaar voor een groot deel bevroren.'),
      M('Wat is landijs?', 'honderden meters tot kilometers dikke lagen ijs op het land, ontstaan uit samengeperste sneeuw', ['bevroren zeewater', 'ijs op een meer', 'hagel'], 'Op Groenland is de laag meer dan 3000 m dik.'),
      M('Wat is eeuwige sneeuw?', 'gebied waar altijd sneeuw ligt', ['sneeuw die alleen in de winter valt', 'sneeuw op een berg in Nederland', 'regen die bevriest'], 'De sneeuw smelt in de zomer niet weg.'),
      M('Welk landschap hoort bij Groenland?', 'het grootste eiland ter wereld, 50 keer groter dan Nederland, met ongeveer 85% ijs', ['een klein eiland zonder ijs', 'een woestijn', 'een regenwoud'], 'Er wonen maar ongeveer 60.000 mensen, vooral in het kustgebied.'),
      M('Waarom wonen er op Groenland vooral mensen langs de kust?', 'het binnenland is bedekt met sneeuw en ijs en dus onbewoonbaar', ['de kust is warm', 'er zijn in het binnenland veel steden', 'het binnenland is een oase'], 'Daardoor is de bevolkingsdichtheid zeer laag.'),
      M('Wat is toendra?', 'een boomloos natuurlandschap in de poolstreken met grassen, mossen en lage struiken', ['een bos met naaldbomen', 'een warme woestijn', 'een savanne'], 'In bron 16 zie je toendra bij Ilulissat.'),
      M('Wat is permafrost?', 'altijd bevroren ondergrond', ['sneeuw die in de zomer smelt', 'ijs op zee', 'een koude wind'], 'In de korte zomer ontdooit alleen het bovenste laagje.'),
      M('Waarom is de toendra in de zomer vaak drassig?', 'het smeltwater kan niet wegzakken omdat de ondergrond bevroren blijft', ['er valt dagelijks regen', 'er zijn veel rivieren', 'de grond is van klei'], 'Verdamping is er bijna niet door de lage temperatuur.'),
      M('Wat is de boomgrens in het noordpoolgebied?', 'de grens waar het te koud is voor bomen: de warmste maand haalt gemiddeld niet 10 °C', ['de grens van een land', 'waar de sneeuw begint', 'waar het regenwoud begint'], 'De boomgrens volgt de lijn van 10 °C in de warmste maand.'),
      M('Welk natuurlandschap ligt ten zuiden van de toendra?', 'taiga (naaldbossen)', ['savanne', 'tropisch regenwoud', 'steppe'], 'In het zuidelijk halfrond ligt er vrijwel geen taiga.'),
      M('Wat is de taiga?', 'natuurlandschap in de gematigde zone met naaldbomen en koude winters (gemiddeld kouder dan −3 °C)', ['een warm bos met loofbomen', 'een drassige vlakte met cactussen', 'een gebied met sneeuw en ijs'], 'Ook naaldboomgordel genoemd.'),
      M('Hoe is het klimaat bij Iqaluit (klimaatdiagram)?', 'zeer koude winters (bijna −30 °C) en een korte zomer met temperaturen iets boven 0 °C tot 10 °C', ['het hele jaar warm', 'het hele jaar boven 20 °C', 'warm met veel neerslag'], 'Neerslag valt vooral als sneeuw.'),
      M('In welke landen wonen Inuit?', 'Tsjoekotka (Rusland), Alaska (VS), Canada en Groenland (Denemarken)', ['Noorwegen, Zweden en Finland', 'Australië en Nieuw-Zeeland', 'Zwitserland en Oostenrijk'], 'Ongeveer 160.000 Inuit.'),
      M('Waarvan leefden de Inuit van oudsher?', 'van de jacht op onder andere zeehonden, ijsberen, rendieren en walvissen, en van de visvangst', ['van akkerbouw', 'van de handel in specerijen', 'van de mijnbouw'], 'Planten groeien er nauwelijks.'),
      M('Hoe leven de meeste Inuit nu?', 'in dorpen, met boodschappen uit een supermarkt', ['alleen van de jacht', 'als nomaden in tenten', 'in grote steden zonder winkels'], 'Sommigen houden de jachttraditie in ere.'),
      M('Welk effect heeft klimaatverandering in het noordpoolgebied?', 'het zee-ijs smelt, de ijslaag wordt dunner en het landijs op Groenland kalft in zee', ['er komt meer zee-ijs', 'het wordt kouder', 'er verandert niets'], 'Daardoor krimpt het oppervlak van het zee-ijs.'),
      M('Welke grondstoffen liggen in de bodem van de Noordelijke IJszee en Groenland?', 'aardolie en metalen', ['alleen zand', 'alleen zout', 'alleen water'], 'Ze worden misschien winbaar doordat het klimaat verandert.'),
      M('Wat is klimaatverandering?', 'geleidelijke of abrupte verandering in het klimaat door natuurlijke processen en/of invloed van de mens', ['het verschil tussen dag en nacht', 'het weer van vandaag', 'het wisselen van de seizoenen'], ''),
      M('Wat is het gemiddelde in de warmste maand op de toendra?', 'ruim boven de 0 °C, maar niet boven de 10 °C; ’s nachts koelt het af tot ongeveer 3 °C', ['rond 30 °C', 'rond −30 °C', 'rond 20 °C'], 'Overdag is het in de warmste maand soms net boven 10 °C.'),
    ] }),
    U('v1-ak8', '2.4 Het Lötschental', '🏔️', 'Alpen, hoogtegordels, gletsjer en toerisme', { gen: [G.altTemp], qs: [
      M('Wat is de breedteligging van de Alpen vergeleken met het poolgebied?', 'de Alpen liggen veel verder naar het zuiden, maar hoog in de bergen is het toch koud', ['de Alpen liggen op de evenaar', 'de Alpen liggen op de Noordpool', 'er is geen verschil'], 'Niet alleen de breedteligging, ook de hoogteligging beïnvloedt de temperatuur.'),
      M('In hoeveel landen strekken de Alpen zich uit?', 'zeven', ['twee', 'drie', 'twaalf'], 'Het is het grootste berggebied van Europa.'),
      M('Vanaf welke hoogte spreek je van een hooggebergte?', 'berggebied met toppen hoger dan 1500 m', ['hoger dan 100 m', 'hoger dan 500 m', 'hoger dan 8000 m'], 'Veel bergen in de Alpen zijn hoger dan 1500 m.'),
      M('Wat is de hoogste bergtop van de Alpen?', 'de Mont Blanc (4810 m)', ['de Matterhorn (800 m)', 'de Zugspitze (15.000 m)', 'de Vaalserberg'], ''),
      M('Wat is reliëf?', 'hoogteverschillen in het landschap', ['de kleur van een kaart', 'de schaal van een kaart', 'het aantal mensen'], 'In de Alpen is veel reliëf.'),
      M('Waarom noem je de Alpen een natuurlandschap?', 'er zijn weinig mensen; alleen in de dalen zijn dorpen, hoog in de bergen woont bijna niemand', ['er zijn alleen steden', 'er liggen overal akkers', 'er woont niemand'], 'De bevolkingsdichtheid is laag.'),
      M('Wat is een hoogtegordel?', 'een zone met een bepaalde plantengroei in een gebergte', ['een weg in de bergen', 'een gordel van ijs rond de pool', 'een klimaatzone op aarde'], 'Zoals naaldbossen en alpenweiden.'),
      M('Welke volgorde van beneden naar boven past bij hoogtegordels in de Alpen?', 'naaldbos, alpenweide, rotsgordel, sneeuw en ijs', ['sneeuw en ijs, alpenweide, naaldbos', 'alpenweide, sneeuw, naaldbos', 'rotsgordel, naaldbos, ijs'], 'Het lijkt op de opeenvolging van het noordpoolgebied: taiga, toendra, sneeuw en ijs.'),
      M('Wat is een alpenweide?', 'hoogtegordel met gras, kruiden en lage struikjes (boven de boomgrens)', ['een weiland in Nederland', 'een bos met naaldbomen', 'een gletsjer'], 'Ze worden in de zomer gebruikt voor vee.'),
      M('Wat is de rotsgordel?', 'hoogtegordel waar door de kou en de harde ondergrond bijna geen planten meer groeien', ['een gordel van bossen', 'een gordel met alpenweiden', 'een gordel met cactussen'], ''),
      M('Waarom ligt de boomgrens in het Lötschental rond de 2000 m?', 'door de lage temperaturen groeien er daarboven geen bomen meer', ['er is geen water', 'de bergen zijn te steil om te bouwen', 'omdat mensen er alle bomen gekapt hebben'], 'Daarboven ligt alpenweide.'),
      M('Wat is een gletsjer?', 'een grote ijsmassa die langzaam naar beneden schuift', ['een snel stromende rivier', 'een meer in een dal', 'een lawine van sneeuw'], 'Hij schuift maar enkele centimeters per jaar.'),
      M('Welke rivier ontspringt aan de gletsjer in het Lötschental?', 'de Lonza', ['de Rijn', 'de Amazone', 'de Donau'], 'De Langgletsjer is de bron van de Lonza.'),
      M('Op welke hoogte liggen de dorpen in het Lötschental ongeveer?', 'op 1350 tot 1550 m', ['op 0 m', 'op 3500 m', 'op 5000 m'], ''),
      M('Hoe leefden de bewoners van het Lötschental ruim honderd jaar geleden?', 'van de landbouw, helemaal afgesloten van de buitenwereld', ['van het toerisme', 'van de visserij', 'van de industrie'], 'Ze brachten hun vee in de zomer naar alpenweiden op ongeveer 2000 m.'),
      M('Wat is bereikbaarheid?', 'de mogelijkheid om een plaats te bereiken', ['de hoogte van een berg', 'het aantal inwoners', 'de afstand tot de evenaar'], ''),
      M('Hoe is de bereikbaarheid van het Lötschental veranderd?', 'enorm verbeterd, onder andere door een weg met tunnels naar Steg', ['verslechterd door een nieuwe gletsjer', 'het dal is nog steeds afgesloten', 'er is alleen een spoorlijn'], 'In een kwartiertje ben je met de auto in Steg.'),
      M('Waarvan leven veel bewoners van het Lötschental tegenwoordig?', 'van het toerisme, of ze werken buiten het dal', ['van de jacht op walvissen', 'van de mijnbouw', 'van de visserij'], ''),
      M('Waarom noem je de Zwitserse Alpen een dubbelseizoen-gebied?', 'er is toerisme in de zomer (wandelen, mountainbiken) en in de winter (skiën)', ['er zijn twee zomers per jaar', 'het regent twee keer per jaar', 'er zijn twee klimaten'], 'De bergen zijn het hele jaar in trek.'),
      M('Wat is er gebeurd met de Langgletsjer door klimaatverandering?', 'hij trekt zich terug (wordt korter)', ['hij groeit snel', 'hij is verdwenen en kwam terug', 'er is niets veranderd'], 'Bron 21 laat het begin van de Lonza in 2006 en 2016 zien.'),
      M('Wat gebeurt er met de temperatuur als je hoger de berg opgaat?', 'het wordt kouder', ['het wordt warmer', 'het blijft gelijk', 'het wordt eerst warmer en dan koud'], 'Hoe hoger in de bergen, hoe kouder het wordt.'),
    ] }),
    U('v1-ak10', 'H2 Begrippen', '📖', 'De begrippenlijst van hoofdstuk 2 (Finish)', { qs: [
      M('aride', 'droog', ['nat', 'koud', 'bergachtig'], ''),
      M('Wat is een klimaatdiagram?', 'een diagram met de gemiddelde temperatuur en neerslag per maand van een plaats', ['een kaart met klimaatzones', 'een grafiek van het aantal inwoners', 'een foto van het weer'], ''),
      M('evenaar', 'denkbeeldige lijn die de aardbol in het noordelijk en zuidelijk halfrond verdeelt', ['de breedtecirkel van 66½° N.B.', 'de grens van de tropen op 23½°', 'een rivier in Afrika'], ''),
      M('keerkring', 'de breedtecirkel van 23½° N.B. (Kreeftskeerkring) en 23½° Z.B. (Steenbokskeerkring); grens van de tropen', ['de breedtecirkel van 66½°', 'de lijn door Greenwich', 'de lijn op 0°'], ''),
      M('poolcirkel', 'de breedtecirkel van 66½° N.B. (noordpoolcirkel) en 66½° Z.B. (zuidpoolcirkel)', ['de breedtecirkel van 23½°', 'de evenaar', 'de nulmeridiaan'], ''),
      M('Wat is een luchtstreek?', 'een temperatuurzone op aarde: tropen, gematigde zone en poolstreken', ['een weerbericht', 'een zone met wind', 'een klimaat in de bergen'], ''),
      M('Wat is de gematigde zone?', 'de luchtstreek tussen de breedtecirkels van 23½° en 66½° N.B. en Z.B.; niet heel warm en niet heel koud', ['het gebied rond de evenaar', 'het gebied rond de polen', 'alleen Nederland'], ''),
      M('Wat zijn de subtropen?', 'het deel van de gematigde zone dat dichtst bij de tropen ligt; minder warm dan de tropen, warmer dan de rest van de gematigde zone', ['het deel van de tropen dat het koudst is', 'het gebied onder de zee', 'het poolgebied'], 'Sub = onder.'),
      M('Wat is de poolstreek?', 'koude luchtstreek ten noorden van 66½° N.B. en ten zuiden van 66½° Z.B.', ['warme luchtstreek bij de evenaar', 'gematigde zone', 'subtropen'], 'Ook polaire zone genoemd.'),
      M('Wat is breedteligging?', 'de afstand van een plaats tot de evenaar', ['de hoogte van een plaats', 'de afstand tot de zee', 'de afstand tot Nederland'], ''),
      M('Wat is een breedtecirkel?', 'een denkbeeldige cirkel die plaatsen van gelijke breedteligging verbindt (parallel)', ['een denkbeeldige lijn van pool tot pool', 'een cirkel om de zon', 'de rand van een kaart'], ''),
      M('lage breedte', 'de ligging van een plaats dicht bij de evenaar (lager dan 30° N.B. en Z.B.)', ['ver van de evenaar (hoger dan 60°)', 'een laag gebergte', 'een rivier op zeeniveau'], ''),
      M('hoge breedte', 'de ligging van een plaats ver van de evenaar (hoger dan 60° N.B. en Z.B.)', ['dicht bij de evenaar', 'hoog in de bergen', 'op het hoogste punt van een land'], ''),
      M('natuurlandschap', 'een landschap dat niet door mensen is ingericht; puur natuur', ['een landschap met wegen en akkers', 'een stad', 'een plantage'], ''),
      M('cultuurlandschap (ingericht landschap)', 'landschap waarin mensen huizen, wegen, akkers, weilanden en andere dingen hebben aangelegd', ['puur natuur', 'alleen ijs en sneeuw', 'een oerwoud'], ''),
      M('oorspronkelijke plantengroei', 'de natuurlijke plantengroei die ergens voorkomt (oorspronkelijke vegetatie)', ['de planten in een tuin', 'planten op een akker', 'planten in een kas'], ''),
      M('bevolkingsdichtheid', 'het gemiddelde aantal inwoners per vierkante kilometer (inw/km²)', ['het totale aantal inwoners', 'de verdeling van mensen over een land', 'de oppervlakte van een land'], ''),
      M('bevolkingsspreiding', 'de verdeling van mensen over een land of gebied', ['het aantal inwoners per km²', 'de groei van een bevolking', 'het aantal geboorten'], ''),
      M('bevolkingsconcentratie', 'opeenhoping van mensen in een gebied', ['gelijke verdeling over een land', 'aantal inwoners per km²', 'aantal huizen'], ''),
      M('etage', 'verdieping van een bepaalde plantengroei in het tropisch regenwoud', ['een laag in de ijskap', 'een bergtop', 'een gebouw met veel verdiepingen'], ''),
      M('savanne', 'natuurlandschap in de tropen met lange grassen, afgewisseld met groepjes bomen en struiken', ['dicht, ondoordringbaar bos', 'boomloze vlakte in de poolstreken', 'droge zandvlakte'], ''),
      M('steppe', 'natuurlandschap waar niet genoeg regen valt voor de groei van grassen en lage struikjes', ['natuurlandschap met naaldbomen', 'natuurlandschap met ijs', 'tropisch bos'], 'Bijvoorbeeld de Masai Mara.'),
      M('woestijn', 'natuurlandschap waar door droogte bijna niets groeit', ['tropische bossen', 'boomloze vlakte met mossen', 'gebied met naaldbomen'], ''),
      M('oase', 'plek in de woestijn waar water aan het oppervlak is', ['woestijn met zand', 'een bergtop', 'zee-ijs'], ''),
      M('toendra', 'natuurlandschap in de poolstreken met begroeiing van grassen, mossen en lage struikjes', ['tropisch bos', 'zandwoestijn', 'naaldbos'], ''),
      M('taiga', 'natuurlandschap in de gematigde zone met naaldbomen; in de winter gemiddeld kouder dan −3 °C', ['tropisch regenwoud', 'vlakte met gras', 'ijswoestijn'], 'Ook naaldboomgordel genoemd.'),
      M('permafrost', 'altijd bevroren ondergrond', ['bevroren zeewater', 'sneeuw op bergen', 'het koudste punt van de aarde'], ''),
      M('boomgrens', 'grens tussen een gebied waar nog bomen groeien en waar geen bomen meer kunnen groeien door lage temperatuur (kouder dan gemiddeld 10 °C in de zomer)', ['grens tussen twee landen', 'grens van een bos in een stad', 'grens tussen zee en land'], ''),
      M('landijs', 'honderden meters tot kilometers dikke lagen ijs op het land, ontstaan uit samengeperste sneeuw', ['bevroren zeewater', 'dunne ijslaag op een sloot', 'sneeuwstorm'], ''),
      M('zee-ijs', 'bevroren zeewater', ['bevroren zoet water in een meer', 'ijs op het land', 'hagelbui'], ''),
      M('eeuwige sneeuw', 'gebied waar altijd sneeuw ligt', ['sneeuw die nooit valt', 'sneeuw in Nederland', 'sneeuw alleen in de winter'], ''),
      M('hooggebergte', 'berggebied met toppen die hoger zijn dan 1500 m', ['berggebied lager dan 500 m', 'een heuvel', 'een plateau'], ''),
      M('reliëf', 'hoogteverschillen in het landschap', ['een kleur op de kaart', 'de schaal van de kaart', 'een grens'], ''),
      M('hoogtegordel', 'zone van plantengroei in een gebergte', ['zone van regenval op de evenaar', 'een gebergte met meerdere toppen', 'een weg in de bergen'], ''),
      M('alpenweide', 'hoogtegordel in de bergen met gras, kruiden en lage struikjes (boven de boomgrens)', ['dicht naaldbos', 'sneeuw en ijs', 'tropisch bos'], ''),
      M('gletsjer', 'grote ijsmassa die langzaam naar beneden schuift', ['snelstromende rivier', 'een meer in de bergen', 'een lawine'], ''),
      M('bereikbaarheid', 'de mogelijkheid om een plaats te bereiken', ['de hoogte van een plaats', 'de afstand tot de evenaar', 'het aantal wegen'], ''),
      M('plantage', 'landbouwonderneming waar op grote schaal één product wordt verbouwd', ['klein boerderijtje voor eigen gebruik', 'een bos', 'een nomadenkamp'], ''),
      M('zelfvoorzienende landbouw', 'landbouw waarbij mensen vooral voor eigen gebruik produceren', ['landbouw voor de export', 'landbouw met veel machines', 'landbouw met irrigatie'], ''),
      M('extensieve veeteelt', 'veeteelt met weinig vee per hectare grond', ['veeteelt met veel vee per hectare', 'veeteelt in stallen', 'het houden van huisdieren'], ''),
      M('intensieve veeteelt', 'veeteelt met veel vee per hectare grond', ['veeteelt met weinig vee per hectare', 'jacht op wilde dieren', 'visserij'], ''),
      M('irrigatie', 'het kunstmatig nathouden van landbouwgronden', ['het uitdrogen van landbouwgrond', 'het bemesten van akkers', 'het kappen van bomen'], ''),
      M('ontbossing', 'het kappen van bossen', ['het planten van bomen', 'het beschermen van bossen', 'het verbouwen van planten'], ''),
      M('herbebossing', 'aanplant van jonge bomen na houtkap', ['het kappen van oude bomen', 'het verbranden van bos', 'het planten van gras'], ''),
      M('duurzaam', 'zo met de aarde omgaan dat deze ook voor toekomstige generaties leefbaar is', ['zo veel mogelijk grondstoffen opmaken', 'niets meer gebruiken', 'alleen in de winter gebruiken'], ''),
      M('natuurlijke hulpbron', 'product uit de natuur dat mensen goed kunnen gebruiken', ['een rivier', 'een bos', 'een gebouw'], 'Bijvoorbeeld goud, hout of olie.'),
      M('biodiversiteit', 'variatie aan levensvormen in de natuur', ['aantal mensen per km²', 'aantal bomen', 'hoeveelheid water'], ''),
      M('klimaatverandering', 'geleidelijke of abrupte verandering in het klimaat door natuurlijke processen en/of invloed van de mens', ['het wisselen van seizoenen', 'het weer van vandaag', 'het verschil tussen dag en nacht'], ''),
      M('neerslag', 'water dat in vaste (sneeuw, hagel) of vloeibare (regen, mist) vorm uit de dampkring op aarde neerkomt', ['water in een rivier', 'water in de zee', 'waterdamp in de lucht'], ''),
      M('schaalniveau', 'de schaal waarop je naar de wereld kijkt: lokaal, regionaal, nationaal, continentaal of mondiaal', ['de schaal van een kaart in centimeters', 'de hoogte van een berg', 'het aantal inwoners'], ''),
      M('stijgingsregen', 'regen bij de evenaar doordat warme lucht stijgt, afkoelt en de waterdamp condenseert', ['regen door wind tegen een gebergte', 'sneeuw in de winter', 'mist op zee'], ''),
      M('mediterrane plantengroei', 'kenmerkende vegetatie in de subtropen, aangepast aan een droge, hete zomer; zoals olijfbomen, palmen, vijgen en kurkeiken', ['tropisch regenwoud', 'toendra', 'taiga'], ''),
    ] }),
    U('v1-ak9', 'Atlasquiz: landen en steden', '🧭', 'Topografie bij De Geo (hoofdstuk 1–4)', { qs: [
      M('Wat is de hoofdstad van Brazilië?', 'Brasília', ['Rio de Janeiro', 'São Paulo', 'Buenos Aires'], 'Rio en São Paulo zijn grote steden, maar niet de hoofdstad.'),
      M('Wat is de hoofdstad van Gambia?', 'Banjul', ['Dakar', 'Accra', 'Lagos'], ''),
      M('Door welk land wordt Gambia bijna helemaal omringd?', 'Senegal', ['Mali', 'Marokko', 'Nigeria'], 'Gambia ligt als smalle strook langs de gelijknamige rivier.'),
      M('Wat is de hoofdstad van Japan?', 'Tokio', ['Kyoto', 'Osaka', 'Peking'], ''),
      M('Welke oceaan ligt ten oosten van Japan?', 'de Grote (Stille) Oceaan', ['de Atlantische Oceaan', 'de Indische Oceaan', 'de Noordelijke IJszee'], ''),
      M('Tussen welke twee oceanen ligt Indonesië?', 'de Indische en de Grote Oceaan', ['de Atlantische en de Indische Oceaan', 'de Noordelijke IJszee en de Atlantische Oceaan', 'de Grote Oceaan en de Atlantische Oceaan'], ''),
      M('Welke van deze is een groot Indonesisch eiland?', 'Java', ['Kreta', 'Corsica', 'Ibiza'], 'Ook Sumatra, Borneo en Sulawesi horen bij Indonesië.'),
      M('Op welk werelddeel ligt de Sahara?', 'Afrika', ['Azië', 'Zuid-Amerika', 'Australië'], ''),
      M('Welke rivier is de langste van Afrika?', 'de Nijl', ['de Congo', 'de Niger', 'de Zambezi'], ''),
      M('Welk werelddeel ligt volledig op het zuidelijk halfrond en ligt rond de Zuidpool?', 'Antarctica', ['Australië', 'Zuid-Amerika', 'Afrika'], ''),
    ] }),
  );

  havo4.subjects[0].units.push(...havo4.subjects[0].units.splice(0, 2));
  /* ============ HAVO 4 Wiskunde A, hoofdstuk 3 Lineaire verbanden ============ */
  const nz = (lo, hi) => { let v; do { v = R(lo, hi); } while (v === 0); return v; };
  const ax = (a) => (a === 1 ? '' : a === -1 ? '−' : neg(a)) + 'x';
  const lineStr = (a, b) => `y = ${ax(a)}${b ? ` ${b > 0 ? '+' : '−'} ${Math.abs(b)}` : ''}`;
  G.onLine = () => {
    const a = nz(-4, 4), b = R(-8, 8), x = R(-5, 6), on = Math.random() < .5, y = a * x + b + (on ? 0 : P([-2, -1, 1, 2]));
    return M(`Ligt het punt (${neg(x)}, ${neg(y)}) op de lijn ${lineStr(a, b)}?`, on ? 'Ja' : 'Nee', [on ? 'Nee' : 'Ja'], `Vul x = ${neg(x)} in: y = ${neg(a * x + b)}. ${on ? 'Dat is gelijk aan' : 'Dat is niet gelijk aan'} ${neg(y)}.`);
  };
  G.parallel = () => {
    const a = nz(-4, 4), b = R(-8, 8), a2 = a + P([-2, -1, 1, 2]), ok = [a, b + P([-3, 3, 5, -5])], bad = [a2, b];
    const opts = [lineStr(...ok), lineStr(...bad), lineStr(-a, b + 1)];
    return M(`Welke lijn is evenwijdig met ${lineStr(a, b)}?`, opts[0], [opts[1], opts[2]], 'Evenwijdige lijnen hebben dezelfde richtingscoëfficiënt a.');
  };
  G.rc2 = () => {
    const a = nz(-5, 5), b = R(-8, 8), x1 = R(-4, 3), x2 = x1 + R(1, 5), y1 = a * x1 + b, y2 = a * x2 + b;
    return num(`Een lijn gaat door A(${neg(x1)}, ${neg(y1)}) en B(${neg(x2)}, ${neg(y2)}). Bereken de richtingscoëfficiënt a.`, a, '', `a = Δy / Δx = (${neg(y2)} − ${par(y1)}) / (${neg(x2)} − ${par(x1)}) = ${neg(y2 - y1)} / ${x2 - x1} = ${neg(a)}.`);
  };
  G.formTwo = () => {
    const a = nz(-4, 4), b = R(-9, 9), x1 = R(-3, 3), x2 = x1 + R(1, 4), y1 = a * x1 + b, y2 = a * x2 + b, k = R(0, 1);
    const q = `Een lijn y = ax + b gaat door (${neg(x1)}, ${neg(y1)}) en (${neg(x2)}, ${neg(y2)}).`;
    if (k === 0) return num(`${q} Bereken b (het snijpunt met de y-as).`, b, '', `Eerst a = ${neg(a)}. Vul een punt in: ${neg(y1)} = ${neg(a)} · ${par(x1)} + b, dus b = ${neg(b)}.`);
    const x = x2 + R(1, 4);
    return num(`${q} Wat is y als x = ${neg(x)}?`, a * x + b, '', `a = ${neg(a)}, b = ${neg(b)}, dus y = ${neg(a)} · ${par(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${neg(a * x + b)}.`);
  };
  G.nulpunt = () => {
    const a = nz(-4, 4), x0 = R(-6, 6), b = -a * x0;
    return num(`In welk punt snijdt ${lineStr(a, b)} de x-as? Geef de x-coördinaat.`, x0, '', `Op de x-as is y = 0: ${neg(a)}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = 0, dus x = ${neg(x0)}.`);
  };
  G.snijpunt = () => {
    let a1, a2; do { a1 = nz(-4, 4); a2 = nz(-4, 4); } while (a1 === a2);
    const x = R(-5, 6), y = R(-8, 10), b1 = y - a1 * x, b2 = y - a2 * x, k = R(0, 1);
    return num(`Twee lijnen: ${lineStr(a1, b1)} en ${lineStr(a2, b2)}. Wat is de ${k ? 'y' : 'x'}-coördinaat van hun snijpunt?`, k ? y : x, '',
      `Stel de formules gelijk: ${ax(a1)} ${b1 < 0 ? '−' : '+'} ${Math.abs(b1)} = ${ax(a2)} ${b2 < 0 ? '−' : '+'} ${Math.abs(b2)} geeft x = ${neg(x)}. Dan y = ${neg(y)}.`);
  };
  G.pxqy = () => {
    const p = nz(-5, 5), q = P([1, 2, 3, 4, 5]), x = R(-4, 6), y = R(-5, 6), r = p * x + q * y, k = R(0, 2);
    const eq = `${ax(p)} + ${q === 1 ? '' : q}y = ${neg(r)}`.replace('+ -', '− ').replace('+ −', '− ');
    if (k === 0) return num(`Gegeven: ${eq}. Op de lijn ligt het punt (${neg(x)}, y). Bereken y.`, y, '', `Vul x = ${neg(x)} in: ${neg(p * x)} + ${q}y = ${neg(r)}, dus ${q}y = ${neg(r - p * x)}, y = ${neg(y)}.`);
    if (k === 1) return num(`Gegeven: ${eq}. Wat is de y-coördinaat van het snijpunt met de y-as?`, r / q, '', `Op de y-as is x = 0: ${q}y = ${neg(r)}, dus y = ${fmt(r / q, 2)}.`, { tolAbs: 0.01 });
    return num(`Gegeven: ${eq}. Wat is de richtingscoëfficiënt van de lijn? (Herleid eerst naar y = ax + b.)`, -p / q, '', `${q}y = ${neg(-p)}x + ${neg(r)}, dus y = ${fmt(-p / q, 2)}x + ${fmt(r / q, 2)}. a = ${fmt(-p / q, 2)}.`, { tolAbs: 0.01 });
  };
  G.interp = () => {
    const a = nz(-6, 8), b = R(10, 60), x1 = P([2000, 2005, 2010, 2012]), d = P([5, 10]), x2 = x1 + d, y1 = a * 0 + b + R(0, 40), y2 = y1 + a * d * 2, t = R(1, d - 1), k = R(0, 1);
    if (k === 0) { const v = y1 + (y2 - y1) * t / d;
      return num(`In ${x1} was de waarde ${y1} en in ${x2} was die ${y2}. Schat met lineaire interpolatie de waarde in ${x1 + t}.`, v, '', `Stijging per jaar: (${y2} − ${y1}) / ${d} = ${fmt((y2 - y1) / d, 2)}. Na ${t} jaar: ${y1} + ${t} × ${fmt((y2 - y1) / d, 2)} = ${fmt(v, 2)}.`, { tolAbs: 0.05 }); }
    const t2 = d + R(1, d), v = y1 + (y2 - y1) * t2 / d;
    return num(`In ${x1} was de waarde ${y1} en in ${x2} was die ${y2}. Schat met lineaire extrapolatie de waarde in ${x1 + t2}.`, v, '', `Stijging per jaar: ${fmt((y2 - y1) / d, 2)}. Na ${t2} jaar: ${y1} + ${t2} × ${fmt((y2 - y1) / d, 2)} = ${fmt(v, 2)}.`, { tolAbs: 0.05 });
  };
  G.modelOpl = () => {
    const a = P([2, 3, 4, 5, 8, 10]), b = P([20, 50, 100, 150]), k = R(0, 1), t = R(2, 12);
    if (k === 0) return num(`Een abonnement kost €${b} aansluitkosten plus €${a} per maand. Hoeveel betaal je in totaal na ${t} maanden?`, b + a * t, 'euro', `K = ${a}t + ${b} = ${a} × ${t} + ${b} = ${a * t + b}.`);
    return num(`Een abonnement kost €${b} aansluitkosten plus €${a} per maand. Na hoeveel maanden heb je in totaal €${b + a * t} betaald?`, t, 'maanden', `${a}t + ${b} = ${b + a * t}, dus ${a}t = ${a * t}, t = ${t}.`);
  };

  const wiA = havo4.subjects.find(s => s.id === 'wi');
  wiA.units.unshift(
    U('h4-wi7', '3.1 Lineaire formules', '📈', 'Grafiek, a en b, evenwijdig, horizontaal en verticaal', { gen: [G.linFunc, G.onLine, G.parallel], qs: [
      M('Wat is de grafiek van een lineaire formule y = ax + b?', 'een rechte lijn', ['een parabool', 'een kromme lijn', 'een cirkel'], ''),
      M('Wat betekent a in y = ax + b?', 'de richtingscoëfficiënt: hoeveel y verandert als x 1 toeneemt', ['het snijpunt met de y-as', 'het snijpunt met de x-as', 'de x-coördinaat van het hoogste punt'], 'Bij a = 2: ga je 1 naar rechts, dan 2 omhoog.'),
      M('Wat betekent b in y = ax + b?', 'het snijpunt met de y-as, het punt (0, b)', ['de helling van de lijn', 'het snijpunt met de x-as', 'de afstand tot de oorsprong'], ''),
      M('Wat gebeurt er met de lijn als a negatief is?', 'de lijn daalt (van links naar rechts)', ['de lijn stijgt', 'de lijn is horizontaal', 'de lijn is verticaal'], ''),
      M('Wat is er bijzonder aan lijnen met dezelfde richtingscoëfficiënt?', 'ze zijn evenwijdig', ['ze snijden elkaar loodrecht', 'ze vallen samen', 'ze snijden de x-as in hetzelfde punt'], 'Bijvoorbeeld y = 3x − 5 en y = 3x + 7.'),
      M('Welke formule heeft de horizontale lijn door het punt (0, 5)?', 'y = 5', ['x = 5', 'y = 5x', 'y = x + 5'], 'Een horizontale lijn heeft rc = 0.'),
      M('Welke formule heeft de verticale lijn door het punt (6, 0)?', 'x = 6', ['y = 6', 'y = 6x', 'x = 0'], 'Een verticale lijn heeft geen richtingscoëfficiënt.'),
      M('Welke lijn is steiler: y = 2x + 1 of y = 0,5x + 1?', 'y = 2x + 1', ['y = 0,5x + 1', 'ze zijn even steil', 'dat kun je niet zien'], 'Hoe groter |a|, hoe steiler.'),
      M('Hoe kun je een lijn tekenen met y = 0,5x + 2?', 'begin in (0, 2), ga 1 naar rechts en 0,5 omhoog', ['begin in (2, 0), ga 1 omhoog en 0,5 naar links', 'begin in (0, 0), ga 2 omhoog', 'begin in (0, 0,5)'], ''),
    ] }),
    U('h4-wi8', '3.2 Formules opstellen', '✏️', 'Formule bij twee punten, rc en b berekenen', { gen: [G.rc2, G.formTwo], qs: [
      M('Hoe bereken je de richtingscoëfficiënt door A(x₁, y₁) en B(x₂, y₂)?', 'a = (y₂ − y₁) / (x₂ − x₁)', ['a = (x₂ − x₁) / (y₂ − y₁)', 'a = y₁ + y₂', 'a = x₁ × y₁'], 'Δy gedeeld door Δx.'),
      M('Wat is Δy?', 'het verschil in y-waarden: y₂ − y₁', ['de som van de y-waarden', 'het verschil in x-waarden', 'de y-waarde bij x = 0'], 'De delta betekent "verschil".'),
      M('Je hebt a berekend. Wat is de volgende stap om de formule y = ax + b op te stellen?', 'vul een van de twee punten in en bereken b', ['vul a in en klaar', 'teken eerst de grafiek', 'neem b = 0'], ''),
      M('Een lijn heeft rc 3 en gaat door (2, 7). Wat is b?', '1', ['6', '−1', '13'], '7 = 3 · 2 + b, dus b = 1.'),
      M('Een lijn gaat door (0, 4) en (2, 10). Wat is de formule?', 'y = 3x + 4', ['y = 4x + 3', 'y = 2x + 4', 'y = 3x + 10'], 'a = (10 − 4)/(2 − 0) = 3; b = 4.'),
      M('Wat zegt de eenheid van a in een model "kosten in euro per aantal uren"?', 'het aantal euro per uur erbij', ['het aantal uren totaal', 'de beginkosten', 'de totale kosten'], 'a is de verandering van de uitkomst per eenheid van x.'),
    ] }),
    U('h4-wi9', '3.3 Snijpunten van lijnen', '✖️', 'Nulpunten en snijpunt van twee lijnen', { gen: [G.snijpunt, G.nulpunt], qs: [
      M('Hoe bereken je het snijpunt van twee lijnen y = a₁x + b₁ en y = a₂x + b₂?', 'stel de twee formules aan elkaar gelijk en los x op', ['tel a₁ en a₂ op', 'deel b₁ door b₂', 'teken de lijnen en schat'], 'Daarna vul je x in om y te vinden.'),
      M('Hoe bereken je het snijpunt van een lijn met de x-as?', 'stel y = 0 en los x op', ['stel x = 0 en los y op', 'deel a door b', 'neem b'], ''),
      M('Hoe bereken je het snijpunt met de y-as?', 'stel x = 0; dan is y = b', ['stel y = 0', 'deel a door b', 'bereken Δy'], ''),
      M('Welk werkschema hoort bij het snijpunt van twee lijnen?', 'gelijkstellen, x oplossen, y berekenen door x in te vullen', ['x invullen, a bepalen, b schrappen', 'a gelijkstellen aan b', 'alleen de grafiek tekenen'], ''),
      M('Twee lijnen zijn evenwijdig en niet gelijk. Hoeveel snijpunten hebben ze?', 'geen', ['één', 'twee', 'oneindig veel'], 'Zelfde a, verschillend b.'),
      M('Als je bij het gelijkstellen 5 = 5 krijgt, wat betekent dat?', 'de lijnen vallen samen', ['de lijnen zijn evenwijdig', 'er is één snijpunt', 'de lijnen staan loodrecht'], ''),
    ] }),
    U('h4-wi10', '3.4 Vergelijkingen met twee variabelen', '🧮', 'Vergelijkingen van de vorm px + qy = r', { gen: [G.pxqy], qs: [
      M('Wat is de algemene vorm van een lineaire vergelijking met twee variabelen?', 'px + qy = r', ['y = x²', 'y = a/x', 'x + y = xy'], 'De grafiek is een rechte lijn.'),
      M('Hoe herleid je 2x + y = 6 naar de vorm y = ax + b?', 'y = −2x + 6', ['y = 2x + 6', 'y = −2x − 6', 'y = 6x − 2'], 'Trek 2x aan beide kanten af.'),
      M('Hoe herleid je 3x + 6y = 12 naar y = ax + b?', 'y = −0,5x + 2', ['y = 0,5x + 2', 'y = −2x + 12', 'y = 3x + 2'], 'Deel alles door 6 na aftrekken van 3x.'),
      M('Hoe kun je het snijpunt met de x-as van px + qy = r snel vinden?', 'vul y = 0 in en los x op', ['vul x = 0 in', 'deel r door q', 'bereken Δy'], ''),
      M('Je koopt hamburgers voor €3 en friet voor €2; totaal €18. Welke vergelijking klopt (h = hamburgers, f = friet)?', '3h + 2f = 18', ['3h − 2f = 18', 'h + f = 18', '5hf = 18'], 'Een vergelijking met twee variabelen: veel combinaties kloppen.'),
    ] }),
    U('h4-wi11', '3.5 Interpoleren en extrapoleren', '📉', 'Lineaire modellen en schatten', { gen: [G.interp, G.modelOpl], qs: [
      M('Wat is interpoleren?', 'een waarde schatten tússen gegeven meetpunten', ['een waarde schatten buiten de meetpunten', 'de grafiek spiegelen', 'de rc omkeren'], ''),
      M('Wat is extrapoleren?', 'een waarde schatten buiten het gegeven bereik, door de trend door te trekken', ['een waarde tussen twee punten schatten', 'de meetwaarden opnieuw meten', 'het gemiddelde nemen'], ''),
      M('Welke schatting is meestal betrouwbaarder?', 'interpoleren', ['extrapoleren', 'ze zijn even betrouwbaar', 'geen van beide'], 'Bij extrapoleren hoeft de trend niet door te lopen.'),
      M('Wat is een lineair model?', 'een formule y = ax + b die een situatie benadert met een rechte lijn', ['een formule met een kwadraat', 'een tabel zonder formule', 'een cirkelgrafiek'], ''),
      M('Waarom klopt een lineair model niet voor de hele situatie (zoals in de parachutesprong-opgave)?', 'het model geldt maar binnen een bepaald bereik (bijvoorbeeld tot de landing)', ['omdat lijnen nooit kloppen', 'omdat a negatief is', 'omdat b nul is'], 'Na de landing is bijvoorbeeld de hoogte 0 en kan die niet verder dalen.'),
    ] }),
  );



  root.LEERPAD = { levels: { vwo1, havo4 }, fmt, R, P };
  if (typeof module !== 'undefined') module.exports = root.LEERPAD;
})(typeof window !== 'undefined' ? window : globalThis);
