(() => {
  const LP = window.LEERPAD, LEVELS = LP.levels, fmt = LP.fmt;
  const KEY = 'leerpad.v1', GOAL = 50, LESSON_LEN = 8;
  const COLORS = ['#1cb0f6', '#a560e8', '#ff9600', '#ff4b4b', '#2bb673', '#ce82ff'];
  const $app = document.getElementById('app');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const dayKey = (d = new Date()) => d.toLocaleDateString('sv-SE');
  const yesterdayKey = () => dayKey(new Date(Date.now() - 864e5));


  /* ---------- koppeling met Supabase (optioneel, zie config.js) ---------- */
  const CFG = Object.assign({}, window.LP_CONFIG || {});
  CFG.supabaseUrl = String(CFG.supabaseUrl || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1.*$/i, '').replace(/\/+$/, '');
  CFG.anonKey = String(CFG.anonKey || '').trim();
  const REMOTE = !!(CFG.supabaseUrl && CFG.anonKey);
  const emptyView = () => (REMOTE ? 'role' : 'setup');
  const niceErr = m => { m = String(m);
    if (/Invalid login/i.test(m)) return 'E-mailadres of wachtwoord klopt niet.';
    if (/already registered/i.test(m)) return 'Er bestaat al een account met dit e-mailadres.';
    if (/Password should be/i.test(m)) return 'Kies een wachtwoord van minstens 8 tekens.';
    if (/valid email|invalid format/i.test(m)) return 'Dit e-mailadres lijkt niet te kloppen.';
    if (/not confirmed/i.test(m)) return 'Bevestig eerst je e-mailadres via de mail die je hebt gekregen.';
    return m; };
  async function sb(path, { method = 'GET', body, token } = {}) {
    let r;
    try { r = await fetch(CFG.supabaseUrl + path, { method, headers: Object.assign({ apikey: CFG.anonKey, 'Content-Type': 'application/json' }, (token || /^eyJ/.test(CFG.anonKey)) ? { Authorization: 'Bearer ' + (token || CFG.anonKey) } : {}), body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { throw new Error('Geen verbinding. Controleer je internet en probeer het opnieuw.'); }
    const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
    if (!r.ok) throw new Error(niceErr((j && (j.message || j.msg || j.error_description || j.error)) || r.statusText));
    return j;
  }
  const rpc = (fn, args, token) => sb('/rest/v1/rpc/' + fn, { method: 'POST', body: args || {}, token });
  let PS = null; try { PS = JSON.parse(localStorage.getItem('leerpad.parent')); } catch (e) {}
  const savePS = () => { try { PS ? localStorage.setItem('leerpad.parent', JSON.stringify(PS)) : localStorage.removeItem('leerpad.parent'); } catch (e) {} };
  const setSession = r => { PS = { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: r.expires_at || Math.floor(Date.now() / 1000) + (r.expires_in || 3600) }; savePS(); };
  async function token() {
    if (!PS) throw new Error('Niet ingelogd.');
    if (PS.expires_at * 1000 - Date.now() < 60000) {
      try { setSession(await sb('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: PS.refresh_token } })); }
      catch (e) { PS = null; savePS(); view = 'plogin'; throw new Error('Je sessie is verlopen. Log opnieuw in.'); }
    }
    return PS.access_token;
  }
  const ui = { err: '', info: '', busy: false, code: '', kids: [], pick: null, pin: '', email: '', pw: '', family: '', rows: [], detail: null, newpin: '', np: { name: '', level: 'havo4', pin: '' } };
  async function run(fn) { ui.busy = true; ui.err = ''; ui.info = ''; render(); try { await fn(); } catch (e) { ui.err = e.message || String(e); } ui.busy = false; render(); }
  const strip = p => { const { remote, dirty, ...rest } = p; return rest; };
  async function pushState(p) {
    try { const r = await rpc('kid_save', { p_id: p.id, p_pin: p.remote.pin, p_state: strip(p) });
      if (r.status === 'bad_pin') { p.remote.stale = true; save(); return; }
      if (r.status !== 'ok') throw new Error(r.status);
      if (p.dirty) { delete p.dirty; save(); } }
    catch (e) { p.dirty = true; save(); }
  }
  async function pullState(p) {
    try { const r = await rpc('kid_login', { p_id: p.id, p_pin: p.remote.pin });
      if (r.status === 'bad_pin') { p.remote.stale = true; save(); if (view === 'main') render(); return; }
      if (r.status !== 'ok') return;
      if (p.dirty) { pushState(p); return; }
      if (r.state && (r.state.xp || 0) > p.xp) { Object.assign(p, r.state, { id: p.id, remote: p.remote }); save(); if (view === 'main') render(); } }
    catch (e) {}
  }
  window.addEventListener('online', () => S.profiles.filter(p => p.remote && p.dirty).forEach(pushState));
  const when = d => (!d ? 'nog niet' : d === dayKey() ? 'vandaag' : d === yesterdayKey() ? 'gisteren' : d);

  /* ---------- opslag ---------- */
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !Array.isArray(S.profiles)) S = { profiles: [], active: null };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const prof = () => S.profiles.find(p => p.id === S.active);
  const streakOf = p => (p.lastDay === dayKey() || p.lastDay === yesterdayKey() ? p.streak : 0);
  const todayXp = p => (p.days && p.days[dayKey()]) || 0;
  const newProfile = (name, level) => ({ id: 'p' + Date.now() + Math.floor(Math.random() * 999), name, level, xp: 0, streak: 0, lastDay: null, days: {}, units: {}, log: [] });

  /* ---------- state ---------- */
  let view = S.profiles.length ? 'pick' : emptyView();
  let tab = 'home';
  let L = null;        // actieve les
  let editing = null;  // profiel in bewerking
  let draft = { name: '', level: 'havo4' };

  const levelData = p => LEVELS[p.level];
  const allUnits = p => levelData(p).subjects.flatMap(s => s.units.map(u => ({ s, u })));

  /* ---------- vragen maken ---------- */
  function buildLesson(unit) {
    const statics = unit.qs || [];
    let take = unit.gen ? Math.min(statics.length, Math.floor(LESSON_LEN / 2)) : Math.min(statics.length, LESSON_LEN);
    const qs = shuffle(statics).slice(0, take);
    const seen = new Set(qs.map(q => q.q));
    let guard = 0, gi = 0;
    while (unit.gen && qs.length < LESSON_LEN && guard++ < 200) {
      const q = unit.gen[gi++ % unit.gen.length]();
      if (!seen.has(q.q)) { seen.add(q.q); qs.push(q); }
    }
    return shuffle(qs).map(q => ({ q, retry: false, order: q.t === 'mc' ? shuffle(q.options.map((_, i) => i)) : null }));
  }

  function startLesson(unitId) {
    const found = allUnits(prof()).find(x => x.u.id === unitId);
    const queue = buildLesson(found.u);
    L = { unit: found.u, subj: found.s, queue, total: queue.length, cleared: 0, firstOk: 0, mistakes: 0, phase: 'ask', input: '', sel: null, ok: null };
    view = 'lesson';
    render();
  }

  /* ---------- antwoord controleren ---------- */
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  function parseNum(s) {
    s = String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.');
    if (!/^-?\d*\.?\d+$/.test(s)) return null;
    return parseFloat(s);
  }
  function isRight(q, input) {
    if (q.t === 'mc') return input === q.a;
    if (q.t === 'num') {
      const x = parseNum(input); if (x === null) return false;
      return Math.abs(x - q.a) <= Math.max(q.tolAbs || 0, Math.abs(q.a) * (q.tolRel || 0)) + 1e-9;
    }
    return q.a.some(a => norm(a) === norm(input));
  }
  const rightText = q => (q.t === 'mc' ? q.options[q.a] : q.t === 'num' ? fmt(q.a) + (q.unit ? ' ' + q.unit : '') : q.a[0]);

  function check() {
    const it = L.queue[0], q = it.q;
    const input = q.t === 'mc' ? L.sel : L.input;
    const ok = isRight(q, input);
    L.ok = ok; L.phase = 'fb';
    if (ok) { L.cleared++; if (!it.retry) L.firstOk++; }
    else { if (!it.retry) L.mistakes++; }
    render();
  }
  function next() {
    const it = L.queue.shift();
    if (!L.ok) L.queue.push({ q: it.q, retry: true, order: it.order });
    L.phase = 'ask'; L.input = ''; L.sel = null; L.ok = null;
    if (!L.queue.length) return finish();
    render();
  }
  function finish() {
    const p = prof(), acc = L.firstOk / L.total;
    const perfect = L.mistakes === 0;
    const gained = L.firstOk * 10 + (perfect ? 10 : 0);
    const stars = acc >= .9 ? 3 : acc >= .7 ? 2 : 1;
    const t = dayKey();
    if (p.lastDay !== t) { p.streak = p.lastDay === yesterdayKey() ? p.streak + 1 : 1; p.lastDay = t; }
    p.xp += gained; p.days[t] = (p.days[t] || 0) + gained;
    const u = p.units[L.unit.id] || (p.units[L.unit.id] = { best: 0, lessons: 0, ok: 0, tot: 0 });
    u.best = Math.max(u.best, stars); u.lessons++; u.ok += L.firstOk; u.tot += L.total;
    p.log.push({ d: t, u: L.unit.id, ok: L.firstOk, tot: L.total }); if (p.log.length > 300) p.log.shift();
    save();
    if (p.remote) pushState(p);
    L.result = { gained, stars, acc, perfect };
    view = 'done'; render();
  }

  /* ---------- weergave ---------- */
  function render() {
    if (view === 'setup' || view === 'edit') $app.innerHTML = setupView();
    else if (view === 'pick') $app.innerHTML = pickView();
    else if (['role', 'kidcode', 'kidpick', 'kidpin', 'plogin', 'parent', 'pkid'].includes(view)) $app.innerHTML = remoteView();
    else if (view === 'lesson') $app.innerHTML = lessonView();
    else if (view === 'done') $app.innerHTML = doneView();
    else $app.innerHTML = mainView();
    const inp = $app.querySelector('input.ans, input#nm'); if (inp && L?.phase !== 'fb') { if (view === 'lesson') inp.focus(); }
  }

  function setupView() {
    const isEdit = view === 'edit';
    return `<div class="pad">
      <div class="hero"><div class="logo">📚</div><h1>${isEdit ? 'Profiel aanpassen' : S.profiles.length ? 'Nieuw profiel' : 'Welkom bij Leerpad'}</h1>
      ${!isEdit && !S.profiles.length ? '<p class="mute" style="margin-top:6px">Oefen elke dag een stukje, verdien XP en bouw je reeks op.</p>' : ''}</div>
      <label for="nm">Naam</label><input id="nm" type="text" maxlength="20" value="${esc(draft.name)}" placeholder="Bijv. Lavinia" autocomplete="off">
      <label>Niveau en leerjaar</label>
      <div class="seg"><button data-act="lvl" data-v="havo4" class="${draft.level === 'havo4' ? 'on' : ''}">HAVO 4</button><button data-act="lvl" data-v="vwo1" class="${draft.level === 'vwo1' ? 'on' : ''}">VWO 1</button></div>
      <div style="margin-top:26px" class="row">
        ${S.profiles.length ? '<button class="btn ghost" data-act="cancel">Terug</button>' : ''}
        <button class="btn" data-act="saveprof" ${draft.name.trim() ? '' : 'disabled'}>Opslaan</button></div>
      ${isEdit ? '<button class="btn red mode" data-act="delprof">Profiel verwijderen</button>' : ''}
    </div>`;
  }

  function pickView() {
    return `<div class="pad"><div class="hero"><div class="logo">📚</div><h1>Leerpad</h1><p class="mute">Wie gaat er oefenen?</p></div>
      <div class="cards">${S.profiles.map((p, i) => `<div class="row"><button class="pcard" data-act="open" data-id="${p.id}">
        <span class="avatar" style="background:${COLORS[i % COLORS.length]}">${esc(p.name.slice(0, 1).toUpperCase())}</span>
        <span class="sp"><b>${esc(p.name)}</b><span class="mute small">${levelData(p).label} · ${p.xp} XP · 🔥 ${streakOf(p)}</span></span></button>
        <button class="edit" data-act="editprof" data-id="${p.id}" aria-label="Aanpassen">✏️</button></div>`).join('')}</div>
      ${REMOTE ? `<button class="btn blue" data-act="role">Leerling toevoegen</button><button class="btn ghost mode" data-act="parent">Ouder: voortgang bekijken</button>` : '<button class="btn blue" data-act="addprof">Profiel toevoegen</button>'}</div>`;
  }

  function mainView() {
    const p = prof();
    const nav = `<nav class="nav"><div>
      <button data-act="tab" data-v="home" class="${tab === 'home' ? 'on' : ''}"><span>🏠</span>Leren</button>
      <button data-act="tab" data-v="prog" class="${tab === 'prog' ? 'on' : ''}"><span>📊</span>Voortgang</button>
      <button data-act="tab" data-v="who" class="${tab === 'who' ? 'on' : ''}"><span>👤</span>Wissel</button></div></nav>`;
    const top = `<div class="top"><span class="name">${esc(p.name)}</span><span class="small mute">${levelData(p).label}</span><span class="sp"></span>
      <span class="chip fire">🔥 ${streakOf(p)}</span><span class="chip xp">⭐ ${p.xp}</span></div>`;
    const stale = p.remote && p.remote.stale ? '<div class="note small" style="margin:12px 0 0">⚠️ De pincode is gewijzigd, dus je voortgang wordt niet meer bewaard. Kies <b>Wissel</b> en log opnieuw in.</div>' : '';
    if (tab === 'prog') return top + `<div class="pad">${progView(p)}</div>` + nav;
    const xp = todayXp(p), pct = Math.min(100, Math.round(xp / GOAL * 100));
    const goal = `<div class="goal"><div class="row"><b>Dagdoel</b><span class="sp"></span><span class="mute">${Math.min(xp, GOAL)} / ${GOAL} XP</span></div>
      <div class="bar" style="margin-top:8px"><i style="width:${pct}%"></i></div>${xp >= GOAL ? '<p style="margin-top:8px;font-weight:700;color:var(--green-d)">Dagdoel gehaald! 🎉</p>' : ''}</div>`;
    const subs = levelData(p).subjects.map(s => `<section class="subj"><div class="shead" style="background:${s.color}"><span>${s.icon}</span>${esc(s.name)}</div>
      <div class="units">${s.units.map(u => {
        const st = p.units[u.id], b = st ? st.best : 0;
        return `<button class="unit" data-act="start" data-id="${u.id}"><span class="bubble" style="background:${s.color}">${u.icon}</span>
          <span class="sp"><b>${esc(u.title)}</b><span class="mute small">${esc(u.desc)}</span><br><span class="stars">${[1, 2, 3].map(n => `<span class="${n <= b ? 'on' : ''}">★</span>`).join('')}</span></span></button>`;
      }).join('')}</div></section>`).join('');
    return top + `<div class="pad">${stale}${goal}${subs}</div>` + nav;
  }

  function progView(p, ro) {
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { k: dayKey(d), l: d.toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2) }; });
    const max = Math.max(GOAL, ...days.map(d => p.days[d.k] || 0));
    const week = `<div class="week">${days.map(d => { const v = p.days[d.k] || 0; return `<div><i style="height:${Math.round(v / max * 90)}px" title="${v} XP"></i>${d.l}</div>`; }).join('')}</div>`;
    const weekTotal = days.reduce((s, d) => s + (p.days[d.k] || 0), 0);
    const rows = levelData(p).subjects.map(s => {
      let ok = 0, tot = 0, les = 0; s.units.forEach(u => { const x = p.units[u.id]; if (x) { ok += x.ok; tot += x.tot; les += x.lessons; } });
      const a = tot ? Math.round(ok / tot * 100) : null;
      return `<tr><td>${s.icon} ${esc(s.name)}</td><td><div class="pct"><i style="width:${a || 0}%;background:${s.color}"></i></div></td><td style="text-align:right;white-space:nowrap">${a === null ? '–' : a + '%'} <span class="mute small">(${les})</span></td></tr>`;
    }).join('');
    const weak = allUnits(p).map(({ s, u }) => ({ s, u, x: p.units[u.id] })).filter(o => o.x && o.x.tot >= 8).map(o => ({ ...o, a: o.x.ok / o.x.tot }))
      .sort((a, b) => a.a - b.a).slice(0, 3).filter(o => o.a < .85);
    const html = `<h2 class="sect" style="margin-top:4px">Laatste 7 dagen</h2><p class="mute small">${weekTotal} XP deze week</p>${week}
      <h2 class="sect">Per vak</h2><p class="mute small">Percentage goed in één keer (aantal lessen)</p><table class="tbl">${rows}</table>
      <h2 class="sect">Extra oefenen</h2>${weak.length ? weak.map(o => `<button class="unit" style="margin-bottom:10px" data-act="start" data-id="${o.u.id}"><span class="bubble" style="background:${o.s.color}">${o.u.icon}</span><span class="sp"><b>${esc(o.u.title)}</b><span class="mute small">${esc(o.s.name)} · ${Math.round(o.a * 100)}% goed</span></span></button>`).join('') : '<p class="mute">Nog niets om extra te oefenen. Maak een paar lessen, dan verschijnen hier de onderdelen die nog lastig zijn.</p>'}
      <h2 class="sect">Back-up</h2><div class="note small">Voortgang staat op dit apparaat. Wil je die meenemen naar een ander apparaat? Maak een back-up en laad die daar in.</div>
      <div class="row"><button class="btn ghost" data-act="export">Back-up maken</button><button class="btn ghost" data-act="import">Laden</button></div>
      <input type="file" id="imp" accept="application/json" hidden>`;
    return ro ? html.slice(0, html.indexOf('<h2 class="sect">Extra oefenen')) : html;
  }

  function lessonView() {
    const it = L.queue[0], q = it.q, fb = L.phase === 'fb';
    const pct = Math.round(L.cleared / L.total * 100);
    const tag = it.retry ? 'Probeer het nog eens' : L.subj.name;
    let body = '';
    if (q.t === 'mc') {
      body = `<div class="opts">${it.order.map((oi, n) => {
        let cls = L.sel === oi ? 'opt sel' : 'opt';
        if (fb) { if (oi === q.a) cls = 'opt right'; else if (L.sel === oi) cls = 'opt wrong'; else cls = 'opt'; }
        return `<button class="${cls}" data-act="sel" data-i="${oi}" ${fb ? 'disabled' : ''}><span class="k">${n + 1}</span><span>${esc(q.options[oi])}</span></button>`;
      }).join('')}</div>`;
    } else {
      body = `<div class="inwrap"><input class="ans" type="text" inputmode="${q.t === 'num' ? 'decimal' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Jouw antwoord" value="${esc(L.input)}" ${fb ? 'disabled' : ''}>${fb ? '' : '<button type="button" class="signbtn" data-act="neg" aria-label="Min-teken">±</button>'}${q.unit ? `<span class="unitlbl">${esc(q.unit)}</span>` : ''}</div>`;
    }
    const ready = q.t === 'mc' ? L.sel !== null : L.input.trim() !== '';
    const foot = fb
      ? `<div class="foot ${L.ok ? 'good' : 'bad'}"><div><div class="fb"><h3>${L.ok ? ['Goed zo!', 'Top!', 'Klopt!', 'Prima!'][Math.floor(Math.random() * 4)] : 'Helaas, dat is niet goed'}</h3>
          ${L.ok ? '' : `<p>Juist antwoord: <b>${esc(rightText(q))}</b></p>`}${q.why ? `<p>${esc(q.why)}</p>` : ''}</div>
          <button class="btn" data-act="next">Doorgaan</button></div></div>`
      : `<div class="foot"><div><button class="btn" data-act="check" ${ready ? '' : 'disabled'}>Controleer</button></div></div>`;
    return `<div class="lesson"><div class="ltop"><button class="x" data-act="quit" aria-label="Stoppen">✕</button><div class="bar sp"><i style="width:${pct}%"></i></div></div>
      <div class="qwrap"><p class="qtag">${esc(tag)}</p><h2 class="qtext">${esc(q.q)}</h2>${body}</div>${foot}</div>`;
  }

  function doneView() {
    const r = L.result;
    return `<div class="pad done"><div class="big">${r.stars === 3 ? '🏆' : r.stars === 2 ? '🎉' : '👍'}</div>
      <h1>${r.perfect ? 'Foutloos!' : 'Les voltooid!'}</h1><p class="stars" style="font-size:38px;margin-bottom:22px">${[1, 2, 3].map(n => `<span class="${n <= r.stars ? 'on' : ''}">★</span>`).join('')}</p>
      <div class="stat"><div><b style="color:var(--gold)">+${r.gained}</b><small>XP</small></div><div><b style="color:var(--green-d)">${Math.round(r.acc * 100)}%</b><small>In één keer goed</small></div><div><b style="color:#ff9600">${streakOf(prof())}</b><small>Dagen reeks</small></div></div>
      <button class="btn" data-act="home">Doorgaan</button><button class="btn ghost mode" data-act="again" data-id="${L.unit.id}">Nog een les</button></div>`;
  }


  /* ---------- ouder- en leerlingschermen (alleen met server) ---------- */
  async function kidFindFamily() {
    const code = ui.code.trim().toUpperCase();
    if (code.length < 4) throw new Error('Vul de gezinscode in.');
    const rows = await rpc('family_profiles', { p_code: code });
    if (!rows.length) throw new Error('Geen leerlingen gevonden bij deze code.');
    ui.kids = rows; ui.code = code; view = 'kidpick';
  }
  async function kidLogin() {
    if (!/^\d{4}$/.test(ui.pin)) throw new Error('De pincode bestaat uit 4 cijfers.');
    const r = await rpc('kid_login', { p_id: ui.pick.id, p_pin: ui.pin });
    if (r.status === 'bad_pin') throw new Error('Onjuiste pincode.');
    if (r.status === 'locked') throw new Error('Te vaak een foute pincode. Probeer het over 15 minuten opnieuw.');
    if (r.status !== 'ok') throw new Error('Inloggen is niet gelukt.');
    const k = ui.pick, p = Object.assign(newProfile(k.name, k.level), r.state || {}, { id: k.id, name: k.name, level: k.level, remote: { pin: ui.pin } });
    delete p.dirty;
    const i = S.profiles.findIndex(x => x.id === k.id);
    if (i >= 0) S.profiles[i] = p; else S.profiles.push(p);
    S.active = p.id; save(); ui.pin = ''; view = 'main'; tab = 'home';
  }
  async function loadParent() {
    const t = await token();
    ui.family = await rpc('parent_create_family', {}, t);
    ui.rows = await sb('/rest/v1/profiles?select=id,name,level,state,updated_at&order=created_at.asc', { token: t });
  }
  async function parentLogin(signup) {
    if (!/.+@.+\..+/.test(ui.email.trim())) throw new Error('Vul een geldig e-mailadres in.');
    if (ui.pw.length < 8) throw new Error('Kies een wachtwoord van minstens 8 tekens.');
    const body = { email: ui.email.trim(), password: ui.pw };
    const r = signup ? await sb('/auth/v1/signup', { method: 'POST', body }) : await sb('/auth/v1/token?grant_type=password', { method: 'POST', body });
    if (!r.access_token) { ui.info = 'Account gemaakt. Bevestig je e-mailadres via de mail en log daarna in.'; return; }
    setSession(r); ui.pw = ''; await loadParent(); view = 'parent';
  }
  async function parentAdd() {
    const n = ui.np;
    if (!n.name.trim()) throw new Error('Vul een naam in.');
    if (!/^\d{4}$/.test(n.pin)) throw new Error('De pincode bestaat uit 4 cijfers.');
    await rpc('parent_add_profile', { p_name: n.name.trim(), p_level: n.level, p_pin: n.pin }, await token());
    ui.np = { name: '', level: n.level, pin: '' }; await loadParent();
  }
  async function parentSetPin() {
    if (!/^\d{4}$/.test(ui.newpin)) throw new Error('De pincode bestaat uit 4 cijfers.');
    await rpc('parent_set_pin', { p_id: ui.detail, p_pin: ui.newpin }, await token());
    ui.newpin = ''; ui.info = 'Pincode gewijzigd.';
  }
  async function parentDelete() { await rpc('parent_delete_profile', { p_id: ui.detail }, await token()); await loadParent(); view = 'parent'; }

  function remoteView() {
    const msg = (ui.err ? `<div class="note small" style="background:#ffdfe0;color:#ea2b2b;font-weight:700">${esc(ui.err)}</div>` : '') + (ui.info ? `<div class="note small" style="background:#d7ffb8;color:#58a700;font-weight:700">${esc(ui.info)}</div>` : '');
    const dis = ui.busy ? 'disabled' : '';
    const back = act => `<button class="btn ghost" data-act="${act}" ${dis}>Terug</button>`;
    const hero = (t, sub) => `<div class="hero"><div class="logo">📚</div><h1>${t}</h1>${sub ? `<p class="mute" style="margin-top:6px">${sub}</p>` : ''}</div>`;
    if (view === 'role') return `<div class="pad">${hero('Leerpad', 'Wie ben jij?')}<div class="cards"><button class="btn" data-act="kid">Ik ben leerling</button><button class="btn blue" data-act="parent">Ik ben ouder</button></div>${S.profiles.length ? back('back') : ''}</div>`;
    if (view === 'kidcode') return `<div class="pad">${hero('Gezinscode', 'Vraag je ouder om de code')}${msg}<input type="text" data-f="code" value="${esc(ui.code)}" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="BIJV. K7M2QD" style="text-transform:uppercase;letter-spacing:.15em;text-align:center">
      <div class="row" style="margin-top:22px">${back('role')}<button class="btn" data-act="kidnext" data-primary ${dis}>Verder</button></div></div>`;
    if (view === 'kidpick') return `<div class="pad">${hero('Wie ben jij?')}${msg}<div class="cards">${ui.kids.map((k, i) => `<button class="pcard" data-act="kidchoose" data-id="${k.id}"><span class="avatar" style="background:${COLORS[i % COLORS.length]}">${esc(k.name.slice(0, 1).toUpperCase())}</span><span class="sp"><b>${esc(k.name)}</b><span class="mute small">${(LEVELS[k.level] || {}).label || ''}</span></span></button>`).join('')}</div>${back('kid')}</div>`;
    if (view === 'kidpin') return `<div class="pad">${hero('Hoi ' + esc(ui.pick.name) + '!', 'Vul je pincode in')}${msg}<input type="text" data-f="pin" value="${esc(ui.pin)}" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••" style="text-align:center;letter-spacing:.4em;font-size:28px;-webkit-text-security:disc">
      <div class="row" style="margin-top:22px">${back('kidbackpick')}<button class="btn" data-act="kidgo" data-primary ${dis}>Inloggen</button></div></div>`;
    if (view === 'plogin') return `<div class="pad">${hero('Ouder', 'Log in om de voortgang te bekijken')}${msg}
      <label for="em">E-mailadres</label><input id="em" type="text" data-f="email" value="${esc(ui.email)}" inputmode="email" autocapitalize="off" autocomplete="username">
      <label for="pw">Wachtwoord</label><input id="pw" type="text" data-f="pw" value="${esc(ui.pw)}" autocomplete="current-password" style="-webkit-text-security:disc" placeholder="minstens 8 tekens">
      <div style="margin-top:22px"><button class="btn" data-act="pgo" data-primary ${dis}>Inloggen</button><button class="btn ghost mode" data-act="psignup" ${dis}>Account maken</button><div class="mode">${back('back')}</div></div></div>`;
    if (view === 'parent') {
      const cards = ui.rows.map((r, i) => { const s = r.state || {}; return `<button class="pcard" data-act="pkid" data-id="${r.id}"><span class="avatar" style="background:${COLORS[i % COLORS.length]}">${esc(r.name.slice(0, 1).toUpperCase())}</span>
        <span class="sp"><b>${esc(r.name)}</b><span class="mute small">${(LEVELS[r.level] || {}).label || ''} · ${s.xp || 0} XP · vandaag ${((s.days || {})[dayKey()]) || 0} XP · 🔥 ${streakOf(Object.assign({ streak: 0 }, s))}<br>Laatst actief: ${when(s.lastDay)}</span></span></button>`; }).join('');
      return `<div class="pad"><div class="hero" style="padding-top:12px"><h1 style="font-size:26px">Ouderoverzicht</h1></div>${msg}
        <div class="note" style="text-align:center">Gezinscode voor de kinderen<br><b style="font-size:30px;letter-spacing:.2em">${esc(ui.family)}</b></div>
        <div class="cards">${cards || '<p class="mute">Nog geen leerlingen. Voeg hieronder je eerste kind toe.</p>'}</div>
        <h2 class="sect">Leerling toevoegen</h2>
        <input type="text" data-f="np.name" value="${esc(ui.np.name)}" maxlength="20" placeholder="Naam" autocomplete="off">
        <div class="seg" style="margin:10px 0"><button data-act="nplvl" data-v="havo4" class="${ui.np.level === 'havo4' ? 'on' : ''}">HAVO 4</button><button data-act="nplvl" data-v="vwo1" class="${ui.np.level === 'vwo1' ? 'on' : ''}">VWO 1</button></div>
        <input type="text" data-f="np.pin" value="${esc(ui.np.pin)}" inputmode="numeric" maxlength="4" placeholder="Pincode (4 cijfers)" autocomplete="off">
        <button class="btn mode" data-act="padd" data-primary ${dis}>Toevoegen</button>
        <button class="btn ghost mode" data-act="plogout">Uitloggen</button></div>`;
    }
    const r = ui.rows.find(x => x.id === ui.detail); if (!r) { view = 'parent'; return remoteView(); }
    const p = Object.assign({ xp: 0, streak: 0, days: {}, units: {}, log: [] }, r.state || {}, { level: r.level, name: r.name });
    return `<div class="top"><button class="x" data-act="pback" style="font-size:22px;padding:4px 8px">←</button><span class="name">${esc(r.name)}</span><span class="small mute">${(LEVELS[r.level] || {}).label || ''}</span><span class="sp"></span><span class="chip fire">🔥 ${streakOf(p)}</span><span class="chip xp">⭐ ${p.xp}</span></div>
      <div class="pad">${msg}<p class="mute small" style="margin-bottom:6px">Laatst actief: ${when(p.lastDay)} · vandaag ${todayXp(p)} XP</p>${progView(p, true)}
      <h2 class="sect">Beheer</h2><input type="text" data-f="newpin" value="${esc(ui.newpin)}" inputmode="numeric" maxlength="4" placeholder="Nieuwe pincode (4 cijfers)" autocomplete="off">
      <button class="btn blue mode" data-act="ppin" data-primary ${dis}>Pincode wijzigen</button><button class="btn red mode" data-act="pdel" ${dis}>Leerling verwijderen</button></div>`;
  }

  /* ---------- events ---------- */
  $app.addEventListener('click', e => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act, id = t.dataset.id;
    switch (a) {
      case 'open': S.active = id; save(); view = 'main'; tab = 'home'; if (prof().remote) pullState(prof()); break;
      case 'addprof': draft = { name: '', level: 'havo4' }; editing = null; view = 'setup'; break;
      case 'editprof': { const p = S.profiles.find(x => x.id === id);
        if (p.remote) { if (confirm('Van dit apparaat uitloggen? De voortgang blijft bewaard op de server.')) { S.profiles = S.profiles.filter(x => x.id !== id); if (S.active === id) S.active = null; save(); view = S.profiles.length ? 'pick' : emptyView(); } break; } editing = id; draft = { name: p.name, level: p.level }; view = 'edit'; break; }
      case 'lvl': draft.level = t.dataset.v; break;
      case 'cancel': view = 'pick'; break;
      case 'saveprof': {
        const name = draft.name.trim(); if (!name) return;
        if (view === 'edit') { const p = S.profiles.find(x => x.id === editing); p.name = name; p.level = draft.level; view = 'pick'; }
        else { const p = newProfile(name, draft.level); S.profiles.push(p); S.active = p.id; view = 'main'; tab = 'home'; }
        save(); break;
      }
      case 'delprof': if (confirm('Dit profiel en alle voortgang verwijderen?')) { S.profiles = S.profiles.filter(x => x.id !== editing); S.active = null; save(); view = S.profiles.length ? 'pick' : emptyView(); draft = { name: '', level: 'havo4' }; } break;
      case 'role': view = 'role'; ui.err = ''; break;
      case 'kid': view = 'kidcode'; ui.err = ''; break;
      case 'back': view = S.profiles.length ? 'pick' : emptyView(); ui.err = ''; break;
      case 'parent': ui.err = ''; ui.info = ''; if (PS) { run(async () => { await loadParent(); view = 'parent'; }); return; } view = 'plogin'; break;
      case 'kidnext': run(kidFindFamily); return;
      case 'kidchoose': ui.pick = ui.kids.find(k => k.id === id); ui.pin = ''; ui.err = ''; view = 'kidpin'; break;
      case 'kidbackpick': view = 'kidpick'; ui.err = ''; break;
      case 'kidgo': run(kidLogin); return;
      case 'pgo': run(() => parentLogin(false)); return;
      case 'psignup': run(() => parentLogin(true)); return;
      case 'plogout': PS = null; savePS(); ui.rows = []; view = S.profiles.length ? 'pick' : emptyView(); break;
      case 'pback': view = 'parent'; ui.err = ''; break;
      case 'pkid': ui.detail = id; ui.newpin = ''; ui.err = ''; view = 'pkid'; break;
      case 'nplvl': ui.np.level = t.dataset.v; break;
      case 'padd': run(parentAdd); return;
      case 'ppin': run(parentSetPin); return;
      case 'pdel': if (confirm('Deze leerling en alle voortgang verwijderen?')) run(parentDelete); return;
      case 'tab': if (t.dataset.v === 'who') { view = 'pick'; } else tab = t.dataset.v; break;
      case 'start': startLesson(id); return;
      case 'again': startLesson(id); return;
      case 'home': view = 'main'; tab = 'home'; break;
      case 'quit': if (confirm('Les stoppen? Je voortgang in deze les gaat verloren.')) { view = 'main'; } else return; break;
      case 'sel': if (L.phase === 'ask') { L.sel = +t.dataset.i; } break;
      case 'neg': {
        const inp = $app.querySelector('input.ans'); if (!inp) return;
        L.input = /^[-−]/.test(L.input) ? L.input.replace(/^[-−]/, '') : '−' + L.input;
        inp.value = L.input; inp.focus();
        const b = $app.querySelector('[data-act=check]'); if (b) b.disabled = !L.input.trim();
        return;
      }
      case 'check': check(); return;
      case 'next': next(); return;
      case 'export': {
        const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }), url = URL.createObjectURL(blob), el = document.createElement('a');
        el.href = url; el.download = 'leerpad-back-up-' + dayKey() + '.json'; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); return;
      }
      case 'import': document.getElementById('imp').click(); return;
    }
    render();
  });
  $app.addEventListener('input', e => {
    const f = e.target.dataset && e.target.dataset.f;
    if (f) { const [a, b] = f.split('.'); if (b) ui[a][b] = e.target.value; else ui[a] = e.target.value; return; }
    if (e.target.id === 'nm') { draft.name = e.target.value; const b = $app.querySelector('[data-act=saveprof]'); if (b) b.disabled = !draft.name.trim(); }
    else if (e.target.classList.contains('ans')) { L.input = e.target.value; const b = $app.querySelector('[data-act=check]'); if (b) b.disabled = !L.input.trim(); }
  });
  $app.addEventListener('change', e => {
    if (e.target.id !== 'imp' || !e.target.files[0]) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (!Array.isArray(d.profiles)) throw 0; if (confirm('Huidige voortgang vervangen door de back-up?')) { S = d; save(); view = 'pick'; render(); } } catch (x) { alert('Dit bestand is geen geldige back-up.'); } };
    r.readAsText(e.target.files[0]);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.f) { const b = $app.querySelector('[data-primary]'); if (b && !ui.busy) { e.preventDefault(); b.click(); } return; }
    if (view !== 'lesson') return;
    if (e.key === 'Enter') { const b = $app.querySelector('[data-act=check]:not([disabled]), [data-act=next]'); if (b) { e.preventDefault(); b.click(); } }
    else if (/^[1-4]$/.test(e.key) && L.phase === 'ask' && L.queue[0].q.t === 'mc') { const o = L.queue[0].order[+e.key - 1]; if (o !== undefined) { L.sel = o; render(); } }
  });

  window.__lp = { get L() { return L; }, get S() { return S; }, isRight };
  if (S.active && prof()) view = 'pick';
  render();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
