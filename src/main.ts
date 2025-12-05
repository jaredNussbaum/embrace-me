// deno-lint-ignore-file
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Box, GameObject } from "./object.ts";
import "./style.css";

const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

const speed = 2;
let has_key = false;

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
const defaultMaterial = new CANNON.Material("default");

const contactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.0,
    restitution: 0.0,
    frictionEquationRelaxation: 3,
    frictionEquationStiffness: 1e7,
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

  if (underPointer(keyCube)) {
    alert("You've picked up the key!");
    has_key = true;

    //explode the key cube
    scene.remove(keyCube.mesh);
    world.removeBody(keyCube.body);
  }

  if (underPointer(chestCube)) {
    if (has_key === false) {
      alert("You need the key to unlock this chest!");
    } else {
      alert("you've unlocked the chest! You Win!");
      winGame();
    }
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
ui.innerText = "Collect the key and open the chest to win!!\nControls: WASD to Move; SPACE to Jump";
document.body.appendChild(ui);

const uiHint = document.createElement("div");
uiHint.id = "ui-hint";
uiHint.style.position = "fixed";
uiHint.style.top = "20px";
uiHint.style.right = "20px"; // top-right corner
uiHint.style.color = "white";
uiHint.style.fontSize = "28px";
uiHint.style.fontFamily = "Arial";
uiHint.style.textAlign = "right";
uiHint.innerText = ""; // starts empty
document.body.appendChild(uiHint);

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

const keyCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(-20, 0, 0), 0xfff135, 2);
keyCube.addToGame(world, scene);

const chestCube = new Box(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(20, 0, 0), 0x7b3f00, 2);
chestCube.addToGame(world, scene);

// TODO: Find a cleaner way to do this... why doesn't cannon have a collisionEvent type already
type CollisionEvent = {
  body: CANNON.Body;
};

purpleCube.body.material = defaultMaterial;
blueCube.body.material = defaultMaterial;
greenCube.body.material = defaultMaterial;

purpleCube.body.fixedRotation = true;
greenCube.body.fixedRotation = true;
blueCube.body.fixedRotation = true;

//fix the weight
purpleCube.body.linearDamping = 0.9;
purpleCube.body.angularDamping = 0.7;

blueCube.body.linearDamping = 0.9;
blueCube.body.angularDamping = 1;

greenCube.body.linearDamping = 0.9;
greenCube.body.angularDamping = 1;

// ######################################################
//
// Walls
//
// ######################################################

// Mass of 0 means it doesn't move!
const bottomWall = new Box(new CANNON.Vec3(55, 1, 15), new CANNON.Vec3(0, -4, 0), 0x222222, 0);
bottomWall.addToGame(world, scene);

const rightWall = new Box(new CANNON.Vec3(1, 8, 20), new CANNON.Vec3(9, -1, 1.5), 0x444444, 0);
rightWall.addToGame(world, scene);

const door = new Box(new CANNON.Vec3(1, 5, 3), new CANNON.Vec3(8.5, -1, -2), 0x7b3f00, 0);
door.addToGame(world, scene);

/*
const rightWall = new Box(new CANNON.Vec3(1, 8, 4), new CANNON.Vec3(9, -1, 1.5), 0x444444, 0);
rightWall.addToGame(world, scene);

const rightWall2 = new Box(new CANNON.Vec3(1, 2, 2), new CANNON.Vec3(9, 2, -1.5), 0x444444, 0);
rightWall2.addToGame(world, scene);

const rightWall3 = new Box(new CANNON.Vec3(1, 8, 5), new CANNON.Vec3(9, -1, -5), 0x444444, 0);
rightWall3.addToGame(world, scene);
*/

const leftWall = new Box(new CANNON.Vec3(1, 8, 4), new CANNON.Vec3(-9, -1, 1.5), 0x444444, 0);
leftWall.addToGame(world, scene);

const leftWall2 = new Box(new CANNON.Vec3(1, 3.5, 2), new CANNON.Vec3(-9, -3, -1.5), 0xffffff, 0);
leftWall2.addToGame(world, scene);

const leftWall3 = new Box(new CANNON.Vec3(1, 8, 5), new CANNON.Vec3(-9, -1, -5), 0x444444, 0);
leftWall3.addToGame(world, scene);

const backWall = new Box(new CANNON.Vec3(50, 8, 1), new CANNON.Vec3(0, -1, -8), 0x333333, 0);
backWall.addToGame(world, scene);

//other wroom walls
const rightRoomWall = new Box(new CANNON.Vec3(1, 8, 11.5), new CANNON.Vec3(25, -1, -1.5), 0x444444, 0);
rightRoomWall.addToGame(world, scene);

const leftRoomWall = new Box(new CANNON.Vec3(1, 8, 11.5), new CANNON.Vec3(-25, -1, -1.5), 0x444444, 0);
leftRoomWall.addToGame(world, scene);

const step = new Box(new CANNON.Vec3(1, 1, 2), new CANNON.Vec3(-10, -3, -1.5), 0x444444, 0);
step.addToGame(world, scene);

//add new material to all rendered shapes to prevent sticking n stuff
bottomWall.body.material = defaultMaterial;
rightWall.body.material = defaultMaterial;
leftWall.body.material = defaultMaterial;
backWall.body.material = defaultMaterial;
rightRoomWall.body.material = defaultMaterial;
leftRoomWall.body.material = defaultMaterial;
step.body.material = defaultMaterial;

// ######################################################
//
// Game Loop
//
// ######################################################

function animate() {
  processInput();
  world.fixedStep();

  purpleCube.updateMesh();
  blueCube.updateMesh();
  greenCube.updateMesh();
  keyCube.updateMesh();
  chestCube.updateMesh();

  //check the win/lose condition every frame
  checkLose();

  //check player/camera location
  checkCameraShift();

  //display some hints meyhaps
  updateHintText();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
setTimeout(animate, 100);

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

function distance(a: GameObject, b: GameObject) {
  return a.body.position.vsub(b.body.position).length();
}

// ######################################################
//
// Jump Functionality
//
// ######################################################

let isGrounded = false;

purpleCube.body.addEventListener("collide", (ev: any) => {
  if (ev.body === bottomWall.body || ev.body === greenCube.body || ev.body === blueCube.body || ev.body === step.body) {
    isGrounded = true;
  }
});

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
};

document.addEventListener("keydown", (e) => {
  if (e.key === "d") input.right = true;
  if (e.key === "a") input.left = true;
  if (e.key === "w") input.up = true;
  if (e.key === "s") input.down = true;
  if (e.code === "Space") input.jump = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "d") input.right = false;
  if (e.key === "a") input.left = false;
  if (e.key === "w") input.up = false;
  if (e.key === "s") input.down = false;
  if (e.code === "Space") input.jump = false;
});

function processInput() {
  if (input.right) set_vx(1);
  else if (input.left) set_vx(-1);
  else if (!input.right && !input.left) set_vx(0);

  if (input.up) set_vz(-1);
  else if (input.down) set_vz(1);
  else if (!input.up && !input.down) set_vz(0);

  // Jump
  if (input.jump) {
    if (isGrounded) {
      purpleCube.body.velocity.y = 9; //jump height
      isGrounded = false;
    }
  }
}

// ######################################################
//
// New Scene Functionality
//
// ######################################################

purpleCube.body.addEventListener("collide", (collisionEvent: CollisionEvent) => {
  if (collisionEvent.body === door.body || has_key === true) {
    //TODO: add functionality such that when the player approaches the door, the scene changes
  }
});

// ######################################################
//
// Win Screen
//
// ######################################################

function winGame() {
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

// ######################################################
//
// Hint Text
//
// ######################################################

function updateHintText() {
  const uiHint = document.getElementById("ui-hint");
  if (!uiHint) return;

  const distKey = distance(purpleCube, keyCube);
  const distDoor = distance(purpleCube, door);

  if (!has_key && distKey < 5) {
    uiHint.innerText = "Click the key to pick it up!";
    return;
  }

  if (distDoor < 3) {
    if (!has_key) uiHint.innerText = "The door is locked. You need the key.";
    else uiHint.innerText = "You unlocked the door!";
    return;
  }

  uiHint.innerText = "";
}
