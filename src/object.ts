import * as CANNON from "cannon-es";
import * as THREE from "three";

class GameObject {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  constructor(physicsbody: CANNON.Body, mesh: THREE.Mesh) {
    this.body = physicsbody;
    this.mesh = mesh;
  }
  addToGame(world: CANNON.World, scene: THREE.Scene) {
    world.addBody(this.body);
    scene.add(this.mesh);
  }
  updateMesh() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

class Box extends GameObject {
  constructor(size: CANNON.Vec3, position: CANNON.Vec3, color: THREE.ColorRepresentation, mass: number) {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const render = new THREE.Mesh(geo, mat);

    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
    const shape = new CANNON.Box(halfExtents);
    const body = new CANNON.Body({
      mass: mass,
      angularDamping: 1,
      linearDamping: 0.9,
    });
    body.addShape(shape);

    render.position.copy(position);
    body.position.copy(position);

    super(body, render);
  }
}

export { Box, GameObject };
