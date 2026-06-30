# Project Specification: Shattered Portfolio with Hidden Orb Retro Reveal

## Goal

Build a static personal portfolio website deployable to GitHub Pages. The site should initially appear extremely plain and minimal. A visible “clickable crack” triggers a destructive animation where the initial page appears to shatter into 3D pieces. Among the shattered fragments, a glowing orb should be hidden. When the user finds and clicks the orb, the site transitions into a second “retro internet” version inspired by 1990s personal websites.

The project must be maintainable. Text content should be modular and editable without touching rendering or animation code.

## Target Stack

Use the following stack unless there is a strong implementation reason not to:

```txt
Astro
TypeScript
Three.js
Rapier 3D
GSAP
Markdown or JSON content files
GitHub Pages deployment
```

## Hosting Constraints

The final output must be a static site compatible with GitHub Pages.

No backend server, database, authentication, or server-side runtime should be required.

The build output should be static HTML, CSS, JavaScript, images, fonts, and other static assets.

## Core User Experience

### Phase 1: Plain Site

The initial page should look intentionally plain:

```txt
white or off-white background
simple typography
minimal sections
almost default-browser aesthetic
subtle clickable crack visible somewhere on the page
```

The user should initially see a normal portfolio/about-me page.

Required sections:

```txt
Intro
About
Projects
Contact
```

The text content for these sections must be loaded from modular content files.

### Phase 2: Crack Interaction

The crack should be clickable.

On click:

```txt
disable normal page interaction
brief screen shake or rupture effect
capture or simulate a snapshot of the visible page
hide/freeze the original DOM
create a fullscreen Three.js canvas overlay
break the page image into 3D shard meshes
apply physics to shards
allow pieces to fall, collide, spin, and scatter
```

### Phase 3: Hidden Orb

A glowing orb should appear among the shattered pieces.

The orb should not be immediately obvious. It should feel hidden within the debris.

Requirements:

```txt
orb is clickable or tappable
orb emits glow/pulse
orb can be partially obscured by fragments
orb should become easier to notice after a short delay
hover/focus state should indicate interactivity
clicking the orb triggers the retro reveal
```

Suggested behavior:

```txt
0–2 seconds after shatter: orb is subtle
2–5 seconds: orb pulses faintly
5+ seconds: orb glow strengthens slightly
```

Do not make the orb impossible to find.

### Phase 4: Retro Reveal

When the orb is clicked:

```txt
physics simulation winds down or fades out
canvas overlay transitions away
retro page appears
optional CRT flicker/static transition
```

The retro page should feel like a 1990s personal website.

Visual references:

```txt
Space Jam 1996-style web design
starry tiled backgrounds
neon colors
beveled buttons
under construction motifs
visitor counter gag
marquee-like movement
chunky borders
web-safe-looking colors
low-resolution image treatment
```

Do not clone copyrighted assets. Recreate the general aesthetic with original assets.

## Content Modularity

All editable text should live outside component logic.

Preferred structure:

```txt
src/content/site.json
src/content/plain.md
src/content/retro.md
src/content/projects.json
```

Alternative acceptable structure:

```txt
src/data/site.ts
src/data/projects.ts
```

But static JSON/Markdown is preferred because it minimizes code editing.

### Content Requirements

The following content should be configurable:

```txt
site name
tagline
intro text
about text
projects
contact links
retro welcome message
retro about text
retro project blurbs
fake visitor counter text
footer text
```

Project data should support:

```txt
title
description
url
tags
year
featured boolean
```

## Accessibility Requirements

The experience should remain usable for users who cannot or do not want to run the animation.

Implement:

```txt
prefers-reduced-motion support
keyboard-accessible crack trigger
keyboard-accessible orb
visible focus states
ARIA labels for crack and orb
fallback button to reveal retro site
semantic HTML for portfolio content
```

If `prefers-reduced-motion: reduce` is active:

```txt
skip violent physics animation
use a simple fade/crack transition
show the orb clearly or provide direct reveal button
```

## Performance Requirements

The site should run acceptably on typical modern laptops and phones.

Guidelines:

```txt
limit shard count on mobile
pause physics once fragments settle
dispose Three.js geometries/materials/textures after transition
lazy-load Three.js/Rapier code only after crack click if practical
avoid huge textures
avoid excessive post-processing
```

Suggested shard counts:

```txt
desktop: 80–160 shards
tablet: 50–100 shards
mobile: 25–60 shards
```

## File/Folder Structure

Use this structure unless implementation constraints require changes:

```txt
/
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ public/
│  ├─ assets/
│  │  ├─ textures/
│  │  ├─ gifs/
│  │  └─ retro/
│  └─ favicon.svg
├─ src/
│  ├─ content/
│  │  ├─ site.json
│  │  ├─ plain.md
│  │  ├─ retro.md
│  │  └─ projects.json
│  ├─ components/
│  │  ├─ PlainPortfolio.astro
│  │  ├─ RetroPortfolio.astro
│  │  ├─ CrackTrigger.astro
│  │  └─ ShatterCanvas.ts
│  ├─ lib/
│  │  ├─ shatter/
│  │  │  ├─ createShardMeshes.ts
│  │  │  ├─ physicsWorld.ts
│  │  │  ├─ orb.ts
│  │  │  └─ transitions.ts
│  │  └─ content.ts
│  ├─ styles/
│  │  ├─ global.css
│  │  ├─ plain.css
│  │  └─ retro.css
│  └─ pages/
│     └─ index.astro
└─ README.md
```

## State Model

The page should operate as a simple finite state machine.

```txt
plain
cracking
shattered
orbFound
retro
```

State descriptions:

```txt
plain:
  normal initial portfolio visible

cracking:
  crack has been clicked; transition begins

shattered:
  Three.js/Rapier scene active; shards moving; orb available

orbFound:
  orb clicked; transition into retro page begins

retro:
  retro page visible; animation cleaned up
```

## Acceptance Criteria

The implementation is complete when:

```txt
site builds successfully as a static Astro project
site can deploy to GitHub Pages
initial page is plain and minimal
clickable crack triggers shatter animation
3D shards use page snapshot or snapshot-like texture
fragments move with physics
glowing orb is hidden among fragments
clicking orb reveals retro page
retro page content is loaded from modular content files
plain page content is loaded from modular content files
reduced-motion fallback exists
keyboard navigation works for crack and orb
Three.js resources are cleaned up after transition
```

