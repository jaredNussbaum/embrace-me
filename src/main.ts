// deno-lint-ignore-file
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { LanguageManager } from "./language-manager.ts";
import { Box, GameObject, Player } from "./object.ts";
import "./style.css";

const langData = new LanguageManager();

const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

const speed = 2;
let has_key = false;

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
camera.position.z = 6.5;
camera.rotation.x = -0.25;

const canvas = document.getElementById("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(viewportWidth, viewportHeight);

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

world.defaultContactMaterial = contactMaterial;

// ######################################################
//
// Starting Menu Functionality
//
// ######################################################

const startMenu = document.getElementById("start-menu")!;

// Language buttons
const EngButton = document.getElementById("eng")!;
const ArButton = document.getElementById("ar")!;
const ChButton = document.getElementById("ch")!;

let gameStarted = false;

function startGame() {
  startMenu.style.display = "none";
  ui.innerText = langData.get("ui-text");
  if (!gameStarted) {
    gameStarted = true;
    animate();
  }
}

EngButton.onclick = () => {
  langData.setLanguage("eng");
  startGame();
};

ArButton.onclick = () => {
  langData.setLanguage("ar");
  startGame();
};

ChButton.onclick = () => {
  langData.setLanguage("ch");
  startGame();
};

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
    has_key = true;

    ui.innerText = langData.get("pickup-key");

    //explode the key cube
    scene.remove(keyCube.mesh);
    world.removeBody(keyCube.body);
  }
});

// ######################################################
//
// Text
//
// ######################################################

const ui = document.getElementById("ui-text")!;
const uiHint = document.getElementById("ui-hint")!;

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

const playerCube = new Player(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(0, 0, 0), 0x7000a0, 2, speed);
playerCube.addToGame(world, scene);

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

const door = new Box(new CANNON.Vec3(1, 5, 3), new CANNON.Vec3(8.5, -1, -2), 0x7b3f00, 0);
door.addToGame(world, scene);

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

// ######################################################
//
// Game Loop
//
// ######################################################

let current_player: Player = playerCube;
let current_scene: THREE.Scene = scene;
let current_world: CANNON.World = world;

function animate() {
  current_player.processInput(input);
  current_world.fixedStep();

  current_player.updateMesh();
  blueCube.updateMesh();
  greenCube.updateMesh();
  keyCube.updateMesh();
  chestCube.updateMesh();

  //check player/camera location
  checkCameraShift();

  //display some hints meyhaps
  updateHintText();

  renderer.render(current_scene, camera);
  requestAnimationFrame(animate);
}

// ######################################################
//
// Cube Movement
//
// ######################################################

function distance(a: GameObject, b: GameObject) {
  return a.body.position.vsub(b.body.position).length();
}

// ######################################################
//
// Player Input
//
// ######################################################

playerCube.body.addEventListener("collide", (ev: any) => {
  if (ev.body === bottomWall.body || ev.body === greenCube.body || ev.body === blueCube.body || ev.body === step.body) {
    playerCube.isGrounded = true;
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

// ######################################################
//
// New Scene Functionality
//
// ######################################################

playerCube.body.addEventListener("collide", (ev: any) => {
  if (ev.body === door.body && has_key === true && !sc_2_booted) {
    scene.remove.apply(scene, scene.children);
    boot_second_scene();
  }
});

// ######################################################
//
// Camera Functionality
//
// ######################################################

function updateCameraPosition() {
  camera.position.x = cameraOffsetX;
}

function checkCameraShift() {
  const pos = playerCube.body.position;

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

const upButton = document.getElementById("up-button") as HTMLButtonElement;
const leftButton = document.getElementById("left-button") as HTMLButtonElement;
const rightButton = document.getElementById("right-button") as HTMLButtonElement;
const downButton = document.getElementById("down-button") as HTMLButtonElement;
const jumpButton = document.getElementById("jump-button") as HTMLButtonElement;

//helper funct to bind mouse movement to buttons
function bindButton(btn: HTMLButtonElement, onPress: () => void, onRelease: () => void) {
  btn.addEventListener("mousedown", onPress);
  btn.addEventListener("mouseup", onRelease);
  btn.addEventListener("mouseleave", onRelease);

  //touch support
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

// ######################################################
//
// Hint Text
//
// ######################################################

function updateHintText() {
  if (!uiHint) return;

  const distKey = distance(playerCube, keyCube);
  const distDoor = distance(playerCube, door);

  if (!has_key && distKey < 6) {
    uiHint.innerText = langData.get("key-hint");
  } else if (distDoor < 5) {
    if (!has_key) {
      uiHint.innerText = langData.get("door-hint");
    } else {
      uiHint.innerText = langData.get("unlock-door");
    }
  } else {
    uiHint.innerText = "";
  }
}

// ######################################################
//
// Save Game Functionality
//
// ######################################################

const saveButton = document.getElementById("save-button")!;
const loadButton = document.getElementById("load-button")!;

saveButton.onclick = saveGame;
loadButton.onclick = loadGame;

function saveGame() {
  const currentLang = langData.lang;

  const saveData = {
    playerPosition: {
      x: playerCube.body.position.x,
      y: playerCube.body.position.y,
      z: playerCube.body.position.z,
    },
    greenCubePos: {
      x: greenCube.body.position.x,
      y: greenCube.body.position.y,
      z: greenCube.body.position.z,
    },
    blueCubePos: {
      x: blueCube.body.position.x,
      y: blueCube.body.position.y,
      z: blueCube.body.position.z,
    },
    has_key,
    cameraOffsetX,
    currentLang,
  };

  localStorage.setItem("myGameSave", JSON.stringify(saveData));

  ui.innerText = langData.get("game-saved");
}

//autosave every 30 seconds
setInterval(() => {
  if (gameStarted) {
    saveGame();
  }
}, 30000);

function loadGame() {
  const data = localStorage.getItem("myGameSave");
  //actually make sure data is loaded. thank u for drilling this into my mind prof Barnett u a real one
  if (!data) {
    alert("No save file found.");
    return;
  }

  const saveData = JSON.parse(data);

  //restore player position
  playerCube.body.position.set(
    saveData.playerPosition.x,
    saveData.playerPosition.y,
    saveData.playerPosition.z,
  );
  playerCube.updateMesh();

  //green cube
  greenCube.body.position.set(
    saveData.greenCubePos.x,
    saveData.greenCubePos.y,
    saveData.greenCubePos.z,
  );
  greenCube.updateMesh();

  //blue cube
  blueCube.body.position.set(
    saveData.blueCubePos.x,
    saveData.blueCubePos.y,
    saveData.blueCubePos.z,
  );
  blueCube.updateMesh();

  //put the varaibles back lol
  has_key = saveData.has_key;
  cameraOffsetX = saveData.cameraOffsetX;
  langData.setLanguage(saveData.currentLang);

  updateCameraPosition();

  //test if working :p
  //alert("Game loaded!");
  ui.innerText = langData.get("game-loaded");
}

// ######################################################
//
// Second Scene
//
// ######################################################

let sc_2_booted: Boolean = false;

function boot_second_scene() {
  // Three.js setup

  const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
  camera.position.z = 6.5;
  camera.rotation.x = -0.25;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(viewportWidth, viewportHeight);
  const world_2 = new CANNON.World();
  const scene_2 = new THREE.Scene();
  const canvas = renderer.domElement;
  document.body.appendChild(canvas);

  // SEPARATE Cannon physics setup

  //add gravity
  world_2.gravity.set(0, -9.82, 0); // x, y, z gravity

  world_2.addContactMaterial(contactMaterial);
  world_2.defaultContactMaterial = contactMaterial;
  sc_2_booted = true;
  instantiate_second_scene_objects(world_2, scene_2);
}

function instantiate_second_scene_objects(wrld: CANNON.World, sc: THREE.Scene) {
  const playerCube_2 = new Player(new CANNON.Vec3(1, 1, 1), new CANNON.Vec3(0, 0, 0), 0x7000a0, 2, speed);
  playerCube_2.addToGame(wrld, sc);
  const bottomWall_2 = new Box(new CANNON.Vec3(55, 1, 15), new CANNON.Vec3(0, -4, 0), 0x222222, 0);
  bottomWall_2.addToGame(wrld, sc);
  current_player = playerCube_2;
  current_scene = sc;
  current_world = wrld;

  ui.innerText = langData.get("victory");
  uiHint.innerText = "";
}
