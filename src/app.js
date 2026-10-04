// Prompt Builder app. Data (BLOCKS, NEG, PLATFORMS, CONFLICTS, T, LIB_VERSION, DEFAULT, DEFAULT_PLATFORM)
// is injected by src/build.py from src/data.py and src/i18n.py.
document.documentElement.classList.add("js");

const $ = s => document.querySelector(s);
const BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b]));
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const num = (b, i) => b.zero ? i : i + 1;
const VAR_PAGE = 3;

// ---------- state ----------
const S = { lang: "en", plat: DEFAULT_PLATFORM, sep: PLATFORMS[DEFAULT_PLATFORM].sep, sel: { ...DEFAULT }, locked: {} };
let VAR = null; // open variants panel: { id, offset, ctx }

function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function save() { store("pb-session", { v: LIB_VERSION, lang: S.lang, plat: S.plat, sep: S.sep, sel: S.sel, locked: S.locked }); }
function restore() {
  const s = load("pb-session");
  const lang = load("pb-lang");
  if (lang === "en" || lang === "es") S.lang = lang;
  if (!s) return;
  if (s.lang === "en" || s.lang === "es") S.lang = s.lang;
  if (PLATFORMS[s.plat]) S.plat = s.plat;
  if (SEPARATORS.includes(s.sep)) S.sep = s.sep;
  for (const b of BLOCKS) {
    const i = s.sel && s.sel[b.id];
    if (Number.isInteger(i) && i >= 0 && i < b.opts.length) S.sel[b.id] = i;
  }
  for (const id in (s.locked || {})) if (BY_ID[id] && s.locked[id]) S.locked[id] = true;
}

const L = () => T[S.lang];
const LI = () => S.lang === "en" ? 0 : 1;

// ---------- prompt ----------
function parts(sel, plat) {
  const P = PLATFORMS[plat];
  return BLOCKS.map(b => {
    let t = b.opts[sel[b.id]][2];
    if (t && P.drop) t = t.split(", ").filter(x => !P.drop.includes(x)).join(", ");
    if (t && P.weights && P.weights.includes(b.id)) t = `(${t}:1.2)`;
    return { b, text: t };
  }).filter(p => p.text);
}
function join(ps, sep, html) {
  const piece = p => html
    ? (sep !== "tag" ? `<span class="tag" aria-hidden="true">[${p.b.id}] </span>` : "") + `<span style="--c:var(${p.b.hue})">${esc(p.text)}</span>`
    : p.text;
  const tagged = p => (sep === "tag" ? `[${p.b.id}] ` : "") + piece(p);
  if (sep === "one") return ps.map(piece).join(", ");
  if (sep === "tag") return ps.map(tagged).join(",\n");
  if (sep === "break") return ps.map(piece).join(",\nBREAK\n");
  return ps.map(piece).join(",\n");
}
const promptText = (sel = S.sel) => join(parts(sel, S.plat), S.sep, false);

// ---------- recipe ----------
// Format: v1.2 | PHOTO2 GLOW2 ... BG1 | perchance | one
function recipe(sel = S.sel) {
  const li = LI();
  return `v${LIB_VERSION} | ` + BLOCKS.map(b => b.key[li] + num(b, sel[b.id])).join(" ") + ` | ${S.plat} | ${S.sep}`;
}
function parseRecipe(txt) {
  const keyMap = {};
  for (const b of BLOCKS) { keyMap[b.key[0].toUpperCase()] = b; keyMap[b.key[1].toUpperCase()] = b; }
  const out = { sel: {}, plat: null, sep: null, v: null };
  const vm = txt.match(/\bv(\d+(?:\.\d+)*)\b/i); if (vm) out.v = vm[1];
  for (const m of txt.matchAll(/\b([A-Za-z]+)\s*=?\s*(\d+)\b/g)) {
    const b = keyMap[m[1].toUpperCase()]; if (!b) continue;
    const n = +m[2], i = b.zero ? n : n - 1;
    if (i >= 0 && i < b.opts.length) out.sel[b.id] = i;
  }
  const low = txt.toLowerCase();
  for (const k in PLATFORMS) if (new RegExp(`\\b${k}\\b`).test(low) || low.includes(PLATFORMS[k].label.toLowerCase())) out.plat = k;
  for (const s of SEPARATORS) if (new RegExp(`\\|\\s*${s}\\s*$`).test(low.trim()) || new RegExp(`\\bsep=${s}\\b`).test(low)) out.sep = s;
  return Object.keys(out.sel).length ? out : null;
}
function loadRecipe() {
  const r = parseRecipe($("#recipeIn").value);
  if (!r) return toast(fmt(L().loadBad, { ex: recipe() }), 5000);
  const skipped = [];
  for (const id in r.sel) { if (S.locked[id]) { if (r.sel[id] !== S.sel[id]) skipped.push(id); } else S.sel[id] = r.sel[id]; }
  if (r.plat) S.plat = r.plat;
  if (r.sep) S.sep = r.sep; else if (r.plat) S.sep = PLATFORMS[r.plat].sep;
  let msg = r.v && r.v !== LIB_VERSION ? fmt(L().loadedVer, { v: r.v, cur: LIB_VERSION }) : L().loaded;
  if (skipped.length) msg += " · " + fmt(L().loadSkipped, { list: skipped.join(", ") });
  changed(); toast(msg, 5000);
}

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
function renderBlocks() {
  const li = LI(), el = $("#blocks");
  el.innerHTML = "";
  for (const b of BLOCKS) {
    const lk = !!S.locked[b.id], gid = "g-" + b.id.replace(".", "_");
    const sec = document.createElement("div");
    sec.className = "block"; sec.style.setProperty("--hue", `var(${b.hue})`);
    sec.innerHTML = `<div class="bhead"><span class="bid">${b.id} · ${b.key[li]}</span><span class="bname">${esc(b.name[li])}</span>
      <span class="tools"><button class="btn" data-lock="${b.id}" aria-pressed="${lk}" title="${L().lockTitle}">${lk ? L().locked : L().lock}</button>
      <button class="btn" data-var="${b.id}" ${lk ? "disabled" : ""} title="${lk ? L().lockedNoVar : L().varTitle}">${L().variants} (${b.opts.length - 1})</button></span></div>
      <div class="opts" role="radiogroup" aria-label="${esc(b.name[li])}">${b.opts.map((o, i) => `<span class="opt"><input type="radio" name="${gid}" id="${gid}-${i}" value="${i}" ${S.sel[b.id] === i ? "checked" : ""} ${lk ? "disabled" : ""}><label for="${gid}-${i}"><b>${num(b, i)}</b>${esc(o[li])}</label></span>`).join("")}</div>`;
    el.appendChild(sec);
  }
  el.querySelectorAll("input[type=radio]").forEach(r => r.addEventListener("change", e => {
    const id = e.target.name.slice(2).replace("_", ".");
    if (S.locked[id]) return; S.sel[id] = +e.target.value; changed();
  }));
  el.querySelectorAll("[data-lock]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.lock; S.locked[id] = !S.locked[id]; if (!S.locked[id]) delete S.locked[id]; changed();
  }));
  el.querySelectorAll("[data-var]").forEach(btn => btn.addEventListener("click", () => openVariants(btn.dataset.var, 0)));
}
function renderPlat() {
  const P = L().plats[S.plat];
  $("#plat").value = S.plat; $("#sep").value = S.sep;
  $("#platNote").textContent = P.note;
  $("#platTips").innerHTML = P.tips.map(t => `<li>${t}</li>`).join("");
}
function renderOut() {
  $("#prompt").innerHTML = join(parts(S.sel, S.plat), S.sep, true);
  $("#recipe").textContent = recipe();
  const w = CONFLICTS.filter(c => c.a_opts.includes(S.sel[c.a]) && c.b_opts.includes(S.sel[c.b]));
  $("#warnPanel").hidden = !w.length;
  $("#warnList").innerHTML = w.map(c => `<li>${esc(c[S.lang])}</li>`).join("");
}

// ---------- variants ----------
// The context is everything except the block being varied; if it changes, the panel is no longer valid.
function ctxKey(id) { const sel = { ...S.sel }; delete sel[id]; return JSON.stringify([sel, S.plat, S.sep, !!S.locked[id]]); }
function openVariants(id, offset) {
  if (S.locked[id]) return toast(L().lockedUse);
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
  // Guard: the block may have been locked, or the context changed, after the panel was drawn.
  if (S.locked[id]) { closeVariants(); return toast(L().lockedUse); }
  if (!VAR || VAR.id !== id || VAR.ctx !== ctxKey(id)) { closeVariants(); return toast(L().stale, 4000); }
  if (kind === "copy") return copy(promptText({ ...S.sel, [id]: i }), fmt(L().variantCopied, { k }));
  S.sel[id] = i; changed();
}

// ---------- central update ----------
function changed() {
  if (VAR && VAR.ctx !== ctxKey(VAR.id)) { closeVariants(); toast(L().stale, 4000); }
  renderBlocks(); renderPlat(); renderOut(); if (VAR) renderVariants(); save();
}
function setLang(l) { S.lang = l; store("pb-lang", l); applyLang(); renderBlocks(); renderPlat(); renderOut(); if (VAR) renderVariants(); save(); }

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
$("#resetBtn").addEventListener("click", () => { S.sel = { ...DEFAULT }; S.locked = {}; S.plat = DEFAULT_PLATFORM; S.sep = PLATFORMS[DEFAULT_PLATFORM].sep; closeVariants(); changed(); });
$("#closeVar").addEventListener("click", closeVariants);
$("#varPrev").addEventListener("click", () => { VAR.offset = Math.max(0, VAR.offset - VAR_PAGE); renderVariants(); });
$("#varNext").addEventListener("click", () => { VAR.offset += VAR_PAGE; renderVariants(); });

restore(); applyLang(); renderBlocks(); renderPlat(); renderOut();
