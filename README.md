# Prompt Builder

Build image prompts from **blocks** and copy a ready-to-use prompt. Pick one numbered option per block: `PHOTO` photo engine · `GLOW` skin glow · `AGE` model age · `ETHN` heritage · `EXPR` expression · `HAIR` hair color · `STYLE` hairstyle · `EYES` eyes · `SKIN` skin tone · `BODY` body · `OUTFIT` outfit · `ACC` accessories · `CAM` framing & pose · `ANGLE` camera angle · `LIGHT` lighting · `BG` background.

**Use it here:** https://dreamcreatorstudio.github.io/prompt-builder/

> **About this project** — An experimental tool for learning and creating image prompts. Explore combinations, change one block at a time, and discover what works for you. Results vary by generator, model and settings; prompts are a starting point, not a guarantee.

## Features
- Numbered options per block; hair **color** (`HAIR`) and **hairstyle** (`STYLE`) are separate, and so are **framing** (`CAM`) and **camera angle** (`ANGLE`).
- Formatting and suggested settings for **Perchance AI** (default), **Venice AI** and **SeaArt**.
- **Lock** keeps a block's choice in the tool (it doesn't make the generator keep the same face or body); **Variants** compares the other options of one block (page through all of them).
- **Copy for generating** (clean prompt) or **Copy with blocks** (keeps `[B#]` labels, for saving or asking for changes).
- To compare fairly, keep the same model, format and settings, and the same seed when available. Recipes are starting points; "tested" is reserved for combinations with recorded results and the platform/model used.
- **Recipes** record library version, options, platform and separator:
  `v1.12 | PHOTO1 GLOW1 AGE1 ETHN1 EXPR2 HAIR1 STYLE9 EYES2 SKIN3 BODY2 OUTFIT22 ACC0 CAM1 ANGLE1 LIGHT1 BG6 | perchance | one`
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
