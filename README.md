# MovieBoxPro Wrapper (TizenBrew module)

A minimal TizenBrew site-modification module that loads any website on a
Samsung Tizen TV and makes it navigable with the remote's D-pad.

## Files
- `package.json` — module manifest. **Edit `websiteURL` and `appName`.**
- `userScript.js` — injected into the site; adds arrow-key navigation,
  a focus ring, Enter-to-click, and Back-button handling.

## Set your site
Open `package.json` and change two fields:
- `"websiteURL"`: the full URL you want to load, e.g. `"https://yoursite.com"`
- `"appName"`: whatever label you want on the TizenBrew module list

## Install on the TV (pick one delivery method)

### A. GitHub (easiest to update)
1. Put this folder in a GitHub repo.
2. On the TV, open TizenBrew → Module Manager.
3. Add module by URL / repo: enter `yourusername/yourreponame`.
4. Launch it from the TizenBrew module list.
To update later: push a change, bump `version` in package.json, reload in TizenBrew.

### B. npm
1. `npm publish` this folder (needs an npm account).
2. In TizenBrew press the GREEN button and enter the package name (`my-tv-wrapper`).

### C. Local test server (fully private, nothing uploaded)
1. In this folder on your PC: `npx http-server -p 8080` (or any static server).
2. In TizenBrew, add module by URL: `http://YOUR_PC_IP:8080`
   (PC and TV must be on the same network.)

## Remote controls once it's running
- Arrow keys: move focus to the nearest clickable element
- OK / Enter: click the focused element
- Back / Return: go back a page

## Tuning
In `userScript.js`:
- Focus ring look: the `.tb-focus` CSS block near the top.
- What's clickable: the `FOCUSABLE` list.
- Off-axis strictness: the `off * 2` weight in `move()` — raise it to keep
  focus moving in straighter lines, lower it to jump more freely.
