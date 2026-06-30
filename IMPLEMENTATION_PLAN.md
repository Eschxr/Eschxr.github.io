# Implementation Plan for Codex

## Objective

Implement a static Astro portfolio site with a two-stage experience:

```txt
1. Plain portfolio page
2. Destructive Three.js/Rapier shatter interaction
3. Hidden glowing orb inside debris
4. Click orb to reveal retro 1990s-style portfolio
```

The result must be deployable to GitHub Pages.

## Install Dependencies

Use:

```bash
npm create astro@latest
npm install three @dimforge/rapier3d-compat gsap html2canvas
npm install -D typescript
```

`html2canvas` is optional but recommended for generating the page texture dynamically.

## Step 1: Astro Setup

Create the core Astro page at:

```txt
src/pages/index.astro
```

This page should render:

```txt
PlainPortfolio
CrackTrigger
RetroPortfolio
```

The `RetroPortfolio` should initially be hidden.

Add a client-side controller script that manages page state.

## Step 2: Modular Content

Create:

```txt
src/content/site.json
src/content/plain.md
src/content/retro.md
src/content/projects.json
```

Example `site.json`:

```json
{
  "name": "Your Name",
  "tagline": "Designer / Developer / Builder",
  "contact": {
    "email": "hello@example.com",
    "github": "https://github.com/example",
    "linkedin": "https://linkedin.com/in/example"
  },
  "footer": "Built with Astro, Three.js, and questionable taste."
}
```

Example `projects.json`:

```json
[
  {
    "title": "Project One",
    "description": "A short project description.",
    "url": "https://example.com",
    "tags": ["Astro", "Three.js"],
    "year": "2026",
    "featured": true
  }
]
```

Example `plain.md`:

```md
# Hello

I make useful digital things.

## About

This is the plain version of the site.

## Contact

You can find me online.
```

Example `retro.md`:

```md
# WELCOME TO MY HOMEPAGE!!!

You found the orb. Nice work.

## About Me

This is the secret retro version of the site.

## Projects

Click around. Everything is probably under construction.
```

Create a content-loading helper if useful:

```txt
src/lib/content.ts
```

## Step 3: Plain Portfolio

Create:

```txt
src/components/PlainPortfolio.astro
```

Requirements:

```txt
renders content from plain.md and site.json
renders projects from projects.json
uses semantic sections
has intentionally plain styling
```

Styling:

```txt
src/styles/plain.css
```

Suggested visual direction:

```txt
max-width centered column
system font
black text
white background
default-looking links
minimal spacing
```

## Step 4: Crack Trigger

Create:

```txt
src/components/CrackTrigger.astro
```

The trigger should be:

```txt
button element
visually styled as a crack
keyboard accessible
ARIA-labelled
positioned somewhere visible but not dominant
```

Example behavior:

```txt
<button id="crack-trigger" aria-label="Break the page open">
  SVG crack graphic
</button>
```

Do not use a non-button div for this interaction.

## Step 5: Shatter Canvas

Create:

```txt
src/components/ShatterCanvas.ts
```

This should export a class or function like:

```ts
export async function startShatterExperience(options: {
  sourceElement: HTMLElement;
  onOrbClicked: () => void;
  reducedMotion: boolean;
}): Promise<{
  destroy: () => void;
}>;
```

Responsibilities:

```txt
create fullscreen fixed canvas
initialize Three.js renderer, scene, camera
initialize Rapier physics world
capture sourceElement as texture
create shard meshes
create rigid bodies for shards
create hidden glowing orb
start animation loop
handle pointer interaction with orb
expose destroy cleanup function
```

## Step 6: Snapshot Texture

Preferred implementation:

```txt
Use html2canvas to render the plain page into a canvas.
Create a Three.js CanvasTexture from that canvas.
Slice the texture into shard UV regions.
Map each UV region to one shard mesh.
```

Fallback implementation:

```txt
Use a pre-rendered screenshot texture from public/assets/textures/plain-page.png.
```

Important:

```txt
The live DOM does not need to physically break.
The original page can be hidden after the snapshot is captured.
The shatter is an overlay illusion.
```

## Step 7: Shard Generation

Create:

```txt
src/lib/shatter/createShardMeshes.ts
```

Recommended approach:

```txt
divide the screen into irregular rectangular or polygonal cells
create one plane geometry per shard
assign UV coordinates matching the corresponding snapshot region
slightly extrude or bevel shards if practical
give each shard a Rapier rigid body
apply impulse from crack origin
```

Initial implementation may use irregular rectangles. Polygonal Voronoi shards are a stretch goal.

Each shard should have:

```txt
Three.js mesh
Rapier rigid body
collider
initial position matching screen region
random rotation
random angular velocity
impulse away from crack
```

## Step 8: Physics

Create:

```txt
src/lib/shatter/physicsWorld.ts
```

Use Rapier 3D.

World setup:

```ts
const gravity = { x: 0, y: -9.81, z: 0 };
```

The visual coordinate system should map screen coordinates to Three.js world coordinates.

Add invisible boundary/catch planes if needed:

```txt
floor below viewport
optional side walls
optional back plane
```

Stop or slow the simulation after the scene settles to save CPU.

## Step 9: Hidden Orb

Create:

```txt
src/lib/shatter/orb.ts
```

Orb requirements:

```txt
small sphere mesh
emissive material
point light attached to orb
subtle pulsing scale or glow
placed among shards
clickable via raycasting
keyboard fallback available through hidden accessible button
```

Suggested placement:

```txt
choose a position behind or near a cluster of shards
not at exact center
not completely off-screen
partially occluded by debris
```

Example behavior:

```txt
after 2 seconds: increase glow pulse
after 5 seconds: increase glow slightly again
on hover: cursor pointer
on click: call onOrbClicked()
```

Do not require pixel-perfect clicking. Use a larger invisible hit sphere if necessary.

## Step 10: Orb Interaction

Use Three.js Raycaster.

On pointer move:

```txt
raycast against orb hit target
set cursor to pointer if hovered
slightly intensify glow
```

On pointer down/click:

```txt
if orb hit:
  transition state to orbFound
  call onOrbClicked()
```

For accessibility, include a DOM button such as:

```html
<button id="orb-fallback-button" class="sr-only">
  Reveal the hidden retro site
</button>
```

When the shatter state begins, make this button keyboard-focusable.

## Step 11: Retro Reveal Transition

Create:

```txt
src/lib/shatter/transitions.ts
```

On orb click:

```txt
play glow burst
fade out shards/canvas
hide plain site
show retro site
destroy Three.js and Rapier resources
```

Optional transition:

```txt
CRT flicker
scanline overlay
brief static noise
palette shift
```

Do not block the reveal for too long.

## Step 12: Retro Portfolio

Create:

```txt
src/components/RetroPortfolio.astro
```

Requirements:

```txt
renders retro.md
renders projects.json in a retro style
renders fake visitor counter
renders contact links
initially hidden
becomes visible after orb click
```

Styling:

```txt
src/styles/retro.css
```

Visual ideas:

```txt
tiled star background
bright cyan/magenta/yellow accents
beveled grey panels
animated marquee-style header
pixel-like font stack
chunky link buttons
under-construction banner
fake guestbook link
fake visitor counter
```

Avoid external copyrighted images. Use CSS and original small assets.

## Step 13: Reduced Motion

Implement:

```ts
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

If reduced motion is enabled:

```txt
skip physics
show a cracked overlay
show orb or reveal button immediately
fade into retro page on activation
```

## Step 14: Cleanup

When transitioning to retro:

```txt
cancel requestAnimationFrame
remove event listeners
dispose renderer
dispose geometries
dispose materials
dispose textures
remove canvas from DOM
free Rapier world references
```

Acceptance check:

```txt
No duplicate canvases after repeated interactions
No continued animation loop after retro page appears
No console errors
```

## Step 15: GitHub Pages Deployment

Use Astro static output.

Configure `astro.config.mjs` with the correct site/base values for GitHub Pages.

Example:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://USERNAME.github.io",
  base: "/REPOSITORY_NAME"
});
```

For a user site repository named:

```txt
USERNAME.github.io
```

the base can usually be omitted or set to `/`.

Add a deploy workflow or document manual deployment.

## Stretch Goals

Only implement after the core experience works.

```txt
Voronoi shard generation
sound effects with mute control
retro guestbook parody
Konami code shortcut
secret project links hidden in debris
fragment hover interaction
mobile-specific simplified shatter
```

## Completion Checklist

```txt
[ ] Astro project builds
[ ] GitHub Pages-compatible static output
[ ] Plain page content is modular
[ ] Retro page content is modular
[ ] Crack trigger is accessible
[ ] Shatter animation runs
[ ] Shards use snapshot texture
[ ] Physics affects fragments
[ ] Orb appears among debris
[ ] Orb is clickable
[ ] Retro page reveals after orb click
[ ] Reduced-motion fallback exists
[ ] Three.js resources are cleaned up
[ ] No copyrighted Space Jam assets are used
```
