// deno-lint-ignore-file
import * as THREE from "three";
import scene1config from "./data/scene1.json" with { type: "json" };
import scene2config from "./data/scene2.json" with { type: "json" };
import { LanguageManager } from "./language-manager.ts";
import { Box, GameObject, Player, PlayerInputFlags } from "./object.ts";
import { Scene } from "./scene.ts";
import "./style.css";

const langData = new LanguageManager();

const viewportWidth = globalThis.innerWidth;
const viewportHeight = globalThis.innerHeight;

let has_key = false;

let scene = new Scene(scene1config);

// Three js camera and renderer are independent of scene
const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight);
camera.position.z = 6.5;
camera.rotation.x = -0.25;

const canvas = document.getElementById("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(viewportWidth, viewportHeight);

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
  saveButton.innerText = langData.get("save-button");
  loadButton.innerText = langData.get("load-button");
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
// Text
//
// ######################################################

const ui = document.getElementById("ui-text")!;
const uiHint = document.getElementById("ui-hint")!;

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
// Camera Movement
//
// #####################################################

const BOUNDS = {
  minX: -9,
  maxX: 9,
  minY: -5,
  maxY: 5,
};

//when the player moves the camera shifts to their new location
const CAMERA_SHIFT_X = BOUNDS.maxX - BOUNDS.minX;

function updateCamera() {
  const pos = playerCube.body.position;

  // player moves to the room to the right
  if (pos.x > camera.position.x + BOUNDS.maxX) {
    camera.position.x += CAMERA_SHIFT_X;
  }

  // player moves to the room on the left
  if (pos.x < camera.position.x + BOUNDS.minX) {
    camera.position.x -= CAMERA_SHIFT_X;
  }
}

// ######################################################
//
// Player
//
// ######################################################

const playerCube = scene.getGameObjectByName("player") as Player;

playerCube.body.addEventListener("collide", playerCollide);

function playerCollide(ev: any) {
  if (ev.body === door.body && has_key && !sc_2_booted) {
    boot_second_scene();
  }
  if (ev.body === floor.body || ev.body === greenCube.body || ev.body === blueCube.body || ev.body === stair.body) {
    playerCube.isGrounded = true;
  }
}

// ######################################################
//
// Player Input
//
// ######################################################

const input: PlayerInputFlags = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
};

document.addEventListener("keydown", (e) => {
  if (e.key === "d") input.right = true;
  else if (e.key === "a") input.left = true;
  else if (e.key === "w") input.up = true;
  else if (e.key === "s") input.down = true;
  else if (e.code === "Space") input.jump = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "d") input.right = false;
  else if (e.key === "a") input.left = false;
  else if (e.key === "w") input.up = false;
  else if (e.key === "s") input.down = false;
  else if (e.code === "Space") input.jump = false;
});

// ######################################################
//
// Touchscreen Input
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
    scene.removeGameObject(keyCube);
  }
});

// ######################################################
//
// Get GameObjects by name
//
// ######################################################

const blueCube = scene.getGameObjectByName("blue-cube") as Box;
const greenCube = scene.getGameObjectByName("green-cube") as Box;
const keyCube = scene.getGameObjectByName("key-cube") as Box;
const door = scene.getGameObjectByName("door") as Box;

let floor = scene.getGameObjectByName("floor") as Box;
const stair = scene.getGameObjectByName("stair") as Box;
const frontBorder = scene.getGameObjectByName("front-border") as Box;
frontBorder.mesh.visible = false;

// ######################################################
//
// Game Loop
//
// ######################################################

let current_player: Player = playerCube;

function animate() {
  current_player.processInput(input);
  scene.world.fixedStep();

  current_player.updateMesh();
  blueCube.updateMesh();
  greenCube.updateMesh();
  keyCube.updateMesh();

  //check player/camera location
  updateCamera();

  //display some hints based on player location
  updateHintText();

  renderer.render(scene.visualScene, camera);
  requestAnimationFrame(animate);
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
  const cameraOffset = camera.position.x;

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
    cameraOffset,
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
  camera.position.x = saveData.cameraOffset;
  langData.setLanguage(saveData.currentLang);

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
  scene = new Scene(scene2config);
  sc_2_booted = true;

  floor = scene.getGameObjectByName("floor") as Box;
  current_player = scene.getGameObjectByName("player") as Player;

  ui.innerText = langData.get("victory");
  uiHint.innerText = "";
}

// ######################################################
//
// Helper Functions
//
// ######################################################

function distance(a: GameObject, b: GameObject) {
  return a.body.position.vsub(b.body.position).length();
}
