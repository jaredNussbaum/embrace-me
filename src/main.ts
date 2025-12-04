import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Box, GameObject } from "./object.ts";
import "./style.css";

const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

const speed = 2;

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
camera.position.z = 6.5;
camera.rotation.x = -0.25;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewportWidth, viewportHeight);

const canvas = renderer.domElement;
document.body.appendChild(canvas);

// SEPARATE Cannon physics setup
const world = new CANNON.World();

//add gravity
world.gravity.set(0, -9.82, 0); // x, y, z gravity

//add a new material to add friction and sliding
//i need to immortalize how poorly i spelled material in the above comment by writing
// "martereil"
//then 2 minutes later i was like lmfao who wrote that comment thats embarrasing
//it was me. i wrote that.
const defaultMaterial = new CANNON.Material("default");

const contactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.0,
    restitution: 0.0,
  },
);

world.addContactMaterial(contactMaterial);
world.defaultContactMaterial = contactMaterial;

// ######################################################
//
// 3D Mouse Events
//
// ######################################################

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function underPointer(object: GameObject): boolean {
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObject(object.mesh);
  return intersections.length > 0;
}

canvas.addEventListener("click", (event: MouseEvent) => {
  pointer.x = (event.offsetX / viewportWidth) * 2 - 1;
  pointer.y = -(event.offsetY / viewportHeight) * 2 + 1;

  if (underPointer(greenCube)) {
    console.log("GREEENENENENE");
  }

  if (underPointer(blueCube)) {
    console.log("blue...");
  }
});

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
// Player and Camera Bounds
//
// #####################################################

const BOUNDS = {
  minX: -9,
  maxX: 9,
  minY: -5,
  maxY: 5,
};

let cameraOffsetX = 0;

//when the player moves the camera shifts to their new location
const CAMERA_SHIFT_X = BOUNDS.maxX - BOUNDS.minX;

// ######################################################
//
// Player
//
// ######################################################

const purpleCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(0, 0, 0), 0x7000a0, 2);
purpleCube.body.angularVelocity.set(0, 10, 0);
purpleCube.body.angularDamping = 0.5;
purpleCube.addToGame(world, scene);

// ######################################################
//
// Environment
//
// ######################################################

const blueCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(3, 0, 0), 0x00a0ff, 2);
blueCube.addToGame(world, scene);

const greenCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(-3, 0, 0), 0x3bb143, 2);
greenCube.addToGame(world, scene);

// TODO: Find a cleaner way to do this... why doesn't cannon have a collisionEvent type already
type CollisionEvent = {
  body: CANNON.Body;
};

greenCube.body.addEventListener("collide", (collisionEvent: CollisionEvent) => {
  if (collisionEvent.body === blueCube.body) {
    winGame();
  }
});

// ######################################################
//
// Walls
//
// ######################################################

// Mass of 0 means it doesn't move!
const bottomWall = new Box(new CANNON.Vec3(19, 1, 15), new CANNON.Vec3(0, -5, 0), 0x222222, 0);
bottomWall.addToGame(world, scene);
/*
const rightWall = new Box(new CANNON.Vec3(1, 6, 11.5), new CANNON.Vec3(9, 0, 0), 0x444444, 0);
rightWall.addToGame(world, scene);

const leftWall = new Box(new CANNON.Vec3(1, 6, 11.5), new CANNON.Vec3(-9, 0, 0), 0x444444, 0);
leftWall.addToGame(world, scene);

const backWall = new Box(new CANNON.Vec3(22, 7.6, 1), new CANNON.Vec3(0, 0, -9), 0x333333, 0);
backWall.addToGame(world, scene);
*/
//add new material to all rendered shapes to prevent sticking n stuff
purpleCube.body.material = defaultMaterial;
blueCube.body.material = defaultMaterial;
greenCube.body.material = defaultMaterial;
bottomWall.body.material = defaultMaterial;
//rightWall.body.material  = defaultMaterial;
//leftWall.body.material   = defaultMaterial;
//backWall.body.material   = defaultMaterial;

// ######################################################
//
// Key Functionality
//
// ######################################################

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
  checkLose();

  //check player/camera location
  checkCameraShift();

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
function set_vz(dir: number) {
  purpleCube.body.velocity.z = speed * dir;
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
    set_vz(-1);
  } else if ((e as KeyboardEvent).key == "s") {
    set_vz(1);
  } else {
    set_vz(0);
  }
});

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

// ######################################################
//
// Camera Functionality
//
// ######################################################

function updateCameraPosition() {
  camera.position.x = cameraOffsetX;
}

function checkCameraShift() {
  const pos = purpleCube.body.position;

  // player moves to the room to the right
  if (pos.x > cameraOffsetX + BOUNDS.maxX) {
    cameraOffsetX += CAMERA_SHIFT_X;
    updateCameraPosition();
  }

  // player moves to the room on the left
  if (pos.x < cameraOffsetX + BOUNDS.minX) {
    cameraOffsetX -= CAMERA_SHIFT_X;
    updateCameraPosition();
  }
}
