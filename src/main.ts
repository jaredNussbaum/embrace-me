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
// Text
//
// ######################################################

const ui = document.createElement("div");
ui.id = "ui-text";
ui.style.position = "fixed";
ui.style.top = "20px";
ui.style.left = "20px";
ui.style.color = "white";
ui.style.fontSize = "32px";
ui.style.fontFamily = "Arial";
ui.innerText = "Move the blue cube to the green cube to win!\nControls: WASD to Move; SPACE to Stop";
document.body.appendChild(ui);

// ######################################################
//
// Player Bounds
//
// #####################################################

const BOUNDS = {
  minX: -8,
  maxX: 8,
  minY: -5,
  maxY: 5,
};

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

const greenCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(-3, 0, 0), 0x3bb143);
greenCube.addToGame(world, scene);

// ######################################################
//
// Game Loop
//
// ######################################################

function animate() {
  world.fixedStep();

  purpleCube.updateMesh();
  blueCube.updateMesh();
  greenCube.updateMesh();

  //check the win/lose condition every frame
  checkWin();
  checkLose();

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

// ######################################################
//
// Check for Win Condition
//
// ######################################################

function checkWin() {
  const bluePos = blueCube.body.position;
  const greenPos = greenCube.body.position;

  const dx = bluePos.x - greenPos.x;
  const dy = bluePos.y - greenPos.y;
  const dz = bluePos.z - greenPos.z;

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distance < 1.2) {
    console.log("winna winna chicken dinnaaaaaaa");
    winGame();
  }
}

// ######################################################
//
// Win Screen
//
// ######################################################

function winGame() {
  //ok so um rn this isnt chnaging th ebackground color and i think it has to do with css but im scared 🥺
  //document.body.style.backgroundColor = "green";

  const ui = document.getElementById("ui-text");
  if (ui) ui.innerText = "YOU WON!";

  purpleCube.body.velocity.set(0, 0, 0);
  purpleCube.body.angularVelocity.set(0, 0, 0);

  blueCube.body.velocity.set(0, 0, 0);
  blueCube.body.angularVelocity.set(0, 0, 0);
}

// ######################################################
//
// Check Lose Conditions
//
// ######################################################

function checkLose() {
  const bluePos = blueCube.body.position;

  if (
    bluePos.x < BOUNDS.minX ||
    bluePos.x > BOUNDS.maxX ||
    bluePos.y < BOUNDS.minY ||
    bluePos.y > BOUNDS.maxY
  ) {
    loseGame();
  }
}

// ######################################################
//
// Lose Screen
//
// ######################################################

function loseGame() {
  const ui = document.getElementById("ui-text");
  if (ui) ui.innerText = "Game Over - Cube Has Left The Bounds";
}
