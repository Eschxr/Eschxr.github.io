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

For a project repository, `astro.config.mjs` derives `base` from `GITHUB_REPOSITORY`, so assets are served under `/<repository-name>/`.

For a user site repository named `USERNAME.github.io`, no base path is applied.

To override the base path manually, set the `PUBLIC_BASE_PATH` repository variable or workflow environment value.
