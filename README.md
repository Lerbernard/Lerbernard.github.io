# lerbernard.github.io

Personal site for Lee Bernard. Plain HTML, CSS and JavaScript, no build step.

| File | What it is |
| --- | --- |
| `index.html` | The whole page: hero with a playable tic-tac-toe, projects, experience, research, about, contact |
| `styles.css` | Theme (dark by default, light toggle), layout |
| `script.js` | Theme toggle, rotating hero word, scroll reveals, live repo count, minimax tic-tac-toe |
| `resume.pdf` | Linked from the "Résumé" button in the nav |
| `paper-ar-sustainability.pdf` | Accepted version of the IEEE ICIICE 2026 paper, with the IEEE copyright notice IEEE requires; the DOI link points to the published version |
| `poster-cybersecurity-suncoast.pdf` | CIS 5377 cybersecurity poster (Eagle X), linked from Projects |

## Preview locally

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

## Publish on GitHub Pages

The repo `Lerbernard/Lerbernard.github.io` already exists (it holds a 2022 placeholder page).
Replace its contents with these files and push to `main`:

```bash
git init
git add .
git commit -m "New personal site"
git branch -M main
git remote add origin https://github.com/Lerbernard/Lerbernard.github.io.git
git push -u origin main --force
```

GitHub Pages serves a `<username>.github.io` repo from the root of `main` automatically.
If it does not appear within a couple of minutes, check Settings > Pages in the repo and make
sure Source is "Deploy from a branch", branch `main`, folder `/ (root)`.

## Things to update over time

- **Résumé**: drop a new `resume.pdf` in the folder and push.
- **Projects**: each project is an `<article class="project">` in `index.html`. Copy one, change the
  text, tags and links.
- **Colours**: `--accent` (FGCU emerald green) for links and tags, `--accent-2` (FGCU cobalt blue) for the rotating hero word; both at the top of `styles.css`, with dark and light values.
