// Prompt Builder app. Data (BLOCKS, NEG, DEFAULT, LIB_VERSION, ARCHIVE, PLATFORMS, DEFAULT_PLATFORM, SEPARATORS, CONFLICTS, T)
// is injected by src/build.py from src/data.py, src/i18n.py and src/archive/*.json.
document.documentElement.classList.add("js");

const $ = s => document.querySelector(s);
const BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b]));
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const num = (b, i) => b.zero ? i : i + 1;
const VAR_PAGE = 3;
const KNOWN = Object.keys(ARCHIVE);            // every published library version, current included

// ---------- state ----------
// sel: current-library selection. pin: an older library version being reproduced exactly (read-only), with pinSel.
const S = { lang: "en", plat: DEFAULT_PLATFORM, sep: PLATFORMS[DEFAULT_PLATFORM].sep, sel: { ...DEFAULT }, locked: {}, pin: null, pinSel: null, notice: null };
let VAR = null;

function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function save() {
  store("pb-session", { v: S.pin || LIB_VERSION, sel: S.pin ? S.pinSel : S.sel, locked: S.locked, lang: S.lang, plat: S.plat, sep: S.sep });
}
function validSel(ver, sel) {           // keep only indexes that exist in that version
  const out = {};
  for (const b of ARCHIVE[ver].blocks) { const i = sel && sel[b.id]; if (Number.isInteger(i) && i >= 0 && i < b.texts.length) out[b.id] = i; }
  return out;
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
      S.sel = { ...S.sel, ...full };
      for (const id in (s.locked || {})) if (BY_ID[id] && s.locked[id]) S.locked[id] = true;
    } else { S.pin = s.v; S.pinSel = full; S.notice = { key: "sessionOld", v: s.v }; }   // reproduce exactly, ask before migrating
  } else {                                          // unknown version: don't reinterpret its numbers
    S.notice = { key: "sessionUnknown", v: s.v || "?" };
  }
}
// An older-version selection can be used as-is when every option still exists and the prompt text is identical.
function sameAsCurrent(v, sel) {
  for (const id in sel) if (!BY_ID[id] || sel[id] >= BY_ID[id].opts.length) return false;
  const now = { ...S.sel, ...sel };
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
    let t = b.texts[sel[b.id]];
    if (t && P.drop) t = t.split(", ").filter(x => !P.drop.includes(x)).join(", ");
    if (t && P.weights && P.weights.includes(b.id)) t = `(${t}:1.2)`;
    return { id: b.id, hue: (BY_ID[b.id] || {}).hue || "--muted", text: t };
  }).filter(p => p.text);
}
function join(ps, sep, html, v = ver()) {
  const SP = ARCHIVE[v].separators[sep] || SEPARATORS[sep];
  const piece = p => html
    ? (!SP.prefix ? `<span class="tag" aria-hidden="true">[${p.id}] </span>` : "") + `<span style="--c:var(${p.hue})">${esc(p.text)}</span>`
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
  return `v${v} | ` + ARCHIVE[v].blocks.map(b => b.key[li] + (b.zero ? sel[b.id] : sel[b.id] + 1)).join(" ") + ` | ${S.plat} | ${S.sep}`;
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
    const m = tok.match(/^([A-Za-z]+)=?(-?\d+)?$/);
    if (!m || m[2] === undefined) { r.errors.push(fmt(L().errToken, { t: tok })); continue; }
    const b = keyMap[m[1].toUpperCase()];
    if (!b) { r.errors.push(fmt(L().errUnknownKey, { k: m[1] })); continue; }
    const n = +m[2], i = b.zero ? n : n - 1, lo = b.zero ? 0 : 1, hi = b.zero ? b.texts.length - 1 : b.texts.length;
    if (!/^\d+$/.test(m[2]) || i < 0 || i >= b.texts.length) { r.errors.push(fmt(L().errRange, { k: m[1], n: m[2], a: lo, b: hi })); continue; }
    if (b.id in seen && seen[b.id].i !== i) { r.errors.push(fmt(L().errDup, { id: b.id, x: seen[b.id].tok, y: tok })); continue; }
    seen[b.id] = { i, tok }; r.sel[b.id] = i;
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
function loadRecipe() {
  const r = parseRecipe($("#recipeIn").value);
  if (r.errors.length) return showErrors(r.errors);   // all-or-nothing: nothing is applied
  showErrors([]);
  if (r.plat) S.plat = r.plat;
  if (r.sep) S.sep = r.sep; else if (r.plat) S.sep = PLATFORMS[r.plat].sep;
  if (r.v !== LIB_VERSION) {
    // Older version: complete with THAT version's defaults; use it as current only if the text is identical.
    const full = { ...ARCHIVE[r.v].defaults, ...r.sel };
    const lockClash = Object.keys(full).some(id => S.locked[id] && full[id] !== S.sel[id]);
    if (!lockClash && sameAsCurrent(r.v, full)) { S.pin = null; S.pinSel = null; S.sel = { ...S.sel, ...full }; changed(); return toast(L().loaded); }
    S.pin = r.v; S.pinSel = full; S.notice = { key: "pinBanner", v: r.v };
    closeVariants(); changed(); return;
  }
  S.pin = null; S.pinSel = null; if (S.notice && S.notice.key !== "sessionUnknown") S.notice = null;
  const skipped = [];
  for (const id in r.sel) { if (S.locked[id]) { if (r.sel[id] !== S.sel[id]) skipped.push(id); } else S.sel[id] = r.sel[id]; }
  changed();
  toast(L().loaded + (skipped.length ? " · " + fmt(L().loadSkipped, { list: skipped.join(", ") }) : ""), 5000);
}
function migrate() {                                // same option numbers, current texts — may change the prompt
  const from = S.pin, missing = [];
  for (const id in S.pinSel) {
    const b = BY_ID[id];
    if (!b || S.pinSel[id] >= b.opts.length) { missing.push(id); continue; }
    if (!S.locked[id]) S.sel[id] = S.pinSel[id];
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
    const sec = document.createElement("div");
    sec.className = "block"; sec.style.setProperty("--hue", `var(${b.hue})`);
    sec.innerHTML = `<div class="bhead"><span class="bid">${b.id} · ${b.key[li]}</span><span class="bname">${esc(b.name[li])}</span>
      <span class="tools"><button class="btn" data-lock="${b.id}" aria-pressed="${lk}" ${frozen ? "disabled" : ""} title="${L().lockTitle}">${lk ? L().locked : L().lock}</button>
      <button class="btn" data-var="${b.id}" ${off ? "disabled" : ""} title="${lk ? L().lockedNoVar : L().varTitle}">${L().variants} (${b.opts.length - 1})</button>
      <button class="btn" data-opts="${b.id}">${L().copyOptions}</button></span></div>
      <div class="opts" role="radiogroup" aria-label="${esc(b.name[li])}">${b.opts.map((o, i) => `<span class="opt"><input type="radio" name="${gid}" id="${gid}-${i}" value="${i}" ${S.sel[b.id] === i && !frozen ? "checked" : ""} ${off ? "disabled" : ""}><label for="${gid}-${i}"><b>${num(b, i)}</b>${esc(o[li])}</label></span>`).join("")}</div>`;
    el.appendChild(sec);
  }
  el.querySelectorAll("input[type=radio]").forEach(r => r.addEventListener("change", e => {
    const id = e.target.name.slice(2).replace("_", ".");
    if (S.locked[id] || S.pin) return; S.sel[id] = +e.target.value; changed();
  }));
  el.querySelectorAll("[data-lock]").forEach(btn => btn.addEventListener("click", () => {
    if (S.pin) return; const id = btn.dataset.lock; S.locked[id] = !S.locked[id]; if (!S.locked[id]) delete S.locked[id]; changed();
  }));
  el.querySelectorAll("[data-var]").forEach(btn => btn.addEventListener("click", () => openVariants(btn.dataset.var, 0)));
  el.querySelectorAll("[data-opts]").forEach(btn => btn.addEventListener("click", () => copy(optionsText(btn.dataset.opts), L().optionsCopied)));
}
function renderPlat() {
  const P = L().plats[S.plat];
  $("#plat").value = S.plat; $("#sep").value = S.sep;
  $("#platNote").textContent = P.note;
  $("#platTips").innerHTML = P.tips.map(t => `<li>${t}</li>`).join("");
}
function activeNotes() {
  if (S.pin) return [];
  return CONFLICTS.filter(c => c.a_opts.includes(S.sel[c.a]) && (!c.b || c.b_opts.includes(S.sel[c.b])));
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
  if (S.locked[id] || S.pin) return toast(L().lockedUse);
  VAR = { id, offset, ctx: ctxKey(id) }; renderVariants();
}
function closeVariants() { VAR = null; $("#varPanel").hidden = true; }
function renderVariants() {
  if (!VAR) return closeVariants();
  const b = BY_ID[VAR.id], li = LI(), cur = S.sel[b.id];
  const alts = b.opts.map((_, i) => i).filter(i => i !== cur);
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
  renderNotice(); renderBlocks(); renderPlat(); renderOut(); if (VAR) renderVariants(); save();
}
function setLang(l) { S.lang = l; store("pb-lang", l); applyLang(); renderNotice(); renderBlocks(); renderPlat(); renderOut(); if (VAR) renderVariants(); save(); }

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
$("#loadBtn").addEventListener("click", loadRecipe);
$("#recipeIn").addEventListener("keydown", e => { if (e.key === "Enter") loadRecipe(); });
$("#recipeIn").addEventListener("input", () => showErrors([]));
$("#resetBtn").addEventListener("click", () => { S.sel = { ...DEFAULT }; S.locked = {}; S.pin = null; S.pinSel = null; S.notice = null; S.plat = DEFAULT_PLATFORM; S.sep = PLATFORMS[DEFAULT_PLATFORM].sep; closeVariants(); showErrors([]); changed(); toast(L().resetDone); });
$("#closeVar").addEventListener("click", closeVariants);
$("#varPrev").addEventListener("click", () => { VAR.offset = Math.max(0, VAR.offset - VAR_PAGE); renderVariants(); });
$("#varNext").addEventListener("click", () => { VAR.offset += VAR_PAGE; renderVariants(); });

restore(); applyLang(); renderNotice(); renderBlocks(); renderPlat(); renderOut();
