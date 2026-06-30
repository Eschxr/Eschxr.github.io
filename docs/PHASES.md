# Project Phases

## Objective

Build a static Astro personal portfolio for GitHub Pages with a plain initial site, a destructive shatter interaction, a hidden glowing orb, and a secret retro 1990s-style reveal.

## Current Phase

Complete

## Phase Checklist

| Phase | Status | Acceptance Criteria |
| --- | --- | --- |
| Phase 1: Static Astro Foundation | Complete | Astro app builds, modular content exists, plain page renders, retro shell is hidden, crack trigger is accessible. |
| Phase 2: State and Reduced Motion | Complete | Client-side state machine exists and reduced-motion path can reveal the retro site without physics. |
| Phase 3: Shatter Canvas and Snapshot | Complete | Three.js overlay starts after crack click and displays snapshot-based shard meshes. |
| Phase 4: Physics | Complete | Rapier bodies drive shard movement, collisions, impulses, and simulation wind-down. |
| Phase 5: Hidden Orb | Complete | Orb is discoverable, clickable/tappable, keyboard accessible, and triggers the retro reveal. |
| Phase 6: Reveal Polish and Cleanup | Complete | Retro transition is polished, mobile behavior is tuned, and Three.js resources are cleaned up. |
| Phase 7: Final Verification and Deployment | Complete | Build, accessibility, interaction, cleanup, and GitHub Pages deployment checks pass. |

## Phase 1 Notes

- Use placeholder personal content until final copy is supplied.
- Keep animation internals out of Phase 1 except for stable DOM hooks.
- Do not introduce external copyrighted assets.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 2 Notes

- Added the `plain`, `cracking`, `shattered`, `orbFound`, and `retro` state model in a client-side TypeScript controller.
- Added a keyboard-accessible reveal fallback for reduced-motion users and as a temporary non-physics reveal path.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 3 Notes

- Added snapshot capture with `html2canvas`.
- Added a fullscreen Three.js overlay that maps the page snapshot onto irregular rectangular shard meshes.
- Added GSAP-driven temporary scatter motion until Rapier physics is implemented.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 4 Notes

- Added Rapier rigid bodies and cuboid colliders for each shard.
- Added impulses, angular torque, a floor collider, mesh/body synchronization, and simulation wind-down.
- Kept the reduced-motion path on the lightweight GSAP transition.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 5 Notes

- Added a glowing orb with a larger invisible hit target, pulse timing, hover feedback, and raycast click handling.
- Added a keyboard reveal fallback that is visually quiet unless focused, with a prominent reduced-motion fallback.
- Orb click now calls the shared retro reveal path and cleans up the shatter overlay.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 6 Notes

- Added a brief CRT/static reveal transition that respects reduced-motion preferences.
- Added scanline and marquee polish to the retro page.
- Tightened the reveal flow so transition, cleanup, DOM hiding, and focus transfer happen in order.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run build`.

## Phase 7 Notes

- Added GitHub Pages deployment documentation and workflow.
- Configured Astro base-path handling for project pages and user pages.
- Added `npm run check` for Astro/TypeScript validation.
- After inspecting GitHub Pages logs, hardened deployment docs/workflow for the required `GitHub Actions` Pages source and added a `.nojekyll` marker to the static artifact.
- After the next deploy log showed `actions/configure-pages@v5` failing before install with `TypeError: error must be an instance of Error`, removed that optional action and kept Pages source configuration as a repository setting.
- Verified with `ASTRO_TELEMETRY_DISABLED=1 npm run check` and `ASTRO_TELEMETRY_DISABLED=1 npm run build`.
