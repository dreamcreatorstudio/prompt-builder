// Prompt Builder app. Data (BLOCKS, NEG, DEFAULT, LIB_VERSION, ARCHIVE, PLATFORMS, DEFAULT_PLATFORM, SEPARATORS, CONFLICTS, T)
// is injected by src/build.py from src/data.py, src/i18n.py and src/archive/*.json.
document.documentElement.classList.add("js");

const $ = s => document.querySelector(s);
const BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b]));
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const num = (b, i) => b.zero ? i : i + 1;
const vals = x => Array.isArray(x) ? x : [x];                 // multi-select blocks store an array
const clone = o => JSON.parse(JSON.stringify(o));
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
// Express a selection in the shape a version expects (older versions stored ACC as one number; 0 = none).
// Selections are stored as list positions. When a block gains or loses its "0 = none" slot between
// versions, positions shift by one while the numbers people see stay the same: convert via that number.
function shiftIdx(src, sel) {
  const out = { ...sel };
  for (const id in sel) {
    const ob = ARCHIVE[src].blocks.find(b => b.id === id), nb = ARCHIVE[LIB_VERSION].blocks.find(b => b.id === id);
    if (!ob || !nb || !!ob.zero === !!nb.zero) continue;
    const d = nb.zero ? 1 : -1, x = sel[id];
    out[id] = Array.isArray(x) ? x.map(i => i + d) : x + d;
  }
  return out;
}
const toCur = (src, sel) => normFor(LIB_VERSION, shiftIdx(src, sel));
function normFor(v, sel) {
  const out = {};
  for (const b of ARCHIVE[v].blocks) {
    if (!(b.id in sel)) continue;
    const x = sel[b.id];
    if (b.multi) out[b.id] = [...new Set(vals(x).filter(i => !b.zero || i !== 0))].sort((p, q) => p - q);
    else out[b.id] = Array.isArray(x) ? (x.length ? x[0] : 0) : x;
  }
  return out;
}
const okIn = (b, x) => vals(x).every(i => Number.isInteger(i) && i >= 0 && i < b.texts.length);
const VAR_PAGE = 3;
const KNOWN = Object.keys(ARCHIVE);            // every published library version, current included

// ---------- state ----------
// sel: current-library selection. pin: an older library version being reproduced exactly (read-only), with pinSel.
const S = { lang: "en", plat: DEFAULT_PLATFORM, sep: PLATFORMS[DEFAULT_PLATFORM].sep, sel: clone(DEFAULT), locked: {}, pin: null, pinSel: null, notice: null };
let VAR = null;

function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function save() {
  store("pb-session", { v: S.pin || LIB_VERSION, sel: S.pin ? S.pinSel : S.sel, locked: S.locked, lang: S.lang, plat: S.plat, sep: S.sep });
}
function validSel(ver, sel) {           // keep only indexes that exist in that version
  const out = {};
  for (const b of ARCHIVE[ver].blocks) {
    if (!sel || !(b.id in sel)) continue;
    const x = sel[b.id];
    if (b.multi ? (Array.isArray(x) || Number.isInteger(x)) && okIn(b, x) : Number.isInteger(x) && okIn(b, x)) out[b.id] = x;
  }
  return normFor(ver, out);
}
function restore() {
  const lang = load("pb-lang"); if (lang === "en" || lang === "es") S.lang = lang;
  const s = load("pb-session"); if (!s) return;
  if (s.lang === "en" || s.lang === "es") S.lang = s.lang;
  if (PLATFORMS[s.plat]) S.plat = s.plat;          // platform and separator don't depend on the library
  if (s.sep in SEPARATORS) S.sep = s.sep;
  if (s.v === LIB_VERSION) {
    Object.assign(S.sel, validSel(LIB_VERSION, s.sel));
    for (const id in (s.locked || {})) if (BY_ID[id] && s.locked[id]) S.locked[id] = true;
  } else if (ARCHIVE[s.v]) {                        // older known version
    const full = { ...ARCHIVE[s.v].defaults, ...validSel(s.v, s.sel) };
    if (sameAsCurrent(s.v, full)) {                 // identical prompt today: keep working normally
      S.sel = { ...S.sel, ...fillNew(toCur(s.v, full)) };
      for (const id in (s.locked || {})) if (BY_ID[id] && s.locked[id]) S.locked[id] = true;
    } else { S.pin = s.v; S.pinSel = full; S.notice = { key: "sessionOld", v: s.v }; }   // reproduce exactly, ask before migrating
  } else {                                          // unknown version: don't reinterpret its numbers
    S.notice = { key: "sessionUnknown", v: s.v || "?" };
  }
}
// Blocks that didn't exist in an older version start empty (option 0) so the old prompt text is kept.
function fillNew(sel) {
  const out = { ...sel };
  for (const b of ARCHIVE[LIB_VERSION].blocks) if (!(b.id in out)) out[b.id] = b.zero ? (b.multi ? [] : 0) : clone(DEFAULT[b.id]);
  return out;
}
// An older-version selection can be used as-is when every option still exists and the prompt text is identical.
function sameAsCurrent(v, sel) {
  const cur = toCur(v, sel);
  for (const id in sel) if (!BY_ID[id] || !(id in cur) || !okIn(ARCHIVE[LIB_VERSION].blocks.find(b => b.id === id), cur[id])) return false;
  const now = { ...S.sel, ...fillNew(cur) };
  return Object.keys(sel).length === ARCHIVE[v].blocks.length &&
    Object.keys(ARCHIVE[v].platforms).every(pl => Object.keys(ARCHIVE[v].separators).every(sp =>
      pl in PLATFORMS && sp in SEPARATORS && textFor(v, sel, pl, sp) === textFor(LIB_VERSION, now, pl, sp)));
}

const L = () => T[S.lang];
const LI = () => S.lang === "en" ? 0 : 1;
const ver = () => S.pin || LIB_VERSION;
const curSel = () => S.pin ? S.pinSel : S.sel;

// ---------- prompt ----------
function parts(sel, plat, v = ver()) {
  const P = ARCHIVE[v].platforms[plat] || PLATFORMS[plat];
  return ARCHIVE[v].blocks.map(b => {
    const picks = vals(sel[b.id]).map(i => b.texts[i]).filter(Boolean);
    let t = picks.length > 1 && b.mix
      ? b.mix.tpl.replace("{}", picks.map(x => x.replace(new RegExp(b.mix.strip), "")).slice(0, -1).join(", ") + " and " + picks[picks.length - 1].replace(new RegExp(b.mix.strip), ""))
      : picks.join(", ");
    if (t && P.drop) t = t.split(", ").filter(x => !P.drop.includes(x)).join(", ");
    if (t && P.weights && P.weights.includes(b.id)) t = `(${t}:1.2)`;
    return { id: b.id, hue: (BY_ID[b.id] || {}).hue || "--muted", text: t, attach: b.attach };
  }).filter(p => p.text).reduce((out, p, _, all) => {
    // a color block is written in front of its garment ("emerald green fitted cropped top"), not as its own part
    if (p.attach && all.some(q => q.id === p.attach)) return out;
    const pre = all.filter(q => q.attach === p.id).map(q => q.text);   // e.g. color, then length
    out.push(pre.length ? { ...p, text: pre.join(" ") + " " + p.text } : p);
    return out;
  }, []);
}
function join(ps, sep, html, v = ver()) {
  const SP = ARCHIVE[v].separators[sep] || SEPARATORS[sep];
  const piece = p => html
    ? (!SP.prefix ? `<span class="tag" aria-hidden="true" data-b="[${p.id}] "></span>` : "") + `<span style="--c:var(${p.hue})">${esc(p.text)}</span>`
    : p.text;
  return ps.map(p => (SP.prefix ? `[${p.id}] ` : "") + piece(p)).join(SP.joiner);
}
const textFor = (v, sel, plat, sep) => join(parts(sel, plat, v), sep, false, v);
const promptText = (sel = curSel()) => textFor(ver(), sel, S.plat, S.sep);
// One block's menu, bilingual and numbered as in the tool (read-only: never changes selections or locks).
function optionsText(id) {
  const b = BY_ID[id];
  return `${b.id} · ${b.key[0]} / ${b.key[1]} — ${b.name[0]} / ${b.name[1]}\n\n` +
    b.opts.map((o, i) => `${num(b, i)}. ${o[0]} / ${o[1]}`).join("\n");
}
// Same prompt, with a [B#] label before every block (for saving or asking for changes).
function blocksText() {
  const SP = ARCHIVE[ver()].separators[S.sep] || SEPARATORS[S.sep];
  return parts(curSel(), S.plat).map(p => `[${p.id}] ${p.text}`).join(SP.joiner);
}

// ---------- recipe ----------
// Format: v1.2 | PHOTO2 GLOW2 ... BG1 | perchance | one   (Spanish keys accepted; partial recipes allowed)
function recipe(sel = curSel(), v = ver()) {
  const li = LI();
  const tok = (b, x) => b.multi ? (vals(x).length ? vals(x).map(i => num(b, i)).join("+") : "0") : num(b, x);
  return `v${v} | ` + ARCHIVE[v].blocks.map(b => b.key[li] + tok(b, sel[b.id])).join(" ") + ` | ${S.plat} | ${S.sep}`;
}
// Strict grammar: every token must be a version (v1.3), a block option (HAIR6 or HAIR=6), a platform
// (perchance / "Perchance AI"), a separator (one, nl, tag, break, or sep=one) or a "|" / "·" / "," divider.
function parseRecipe(txt) {
  const r = { v: LIB_VERSION, sel: {}, plat: null, sep: null, errors: [] };
  const DIV = /[\s|·,;]+/;          // the same dividers the token loop accepts
  const vs = [...new Set(txt.split(DIV).filter(x => /^v\d+(\.\d+)+$/i.test(x)).map(x => x.slice(1)))];
  if (vs.length > 1) r.errors.push(fmt(L().errTwice, { what: L().what.version, list: vs.join(", ") }));
  if (vs.length) r.v = vs[0];
  if (!ARCHIVE[r.v]) { r.errors.push(fmt(L().errVersion, { v: r.v, known: KNOWN.join(", ") })); return r; }
  if (r.errors.length) return r;
  let t = " " + txt + " ";
  const A = ARCHIVE[r.v];
  for (const k in A.platforms) t = t.replace(new RegExp(A.platforms[k].label.replace(/\s+/g, "\\s+"), "ig"), " " + k + " ");
  t = t.replace(/\s*=\s*/g, "=");
  const keyMap = {};
  for (const b of A.blocks) { keyMap[b.key[0].toUpperCase()] = b; keyMap[b.key[1].toUpperCase()] = b; }
  const seen = {}, plats = new Set(), seps = new Set();
  for (const tok of t.split(DIV).filter(Boolean)) {
    const low = tok.toLowerCase();
    if (/^v\d+(\.\d+)+$/i.test(tok)) continue;
    if (low in A.platforms) { plats.add(low); continue; }
    const sm = low.match(/^(?:sep=)?(nl|one|tag|break)$/);
    if (sm && sm[1] in A.separators) { seps.add(sm[1]); continue; }
    const m = tok.match(/^([A-Za-z]+)=?(-?\d+(?:\+-?\d+)*)?$/);
    if (!m || m[2] === undefined) { r.errors.push(fmt(L().errToken, { t: tok })); continue; }
    const b = keyMap[m[1].toUpperCase()];
    if (!b) { r.errors.push(fmt(L().errUnknownKey, { k: m[1] })); continue; }
    const nums = m[2].split("+"), lo = b.zero ? 0 : 1, hi = b.zero ? b.texts.length - 1 : b.texts.length;
    if (nums.length > 1 && !b.multi) { r.errors.push(fmt(L().errMulti, { k: m[1] })); continue; }
    const bad = nums.find(n => !/^\d+$/.test(n) || +n < lo || +n > hi);
    if (bad !== undefined) { r.errors.push(fmt(L().errRange, { k: m[1], n: bad, a: lo, b: hi })); continue; }
    const idx = nums.map(n => b.zero ? +n : +n - 1);
    if (b.multi && b.zero && idx.length > 1 && idx.includes(0)) { r.errors.push(fmt(L().errZeroMix, { k: m[1] })); continue; }
    const val = b.multi ? [...new Set(idx.filter(i => !b.zero || i !== 0))].sort((p, q) => p - q) : idx[0];
    if (b.id in seen && !same(seen[b.id].val, val)) { r.errors.push(fmt(L().errDup, { id: b.id, x: seen[b.id].tok, y: tok })); continue; }
    seen[b.id] = { val, tok }; r.sel[b.id] = val;
  }
  if (plats.size > 1) r.errors.push(fmt(L().errTwice, { what: L().what.platform, list: [...plats].join(", ") }));
  if (seps.size > 1) r.errors.push(fmt(L().errTwice, { what: L().what.separator, list: [...seps].join(", ") }));
  r.plat = [...plats][0] || null; r.sep = [...seps][0] || null;
  if (!r.errors.length && !Object.keys(r.sel).length) r.errors.push(L().errNone);
  return r;
}
function showErrors(list) {
  $("#loadErr").hidden = !list.length;
  $("#loadErr").innerHTML = list.length ? `<p class="small err" style="margin:0">${esc(L().errTitle)}</p><ul class="tips err">${list.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : "";
}
function loadRecipe(text = $("#recipeIn").value, okMsg = null) {
  const r = parseRecipe(text);
  if (r.errors.length) return showErrors(r.errors);   // all-or-nothing: nothing is applied
  showErrors([]);
  if (r.plat) S.plat = r.plat;
  if (r.sep) S.sep = r.sep; else if (r.plat) S.sep = PLATFORMS[r.plat].sep;
  if (r.v !== LIB_VERSION) {
    // Older version: complete with THAT version's defaults; use it as current only if the text is identical.
    const full = { ...ARCHIVE[r.v].defaults, ...r.sel };
    const asNow = fillNew(toCur(r.v, full));
    const lockClash = Object.keys(asNow).some(id => S.locked[id] && !same(asNow[id], S.sel[id]));
    if (!lockClash && sameAsCurrent(r.v, full)) { S.pin = null; S.pinSel = null; S.sel = { ...S.sel, ...asNow }; changed(); return toast(L().loaded); }
    S.pin = r.v; S.pinSel = full; S.notice = { key: "pinBanner", v: r.v };
    closeVariants(); changed(); return;
  }
  S.pin = null; S.pinSel = null; if (S.notice && S.notice.key !== "sessionUnknown") S.notice = null;
  const skipped = [];
  for (const id in r.sel) { if (S.locked[id]) { if (!same(r.sel[id], S.sel[id])) skipped.push(id); } else S.sel[id] = r.sel[id]; }
  changed();
  toast((okMsg || L().loaded) + (skipped.length ? " · " + fmt(L().loadSkipped, { list: skipped.join(", ") }) : ""), 5000);
}
function migrate() {                                // same option numbers, current texts — may change the prompt
  const from = S.pin, missing = [];
  const asNow = fillNew(toCur(S.pin, S.pinSel));
  for (const id of new Set([...Object.keys(S.pinSel), ...Object.keys(asNow)])) {
    const b = ARCHIVE[LIB_VERSION].blocks.find(x => x.id === id);
    if (!b || !(id in asNow) || !okIn(b, asNow[id])) { missing.push(id); continue; }
    if (!S.locked[id]) S.sel[id] = asNow[id];
  }
  S.pin = null; S.pinSel = null; S.notice = null; changed();
  toast(fmt(L().migrated, { cur: LIB_VERSION, v: from }) + (missing.length ? " (" + missing.join(", ") + ")" : ""), 6000);
}
function unpin() { S.pin = null; S.pinSel = null; S.notice = null; changed(); }

// ---------- rendering ----------
function applyLang() {
  document.documentElement.lang = S.lang;
  document.title = L().title;
  document.querySelectorAll("[data-i]").forEach(el => {
    const v = L()[el.dataset.i]; if (typeof v !== "string") return;
    if (el.hasAttribute("data-html")) el.innerHTML = v; else el.textContent = v;
  });
  $("#lang-en").setAttribute("aria-pressed", S.lang === "en");
  $("#lang-es").setAttribute("aria-pressed", S.lang === "es");
  $("#sepTips").innerHTML = L().sepTips.map(t => `<li>${t}</li>`).join("");
}
function renderNotice() {
  const n = S.notice, el = $("#notice");
  el.hidden = !n; if (!n) return;
  const text = fmt(L()[n.key], { v: n.v, cur: LIB_VERSION });
  const pinned = !!S.pin;
  el.innerHTML = `<p style="margin:0">${esc(text)}</p><div class="row">${pinned
    ? `<button class="btn primary" id="migrateBtn">${esc(fmt(L().migrate, { cur: LIB_VERSION }))}</button><button class="btn" id="unpinBtn">${esc(L().unpin)}</button>`
    : `<button class="btn" id="dismissBtn">${esc(L().close)}</button>`}</div>`;
  if (pinned) { $("#migrateBtn").onclick = migrate; $("#unpinBtn").onclick = unpin; }
  else $("#dismissBtn").onclick = () => { S.notice = null; renderNotice(); };
}
function renderBlocks() {
  const li = LI(), el = $("#blocks"), frozen = !!S.pin;
  el.innerHTML = "";
  for (const b of BLOCKS) {
    const lk = !!S.locked[b.id], off = lk || frozen, gid = "g-" + b.id.replace(".", "_");
    const isDefault = same(S.sel[b.id], DEFAULT[b.id]);
    const picked = i => b.multi ? (i === 0 && b.zero ? !vals(S.sel[b.id]).length : vals(S.sel[b.id]).includes(i)) : S.sel[b.id] === i;
    const sec = document.createElement("div");
    sec.className = "block"; sec.style.setProperty("--hue", `var(${b.hue})`);
    sec.innerHTML = `<div class="bhead"><span class="bid">${b.id} · ${b.key[li]}</span><span class="bname">${esc(b.name[li])}</span>
      <span class="tools"><button class="btn" data-reset="${b.id}" ${off || isDefault ? "disabled" : ""} title="${L().reset1Title}">${L().reset1}</button>
      <button class="btn" data-lock="${b.id}" aria-pressed="${lk}" ${frozen ? "disabled" : ""} title="${L().lockTitle}">${lk ? L().locked : L().lock}</button>
      <button class="btn" data-var="${b.id}" ${off || b.multi ? "disabled" : ""} title="${b.multi ? L().noVarMulti : lk ? L().lockedNoVar : L().varTitle}">${L().variants}${b.multi ? "" : ` (${b.opts.filter((o, i) => o[2] && i !== S.sel[b.id]).length})`}</button>
      <button class="btn" data-opts="${b.id}">${L().copyOptions}</button></span></div>
      ${b.multi ? `<p class="small" style="margin:0">${esc(b.mix ? L().mixNote + (b.zero ? " " + L().mixNone : "") : L().multiNote)}</p>` : ""}
      <div class="opts" role="${b.multi ? "group" : "radiogroup"}" aria-label="${esc(b.name[li])}">${b.opts.map((o, i) => `<span class="opt"><input type="${b.multi ? "checkbox" : "radio"}" name="${gid}" id="${gid}-${i}" value="${i}" ${picked(i) && !frozen ? "checked" : ""} ${off ? "disabled" : ""}><label for="${gid}-${i}"><b>${num(b, i)}</b>${esc(o[li])}</label></span>`).join("")}</div>`;
    el.appendChild(sec);
  }
  el.querySelectorAll("input").forEach(r => r.addEventListener("change", e => {
    const id = e.target.name.slice(2).replace("_", "."), b = BY_ID[id], i = +e.target.value;
    if (S.locked[id] || S.pin) return;
    if (b.multi) {
      const cur = vals(S.sel[id]);
      const next = i === 0 && b.zero ? [] : (cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i].sort((p, q) => p - q));
      if (!next.length && !b.zero) return changed();   // a block without "none" keeps at least one pick
      S.sel[id] = next;
    } else S.sel[id] = i;
    changed();
  }));
  el.querySelectorAll("[data-reset]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.reset; if (S.locked[id] || S.pin) return;
    S.sel[id] = clone(DEFAULT[id]); changed();
  }));
  el.querySelectorAll("[data-lock]").forEach(btn => btn.addEventListener("click", () => {
    if (S.pin) return; const id = btn.dataset.lock; S.locked[id] = !S.locked[id]; if (!S.locked[id]) delete S.locked[id]; changed();
  }));
  el.querySelectorAll("[data-var]").forEach(btn => btn.addEventListener("click", () => openVariants(btn.dataset.var, 0)));
  el.querySelectorAll("[data-opts]").forEach(btn => btn.addEventListener("click", () => copy(optionsText(btn.dataset.opts), L().optionsCopied)));
}
// Presets: ready-made recipes; the menu shows the one that matches the current choices, else "None".
function presetMatch() {
  if (S.pin) return "";
  const i = PRESETS.findIndex(p => { const r = parseRecipe(p[2]); return !r.errors.length && Object.keys(r.sel).every(id => same(normFor(LIB_VERSION, { [id]: r.sel[id] })[id], normFor(LIB_VERSION, { [id]: S.sel[id] })[id])); });
  return i < 0 ? "" : String(i);
}
function renderPresets() {
  const cur = presetMatch();
  $("#presetChips").innerHTML =
    `<button class="btn" type="button" data-preset="" aria-pressed="${cur === ""}" disabled>${esc(L().presetNone)}</button>` +
    PRESETS.map((p, i) => `<button class="btn" type="button" data-preset="${i}" aria-pressed="${cur === String(i)}">${esc(p[LI()])}</button>`).join("");
}
function renderPlat() {
  const P = L().plats[S.plat];
  $("#plat").value = S.plat; $("#sep").value = S.sep;
  $("#platNote").textContent = P.note;
  $("#platTips").innerHTML = P.tips.map(t => `<li>${t}</li>`).join("");
}
function activeNotes() {
  if (S.pin) return [];
  const has = (id, opts) => vals(S.sel[id]).some(i => opts.includes(i));
  return CONFLICTS.filter(c => has(c.a, c.a_opts) && (!c.b || has(c.b, c.b_opts)) && (!c.c || has(c.c, c.c_opts)));
}
function renderOut() {
  $("#prompt").innerHTML = join(parts(curSel(), S.plat), S.sep, true);
  $("#recipe").textContent = recipe();
  const notes = activeNotes(), kinds = ["incompatible", "out_of_frame", "test"];
  $("#warnPanel").hidden = !notes.length;
  $("#warnList").innerHTML = kinds.filter(k => notes.some(c => c.kind === k)).map(k =>
    `<p class="kind kind-${k}">${esc(L().kinds[k])}</p><ul class="tips">${notes.filter(c => c.kind === k).map(c => `<li>${esc(c[S.lang])}</li>`).join("")}</ul>`).join("");
}

// ---------- variants ----------
function ctxKey(id) { const sel = { ...S.sel }; delete sel[id]; return JSON.stringify([sel, S.plat, S.sep, !!S.locked[id], S.pin]); }
function openVariants(id, offset) {
  if (S.locked[id] || S.pin || BY_ID[id].multi) return toast(L().lockedUse);
  VAR = { id, offset, ctx: ctxKey(id) }; renderVariants();
}
function closeVariants() { VAR = null; $("#varPanel").hidden = true; }
function renderVariants() {
  if (!VAR) return closeVariants();
  const b = BY_ID[VAR.id], li = LI(), cur = S.sel[b.id];
  const alts = b.opts.map((_, i) => i).filter(i => i !== cur && b.opts[i][2]);   // "none" slots are not shown as variants
  const page = alts.slice(VAR.offset, VAR.offset + VAR_PAGE);
  $("#varTitle").textContent = fmt(L().variantsOf, { id: b.id, name: b.name[li], a: VAR.offset + 1, b: VAR.offset + page.length, n: alts.length });
  const box = $("#variants"); box.innerHTML = "";
  page.forEach((i, k) => {
    const d = document.createElement("div"); d.className = "variant";
    d.innerHTML = `<div class="row"><h3>${esc(fmt(L().variant, { num: num(b, i), label: b.opts[i][li] }))}</h3><span style="margin-left:auto"></span><button class="btn" data-a="copy">${L().copy}</button><button class="btn" data-a="use">${L().use}</button></div><span class="code">${esc(recipe({ ...S.sel, [b.id]: i }))}</span>`;
    d.querySelector('[data-a="copy"]').addEventListener("click", () => variantAction("copy", b.id, i, VAR.offset + k + 1));
    d.querySelector('[data-a="use"]').addEventListener("click", () => variantAction("use", b.id, i));
    box.appendChild(d);
  });
  $("#varPrev").disabled = VAR.offset === 0;
  $("#varNext").disabled = VAR.offset + VAR_PAGE >= alts.length;
  $("#varNav").hidden = alts.length <= VAR_PAGE;
  $("#varPanel").hidden = false;
}
function variantAction(kind, id, i, k) {
  if (S.locked[id] || S.pin) { closeVariants(); return toast(L().lockedUse); }
  if (!VAR || VAR.id !== id || VAR.ctx !== ctxKey(id)) { closeVariants(); return toast(L().stale, 4000); }
  if (kind === "copy") return copy(promptText({ ...S.sel, [id]: i }), fmt(L().variantCopied, { k }));
  S.sel[id] = i; changed();
}

// ---------- central update ----------
function changed() {
  if (VAR && VAR.ctx !== ctxKey(VAR.id)) { closeVariants(); toast(L().stale, 4000); }
  renderNotice(); renderBlocks(); renderPlat(); renderPresets(); renderOut(); if (VAR) renderVariants(); save();
}
function setLang(l) { S.lang = l; store("pb-lang", l); applyLang(); renderNotice(); renderBlocks(); renderPlat(); renderPresets(); renderOut(); if (VAR) renderVariants(); save(); }

// ---------- clipboard / toast ----------
let toastTimer;
function toast(msg, ms = 2200) { const t = $("#toast"); t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.textContent = "", ms); }
function copy(text, msg) {
  try { navigator.clipboard.writeText(text).then(() => toast(msg), () => fallback(text, msg)); } catch (e) { fallback(text, msg); }
}
function fallback(text, msg) {
  const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); toast(msg); } catch (e) { toast(L().manual); }
  ta.remove();
}

// ---------- wiring ----------
$("#lang-en").addEventListener("click", () => setLang("en"));
$("#lang-es").addEventListener("click", () => setLang("es"));
$("#plat").addEventListener("change", e => { S.plat = e.target.value; S.sep = PLATFORMS[S.plat].sep; changed(); });
$("#sep").addEventListener("change", e => { S.sep = e.target.value; changed(); });
$("#copyPrompt").addEventListener("click", () => copy(promptText(), L().copied));
$("#copyBlocks").addEventListener("click", () => copy(blocksText(), L().blocksCopied));
$("#copyRecipe").addEventListener("click", () => copy(recipe(), L().recipeCopied));
$("#copyNeg").addEventListener("click", () => copy(NEG, L().negCopied));
$("#loadBtn").addEventListener("click", () => loadRecipe());
$("#presetChips").addEventListener("click", e => {
  const b = e.target.closest("[data-preset]"); if (!b || b.dataset.preset === "") return;
  const p = PRESETS[+b.dataset.preset]; if (!p) return;
  closeVariants(); loadRecipe(p[2], fmt(L().presetApplied, { name: p[LI()] }));
});
$("#recipeIn").addEventListener("keydown", e => { if (e.key === "Enter") loadRecipe(); });
$("#recipeIn").addEventListener("input", () => showErrors([]));
$("#resetBtn").addEventListener("click", () => { S.sel = clone(DEFAULT); S.locked = {}; S.pin = null; S.pinSel = null; S.notice = null; S.plat = DEFAULT_PLATFORM; S.sep = PLATFORMS[DEFAULT_PLATFORM].sep; closeVariants(); showErrors([]); changed(); toast(L().resetDone); });
$("#closeVar").addEventListener("click", closeVariants);
$("#varPrev").addEventListener("click", () => { VAR.offset = Math.max(0, VAR.offset - VAR_PAGE); renderVariants(); });
$("#varNext").addEventListener("click", () => { VAR.offset += VAR_PAGE; renderVariants(); });

restore(); applyLang(); renderNotice(); renderBlocks(); renderPlat(); renderPresets(); renderOut();
