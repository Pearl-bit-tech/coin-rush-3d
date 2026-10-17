# Coin Rush 3D

Collect coins for 60 seconds. WASD / arrow keys (or on-screen buttons on phones).
Built with plain JavaScript + Three.js. **No build step**: start.ng serves the files as they are.

## Files
- `index.html`, `style.css`: page and look
- `js/game.js`: scene, movement, coins, score, timer, HUD
- `js/player.js`: the character; `applyStyle(style)` re-dresses it
- `js/startng.js`: start.ng player + style adapter (and the dev mock)
- `cover.png`: card picture for start.ng

## Verified vs mock
- Reads player + character style via start.ng's connect page (`startng:whoami`), exactly as in https://start.ng/docs.md. **Not tested live yet.**
- Off start.ng (your laptop) it uses a **mock** player, shown as "DEV MOCK" in the UI.
- Re-checks the player when you return to the tab, as the docs say.

## Run locally
Needs internet (Three.js loads from jsDelivr). From this folder: `python3 -m http.server 8000`, open http://localhost:8000.
Test styling in the browser console: `devSetStyle({ primaryColor: '#ff0000', hair: 'bun', hat: 'tophat' })`.

## Publish
1. Put this folder in a **public GitHub repo** (`index.html` at the top).
2. Check: `curl -X POST https://api.start.ng/games/check -H "Content-Type: application/json" -d '{"repo_url":"https://github.com/YOU/REPO","name":"coin-rush-3d"}'`
3. Publish: same command with `/games/publish`. Open the `approve_url` it returns and say yes.
4. Later updates: just `git push`.
