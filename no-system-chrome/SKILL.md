---
name: no-system-chrome
description: Read before opening, screenshotting, scraping, testing or driving ANY web page or localhost UI. Use whenever you'd reach for Google Chrome, headless chrome (--headless, --screenshot, --print-to-pdf), CDP / --remote-debugging-port, Playwright or Puppeteer with channel "chrome" or an executablePath, chrome-devtools-mcp, or claude-in-chrome tools. aleks never uses Google Chrome; agents use `search` or Yab instead.
---

# Never launch Google Chrome

aleks doesn't use Google Chrome. Any agent launch of `/Applications/Google Chrome.app` is a bug: it eats
RAM and CPU on a shared 16 GB machine running a whole agent fleet, and it can pop keychain prompts.

## Use instead

- **See, screenshot or read a page (localhost or prod):** `search` (`~/.local/bin/search`, aleks's own
  browser). Run `search --help` first. The usual loop:
  `search start --headless` → `search open URL` (prints a tab id) → `search wait ID` →
  `search shot ID out.png [WIDTH]` / `search text ID` / `search eval ID 'JS'` → `search close ID`.
- **Anything needing aleks's logins, tabs or history, or a multi-step task on a site:** Yab, through the
  `yab` CLI (`yab guide` first) or the `mcp__yab-browser__*` tools.
- **Automated e2e suites:** drive them through `search` or Yab. If a suite must stay on Playwright, use
  its bundled Chromium only: `chromium.launch()` with no `channel` and no `executablePath`.
- **HTML → PNG/PDF (slides, mocks):** `search shot`, or Playwright's bundled Chromium.

## Never

- `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" …`, headless or not
- `channel: 'chrome'` / `channel="chrome"`, or an `executablePath` pointing at Google Chrome
- `open -a "Google Chrome"`, raw CDP spawns of Chrome, chrome-devtools-mcp
- `mcp__claude-in-chrome__*` tools
- falling back to Chrome when another browser isn't found: fail loud instead

If repo code hardcodes `channel: 'chrome'`, don't run it as-is. Switch it to `search`, Yab or the bundled
Chromium, and tell the operator what you changed.
