import { gsap } from "gsap";
import html2canvas from "html2canvas";
import {
  AmbientLight,
  CanvasTexture,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer
} from "three";
import { createShardMeshes, type ShardMesh } from "../lib/shatter/createShardMeshes";
import { createHiddenOrb, type HiddenOrb } from "../lib/shatter/orb";
import { createPhysicsWorld, type ShardPhysicsWorld } from "../lib/shatter/physicsWorld";

export interface StartShatterOptions {
  sourceElement: HTMLElement;
  onOrbClicked: () => void;
  reducedMotion: boolean;
}

export interface ShatterHandle {
  destroy: () => void;
}

function getShardCount() {
  const width = window.innerWidth;

  if (width < 640) return 36;
  if (width < 1024) return 72;
  return 120;
}

export async function startShatterExperience(options: StartShatterOptions): Promise<ShatterHandle> {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const snapshot = await html2canvas(options.sourceElement, {
    backgroundColor: "#fdfcf8",
    scale: Math.min(window.devicePixelRatio, 2),
    width: viewportWidth,
    height: viewportHeight,
    windowWidth: viewportWidth,
    windowHeight: viewportHeight,
    scrollX: 0,
    scrollY: -window.scrollY
  });

  const canvasHost = document.createElement("div");
  canvasHost.className = "shatter-host";
  canvasHost.setAttribute("aria-label", "Shattered page debris with a hidden glowing orb");
  document.body.append(canvasHost);

  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.outputColorSpace = SRGBColorSpace;
  canvasHost.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, viewportWidth / viewportHeight, 0.1, 1600);
  camera.position.z = 500;
  const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const cameraScale = viewportHeight / visibleHeight;
  camera.zoom = cameraScale;
  camera.updateProjectionMatrix();

  const texture = new CanvasTexture(snapshot);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  const shards = createShardMeshes({
    texture,
    viewportWidth,
    viewportHeight,
    shardCount: options.reducedMotion ? 24 : getShardCount()
  });

  scene.add(new AmbientLight(0xffffff, 1));
  shards.forEach((shard) => scene.add(shard));

  let frame = 0;
  let destroyed = false;
  let physicsWorld: ShardPhysicsWorld | undefined;
  let hiddenOrb: HiddenOrb | undefined;
  let physicsActive = !options.reducedMotion;
  const startedAt = performance.now();

  function render() {
    if (destroyed) return;

    if (physicsActive && physicsWorld) {
      physicsWorld.step();
      physicsWorld.syncMeshes();

      if (physicsWorld.isSettled()) {
        physicsActive = false;
      }
    }

    hiddenOrb?.update((performance.now() - startedAt) / 1000);
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  }

  function destroyShard(shard: ShardMesh) {
    scene.remove(shard);
    shard.geometry.dispose();
    shard.material.dispose();
  }

  const timeline = gsap.timeline({ paused: !options.reducedMotion });
  timeline.to(
    shards.map((shard) => shard.position),
    {
      x: (index) => shards[index].userData.scatterX,
      y: (index) => shards[index].userData.scatterY,
      z: (index) => shards[index].userData.scatterZ,
      duration: options.reducedMotion ? 0.2 : 1.1,
      ease: "power3.out",
      stagger: options.reducedMotion ? 0 : 0.002
    },
    0
  );
  timeline.to(
    shards.map((shard) => shard.rotation),
    {
      x: (index) => shards[index].userData.rotationX,
      y: (index) => shards[index].userData.rotationY,
      z: (index) => shards[index].userData.rotationZ,
      duration: options.reducedMotion ? 0.2 : 1.1,
      ease: "power3.out",
      stagger: options.reducedMotion ? 0 : 0.002
    },
    0
  );

  if (!options.reducedMotion) {
    physicsWorld = await createPhysicsWorld(shards, viewportWidth, viewportHeight);
    hiddenOrb = createHiddenOrb({
      scene,
      camera,
      canvas: renderer.domElement,
      viewportWidth,
      viewportHeight,
      onClicked: options.onOrbClicked
    });
  }

  render();

  return {
    destroy() {
      if (destroyed) return;

      destroyed = true;
      window.cancelAnimationFrame(frame);
      timeline.kill();
      hiddenOrb?.destroy();
      physicsWorld?.destroy();
      shards.forEach(destroyShard);
      texture.dispose();
      renderer.dispose();
      canvasHost.remove();
    }
  };
}
