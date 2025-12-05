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
ui.innerText = "Collect the key and open the chest to win!";
document.body.appendChild(ui);

const uiHint = document.createElement("div");
uiHint.id = "ui-hint";
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

const frontBorder = new Box(new CANNON.Vec3(50, 8, 1), new CANNON.Vec3(0, -1, 4), 0x00000000, 0);
frontBorder.mesh.visible = false;
frontBorder.addToGame(world, scene);

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
// Button Functionality
//
// ######################################################

//sorry this looks like absolute poop, i am so bad with this kinda stuff
const controlsUI = document.createElement("div");
controlsUI.id = "controls-ui";
document.body.appendChild(controlsUI);

//button maker helper
function makeControlButton(label: string) {
  const button = document.createElement("button");
  button.innerText = label;
  button.classList.add("control-button");
  return button;
}

const upButton = makeControlButton("⬆️");
const leftButton = makeControlButton("⬅️");
const rightButton = makeControlButton("➡️");
const downButton = makeControlButton("⬇️");
const jumpButton = makeControlButton("🆙"); //changed to emoji cos other laguages

//top row
controlsUI.appendChild(document.createElement("div")); // empty cell
controlsUI.appendChild(upButton);
controlsUI.appendChild(document.createElement("div"));

//middle row
controlsUI.appendChild(leftButton);
controlsUI.appendChild(downButton);
controlsUI.appendChild(rightButton);

//bottom jump trow
controlsUI.appendChild(document.createElement("div"));
controlsUI.appendChild(jumpButton);
controlsUI.appendChild(document.createElement("div"));

//helper funct to bind mouse movement to buttons
function bindButton(btn: HTMLButtonElement, onPress: () => void, onRelease: () => void) {
  btn.addEventListener("mousedown", onPress);
  btn.addEventListener("mouseup", onRelease);
  btn.addEventListener("mouseleave", onRelease);

  // touch support
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    onPress();
  });
  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    onRelease();
  });
}

//bind buttons to WASD
bindButton(upButton, () => input.up = true, () => input.up = false);
bindButton(downButton, () => input.down = true, () => input.down = false);
bindButton(leftButton, () => input.left = true, () => input.left = false);
bindButton(rightButton, () => input.right = true, () => input.right = false);
bindButton(jumpButton, () => input.jump = true, () => input.jump = false);

//
//
// Starting Menu Functionality oh my god i cant spell
//
//

const startMenu = document.createElement("div");
startMenu.id = "start-menu";
document.body.appendChild(startMenu);

//game title
const title = document.createElement("div");
title.innerText = "GAME TITLE HERE";
title.id = "title-text";
startMenu.appendChild(title);

//button helper
function makeMenuButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = label;
  button.classList.add("menu-button");
  return button;
}

// Language buttons
const EngButton = makeMenuButton("English");
const ArButton = makeMenuButton("Arabic");
const ChButton = makeMenuButton("Chinese");
startMenu.appendChild(EngButton);
startMenu.appendChild(ArButton);
startMenu.appendChild(ChButton);

let selectedLanguage: string | null = null;
let gameStarted = false;

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    animate();
  }
}

EngButton.onclick = () => {
  chooseLanguage("eng");
  startMenu.style.display = "none";
  startGame();
};

ArButton.onclick = () => {
  chooseLanguage("ar");
  startMenu.style.display = "none";
  startGame();
};

ChButton.onclick = () => {
  chooseLanguage("ch");
  startMenu.style.display = "none";
  startGame();
};

function chooseLanguage(lang: string) {
  selectedLanguage = lang;

  //display language
  const ui = document.getElementById("ui-text");
  if (ui) {
    if (lang === "eng") {
      ui.innerText = "Collect the key and open the chest to win!";
    }
    if (lang === "ar") {
      ui.innerText = "احصل على المفتاح وافتح الصندوق للفوز!";
    }
    if (lang === "ch") {
      ui.innerText = "收集钥匙，打开宝箱，即可获胜";
    }
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

  //please please please someone whos better at coding refactor this to not be ass
  if (!has_key && distKey < 6) {
    if (selectedLanguage === "eng") {
      uiHint.innerText = "Click the key to pick it up!";
    } else if (selectedLanguage === "ar") {
      uiHint.innerText = "انقر على المفتاح لالتقاطه";
    } else {
      uiHint.innerText = "点击钥匙即可拾取。";
    }
    return;
  }

  if (distDoor < 3) {
    if (!has_key) {
      if (selectedLanguage === "eng") {
        uiHint.innerText = "The door is locked. You need the key.";
      } else if (selectedLanguage === "ar") {
        uiHint.innerText = "الباب مُغلق. تحتاج المفتاح.";
      } else {
        uiHint.innerText = "门锁了，你需要钥匙";
      }
    } else {
      if (selectedLanguage === "eng") {
        uiHint.innerText = "You unlocked the door!";
      } else if (selectedLanguage === "ar") {
        uiHint.innerText = "لقد فتحت الباب";
      } else {
        uiHint.innerText = "你打开了门锁。";
      }
    }
    return;
  }

  uiHint.innerText = "";
}
