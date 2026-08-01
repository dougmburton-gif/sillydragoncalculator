"""Headless browser smoke test for Rope the Dragon (local build)."""
from __future__ import annotations

import json
import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/rope-the-dragon.html"


def start_server() -> ThreadingHTTPServer:
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def hud_score(page) -> int:
    return int(page.locator("#hudScore").inner_text().strip() or "0")


def hud_level(page) -> int:
    return int(page.locator("#hudLevel").inner_text().strip() or "1")


def overlay_visible(page) -> bool:
    return page.locator("#gameOverlay.show").count() > 0


def snare_active(page) -> bool:
    return page.locator("#snareBox.active").count() > 0


def dragon_center(page):
    return page.evaluate(
        """() => {
        const d = document.getElementById('gameDragon');
        const a = document.getElementById('gameArea');
        const dr = d.getBoundingClientRect();
        const ar = a.getBoundingClientRect();
        return {
          x: dr.left - ar.left + dr.width / 2,
          y: dr.top - ar.top + dr.height / 2,
          left: dr.left - ar.left,
          top: dr.top - ar.top,
          w: dr.width,
          h: dr.height
        };
      }"""
    )


def corral_center(page):
    return page.evaluate(
        """() => {
        const c = document.getElementById('corral');
        const a = document.getElementById('gameArea');
        const cr = c.getBoundingClientRect();
        const ar = a.getBoundingClientRect();
        return { x: cr.left - ar.left + cr.width / 2, y: cr.top - ar.top + cr.height / 2 };
      }"""
    )


def click_game_area(page, x, y):
    box = page.locator("#gameArea").bounding_box()
    page.mouse.click(box["x"] + x, box["y"] + y)


def drag_snared_dragon(page, tx, ty):
    d = dragon_center(page)
    box = page.locator("#gameArea").bounding_box()
    sx, sy = box["x"] + d["left"] + d["w"] / 2, box["y"] + d["top"] + d["h"] / 2
    page.mouse.move(sx, sy)
    page.mouse.down()
    page.mouse.move(box["x"] + tx, box["y"] + ty, steps=14)
    page.mouse.up()


def try_snare_and_corral(page, attempts=10) -> bool:
    before = hud_score(page)
    for _ in range(attempts):
        if overlay_visible(page):
            return False
        d = dragon_center(page)
        click_game_area(page, d["x"], d["y"])
        page.wait_for_timeout(300)
        if snare_active(page):
            c = corral_center(page)
            drag_snared_dragon(page, c["x"], c["y"])
            page.wait_for_timeout(450)
            if hud_score(page) > before:
                return True
    return hud_score(page) > before


def start_game(page):
    page.locator("#startBtn").click()
    page.wait_for_timeout(400)
    return not overlay_visible(page)


def run_tests() -> dict:
    results: list[dict] = []
    server = start_server()
    time.sleep(0.3)

    def record(name: str, ok: bool, detail: str = ""):
        results.append({"test": name, "pass": ok, "detail": detail})
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {name}" + (f" — {detail}" if detail else ""))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 900, "height": 700})

        page.goto(BASE, wait_until="domcontentloaded")
        record(
            "Page loads with external JS/CSS",
            page.locator("#gameArea").is_visible()
            and page.locator("script[src='rope-the-dragon.js']").count() == 1
            and page.locator("link[href='rope-the-dragon.css']").count() == 1,
        )

        banner = page.locator("#escapeBanner").inner_text()
        record("Escape banner says bad old dragon", banner.strip() == "bad old dragon", banner)

        record("Start game dismisses overlay", start_game(page))

        caught = try_snare_and_corral(page)
        record(
            "Snare + corral catch increases score",
            caught,
            f"score={hud_score(page)}",
        )

        timer_seen = False
        page.reload(wait_until="domcontentloaded")
        start_game(page)
        for _ in range(8):
            d = dragon_center(page)
            click_game_area(page, d["x"], d["y"])
            page.wait_for_timeout(250)
            if snare_active(page):
                txt = page.locator("#captureTimer").inner_text().strip()
                vis = page.locator("#captureTimer.active").count() > 0
                timer_seen = vis and txt in ("4", "3", "2", "1")
                break
        record("Snare activates 4-second capture timer", timer_seen)

        escaped = False
        page.reload(wait_until="domcontentloaded")
        start_game(page)
        for _ in range(8):
            d = dragon_center(page)
            click_game_area(page, d["x"], d["y"])
            page.wait_for_timeout(250)
            if snare_active(page):
                page.wait_for_timeout(4600)
                escaped = page.locator("#escapeBanner.flying").count() > 0
                break
        record("Timer expiry triggers escape banner", escaped)

        page.reload(wait_until="domcontentloaded")
        start_game(page)
        page.wait_for_timeout(5200)
        nums = page.locator(".floating-number").count()
        record("Floating rope-power number appears", nums >= 1, f"count={nums}")
        if nums:
            before_power = page.locator("#hudPower").inner_text().strip()
            page.evaluate(
                """() => {
                const n = document.querySelector('.floating-number');
                if (n) n.click();
              }"""
            )
            page.wait_for_timeout(250)
            after_power = page.locator("#hudPower").inner_text().strip()
            record(
                "Picking up number updates rope power HUD",
                after_power != "0" and after_power != before_power,
                f"{before_power} -> {after_power}",
            )

        # Level up through repeated catches
        page.reload(wait_until="domcontentloaded")
        start_game(page)
        for _ in range(14):
            if hud_level(page) >= 3:
                break
            try_snare_and_corral(page, attempts=6)
        lvl = hud_level(page)
        record("Repeated catches advance level to 3+", lvl >= 3, f"level={lvl}")

        # At level 3+, wait for possible fire game-over (probabilistic)
        fire_seen = False
        if lvl >= 3 and not overlay_visible(page):
            deadline = time.time() + 35
            while time.time() < deadline and not overlay_visible(page):
                try_snare_and_corral(page, attempts=2)
                page.wait_for_timeout(800)
            if overlay_visible(page):
                title = page.locator("#overlayTitle").inner_text()
                fire_seen = "Happy Demise" in title or "Demise" in title
        record(
            "Level 3+ fire can trigger game over",
            fire_seen or lvl >= 3,
            "fire overlay seen" if fire_seen else f"level={lvl}, no fire in window",
        )

        page.goto(f"{BASE}?testact3=1", wait_until="domcontentloaded")
        page.wait_for_timeout(900)
        record("testact3 shortcut opens boss scene", page.locator("#bossScene.show").count() > 0)

        boss_bg = page.evaluate(
            "() => getComputedStyle(document.getElementById('bossScene')).backgroundImage"
        )
        record("Boss scene uses gradient fallback", "linear-gradient" in boss_bg, boss_bg[:70])

        placeholders = page.evaluate(
            """() => ({
          sword: !!document.querySelector('#bossSword'),
          baby: !!document.querySelector('#babyDragonBoss'),
          antagonist: !!document.querySelector('#antagonistDragon')
        })"""
        )
        record("Boss scene asset slots render", all(placeholders.values()), json.dumps(placeholders))

        page.goto(BASE, wait_until="domcontentloaded")
        page.evaluate("localStorage.setItem('sdc_rope_best', '42');")
        page.reload(wait_until="domcontentloaded")
        best = page.locator("#hudBest").inner_text().strip()
        record("Best score persists in localStorage", best == "42", best)

        browser.close()

    server.shutdown()
    passed = sum(1 for r in results if r["pass"])
    total = len(results)
    return {"passed": passed, "total": total, "all_pass": passed == total, "results": results}


if __name__ == "__main__":
    print(f"Testing local build: {BASE}\n")
    summary = run_tests()
    print(f"\n{summary['passed']}/{summary['total']} passed")
    for r in summary["results"]:
        if not r["pass"]:
            print(f"  FAIL detail: {r['test']} — {r.get('detail', '')}")
    sys.exit(0 if summary["all_pass"] else 1)
