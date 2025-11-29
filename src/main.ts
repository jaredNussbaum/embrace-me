import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Box } from "./object.ts";
import "./style.css";

const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

const speed = 2;

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewportWidth, viewportHeight);

const canvas = renderer.domElement;
document.body.appendChild(canvas);

// SEPARATE Cannon physics setup
const world = new CANNON.World();

// ######################################################
//
// Player
//
// ######################################################

const purpleCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(0, 0, 0), 0x7000a0);
purpleCube.body.angularVelocity.set(0, 10, 0);
purpleCube.body.angularDamping = 0.5;
purpleCube.addToGame(world, scene);

// ######################################################
//
// Environment
//
// ######################################################

const blueCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(3, 0, 0), 0x00a0ff);
blueCube.addToGame(world, scene);

// ######################################################
//
// Game Loop
//
// ######################################################

function animate() {
  world.fixedStep();

  purpleCube.updateMesh();
  blueCube.updateMesh();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ######################################################
//
// Cube Movement
//
// ######################################################

function set_vx(dir: number) {
  purpleCube.body.velocity.x = speed * dir;
}
function set_vy(dir: number) {
  purpleCube.body.velocity.y = speed * dir;
}

document.addEventListener("keydown", (e) => {
  if ((e as KeyboardEvent).key == "d") {
    set_vx(1);
  } else if ((e as KeyboardEvent).key == "a") {
    set_vx(-1);
  } else {
    set_vx(0);
  }

  if ((e as KeyboardEvent).key == "w") {
    set_vy(1);
  } else if ((e as KeyboardEvent).key == "s") {
    set_vy(-1);
  } else {
    set_vy(0);
  }
});
