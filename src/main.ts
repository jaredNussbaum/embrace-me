import * as CANNON from "cannon-es";
import * as THREE from "three";
import "./style.css";

const speed = 2;
// Screen Size Constants
const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewportWidth, viewportHeight);

const canvas = renderer.domElement;
document.body.appendChild(canvas);

// Make Three.js Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xaa00aa });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// SEPARATE Cannon physics setup
const world = new CANNON.World();

// Make cannon.js rigidbody for the cube
const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
const body = new CANNON.Body({ mass: 1 });
body.addShape(shape);
body.angularVelocity.set(0, 10, 0);
body.angularDamping = 0.5;
world.addBody(body);

// ######################################################
//
// Environment
//
// ######################################################

function create_object(size: CANNON.Vec3, position: CANNON.Vec3) {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = new THREE.MeshBasicMaterial({ color: 111100 });
  const render = new THREE.Mesh(geo, mat);

  const shape = new CANNON.Box(size);
  const body = new CANNON.Body({ mass: 20000, type: 2 });
  body.addShape(shape);

  render.position.copy(position);
  body.position.copy(position);

  world.addBody(body);
  scene.add(render);
}
create_object(new CANNON.Vec3(1, 2, 2), new CANNON.Vec3(3, 1, 0));

// ######################################################
//
//
//
// ######################################################

// Game Loop
function animate() {
  match_all_renders_constant();

  world.fixedStep();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

function match_render_to_body(render: THREE.Mesh, body: CANNON.Body) {
  render.position.copy(body.position);
  render.quaternion.copy(body.quaternion);
}

function match_all_renders_constant() {
  match_render_to_body(cube, body);
}

function move_cube_x(dir: number) {
  body.velocity.x = speed * dir;
}
function move_cube_y(dir: number) {
  body.velocity.y = speed * dir;
}

document.addEventListener("keydown", (e) => {
  if ((e as KeyboardEvent).key == "d") {
    move_cube_x(1);
  } else if ((e as KeyboardEvent).key == "a") {
    move_cube_x(-1);
  } else {
    body.velocity.x = 0;
  }

  if ((e as KeyboardEvent).key == "w") {
    move_cube_y(1);
  } else if ((e as KeyboardEvent).key == "s") {
    move_cube_y(-1);
  } else {
    body.velocity.y = 0;
  }
});
