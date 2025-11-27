import * as CANNON from "cannon-es";
import * as THREE from "three";
import "./style.css";

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

// Game Loop
function animate() {
  // adjust rendered cube to match the rigidbody
  cube.position.copy(body.position);
  cube.quaternion.copy(body.quaternion);

  world.fixedStep();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
