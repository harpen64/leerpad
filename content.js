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

  havo4.subjects[0].units.push(...havo4.subjects[0].units.splice(0, 2));

  root.LEERPAD = { levels: { vwo1, havo4 }, fmt, R, P };
  if (typeof module !== 'undefined') module.exports = root.LEERPAD;
})(typeof window !== 'undefined' ? window : globalThis);
