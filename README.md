# SysDesign RPG

Turn-based system design combat. Pick the right architecture trade-off to damage Incident Bosses and level mastery tracks.

## Local

```bash
npm install
npm run dev
```

## Art direction

**Datacenter-dungeon:** same HD-2D pixel RPG style; arena and bosses use ops metaphors (racks, cables, incident creatures). See [`docs/design-decisions/datacenter-dungeon-art.md`](docs/design-decisions/datacenter-dungeon-art.md).

Retired art lives under [`src/assets/archive/`](src/assets/archive/) — never delete/replace assets without archiving first.

**Process-flow cards:** order request-path hops (see [`docs/design-decisions/process-flow-learning.md`](docs/design-decisions/process-flow-learning.md)).

- Autosaves to **localStorage** after every action (works on GitHub Pages).
- **Export JSON** / **Import JSON** in the top bar to back up or move progress between browsers.
- **Reset** clears the current fight and mastery defaults.

## GitHub Pages

Production builds use base path `/sysdesign-rpg/` (repo name).

1. Repo **Settings → Pages → Source**: GitHub Actions.
2. Push to `main` (workflow: `.github/workflows/pages.yml`).
3. Site URL: `https://clarkngo.github.io/sysdesign-rpg/`

```bash
npm run build   # outputs dist/ with correct asset paths
npm run preview # local check of the production build
```
