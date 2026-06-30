export interface RetroRevealTransitionOptions {
  reducedMotion: boolean;
}

function wait(duration: number) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export async function playRetroRevealTransition(options: RetroRevealTransitionOptions) {
  if (options.reducedMotion) {
    await wait(80);
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "retro-transition";
  overlay.setAttribute("aria-hidden", "true");
  document.body.append(overlay);

  await wait(20);
  overlay.classList.add("is-active");
  await wait(560);
  overlay.classList.remove("is-active");
  await wait(180);
  overlay.remove();
}
