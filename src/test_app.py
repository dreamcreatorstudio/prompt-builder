"""Behaviour tests for Prompt Builder. Run: python3 src/test_app.py (needs playwright + chromium)."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = (Path(__file__).resolve().parent.parent / "index.html").read_text()
import json, re
_arch = json.loads(re.search(r"const ARCHIVE = (\{.*?\});\n", HTML).group(1))
_old = json.loads(json.dumps(_arch["1.6"])); _old["blocks"][[x["id"] for x in _old["blocks"]].index("B3.1")]["texts"][0] = "OLD honey hair"
_old["separators"]["one"]["joiner"] = " ; "   # frozen formatting rule that differs from today
_arch["1.1"] = _old
OLD_HTML = re.sub(r"const ARCHIVE = \{.*?\};\n", lambda m: "const ARCHIVE = " + json.dumps(_arch) + ";\n", HTML, count=1)
DEFAULT_HAIR = json.loads(re.search(r"const DEFAULT = (\{.*?\});", HTML).group(1))["B3.1"]
results = []
def check(name, cond, detail=""):
    results.append((name, bool(cond), detail)); print(("PASS " if cond else "FAIL ") + name + (f" — {detail}" if detail and not cond else ""))

def fresh(b, js=True, locale="en-US", html=None):
    c = b.new_context(java_script_enabled=js, locale=locale)
    pg = c.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("about:blank"); pg.set_content(html or HTML)
    return pg, errs

ev = lambda pg, js: pg.evaluate(js)
radio = lambda bid, i: f'label[for="g-{bid.replace(".","_")}-{i}"]'

with sync_playwright() as p:
    b = p.chromium.launch()

    # --- load ---
    pg, errs = fresh(b)
    check("loads without JS errors", not errs, str(errs))
    check("English by default", pg.inner_text("h1") == "Prompt Builder")
    check("footer keeps the library version after the page loads", "Library v" in pg.inner_text("footer"))
    check("Perchance is the default platform", pg.input_value("#plat") == "perchance")

    # 1. locks: lock BEFORE opening variants
    pg.click('[data-lock="B3.1"]')
    check("locked block disables its Variants button", pg.is_disabled('[data-var="B3.1"]'))
    check("locked block disables its options", pg.is_disabled("#g-B3_1-0"))

    # 1. locks: lock AFTER opening variants, then click Use / Copy
    pg.click('[data-var="B3.4"]')
    check("variants open", pg.is_visible("#varPanel"))
    use = pg.locator('#variants [data-a="use"]').first
    before = ev(pg, 'S.sel["B3.4"]')
    pg.click('[data-lock="B3.4"]')                      # lock while panel is open
    check("locking the varied block closes its variants", not pg.is_visible("#varPanel"))
    # call the guard directly as if a stale button were clicked
    ev(pg, 'variantAction("use","B3.4",0)')
    check("Use is refused on a locked block (internal guard)", ev(pg, 'S.sel["B3.4"]') == before)
    pg.click('[data-lock="B3.4"]'); pg.click('[data-lock="B3.1"]')  # unlock both

    # 2. stale variants: change AGE with variants open
    pg.click('[data-var="B6"]')
    pg.click(radio("B3", 2))
    check("changing AGE closes open variants", not pg.is_visible("#varPanel"))
    check("…and tells the user why", "closed" in pg.inner_text("#toast"))
    # stale copy guard: open, then change platform via state, then try copy
    pg.click('[data-var="B6"]')
    pg.select_option("#plat", "seaart")
    check("changing platform closes open variants", not pg.is_visible("#varPanel"))
    pg.click('[data-var="B6"]')
    pg.select_option("#sep", "break")
    check("changing separator closes open variants", not pg.is_visible("#varPanel"))
    # Copy text is built at click time from the current context
    pg.click('[data-var="B6"]')
    copied = ev(pg, 'promptText({...S.sel, B6: 0})')
    check("variant prompt uses current platform weights", "(white ribbed cotton crop top" in copied and ":1.2)" in copied)
    # Use stays valid when only the varied block changes
    pg.locator('#variants [data-a="use"]').first.click()
    check("Use keeps the panel open and valid", pg.is_visible("#varPanel"))

    # 3. real count + paging
    pg.click('[data-var="B2"]')
    t = pg.inner_text("#varTitle")
    check("GLOW shows 2 alternatives, not 3", pg.locator("#variants .variant").count() == 2 and "of 2" in t, t)
    check("no paging when everything fits", not pg.is_visible("#varNav"))
    pg.click('[data-var="B6"]')
    check("OUTFIT shows 32 alternatives", "of 32" in pg.inner_text("#varTitle"))
    pg.click("#varNext"); pg.click("#varNext")
    check("paging reaches later options", "7–9 of 32" in pg.inner_text("#varTitle"), pg.inner_text("#varTitle"))
    check("Variants button shows real count", "(2)" in pg.inner_text('[data-var="B2"]'))

    # EN/ES must not alter the prompt
    pg.click("#closeVar")
    en_prompt = ev(pg, "promptText()")
    pg.click("#lang-es")
    check("Spanish UI", pg.inner_text("h1") == "Mezclador de Prompts")
    check("switching EN→ES keeps the prompt identical", ev(pg, "promptText()") == en_prompt)
    pg.click("#lang-en")
    check("switching back keeps it identical", ev(pg, "promptText()") == en_prompt)

    # conflicts are warnings only
    pg.click(radio("B7", 0)); pg.click(radio("B7.1", 7))
    check("profile + three-quarter framing shows a warning", pg.is_visible("#warnPanel"))
    check("…without changing the user's choices", ev(pg, 'S.sel["B7"]') == 0 and ev(pg, 'S.sel["B7.1"]') == 7)
    pg.click(radio("B7", 3))
    check("warning clears when the conflict is gone", not pg.is_visible("#warnPanel"))

    # recipe round-trip
    rec = pg.inner_text("#recipe"); prompt = ev(pg, "promptText()")
    check("recipe records version, platform and separator", rec.startswith("v1.19 |") and "| seaart | break" in rec, rec)
    pg.click("#resetBtn")
    pg.fill("#recipeIn", rec); pg.click("#loadBtn")
    check("pasting the recipe restores the exact prompt", ev(pg, "promptText()") == prompt)
    # Spanish keys and partial recipes
    pg.fill("#recipeIn", "CAB2 PEI5 FON3"); pg.click("#loadBtn")
    check("Spanish keys load", ev(pg, 'S.sel["B3.1"]') == [1] and ev(pg, 'S.sel["B3.4"]') == 4 and ev(pg, 'S.sel["B11"]') == 2)
    # recipe respects locks
    pg.click('[data-lock="B3"]'); cur = ev(pg, 'S.sel["B3"]')
    pg.fill("#recipeIn", "AGE6"); pg.click("#loadBtn")
    check("recipe does not change locked blocks", ev(pg, 'S.sel["B3"]') == cur and "Locked" in pg.inner_text("#toast"))
    pg.click('[data-lock="B3"]')  # unlock

    # 1. full validation before applying (nothing is applied if anything is wrong)
    def attempt(txt):
        before = ev(pg, "JSON.stringify(S.sel)")
        pg.fill("#recipeIn", txt); pg.click("#loadBtn")
        return before == ev(pg, "JSON.stringify(S.sel)"), pg.inner_text("#loadErr") if pg.is_visible("#loadErr") else ""
    unchanged, err = attempt("AGE2 HAIR99")
    check("out-of-range option rejects the whole recipe (AGE not applied)", unchanged and "HAIR99" in err and "1–16" in err, err)
    unchanged, err = attempt("HAIR6 CAB7")
    check("same block twice (EN/ES) with different values is rejected", unchanged and "B3.1" in err, err)
    unchanged, err = attempt("HAIR6 CAB6 BG2")
    check("same block twice with the same value is accepted", not err and ev(pg, 'S.sel["B11"]') == 1, err)
    unchanged, err = attempt("AGE2 FOO3")
    check("unknown key rejects the recipe", unchanged and "FOO" in err, err)
    unchanged, err = attempt("v9.9 | HAIR1")
    check("unknown library version is refused", unchanged and "9.9" in err, err)
    unchanged, err = attempt("nonsense")
    check("recipe with no options shows an error", unchanged and err, err)
    unchanged, err = attempt("ACC0")
    check("zero-based block accepts 0", not err)
    unchanged, err = attempt("ACC14")
    check("zero-based block rejects past its range", unchanged and "0–13" in err, err)
    unchanged, err = attempt("AGE2 HAIR=-1")
    check("negative option number is rejected (AGE not applied)", unchanged and "-1" in err, err)
    unchanged, err = attempt("AGE2 | typo | wrong")
    check("unrecognised words are rejected", unchanged and "typo" in err and "wrong" in err, err)
    unchanged, err = attempt("AGE2 HAIR=")
    check("key without a number is rejected", unchanged and "HAIR=" in err, err)
    unchanged, err = attempt("AGE2 | venice | seaart")
    check("two platforms are rejected", unchanged and "platform" in err, err)
    unchanged, err = attempt("AGE2 | Perchance AI | one")
    check("platform label with spaces is accepted", not err and ev(pg, 'S.sel["B3"]') == 1)
    for txt, needle in [("v9.9,AGE2", "9.9"), ("v9.9·AGE2", "9.9"), ("v9.9;AGE2", "9.9"), ("v9.9|AGE2", "9.9"),
                        ("v1.3,v1.2,AGE2", "1.2"), ("v1.3·v1.2 AGE2", "1.2"), ("AGE2·v8.0", "8.0")]:
        unchanged, err = attempt(txt)
        check(f"version after any divider is checked: {txt!r}", unchanged and needle in err, err)
    unchanged, err = attempt("v1.6,AGE2")
    check("known version after a comma loads", not err and ev(pg, 'S.sel["B3"]') == 1, err)
    unchanged, err = attempt("v1.6·AGE3·BG2")
    check("middle dot divider loads", not err and ev(pg, 'S.sel["B3"]') == 2 and ev(pg, 'S.sel["B11"]') == 1, err)
    unchanged, err = attempt("v1.3 | OUTFIT18")
    check("v1.3 recipe can't use outfits added in v1.4", unchanged and "1–17" in err, err)
    unchanged, err = attempt("OUTFIT22")
    check("current recipe accepts the new outfit 22", not err and ev(pg, 'S.sel["B6"]') == 21, err)
    unchanged, err = attempt("v1.3 | OUTFIT5")
    check("v1.3 recipe still loads normally (same text today)", not err and ev(pg, "S.pin") is None, err)
    unchanged, err = attempt("v1.4 | HAIR2")
    check("v1.4 partial recipe completes with the v1.4 base (yoga catalog), not the new one", not err and ev(pg, 'S.sel["B6"]') == 4 and ev(pg, 'S.sel["B1"]') == 2, err)
    # multi-select accessories
    unchanged, err = attempt("ACC1+3")
    check("ACC1+3 selects two accessories", not err and ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[1,3]", err)
    check("…and both appear in the prompt", "emerald pendant necklace on a fine gold chain, minimalist sports watch" in ev(pg, "promptText()"))
    check("…and the recipe writes ACC1+3", "ACC1+3" in pg.inner_text("#recipe"))
    unchanged, err = attempt("ACC0+2")
    check("ACC0 can't be combined", unchanged and "0" in err, err)
    unchanged, err = attempt("EYES1+2")
    check("single-choice blocks reject +", unchanged and "only one" in err, err)
    unchanged, err = attempt("ACC1+14")
    check("multi rejects an out-of-range part", unchanged and "14" in err, err)
    unchanged, err = attempt("ACC3+1 ACC1+3")
    check("same set written twice is accepted", not err, err)
    unchanged, err = attempt("ACC0")
    check("ACC0 clears accessories", not err and ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[]", err)
    unchanged, err = attempt("v1.5 | ACC2")
    check("old single-number ACC2 still works (v1.5)", not err and ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[2]" and ev(pg, "S.pin") is None, err)
    unchanged, err = attempt("STYLE3")
    check("partial valid recipe still works and clears errors", not err and ev(pg, 'S.sel["B3.4"]') == 2)

    # 2. reproduce an older version exactly vs migrate (fake archived v1.1 with a different hair text)
    pgA, errsA = fresh(b, html=OLD_HTML)
    pgA.fill("#recipeIn", "v1.1 | HAIR1 BG1"); pgA.click("#loadBtn")
    exact = pgA.evaluate("promptText()")
    check("older recipe is reproduced with its own texts", "OLD honey hair" in exact and pgA.evaluate("S.pin") == "1.1", exact[:80])
    check("…and its own frozen separator rule", " ; " in exact)
    check("…editing is paused while reproducing", pgA.is_disabled("#g-B3_1-0") and pgA.is_disabled('[data-var="B6"]'))
    check("…recipe keeps the old version", pgA.inner_text("#recipe").startswith("v1.1 |"))
    pgA.click("#migrateBtn")
    mig = pgA.evaluate("promptText()")
    check("migrating keeps option numbers but uses current texts", pgA.evaluate("S.pin") is None and "honey-blonde hair" in mig and "OLD" not in mig)
    check("…and says the prompt may differ", "may differ" in pgA.inner_text("#toast"))

    # 3. sessions: same version restored, older version pinned with notice, unknown version ignored
    def session_page(sess):
        c = b.new_context(); p2 = c.new_page()
        p2.route("https://pb.test/", lambda r: r.fulfill(body=OLD_HTML, content_type="text/html"))
        p2.goto("https://pb.test/")
        p2.evaluate(f"localStorage.setItem('pb-session', JSON.stringify({sess}))"); p2.reload()
        return p2
    p2 = session_page('{v:"1.1", sel:{"B3.1":0,"B11":0}, plat:"venice", sep:"nl"}')
    check("old-version session is shown exactly, with a notice", p2.evaluate("S.pin") == "1.1" and "OLD honey hair" in p2.evaluate("promptText()") and p2.is_visible("#notice"))
    p2 = session_page('{v:"0.3", sel:{"B3.1":7}, plat:"venice", sep:"tag"}')
    check("unknown-version session is not reinterpreted", p2.evaluate('S.sel["B3.1"]') == DEFAULT_HAIR and p2.evaluate("S.pin") is None and "0.3" in p2.inner_text("#notice"))
    check("…but platform and separator are kept", p2.input_value("#plat") == "venice" and p2.input_value("#sep") == "tag")
    p2 = session_page('{sel:{"B3.1":7}}')
    check("session without a version is not reinterpreted", p2.evaluate('S.sel["B3.1"]') == DEFAULT_HAIR and p2.is_visible("#notice"))

    # versions whose prompt is identical today are used directly; partial ones complete with THEIR defaults
    pgB, _ = fresh(b)
    pgB.fill("#recipeIn", "v1.2 | HAIR1"); pgB.click("#loadBtn")
    check("v1.2 partial recipe completes with v1.2 defaults (PHOTO2, OUTFIT4)", pgB.evaluate('S.sel["B1"]') == 1 and pgB.evaluate('S.sel["B6"]') == 3 and pgB.evaluate('S.sel["B3.1"]') == [0])
    check("…and works normally because its text is identical today", pgB.evaluate("S.pin") is None)
    p2 = session_page('{v:"1.2", sel:{"B1":1,"B2":1,"B3":0,"B3.3":2,"B3.1":5,"B3.4":8,"B3.2":1,"B4":0,"B5":1,"B6":3,"B6.1":2,"B7":0,"B7.1":8,"B8":0,"B11":0}, plat:"perchance", sep:"one"}')
    check("saved v1.2 session is kept as the user left it", p2.evaluate('S.sel["B6"]') == 3 and p2.evaluate('S.sel["B7.1"]') == 8 and p2.evaluate("S.pin") is None and not p2.is_visible("#notice"))

    # new base: fresh session and Reset use the yoga catalog defaults, with no notes
    pgC, _ = fresh(b)
    base = "PHOTO1 GLOW1 AGE1 ETHN1 EXPR2 HAIR1 STYLE9 EYES2 SKIN3 BODY2 OUTFIT22 ACC0 CAM1 POSE0 PLACE0 ANGLE1 LIGHT1 BG6"
    check("new session starts with the default base", base in pgC.inner_text("#recipe") and not pgC.is_visible("#warnPanel"))
    pgC.click('label[for="g-B6-0"]'); pgC.click("#resetBtn")
    check("Reset returns to the default base", base in pgC.inner_text("#recipe"))
    check("default prompt includes Slavic heritage after the age", "a 25-year-old woman, adult facial features, Slavic heritage" in ev(pgC, "promptText()"))
    pgC.fill("#recipeIn", "v1.19 | ETHN0"); pgC.click("#loadBtn")
    check("ETHN0 leaves heritage out of the prompt", "heritage" not in ev(pgC, "promptText()") and "adult facial features, " in ev(pgC, "promptText()"))
    pgC.fill("#recipeIn", "v1.19 | ETHN2"); pgC.click("#loadBtn")
    check("ETHN2 adds Nordic heritage", "Nordic Scandinavian heritage" in ev(pgC, "promptText()"))
    pgC.fill("#recipeIn", "v1.19 | ETHN16"); pgC.click("#loadBtn")
    check("ETHN16 is out of range", pgC.is_visible("#loadErr"))
    pgC.fill("#recipeIn", "v1.19 | ETHN14+15 HAIR3+10"); pgC.click("#loadBtn")
    pr = ev(pgC, "promptText()")
    check("two heritages mix into one phrase", "mixed Greek and Native American First Nations heritage" in pr, pr)
    check("two hair colors mix into one phrase", "multi-tone hair blending copper-red and vivid electric-blue" in pr, pr)
    check("mixed recipe round-trips", "ETHN14+15" in pgC.inner_text("#recipe") and "HAIR3+10" in pgC.inner_text("#recipe"))
    pgC.fill("#recipeIn", "v1.19 | ETHN0+14"); pgC.click("#loadBtn")
    check("ETHN0 can't be mixed", pgC.is_visible("#loadErr"))
    pgC.fill("#recipeIn", "v1.19 | HAIR3"); pgC.click("#loadBtn")
    pgC.click('label[for="g-B3_1-2"]')
    check("hair keeps at least one color when the last is unticked", ev(pgC, 'S.sel["B3.1"]') == [2])
    pgC.fill("#recipeIn", "v1.19 | CAM12 POSE2 PLACE3"); pgC.click("#loadBtn")
    pr = ev(pgC, "promptText()")
    check("POSE + PLACE combine (sitting on the silk net)", "full body shot, head to toe framing" in pr and "sitting gracefully" in pr and "taut net of thick glowing silver silk" in pr, pr)
    pgC.fill("#recipeIn", "v1.19 | CAM1 POSE2"); pgC.click("#loadBtn")
    check("a CAM option with a built-in pose plus POSE shows a note", ev(pgC, "activeNotes().length") > 0)
    pgC.fill("#recipeIn", "LUG5 POS7"); pgC.click("#loadBtn")
    check("Spanish keys LUG / POS load", ev(pgC, 'S.sel["B7.3"]') == 5 and ev(pgC, 'S.sel["B7.2"]') == 7)
    # presets: each loads cleanly, has no conflict notes, is 25 / Slavic, and the menu tracks it
    n_presets = ev(pgC, "PRESETS.length")
    check("library version is shown at the top next to Preset", pgC.inner_text("#libVer") == "Library v" + ev(pgC, "LIB_VERSION"))
    check("there are 14 presets plus None", n_presets == 14 and pgC.locator("#preset option").count() == 15)
    bad = []
    for i in range(n_presets):
        pgC.select_option("#preset", str(i))
        notes = ev(pgC, "activeNotes().map(c => c.kind).filter(k => k !== 'out_of_frame')")
        if pgC.is_visible("#loadErr") or notes or pgC.input_value("#preset") != str(i) or "AGE1 ETHN1 " not in pgC.inner_text("#recipe"):
            bad.append((i, notes))
    check("every preset loads with no errors or conflicts (crop notice allowed), at 25 and Slavic", not bad, bad)
    pgC.click('label[for="g-B6-0"]')
    check("changing a block sets the preset menu back to None", pgC.input_value("#preset") == "")
    pgC.click("#resetBtn")
    check("default base shows None", pgC.input_value("#preset") == "")
    pgC.fill("#recipeIn", "v1.6 | PHOTO1 GLOW1 AGE1 EXPR2 HAIR1 STYLE9 EYES2 SKIN3 BODY2 OUTFIT22 ACC0 CAM1 ANGLE1 LIGHT1 BG6 | perchance | one"); pgC.click("#loadBtn")
    check("v1.6 recipe loads as current with heritage unspecified (same text)", "ETHN0" in pgC.inner_text("#recipe") and "heritage" not in ev(pgC, "promptText()"))
    check("Reset button is in the header, next to EN/ES", pgC.locator("header #resetBtn").count() == 1)
    pgC.click('[data-lock="B3"]'); pgC.click("#resetBtn")
    check("Reset also clears locks", pgC.evaluate("Object.keys(S.locked).length") == 0)

    # 4. notes by kind; seated + upright and walking + helmet are no longer flagged
    pg.click("#resetBtn")
    pg.click(radio("B5", 1)); pg.click(radio("B7", 4))
    check("seated + lean pilates gives no note", not pg.is_visible("#warnPanel"))
    pg.click(radio("B6", 9)); pg.click(radio("B7", 3))
    check("walking + astronaut gives no note", not pg.is_visible("#warnPanel"))
    pg.click(radio("B7", 2))
    check("portrait shows an out-of-frame note", "out of frame" in pg.inner_text("#warnPanel").lower())
    pg.click(radio("B7", 0)); pg.click(radio("B7.1", 7))
    check("profile + 3/4 framing is marked incompatible", "incompatible" in pg.inner_text("#warnPanel").lower())
    pg.click(radio("B7.1", 11))
    check("POV + looking at camera is marked needs testing", "needs testing" in pg.inner_text("#warnPanel").lower())
    pg.click(radio("B7.1", 0))

    # session persists (same origin storage: use a real origin)
    c = b.new_context(); pg2 = c.new_page()
    pg2.route("https://pb.test/", lambda r: r.fulfill(body=HTML, content_type="text/html"))
    pg2.goto("https://pb.test/"); pg2.click(radio("B3.1", 2)); pg2.select_option("#plat", "venice"); pg2.select_option("#sep", "tag"); pg2.click("#lang-es")
    pg2.reload()
    check("session restores selections, platform, separator and language",
          pg2.evaluate('S.sel["B3.1"]') == [0, 2] and pg2.input_value("#plat") == "venice" and pg2.input_value("#sep") == "tag" and pg2.inner_text("h1") == "Mezclador de Prompts")

    # multi-select in the page: toggle on, toggle off, None clears
    pg.click("#resetBtn")
    pg.click(radio("B6.1", 2)); pg.click(radio("B6.1", 5))
    check("clicking two accessories keeps both", ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[2,5]")
    pg.click(radio("B6.1", 2))
    check("clicking again removes it", ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[5]")
    pg.click(radio("B6.1", 0))
    check("None clears all accessories", ev(pg, 'JSON.stringify(S.sel["B6.1"])') == "[]")
    check("Variants is disabled for the multi-select block", pg.is_disabled('[data-var="B6.1"]'))
    pg.click(radio("B6.1", 4)); pg.click(radio("B6.1", 6))
    check("cap + straw hat is flagged incompatible", "incompatible" in pg.inner_text("#warnPanel").lower())
    pg.click(radio("B6.1", 0))
    # per-block reset
    check("block Reset is disabled while at its default", pg.is_disabled('[data-reset="B3.1"]'))
    pg.click(radio("B3.1", 2))
    pg.click('[data-reset="B3.1"]')
    check("block Reset restores only that block", ev(pg, 'S.sel["B3.1"]') == DEFAULT_HAIR)
    pg.click(radio("B3.1", 2)); pg.click('[data-lock="B3.1"]')
    check("block Reset is disabled while locked", pg.is_disabled('[data-reset="B3.1"]'))
    pg.click('[data-lock="B3.1"]'); pg.click("#resetBtn")

    # copy options of one block
    txt = ev(pg, 'optionsText("B6")')
    check("Copy options: header with ID, EN/ES keys and names", txt.startswith("B6 · OUTFIT / VES — Outfit / Vestuario\n\n1. Denim + white crop / Denim + crop blanco"), txt[:80])
    check("Copy options: all 33 outfits, 22 is Venice carnival, last is the cropped midnight moth", "\n22. Venice carnival / Carnaval de Venecia\n" in txt and txt.rstrip().endswith("33. Midnight moth (crop) / Polilla nocturna (top corto)") and txt.count("\n") == 34)
    check("Copy options: ACC keeps 0", "\n0. None / Ninguno" in ev(pg, 'optionsText("B6.1")'))
    check("Copy options: no button labels inside", "Lock" not in txt and "Variants" not in txt)
    before = ev(pg, "JSON.stringify([S.sel, S.locked])")
    pg.click('[data-lock="B6"]'); pg.click('[data-opts="B6"]')
    check("Copy options works on a locked block", pg.is_enabled('[data-opts="B6"]'))
    pg.click('[data-lock="B6"]')
    check("Copy options doesn't change selections or locks", ev(pg, "JSON.stringify([S.sel, S.locked])") == before)

    # two copy modes
    check("[B#] labels are on screen but not in the page text (manual copy stays clean)", "[B1]" not in pg.inner_text("#prompt") and pg.locator("#prompt .tag").count() > 0 and ev(pg, 'getComputedStyle(document.querySelector("#prompt .tag"), "::before").content').startswith('"[B'))
    check("'Copy with blocks' keeps [B#] labels", ev(pg, "blocksText()").startswith("[B1] ") and "[B11] " in ev(pg, "blocksText()"))
    check("'Copy with blocks' has the same text once labels are removed",
          __import__("re").sub(r"\[B[\d.]+\] ", "", ev(pg, "blocksText()")) == ev(pg, "promptText()"))
    check("intro no longer promises ×3", "×3" not in pg.inner_text("header"))
    check("About this project note is shown once", pg.inner_text("header").count("About this project") == 1)

    # copied text never contains the grey labels
    check("copied prompt has no [B#] labels (line-break mode)", "[B" not in ev(pg, 'join(parts(S.sel,S.plat),"nl",false)'))

    # read-only mode without JS
    pg3, _ = fresh(b, js=False)
    check("no-JS read-only library is visible", pg3.is_visible("#static") and "Galactic heroine" in pg3.inner_text("#static"))
    check("no-JS library includes ANGLE", "Dutch angle" in pg3.inner_text("#static"))

    print(f"\n{sum(r[1] for r in results)}/{len(results)} passed")
    sys.exit(0 if all(r[1] for r in results) else 1)
