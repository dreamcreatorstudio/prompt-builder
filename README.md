# Prompt Builder

Build image prompts from **blocks** and copy a ready-to-use prompt. Pick one numbered option per block: `PHOTO` photo engine · `GLOW` skin glow · `AGE` model age · `EXPR` expression · `HAIR` hair color · `STYLE` hairstyle · `EYES` eyes · `SKIN` skin tone · `BODY` body · `OUTFIT` outfit · `ACC` accessories · `CAM` framing & pose · `ANGLE` camera angle · `LIGHT` lighting · `BG` background.

**Use it here:** https://dreamcreatorstudio.github.io/prompt-builder/

> Experimental project to test and share. Image generators don't always follow a prompt exactly — results vary by platform, model and seed. Use it as a guide, not a guarantee.

## Features
- Numbered options per block; hair **color** (`HAIR`) and **hairstyle** (`STYLE`) are separate, and so are **framing** (`CAM`) and **camera angle** (`ANGLE`).
- Formatting and suggested settings for **Perchance AI** (default), **Venice AI** and **SeaArt**.
- **Lock** blocks; **Variants** compares the other options of one block (page through all of them).
- **Recipes** reproduce a prompt exactly — library version, options, platform and separator:
  `v1.2 | PHOTO2 GLOW2 AGE1 EXPR3 HAIR6 STYLE9 EYES2 SKIN1 BODY2 OUTFIT4 ACC2 CAM1 ANGLE9 LIGHT1 BG1 | perchance | one`
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
