import RAPIER from "@dimforge/rapier3d-compat";
import { Euler, Quaternion } from "three";
import type { ShardMesh } from "./createShardMeshes";

const WORLD_SCALE = 100;
const SHARD_DEPTH = 8;
const BOUNDARY_THICKNESS = 96;
const MAX_TILT_RADIANS = Math.PI / 7;

export interface ShardPhysicsWorld {
  step: () => void;
  syncMeshes: () => void;
  isSettled: () => boolean;
  destroy: () => void;
}

function toWorld(value: number) {
  return value / WORLD_SCALE;
}

function toScreen(value: number) {
  return value * WORLD_SCALE;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function createPhysicsWorld(
  shards: ShardMesh[],
  viewportWidth: number,
  viewportHeight: number
): Promise<ShardPhysicsWorld> {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const bodies = shards.map((shard) => {
    const bodyRotation = new Quaternion().setFromEuler(shard.rotation);
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(toWorld(shard.position.x), toWorld(shard.position.y), 0)
        .setRotation(bodyRotation)
        .enabledTranslations(true, true, false)
        .enabledRotations(true, true, true)
        .setLinearDamping(0.18)
        .setAngularDamping(1.35)
        .setCanSleep(true)
    );

    const width = shard.geometry.parameters.width;
    const height = shard.geometry.parameters.height;
    const collider = RAPIER.ColliderDesc.cuboid(
      toWorld(width / 2),
      toWorld(height / 2),
      toWorld(SHARD_DEPTH / 2)
    )
      .setDensity(0.7)
      .setFriction(0.74)
      .setRestitution(0.22);

    world.createCollider(collider, body);

    const impulseX = toWorld(shard.userData.scatterX - shard.position.x) * (0.28 + Math.random() * 0.12);
    const impulseY = toWorld(shard.userData.scatterY - shard.position.y) * (0.18 + Math.random() * 0.1);

    body.applyImpulse({ x: impulseX, y: impulseY, z: 0 }, true);
    body.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * 0.018,
        y: (Math.random() - 0.5) * 0.018,
        z: (Math.random() - 0.5) * 0.065
      },
      true
    );

    return body;
  });

  const boundaryDepth = 320;
  const largestShardHalfExtent = shards.reduce((largest, shard) => {
    const width = shard.geometry.parameters.width;
    const height = shard.geometry.parameters.height;

    return Math.max(largest, width / 2, height / 2);
  }, 0);
  const inset = largestShardHalfExtent + 2;
  const halfPlayableWidth = Math.max(1, viewportWidth / 2 - inset);
  const halfPlayableHeight = Math.max(1, viewportHeight / 2 - inset);
  const horizontalHalfWidth = halfPlayableWidth + BOUNDARY_THICKNESS;
  const verticalHalfHeight = halfPlayableHeight + BOUNDARY_THICKNESS;

  const floor = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, toWorld(-halfPlayableHeight - BOUNDARY_THICKNESS / 2), 0)
  );
  const ceiling = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, toWorld(halfPlayableHeight + BOUNDARY_THICKNESS / 2), 0)
  );
  const leftWall = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(toWorld(-halfPlayableWidth - BOUNDARY_THICKNESS / 2), 0, 0)
  );
  const rightWall = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(toWorld(halfPlayableWidth + BOUNDARY_THICKNESS / 2), 0, 0)
  );

  function createHorizontalBoundary() {
    return RAPIER.ColliderDesc.cuboid(
      toWorld(horizontalHalfWidth),
      toWorld(BOUNDARY_THICKNESS / 2),
      toWorld(boundaryDepth)
    ).setFriction(0.92);
  }

  function createVerticalBoundary() {
    return RAPIER.ColliderDesc.cuboid(
      toWorld(BOUNDARY_THICKNESS / 2),
      toWorld(verticalHalfHeight),
      toWorld(boundaryDepth)
    ).setFriction(0.92);
  }

  world.createCollider(createHorizontalBoundary(), floor);
  world.createCollider(createHorizontalBoundary(), ceiling);
  world.createCollider(createVerticalBoundary(), leftWall);
  world.createCollider(createVerticalBoundary(), rightWall);

  let steps = 0;

  return {
    step() {
      if (steps > 900) return;

      world.step();
      steps += 1;
    },
    syncMeshes() {
      bodies.forEach((body, index) => {
        const shard = shards[index];
        const translation = body.translation();
        const rotation = body.rotation();
        const clampedEuler = new Euler().setFromQuaternion(
          new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
          "XYZ"
        );

        const width = shard.geometry.parameters.width;
        const height = shard.geometry.parameters.height;
        const minX = viewportWidth / -2 + width / 2;
        const maxX = viewportWidth / 2 - width / 2;
        const minY = viewportHeight / -2 + height / 2;
        const maxY = viewportHeight / 2 - height / 2;
        const x = clamp(toScreen(translation.x), minX, maxX);
        const y = clamp(toScreen(translation.y), minY, maxY);

        if (x !== toScreen(translation.x) || y !== toScreen(translation.y)) {
          body.setTranslation({ x: toWorld(x), y: toWorld(y), z: 0 }, true);
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }

        shard.position.set(x, y, 0);
        clampedEuler.x = Math.max(-MAX_TILT_RADIANS, Math.min(MAX_TILT_RADIANS, clampedEuler.x));
        clampedEuler.y = Math.max(-MAX_TILT_RADIANS, Math.min(MAX_TILT_RADIANS, clampedEuler.y));
        shard.quaternion.setFromEuler(clampedEuler);
      });
    },
    isSettled() {
      return steps > 240 && bodies.every((body) => body.isSleeping());
    },
    destroy() {
      world.free();
    }
  };
}
