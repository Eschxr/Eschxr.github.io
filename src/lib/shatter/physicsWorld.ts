import RAPIER from "@dimforge/rapier3d-compat";
import { Quaternion } from "three";
import type { ShardMesh } from "./createShardMeshes";

const WORLD_SCALE = 100;
const SHARD_DEPTH = 8;

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
        .setTranslation(toWorld(shard.position.x), toWorld(shard.position.y), toWorld(shard.position.z))
        .setRotation(bodyRotation)
        .setLinearDamping(0.18)
        .setAngularDamping(0.2)
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

    const impulseX = toWorld(shard.userData.scatterX - shard.position.x) * (1.8 + Math.random());
    const impulseY = toWorld(shard.userData.scatterY - shard.position.y) * (1.2 + Math.random());
    const impulseZ = toWorld(shard.userData.scatterZ) * (0.45 + Math.random() * 0.4);

    body.applyImpulse({ x: impulseX, y: impulseY, z: impulseZ }, true);
    body.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * 0.45,
        y: (Math.random() - 0.5) * 0.45,
        z: (Math.random() - 0.5) * 0.4
      },
      true
    );

    return body;
  });

  const floor = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, toWorld(viewportHeight / -2 - 72), 0)
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(toWorld(viewportWidth), toWorld(24), toWorld(220)).setFriction(0.9),
    floor
  );

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

        shard.position.set(toScreen(translation.x), toScreen(translation.y), toScreen(translation.z));
        shard.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
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
