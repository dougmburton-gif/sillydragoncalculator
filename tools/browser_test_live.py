"""Quick smoke test against live sillydragoncalculator.com."""
from playwright.sync_api import sync_playwright

LIVE = "https://sillydragoncalculator.com/rope-the-dragon.html"


def click_area(page, x, y):
    box = page.locator("#gameArea").bounding_box()
    page.mouse.click(box["x"] + x, box["y"] + y)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 900, "height": 700})
    page.goto(LIVE, wait_until="domcontentloaded", timeout=60000)

    print("=== LIVE SITE ===")
    print("Escape banner:", repr(page.locator("#escapeBanner").inner_text().strip()))
    print("External JS:", page.locator("script[src='rope-the-dragon.js']").count() > 0)

    page.locator("#startBtn").click()
    page.wait_for_timeout(500)
    d = page.evaluate(
        """() => {
        const d = document.getElementById('gameDragon');
        const a = document.getElementById('gameArea');
        const dr = d.getBoundingClientRect();
        const ar = a.getBoundingClientRect();
        return { x: dr.left - ar.left + dr.width / 2, y: dr.top - ar.top + dr.height / 2 };
      }"""
    )
    click_area(page, d["x"], d["y"])
    page.wait_for_timeout(350)
    print("Snare on click:", page.locator("#snareBox.active").count() > 0)

    page.goto(LIVE + "?testact3=1", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(900)
    print("Boss scene (testact3):", page.locator("#bossScene.show").count() > 0)
    bg = page.evaluate(
        "() => getComputedStyle(document.getElementById('bossScene')).backgroundImage"
    )
    print("Boss background:", bg[:120])
    browser.close()
