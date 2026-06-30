import {
  BufferAttribute,
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from "three";

export type ShardMesh = Mesh<PlaneGeometry, MeshBasicMaterial>;

export interface CreateShardMeshesOptions {
  texture: CanvasTexture;
  viewportWidth: number;
  viewportHeight: number;
  shardCount: number;
}

interface ShardCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

function jitter(value: number, amount: number) {
  return value + (Math.random() - 0.5) * amount;
}

function createCells(viewportWidth: number, viewportHeight: number, shardCount: number) {
  const aspect = viewportWidth / viewportHeight;
  const columns = Math.max(4, Math.round(Math.sqrt(shardCount * aspect)));
  const rows = Math.max(4, Math.ceil(shardCount / columns));
  const cellWidth = viewportWidth / columns;
  const cellHeight = viewportHeight / rows;
  const cells: ShardCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cellWidth;
      const y = row * cellHeight;
      const rightEdge = column === columns - 1;
      const bottomEdge = row === rows - 1;

      cells.push({
        x: rightEdge ? x : Math.max(0, jitter(x, cellWidth * 0.2)),
        y: bottomEdge ? y : Math.max(0, jitter(y, cellHeight * 0.2)),
        width: rightEdge ? viewportWidth - x : cellWidth * (0.86 + Math.random() * 0.24),
        height: bottomEdge ? viewportHeight - y : cellHeight * (0.86 + Math.random() * 0.24)
      });
    }
  }

  return cells.slice(0, shardCount);
}

function applyShardUv(
  geometry: PlaneGeometry,
  cell: ShardCell,
  viewportWidth: number,
  viewportHeight: number
) {
  const u0 = cell.x / viewportWidth;
  const u1 = (cell.x + cell.width) / viewportWidth;
  const vTop = 1 - cell.y / viewportHeight;
  const vBottom = 1 - (cell.y + cell.height) / viewportHeight;

  geometry.setAttribute(
    "uv",
    new BufferAttribute(
      new Float32Array([
        u0,
        vTop,
        u1,
        vTop,
        u0,
        vBottom,
        u1,
        vBottom
      ]),
      2
    )
  );
}

export function createShardMeshes(options: CreateShardMeshesOptions) {
  const cells = createCells(options.viewportWidth, options.viewportHeight, options.shardCount);

  return cells.map((cell) => {
    const geometry = new PlaneGeometry(cell.width, cell.height);
    applyShardUv(geometry, cell, options.viewportWidth, options.viewportHeight);

    const material = new MeshBasicMaterial({
      map: options.texture,
      side: DoubleSide
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.set(
      cell.x + cell.width / 2 - options.viewportWidth / 2,
      options.viewportHeight / 2 - cell.y - cell.height / 2,
      Math.random() * 8
    );
    mesh.rotation.z = (Math.random() - 0.5) * 0.08;
    mesh.userData.initialX = mesh.position.x;
    mesh.userData.initialY = mesh.position.y;
    mesh.userData.scatterX = mesh.position.x + (Math.random() - 0.5) * options.viewportWidth * 0.22;
    mesh.userData.scatterY = mesh.position.y - Math.random() * options.viewportHeight * 0.22;
    mesh.userData.scatterZ = 80 + Math.random() * 160;
    mesh.userData.rotationX = (Math.random() - 0.5) * 1.6;
    mesh.userData.rotationY = (Math.random() - 0.5) * 1.6;
    mesh.userData.rotationZ = (Math.random() - 0.5) * 0.8;

    return mesh;
  });
}
