type ExperienceState = "plain" | "cracking" | "shattered" | "orbFound" | "retro";

const root = document.documentElement;
const plainSite = document.querySelector<HTMLElement>("#plain-site");
const retroSite = document.querySelector<HTMLElement>("#retro-site");
const crackTrigger = document.querySelector<HTMLButtonElement>("#crack-trigger");
const orbFallbackButton = document.querySelector<HTMLButtonElement>("#orb-fallback-button");
const liveStatus = document.querySelector<HTMLElement>("#experience-status");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let state: ExperienceState = "plain";
let reducedMotion = reducedMotionQuery.matches;
let crackTimer = 0;
let shatterHandle: { destroy: () => void } | undefined;
let revealStarted = false;

function announce(message: string) {
  if (liveStatus) {
    liveStatus.textContent = message;
  }
}

function setState(nextState: ExperienceState) {
  state = nextState;
  root.dataset.experienceState = nextState;
}

function setPageInteraction(disabled: boolean) {
  if (!plainSite) return;

  if (disabled) {
    plainSite.setAttribute("aria-hidden", "true");
    plainSite.inert = true;
    return;
  }

  plainSite.removeAttribute("aria-hidden");
  plainSite.inert = false;
}

function showOrbFallback(visible: boolean, prominent = false) {
  if (!orbFallbackButton) return;

  orbFallbackButton.hidden = !visible;
  orbFallbackButton.tabIndex = visible ? 0 : -1;
  orbFallbackButton.classList.toggle("is-prominent", prominent);
}

function focusRetroTitle() {
  const retroTitle = document.querySelector<HTMLElement>("#retro-title");
  retroTitle?.setAttribute("tabindex", "-1");
  retroTitle?.focus({ preventScroll: true });
}

async function revealRetro() {
  if (state === "retro" || revealStarted) return;

  revealStarted = true;
  window.clearTimeout(crackTimer);
  setState("orbFound");
  announce("Retro site revealed.");

  try {
    const { playRetroRevealTransition } = await import("../lib/shatter/transitions");
    await playRetroRevealTransition({ reducedMotion });
  } catch (error) {
    console.error("Unable to play retro reveal transition", error);
  } finally {
    shatterHandle?.destroy();
    shatterHandle = undefined;
  }

  if (plainSite) {
    plainSite.hidden = true;
  }

  if (crackTrigger) {
    crackTrigger.hidden = true;
  }

  showOrbFallback(false);
  setPageInteraction(false);

  if (retroSite) {
    retroSite.hidden = false;
  }

  requestAnimationFrame(() => {
    setState("retro");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    focusRetroTitle();
    revealStarted = false;
  });
}

async function beginCrack() {
  if (state !== "plain") return;

  setState("cracking");
  setPageInteraction(true);
  crackTrigger?.setAttribute("aria-expanded", "true");
  announce("The page has cracked open.");

  if (reducedMotion) {
    showOrbFallback(true, true);
    orbFallbackButton?.focus();
    return;
  }

  try {
    const { startShatterExperience } = await import("../components/ShatterCanvas");
    shatterHandle = await startShatterExperience({
      sourceElement: plainSite ?? document.body,
      reducedMotion,
      onOrbClicked: revealRetro
    });

    setState("shattered");
    showOrbFallback(true);
    announce("The shattered page contains a hidden orb.");
  } catch (error) {
    console.error("Unable to start shatter experience", error);
    setState("shattered");
    showOrbFallback(true, true);
    announce("A reveal control is available.");
  }
}

function handleMotionPreferenceChange(event: MediaQueryListEvent) {
  reducedMotion = event.matches;

  if (reducedMotion && (state === "cracking" || state === "shattered")) {
    window.clearTimeout(crackTimer);
    shatterHandle?.destroy();
    shatterHandle = undefined;
    setState("shattered");
    showOrbFallback(true, true);
  }
}

root.dataset.reducedMotion = String(reducedMotion);
root.dataset.experienceState = state;
orbFallbackButton?.setAttribute("tabindex", "-1");
crackTrigger?.setAttribute("aria-controls", "retro-site");
crackTrigger?.setAttribute("aria-expanded", "false");

crackTrigger?.addEventListener("click", beginCrack);
orbFallbackButton?.addEventListener("click", revealRetro);
reducedMotionQuery.addEventListener("change", (event) => {
  root.dataset.reducedMotion = String(event.matches);
  handleMotionPreferenceChange(event);
});
