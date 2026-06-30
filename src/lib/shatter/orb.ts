import {
  AdditiveBlending,
  BackSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2
} from "three";

export interface HiddenOrb {
  group: Group;
  update: (elapsedSeconds: number) => void;
  destroy: () => void;
}

export interface CreateHiddenOrbOptions {
  scene: Scene;
  camera: PerspectiveCamera;
  canvas: HTMLCanvasElement;
  viewportWidth: number;
  viewportHeight: number;
  onClicked: () => void;
}

export function createHiddenOrb(options: CreateHiddenOrbOptions): HiddenOrb {
  const group = new Group();
  const x = options.viewportWidth * 0.18;
  const y = options.viewportHeight * -0.12;
  const z = 58;
  group.position.set(x, y, z);

  const orbGeometry = new SphereGeometry(18, 32, 16);
  const orbMaterial = new MeshStandardMaterial({
    color: "#7fffd4",
    emissive: "#00ffd5",
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.05
  });
  const orb = new Mesh(orbGeometry, orbMaterial);

  const glowGeometry = new SphereGeometry(38, 32, 16);
  const glowMaterial = new MeshBasicMaterial({
    color: "#00ffd5",
    transparent: true,
    opacity: 0.14,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false
  });
  const glow = new Mesh(glowGeometry, glowMaterial);

  const hitGeometry = new SphereGeometry(44, 16, 8);
  const hitMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const hitTarget = new Mesh(hitGeometry, hitMaterial);
  hitTarget.name = "hidden-orb-hit-target";

  const light = new PointLight("#00ffd5", 1.1, 220);
  group.add(glow, orb, hitTarget, light);
  options.scene.add(group);

  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let hovered = false;
  let destroyed = false;

  function setPointer(event: PointerEvent) {
    const rect = options.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function intersectsOrb(event: PointerEvent) {
    setPointer(event);
    raycaster.setFromCamera(pointer, options.camera);
    return raycaster.intersectObject(hitTarget, false).length > 0;
  }

  function handlePointerMove(event: PointerEvent) {
    if (destroyed) return;

    hovered = intersectsOrb(event);
    options.canvas.style.cursor = hovered ? "pointer" : "";
  }

  function handlePointerDown(event: PointerEvent) {
    if (destroyed || !intersectsOrb(event)) return;

    event.preventDefault();
    options.onClicked();
  }

  options.canvas.addEventListener("pointermove", handlePointerMove);
  options.canvas.addEventListener("pointerdown", handlePointerDown);

  return {
    group,
    update(elapsedSeconds: number) {
      const delayBoost = elapsedSeconds > 5 ? 0.55 : elapsedSeconds > 2 ? 0.28 : 0;
      const pulse = (Math.sin(elapsedSeconds * 3.1) + 1) / 2;
      const hoverBoost = hovered ? 0.5 : 0;
      const intensity = 0.7 + delayBoost + hoverBoost + pulse * 0.35;

      orbMaterial.emissiveIntensity = intensity;
      glowMaterial.opacity = 0.1 + delayBoost * 0.16 + hoverBoost * 0.16 + pulse * 0.12;
      glow.scale.setScalar(0.92 + pulse * 0.16 + delayBoost * 0.1);
      group.rotation.y += 0.006;
      light.intensity = 1 + delayBoost + hoverBoost + pulse * 0.5;
    },
    destroy() {
      destroyed = true;
      options.canvas.removeEventListener("pointermove", handlePointerMove);
      options.canvas.removeEventListener("pointerdown", handlePointerDown);
      options.canvas.style.cursor = "";
      options.scene.remove(group);
      orbGeometry.dispose();
      orbMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      hitGeometry.dispose();
      hitMaterial.dispose();
    }
  };
}
