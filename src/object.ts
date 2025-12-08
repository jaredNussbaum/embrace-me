import * as CANNON from "cannon-es";
import * as THREE from "three";

let nextID: number = 0;

class GameObject {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  id: number; // every object has a unique ID
  constructor(physicsbody: CANNON.Body, mesh: THREE.Mesh) {
    this.body = physicsbody;
    this.mesh = mesh;
    this.id = nextID;
    nextID++;
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

export interface PlayerInputFlags {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

class Player extends Box {
  speed: number;
  isGrounded: boolean;
  constructor(size: CANNON.Vec3, position: CANNON.Vec3, color: THREE.ColorRepresentation, mass: number, speed: number) {
    super(size, position, color, mass);

    this.speed = speed;
    this.isGrounded = true;

    this.body.angularVelocity.set(0, 10, 0); // for fun!!
    this.body.angularDamping = 0.6;
  }
  set_vx(dir: number) {
    this.body.velocity.x = this.speed * dir;
  }
  set_vz(dir: number) {
    this.body.velocity.z = this.speed * dir;
  }
  jump() {
    this.body.velocity.y = 9; // jump height
  }
  processInput(input: PlayerInputFlags) {
    if (input.right) this.set_vx(1);
    else if (input.left) this.set_vx(-1);
    else if (!input.right && !input.left) this.set_vx(0);

    if (input.up) this.set_vz(-1);
    else if (input.down) this.set_vz(1);
    else if (!input.up && !input.down) this.set_vz(0);

    // Jump
    if (input.jump) {
      if (this.isGrounded) {
        this.jump();
        this.isGrounded = false;
      }
    }
  }
}

export { Box, GameObject, Player };
