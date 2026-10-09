import re
"""Build every published file from one source.

    python3 src/build.py            -> index.html, biblioteca.md, README.md (repo root)
    python3 src/build.py --fragment PATH   also writes a page fragment without <html>/<head> (for Claude artifacts)

Sources: src/data.py (blocks, platforms, notes, version), src/i18n.py (UI text), src/theme.py (colour tokens),
src/style.css, src/app.js. Published prompt texts are frozen in src/archive/v<version>.json so old recipes
and sessions can be reproduced exactly; the build stops if texts change without a new LIB_VERSION.
"""
import json, sys, html as H
from pathlib import Path
SRC = Path(__file__).resolve().parent
ROOT = SRC.parent
sys.path.insert(0, str(SRC))
from data import BLOCKS, NEG, DEFAULT, LIB_VERSION, PLATFORMS, DEFAULT_PLATFORM, SEPARATORS, CONFLICTS, PRESETS
from i18n import T, REPO, URL
import theme

ARCHIVE_DIR = SRC / "archive"

def snapshot():
    """Everything that decides the prompt text for a recipe: block texts, defaults used to complete
    partial recipes, platform formatting rules and separators."""
    return {"blocks": [{"id": b["id"], "key": list(b["key"]), "zero": bool(b.get("zero")), **({"multi": True} if b.get("multi") else {}), **({"mix": b["mix"]} if b.get("mix") else {}), **({"attach": b["attach"]} if b.get("attach") else {}), "texts": [o[2] for o in b["opts"]]} for b in BLOCKS],
            "defaults": DEFAULT, "default_platform": DEFAULT_PLATFORM, "platforms": PLATFORMS, "separators": SEPARATORS}

def load_archive():
    """Freeze the current version the first time it is built; refuse silent changes later."""
    ARCHIVE_DIR.mkdir(exist_ok=True)
    cur = ARCHIVE_DIR / f"v{LIB_VERSION}.json"
    snap = json.loads(json.dumps(snapshot()))
    if cur.exists():
        old = json.loads(cur.read_text())
        if old != snap:
            what = [k for k in snap if old.get(k) != snap[k]]
            sys.exit(f"{', '.join(what)} changed but LIB_VERSION is still {LIB_VERSION}. Bump LIB_VERSION in src/data.py.")
    else:
        cur.write_text(json.dumps(snap, ensure_ascii=False, indent=1))
    return {p.stem[1:]: json.loads(p.read_text()) for p in sorted(ARCHIVE_DIR.glob("v*.json"))}

def n(b, i): return i if b.get("zero") else i + 1
def token(b, v):
    if b.get("multi"):
        return "+".join(str(n(b, i)) for i in v) if v else "0"
    return str(n(b, v))

def mixed(b, texts):
    """Several picks in a mixing block become one phrase (e.g. "mixed Greek and Latina heritage")."""
    if len(texts) > 1 and b.get("mix"):
        names = [re.sub(b["mix"]["strip"], "", t) for t in texts]
        return b["mix"]["tpl"].replace("{}", ", ".join(names[:-1]) + " and " + names[-1])
    return ", ".join(texts)

def default_recipe(li=0):
    return f"v{LIB_VERSION} | " + " ".join(b["key"][li] + token(b, DEFAULT[b["id"]]) for b in BLOCKS) + f" | {DEFAULT_PLATFORM} | {PLATFORMS[DEFAULT_PLATFORM]['sep']}"

def default_prompt():
    P = PLATFORMS[DEFAULT_PLATFORM]; out = []
    for b in BLOCKS:
        v = DEFAULT[b["id"]]
        t = mixed(b, [b["opts"][i][2] for i in (v if isinstance(v, list) else [v]) if b["opts"][i][2]])
        if not t: continue
        if P.get("drop"): t = ", ".join(x for x in t.split(", ") if x not in P["drop"])
        out.append(t)
    return SEPARATORS[P["sep"]]["joiner"].join(out)

def static_library():
    en = T["en"]
    rows = [f'<section id="static" class="blocks" aria-label="Library">',
            f'<div class="panel"><h2>{en["staticTitle"]}</h2><p class="small" style="margin:0">{en["static"]}</p></div>']
    for b in BLOCKS:
        rows.append(f'<div class="block" style="--hue:var({b["hue"]})"><div class="bhead"><span class="bid">{b["id"]} · {b["key"][0]}</span><span class="bname">{H.escape(b["name"][0])}</span></div><ol class="tips" style="padding-left:0;list-style:none">')
        rows += [f'<li><b>{n(b,i)} · {H.escape(en_)}:</b> {H.escape(t) or "(none)"}</li>' for i, (en_, es_, t) in enumerate(b["opts"])]
        rows.append('</ol></div>')
    rows.append('</section>')
    return "\n".join(rows)

def page(head_close, archive):
    en = T["en"]
    data_js = "\n".join([
        f"const BLOCKS = {json.dumps(BLOCKS, ensure_ascii=False)};",
        f"const NEG = {json.dumps(NEG)};",
        f"const DEFAULT = {json.dumps(DEFAULT)};",
        f"const PRESETS = {json.dumps(PRESETS, ensure_ascii=False)};",
        f"const LIB_VERSION = {json.dumps(LIB_VERSION)};",
        f"const ARCHIVE = {json.dumps(archive, ensure_ascii=False)};",
        f"const PLATFORMS = {json.dumps(PLATFORMS)};",
        f"const DEFAULT_PLATFORM = {json.dumps(DEFAULT_PLATFORM)};",
        f"const SEPARATORS = {json.dumps(SEPARATORS)};",
        f"const CONFLICTS = {json.dumps(CONFLICTS, ensure_ascii=False)};",
        f"const T = {json.dumps(T, ensure_ascii=False)};",
    ])
    plat_opts = "\n".join(f'            <option value="{k}"{" selected" if k == DEFAULT_PLATFORM else ""}{" data-i=\"generic\"" if k == "gen" else ""}>{v["label"]}</option>' for k, v in PLATFORMS.items())
    sep_keys = {"nl": "sepNl", "one": "sepOne", "tag": "sepTag", "break": "sepBreak"}
    sep_opts = "\n".join(f'            <option value="{s}" data-i="{sep_keys[s]}"{" selected" if s == PLATFORMS[DEFAULT_PLATFORM]["sep"] else ""}>{en[sep_keys[s]]}</option>' for s in SEPARATORS)
    return f"""<title>Prompt Builder</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
{theme.css()}{(SRC/'style.css').read_text()}</style>
{head_close}
<div class="wrap">
  <header class="top">
    <div class="intro">
      <h1 data-i="title">{en["title"]}</h1>
      <p class="lede" data-i="lede" data-html>{en["lede"]}</p>
      <div class="small disclaimer"><b data-i="aboutTitle">{en["aboutTitle"]}</b> — <span data-i="disclaimer">{en["disclaimer"]}</span></div>
      <p class="small help" data-i="help" data-html>{en["help"]}</p>
    </div>
    <div class="topbar">
      <span class="small libver" id="libVer">Library v{LIB_VERSION}</span>
      <button class="btn" id="resetBtn" data-i="reset" title="">{en["reset"]}</button>
      <div class="lang" role="group" aria-label="Language">
        <button id="lang-en" aria-pressed="true">EN</button><button id="lang-es" aria-pressed="false">ES</button>
      </div>
    </div>
  </header>

  <div class="panel notice" id="notice" role="status" hidden></div>

  <section class="panel presets" id="presetPanel" aria-labelledby="presetTitle">
    <div class="row"><h2 id="presetTitle" data-i="preset">{en["preset"]}</h2><span class="small" data-i="presetHint">{en["presetHint"]}</span></div>
    <div class="chips" id="presetChips" role="group" aria-labelledby="presetTitle"></div>
  </section>

  <div class="grid">
    <section class="blocks" id="blocks" aria-label="Blocks"></section>
{static_library()}

    <aside class="out">
      <div class="panel">
        <div class="row">
          <h2 data-i="platform">{en["platform"]}</h2>
          <span style="margin-left:auto"></span>
          <select id="plat" aria-label="Platform">
{plat_opts}
          </select>
        </div>
        <p class="small" id="platNote" style="margin:0"></p>
        <ul class="tips" id="platTips"></ul>
      </div>
      <div class="panel">
        <div class="row">
          <h2>Prompt</h2>
          <span style="margin-left:auto"></span>
          <button class="btn primary" id="copyPrompt" data-i="copyPrompt">{en["copyPrompt"]}</button>
          <button class="btn" id="copyBlocks" data-i="copyBlocks">{en["copyBlocks"]}</button>
        </div>
        <div class="row">
          <label class="small" for="sep" data-i="sepLabel">{en["sepLabel"]}</label>
          <select id="sep">
{sep_opts}
          </select>
        </div>
        <pre id="prompt" aria-live="polite">{H.escape(default_prompt())}</pre>
        <p class="small" style="margin:0" data-i="labelNote" data-html>{en["labelNote"]}</p>
        <div class="row">
          <span class="small" data-i="recipe">{en["recipe"]}</span>
          <span class="code" id="recipe">{H.escape(default_recipe())}</span>
          <button class="btn" id="copyRecipe" data-i="copyRecipe">{en["copyRecipe"]}</button>
        </div>
        <div class="row">
          <label class="small" for="recipeIn" data-i="loadLabel">{en["loadLabel"]}</label>
          <input id="recipeIn" class="input" type="text" spellcheck="false" autocomplete="off" placeholder="HAIR2 STYLE5 BG3">
          <button class="btn" id="loadBtn" data-i="load">{en["load"]}</button>
        </div>
        <div id="loadErr" hidden></div>
        <div class="toast" id="toast" role="status"></div>
      </div>

      <div class="panel warn" id="warnPanel" hidden>
        <h2 data-i="warnTitle">{en["warnTitle"]}</h2>
        <div id="warnList"></div>
      </div>

      <div class="panel" id="varPanel" hidden>
        <div class="row"><h2 id="varTitle">Variants</h2><span style="margin-left:auto"></span><button class="btn" id="closeVar" data-i="close">{en["close"]}</button></div>
        <div class="variants" id="variants"></div>
        <div class="row" id="varNav"><button class="btn" id="varPrev" data-i="prev">{en["prev"]}</button><button class="btn" id="varNext" data-i="next">{en["next"]}</button></div>
      </div>

      <div class="panel">
        <div class="row"><h2 data-i="neg">{en["neg"]}</h2><span style="margin-left:auto"></span><button class="btn" id="copyNeg" data-i="copy">{en["copy"]}</button></div>
        <pre id="neg">{H.escape(NEG)}</pre>
      </div>

      <div class="panel">
        <h2 data-i="sepTitle">{en["sepTitle"]}</h2>
        <ul class="tips" id="sepTips"></ul>
      </div>
    </aside>
  </div>
  <section class="panel links" aria-labelledby="linksTitle">
    <h2 id="linksTitle" data-i="linksTitle">{en["linksTitle"]}</h2>
    <a class="lk-project" href="{REPO}" target="_blank" rel="noopener"><b data-i="linkProject">{en["linkProject"]}</b><span class="small" data-i="linkProjectNote">{en["linkProjectNote"]}</span><span class="small url">github.com/dreamcreatorstudio/prompt-builder</span></a>
    <div class="lk-groups">
      <div><h3 data-i="groupGen">{en["groupGen"]}</h3><ul>
        <li><a href="https://perchance.org/image-generator-professional" target="_blank" rel="noopener"><b>Perchance</b> · <span data-i="lkPro">{en["lkPro"]}</span></a></li>
        <li><a href="https://perchance.org/ai-character-generator" target="_blank" rel="noopener"><b>Perchance</b> · <span data-i="lkCharacter">{en["lkCharacter"]}</span></a></li>
        <li><a href="https://venice.ai/studio/image" target="_blank" rel="noopener"><b>Venice AI</b> · <span data-i="lkVenice">{en["lkVenice"]}</span></a></li>
        <li><a href="https://www.seaart.ai/create/" target="_blank" rel="noopener"><b>SeaArt</b> · <span data-i="lkSeaart">{en["lkSeaart"]}</span></a></li>
      </ul></div>
      <div><h3 data-i="groupTools">{en["groupTools"]}</h3><ul>
        <li><a href="https://perchance.org/image-prompt-optimizer" target="_blank" rel="noopener"><b>Perchance</b> · <span data-i="lkOptimizer">{en["lkOptimizer"]}</span></a></li>
      </ul></div>
    </div>
  </section>
  <footer><span data-i="footer" data-html>{en["footer"]}</span> · Library v{LIB_VERSION}</footer>
</div>

<script>
{data_js}
{(SRC/'app.js').read_text()}</script>
"""

def library_md():
    L = ["# Block Library / Biblioteca de bloques", "",
         f"Library version **v{LIB_VERSION}** · Live tool: https://{URL}", "",
         "Each block has a short key and numbered options. A **recipe** records the library version, one option per block, the platform and the separator:", "",
         f"`{default_recipe()}`", "",
         "Spanish keys work too: " + f"`{default_recipe(1)}`", "",
         "New options are always added at the end of a block and existing numbers never change, so old recipes keep working.", ""]
    for b in BLOCKS:
        L.append(f"## {b['id']} · {b['key'][0]} / {b['key'][1]} — {b['name'][0]} / {b['name'][1]}" + ((f" (mix several: `{b['key'][0]}{n(b,1)}+{n(b,3)}`)" if b.get("mix") else " (choose several: `ACC1+3`; `ACC0` = none)") if b.get("multi") else ""))
        L.append("| # | EN | ES | Prompt text |\n|---|---|---|---|")
        L += [f"| {n(b,i)} | {en} | {es} | {t or '(none)'} |" for i, (en, es, t) in enumerate(b['opts'])]
        L.append("")
    L += ["## B0 · NEG — Negative prompt", "```", NEG, "```", "",
          "## Combination notes / Notas de combinación",
          "Shown as notes, grouped by kind; the tool never changes your choices. / Se muestran como notas por tipo; la herramienta nunca cambia tu elección.", ""]
    kinds = {"incompatible": "Incompatible", "out_of_frame": "Out of frame / Fuera de encuadre", "test": "Needs testing / Requiere pruebas"}
    for k, label in kinds.items():
        L.append(f"**{label}**")
        L += [f"- {c['en']}" for c in CONFLICTS if c["kind"] == k]
        L.append("")
    return "\n".join(L) + "\n"

def readme_md():
    keys = " · ".join(f"`{b['key'][0]}` {b['name'][0].lower()}" for b in BLOCKS)
    return f"""# Prompt Builder

Build image prompts from **blocks** and copy a ready-to-use prompt. Pick one numbered option per block: {keys}.

**Use it here:** https://{URL}/

> **About this project** — {T["en"]["disclaimer"]}

## Features
- Numbered options per block; hair **color** (`HAIR`) and **hairstyle** (`STYLE`) are separate, and so are **framing** (`CAM`) and **camera angle** (`ANGLE`).
- Formatting and suggested settings for **Perchance AI** (default), **Venice AI** and **SeaArt**.
- **Lock** keeps a block's choice in the tool (it doesn't make the generator keep the same face or body); **Variants** compares the other options of one block (page through all of them).
- **Copy for generating** (clean prompt) or **Copy with blocks** (keeps `[B#]` labels, for saving or asking for changes).
- To compare fairly, keep the same model, format and settings, and the same seed when available. Recipes are starting points; "tested" is reserved for combinations with recorded results and the platform/model used.
- **Recipes** record library version, options, platform and separator:
  `{default_recipe()}`
- Paste a recipe to load it. Invalid recipes are rejected as a whole with a list of errors; partial recipes are fine.
- Recipes and saved sessions from an older library version are shown with that version's exact texts (read-only) until you choose to migrate. Migrating keeps the option numbers but uses current texts, so the prompt may change.
- Notes on combinations, grouped as incompatible, out of frame or needs testing (never changed silently).
- English / Spanish interface. Prompts are always in English. Works without installing anything; a read-only list appears where scripts can't run.

## Content rules
Adults only, fictional people, no nudity or sexual content, no trademarked characters.

## Editing
All published files come from `src/`. Edit `src/data.py` (blocks), `src/i18n.py` (interface text), `src/theme.py` (colours), `src/style.css` or `src/app.js`, then run `python3 src/build.py`. It regenerates `index.html`, `biblioteca.md` and this README so they stay in sync. Published texts are frozen in `src/archive/`; the build stops if a text or option changes without bumping `LIB_VERSION`. Tests: `python3 src/test_app.py`.

## Contributing
Have a block that works well? Open an *issue* with the text, the platform and the seed.

---

# Mezclador de Prompts (ES)

Arma prompts de imagen por **bloques** y copia el resultado listo. Interfaz en español con el botón **ES**; los prompts siempre salen en inglés. Biblioteca completa en [biblioteca.md](biblioteca.md).
"""

if __name__ == "__main__":
    archive = load_archive()
    (ROOT/"index.html").write_text('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + page("</head><body>", archive) + "\n</body></html>\n")
    (ROOT/"biblioteca.md").write_text(library_md())
    (ROOT/"README.md").write_text(readme_md())
    if "--fragment" in sys.argv:
        Path(sys.argv[sys.argv.index("--fragment") + 1]).write_text(page("", archive))
    print("built v" + LIB_VERSION)
