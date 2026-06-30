# Deployment

This project builds as a static Astro site.

## Local Verification

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

The generated site is written to `dist/`.

## GitHub Pages

The included GitHub Actions workflow builds the site and deploys `dist/` to GitHub Pages.

In the repository settings, set:

```txt
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

Do not use `Deploy from a branch` for this repository. Branch-based Pages deployment runs GitHub's default Jekyll builder against the repository root, which cannot parse Astro component frontmatter in `src/**/*.astro`.

The workflow intentionally does not run `actions/configure-pages`; Pages configuration should be handled through the repository setting above. In this repository, `actions/configure-pages@v5` failed before dependency installation with `TypeError: error must be an instance of Error`, so keeping deployment configuration out of the workflow avoids that action-level failure.

For a project repository, `astro.config.mjs` derives `base` from `GITHUB_REPOSITORY`, so assets are served under `/<repository-name>/`.

For a user site repository named `USERNAME.github.io`, no base path is applied.

To override the base path manually, set the `PUBLIC_BASE_PATH` repository variable or workflow environment value.

The build includes `public/.nojekyll`, which is copied into `dist/` to prevent Jekyll processing of the uploaded static artifact.
