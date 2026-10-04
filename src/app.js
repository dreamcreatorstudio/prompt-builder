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
  for (const b of ARCHIVE[ver]) { const i = sel && sel[b.id]; if (Number.isInteger(i) && i >= 0 && i < b.texts.length) out[b.id] = i; }
  return out;
}
function restore() {
  const lang = load("pb-lang"); if (lang === "en" || lang === "es") S.lang = lang;
  const s = load("pb-session"); if (!s) return;
  if (s.lang === "en" || s.lang === "es") S.lang = s.lang;
  if (PLATFORMS[s.plat]) S.plat = s.plat;          // platform and separator don't depend on the library
  if (SEPARATORS.includes(s.sep)) S.sep = s.sep;
  if (s.v === LIB_VERSION) {
    Object.assign(S.sel, validSel(LIB_VERSION, s.sel));
    for (const id in (s.locked || {})) if (BY_ID[id] && s.locked[id]) S.locked[id] = true;
  } else if (ARCHIVE[s.v]) {                        // older known version: reproduce exactly, ask before migrating
    S.pin = s.v; S.pinSel = { ...defaultsFor(s.v), ...validSel(s.v, s.sel) }; S.notice = { key: "sessionOld", v: s.v };
  } else {                                          // unknown version: don't reinterpret its numbers
    S.notice = { key: "sessionUnknown", v: s.v || "?" };
  }
}
function defaultsFor(ver) { const d = {}; for (const b of ARCHIVE[ver]) d[b.id] = BY_ID[b.id] && DEFAULT[b.id] < b.texts.length ? DEFAULT[b.id] : 0; return d; }

const L = () => T[S.lang];
const LI = () => S.lang === "en" ? 0 : 1;
const ver = () => S.pin || LIB_VERSION;
const curSel = () => S.pin ? S.pinSel : S.sel;

// ---------- prompt ----------
function parts(sel, plat, v = ver()) {
  const P = PLATFORMS[plat];
  return ARCHIVE[v].map(b => {
    let t = b.texts[sel[b.id]];
    if (t && P.drop) t = t.split(", ").filter(x => !P.drop.includes(x)).join(", ");
    if (t && P.weights && P.weights.includes(b.id)) t = `(${t}:1.2)`;
    return { id: b.id, hue: (BY_ID[b.id] || {}).hue || "--muted", text: t };
  }).filter(p => p.text);
}
function join(ps, sep, html) {
  const piece = p => html
    ? (sep !== "tag" ? `<span class="tag" aria-hidden="true">[${p.id}] </span>` : "") + `<span style="--c:var(${p.hue})">${esc(p.text)}</span>`
    : p.text;
  const tagged = p => (sep === "tag" ? `[${p.id}] ` : "") + piece(p);
  if (sep === "one") return ps.map(piece).join(", ");
  if (sep === "tag") return ps.map(tagged).join(",\n");
  if (sep === "break") return ps.map(piece).join(",\nBREAK\n");
  return ps.map(piece).join(",\n");
}
const promptText = (sel = curSel()) => join(parts(sel, S.plat), S.sep, false);

// ---------- recipe ----------
// Format: v1.2 | PHOTO2 GLOW2 ... BG1 | perchance | one   (Spanish keys accepted; partial recipes allowed)
function recipe(sel = curSel(), v = ver()) {
  const li = LI();
  return `v${v} | ` + ARCHIVE[v].map(b => b.key[li] + (b.zero ? sel[b.id] : sel[b.id] + 1)).join(" ") + ` | ${S.plat} | ${S.sep}`;
}
function parseRecipe(txt) {
  const r = { v: LIB_VERSION, sel: {}, plat: null, sep: null, errors: [] };
  const vm = txt.match(/\bv(\d+(?:\.\d+)+)\b/i);
  if (vm) r.v = vm[1];
  if (!ARCHIVE[r.v]) { r.errors.push(fmt(L().errVersion, { v: r.v, known: KNOWN.join(", ") })); return r; }
  const lib = ARCHIVE[r.v], keyMap = {};
  for (const b of lib) { keyMap[b.key[0].toUpperCase()] = b; keyMap[b.key[1].toUpperCase()] = b; }
  const body = txt.replace(/\bv\d+(?:\.\d+)+\b/ig, " ");
  const seen = {};
  for (const m of body.matchAll(/\b([A-Za-z]+)\s*=?\s*(\d+)\b/g)) {
    const k = m[1].toUpperCase(), n = +m[2], b = keyMap[k];
    if (!b) { r.errors.push(fmt(L().errUnknownKey, { k: m[1] })); continue; }
    const i = b.zero ? n : n - 1;
    if (i < 0 || i >= b.texts.length) { r.errors.push(fmt(L().errRange, { k: m[1], n, a: b.zero ? 0 : 1, b: b.zero ? b.texts.length - 1 : b.texts.length })); continue; }
    if (b.id in seen && seen[b.id].i !== i) { r.errors.push(fmt(L().errDup, { id: b.id, x: seen[b.id].tok, y: m[0].replace(/\s/g, "") })); continue; }
    seen[b.id] = { i, tok: m[0].replace(/\s/g, "") }; r.sel[b.id] = i;
  }
  const low = txt.toLowerCase();
  for (const k in PLATFORMS) if (new RegExp(`\\b${k}\\b`).test(low) || low.includes(PLATFORMS[k].label.toLowerCase())) r.plat = k;
  for (const s of SEPARATORS) if (new RegExp(`\\|\\s*${s}\\s*$`).test(low.trim()) || new RegExp(`\\bsep=${s}\\b`).test(low)) r.sep = s;
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
  if (r.v !== LIB_VERSION) {                         // reproduce an older version exactly
    S.pin = r.v; S.pinSel = { ...defaultsFor(r.v), ...r.sel }; S.notice = { key: "pinBanner", v: r.v };
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
      <button class="btn" data-var="${b.id}" ${off ? "disabled" : ""} title="${lk ? L().lockedNoVar : L().varTitle}">${L().variants} (${b.opts.length - 1})</button></span></div>
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
$("#copyRecipe").addEventListener("click", () => copy(recipe(), L().recipeCopied));
$("#copyNeg").addEventListener("click", () => copy(NEG, L().negCopied));
$("#loadBtn").addEventListener("click", loadRecipe);
$("#recipeIn").addEventListener("keydown", e => { if (e.key === "Enter") loadRecipe(); });
$("#recipeIn").addEventListener("input", () => showErrors([]));
$("#resetBtn").addEventListener("click", () => { S.sel = { ...DEFAULT }; S.locked = {}; S.pin = null; S.pinSel = null; S.notice = null; S.plat = DEFAULT_PLATFORM; S.sep = PLATFORMS[DEFAULT_PLATFORM].sep; closeVariants(); showErrors([]); changed(); });
$("#closeVar").addEventListener("click", closeVariants);
$("#varPrev").addEventListener("click", () => { VAR.offset = Math.max(0, VAR.offset - VAR_PAGE); renderVariants(); });
$("#varNext").addEventListener("click", () => { VAR.offset += VAR_PAGE; renderVariants(); });

restore(); applyLang(); renderNotice(); renderBlocks(); renderPlat(); renderOut();
