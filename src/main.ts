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

// Make Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xaa00aa });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// Game Loop
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
