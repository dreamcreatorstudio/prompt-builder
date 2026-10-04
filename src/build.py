"""Build every published file from one source.

    python3 src/build.py            -> index.html, biblioteca.md, README.md (repo root)
    python3 src/build.py --fragment PATH   also writes a page fragment without <html>/<head> (for Claude artifacts)

Sources: src/data.py (blocks, platforms, conflicts, version), src/i18n.py (UI text), src/style.css, src/app.js.
"""
import json, sys, html as H
from pathlib import Path
SRC = Path(__file__).resolve().parent
ROOT = SRC.parent
sys.path.insert(0, str(SRC))
from data import BLOCKS, NEG, DEFAULT, LIB_VERSION, PLATFORMS, DEFAULT_PLATFORM, SEPARATORS, CONFLICTS
from i18n import T, REPO, URL

def n(b, i): return i if b.get("zero") else i + 1
def default_recipe(li=0):
    return f"v{LIB_VERSION} | " + " ".join(b["key"][li] + str(n(b, DEFAULT[b["id"]])) for b in BLOCKS) + f" | {DEFAULT_PLATFORM} | {PLATFORMS[DEFAULT_PLATFORM]['sep']}"

def default_prompt():
    P = PLATFORMS[DEFAULT_PLATFORM]; out = []
    for b in BLOCKS:
        t = b["opts"][DEFAULT[b["id"]]][2]
        if not t: continue
        if P.get("drop"): t = ", ".join(x for x in t.split(", ") if x not in P["drop"])
        out.append(t)
    return (", " if P["sep"] == "one" else ",\n").join(out)

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

def page(head_close):
    en = T["en"]
    data_js = "\n".join([
        f"const BLOCKS = {json.dumps(BLOCKS, ensure_ascii=False)};",
        f"const NEG = {json.dumps(NEG)};",
        f"const DEFAULT = {json.dumps(DEFAULT)};",
        f"const LIB_VERSION = {json.dumps(LIB_VERSION)};",
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
{(SRC/'style.css').read_text()}</style>
{head_close}
<div class="wrap">
  <header class="top">
    <div style="display:grid;gap:6px;min-width:0;flex:1">
      <h1 data-i="title">{en["title"]}</h1>
      <p class="lede" data-i="lede" data-html>{en["lede"]}</p>
      <p class="small disclaimer" data-i="disclaimer">{en["disclaimer"]}</p>
    </div>
    <div class="lang" role="group" aria-label="Language">
      <button id="lang-en" aria-pressed="true">EN</button><button id="lang-es" aria-pressed="false">ES</button>
    </div>
  </header>

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
        </div>
        <div class="row">
          <label class="small" for="sep" data-i="sepLabel">{en["sepLabel"]}</label>
          <select id="sep">
{sep_opts}
          </select>
        </div>
        <pre id="prompt" aria-live="polite">{H.escape(default_prompt())}</pre>
        <p class="small" style="margin:0" data-i="labelNote">{en["labelNote"]}</p>
        <div class="row">
          <span class="small" data-i="recipe">{en["recipe"]}</span>
          <span class="code" id="recipe">{H.escape(default_recipe())}</span>
          <button class="btn" id="copyRecipe" data-i="copyRecipe">{en["copyRecipe"]}</button>
        </div>
        <div class="row">
          <label class="small" for="recipeIn" data-i="loadLabel">{en["loadLabel"]}</label>
          <input id="recipeIn" class="input" type="text" spellcheck="false" autocomplete="off" placeholder="HAIR2 STYLE5 BG3">
          <button class="btn" id="loadBtn" data-i="load">{en["load"]}</button>
          <button class="btn" id="resetBtn" data-i="reset">{en["reset"]}</button>
        </div>
        <div class="toast" id="toast" role="status"></div>
      </div>

      <div class="panel warn" id="warnPanel" hidden>
        <h2 data-i="warnTitle">{en["warnTitle"]}</h2>
        <ul class="tips" id="warnList"></ul>
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
  <footer data-i="footer" data-html>{en["footer"]} · Library v{LIB_VERSION}</footer>
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
        L.append(f"## {b['id']} · {b['key'][0]} / {b['key'][1]} — {b['name'][0]} / {b['name'][1]}")
        L.append("| # | EN | ES | Prompt text |\n|---|---|---|---|")
        L += [f"| {n(b,i)} | {en} | {es} | {t or '(none)'} |" for i, (en, es, t) in enumerate(b['opts'])]
        L.append("")
    L += ["## B0 · NEG — Negative prompt", "```", NEG, "```", "",
          "## Known conflicts / Conflictos conocidos",
          "The tool shows these as warnings and never changes your choices. / La herramienta los muestra como avisos y nunca cambia tu elección.", ""]
    L += [f"- {c['en']}" for c in CONFLICTS]
    return "\n".join(L) + "\n"

def readme_md():
    keys = " · ".join(f"`{b['key'][0]}` {b['name'][0].lower()}" for b in BLOCKS)
    return f"""# Prompt Builder

Build image prompts from **blocks** and copy a ready-to-use prompt. Pick one numbered option per block: {keys}.

**Use it here:** https://{URL}/

> Experimental project to test and share. Image generators don't always follow a prompt exactly — results vary by platform, model and seed. Use it as a guide, not a guarantee.

## Features
- Numbered options per block; hair **color** (`HAIR`) and **hairstyle** (`STYLE`) are separate, and so are **framing** (`CAM`) and **camera angle** (`ANGLE`).
- Formatting and suggested settings for **Perchance AI** (default), **Venice AI** and **SeaArt**.
- **Lock** blocks; **Variants** compares the other options of one block (page through all of them).
- **Recipes** reproduce a prompt exactly — library version, options, platform and separator:
  `{default_recipe()}`
- Paste a recipe to load it; your last session is remembered in your browser.
- Warnings for known contradictions between blocks (never changed silently).
- English / Spanish interface. Prompts are always in English. Works without installing anything; a read-only list appears where scripts can't run.

## Content rules
Adults only, fictional people, no nudity or sexual content, no trademarked characters.

## Editing
All published files come from `src/`. Edit `src/data.py` (blocks), `src/i18n.py` (interface text), `src/style.css` or `src/app.js`, then run `python3 src/build.py`. It regenerates `index.html`, `biblioteca.md` and this README so they stay in sync. Bump `LIB_VERSION` whenever a prompt text changes.

## Contributing
Have a block that works well? Open an *issue* with the text, the platform and the seed.

---

# Mezclador de Prompts (ES)

Arma prompts de imagen por **bloques** y copia el resultado listo. Interfaz en español con el botón **ES**; los prompts siempre salen en inglés. Biblioteca completa en [biblioteca.md](biblioteca.md).
"""

if __name__ == "__main__":
    (ROOT/"index.html").write_text('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' + page("</head><body>") + "\n</body></html>\n")
    (ROOT/"biblioteca.md").write_text(library_md())
    (ROOT/"README.md").write_text(readme_md())
    if "--fragment" in sys.argv:
        Path(sys.argv[sys.argv.index("--fragment") + 1]).write_text(page(""))
    print("built v" + LIB_VERSION)
