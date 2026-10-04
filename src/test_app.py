"""Behaviour tests for Prompt Builder. Run: python3 src/test_app.py (needs playwright + chromium)."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = (Path(__file__).resolve().parent.parent / "index.html").read_text()
results = []
def check(name, cond, detail=""):
    results.append((name, bool(cond), detail)); print(("PASS " if cond else "FAIL ") + name + (f" — {detail}" if detail and not cond else ""))

def fresh(b, js=True, locale="en-US"):
    c = b.new_context(java_script_enabled=js, locale=locale)
    pg = c.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("about:blank"); pg.set_content(HTML)
    return pg, errs

ev = lambda pg, js: pg.evaluate(js)
radio = lambda bid, i: f'label[for="g-{bid.replace(".","_")}-{i}"]'

with sync_playwright() as p:
    b = p.chromium.launch()

    # --- load ---
    pg, errs = fresh(b)
    check("loads without JS errors", not errs, str(errs))
    check("English by default", pg.inner_text("h1") == "Prompt Builder")
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
    pg.click('[data-var="B1"]')
    t = pg.inner_text("#varTitle")
    check("PHOTO shows 2 alternatives, not 3", pg.locator("#variants .variant").count() == 2 and "of 2" in t, t)
    check("no paging when everything fits", not pg.is_visible("#varNav"))
    pg.click('[data-var="B6"]')
    check("OUTFIT shows 16 alternatives", "of 16" in pg.inner_text("#varTitle"))
    pg.click("#varNext"); pg.click("#varNext")
    check("paging reaches later options", "7–9 of 16" in pg.inner_text("#varTitle"), pg.inner_text("#varTitle"))
    check("Variants button shows real count", "(2)" in pg.inner_text('[data-var="B1"]'))

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
    pg.click(radio("B7", 2))
    check("warning clears when the conflict is gone", not pg.is_visible("#warnPanel"))

    # recipe round-trip
    rec = pg.inner_text("#recipe"); prompt = ev(pg, "promptText()")
    check("recipe records version, platform and separator", rec.startswith("v1.2 |") and "| seaart | break" in rec, rec)
    pg.click("#resetBtn")
    pg.fill("#recipeIn", rec); pg.click("#loadBtn")
    check("pasting the recipe restores the exact prompt", ev(pg, "promptText()") == prompt)
    # Spanish keys and partial recipes
    pg.fill("#recipeIn", "CAB2 PEI5 FON3"); pg.click("#loadBtn")
    check("Spanish keys load", ev(pg, 'S.sel["B3.1"]') == 1 and ev(pg, 'S.sel["B3.4"]') == 4 and ev(pg, 'S.sel["B11"]') == 2)
    # recipe respects locks
    pg.click('[data-lock="B3"]'); cur = ev(pg, 'S.sel["B3"]')
    pg.fill("#recipeIn", "AGE6"); pg.click("#loadBtn")
    check("recipe does not change locked blocks", ev(pg, 'S.sel["B3"]') == cur and "Locked" in pg.inner_text("#toast"))
    pg.fill("#recipeIn", "v1.0 | HAIR1"); pg.click("#loadBtn")
    check("older library version is flagged", "v1.0" in pg.inner_text("#toast"))
    pg.fill("#recipeIn", "nonsense"); pg.click("#loadBtn")
    check("bad recipe shows an example", "Example" in pg.inner_text("#toast"))

    # session persists (same origin storage: use a real origin)
    c = b.new_context(); pg2 = c.new_page()
    pg2.route("https://pb.test/", lambda r: r.fulfill(body=HTML, content_type="text/html"))
    pg2.goto("https://pb.test/"); pg2.click(radio("B3.1", 2)); pg2.select_option("#plat", "venice"); pg2.select_option("#sep", "tag"); pg2.click("#lang-es")
    pg2.reload()
    check("session restores selections, platform, separator and language",
          pg2.evaluate('S.sel["B3.1"]') == 2 and pg2.input_value("#plat") == "venice" and pg2.input_value("#sep") == "tag" and pg2.inner_text("h1") == "Mezclador de Prompts")

    # copied text never contains the grey labels
    check("copied prompt has no [B#] labels (line-break mode)", "[B" not in ev(pg, 'join(parts(S.sel,S.plat),"nl",false)'))

    # read-only mode without JS
    pg3, _ = fresh(b, js=False)
    check("no-JS read-only library is visible", pg3.is_visible("#static") and "Galactic heroine" in pg3.inner_text("#static"))
    check("no-JS library includes ANGLE", "Dutch angle" in pg3.inner_text("#static"))

    print(f"\n{sum(r[1] for r in results)}/{len(results)} passed")
    sys.exit(0 if all(r[1] for r in results) else 1)
