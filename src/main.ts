// deno-lint-ignore-file
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Box, GameObject, Player } from "./object.ts";
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

world.defaultContactMaterial = contactMaterial;

// ######################################################
//
// Starting Menu Functionality
//
// ######################################################

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

    //change the language of the text
    if (selectedLanguage === "eng") {
      ui.innerText = "You've picked up the key!";
    } else if (selectedLanguage === "ar") {
      ui.innerText = "لقد التقطت المفتاح";
    } else {
      ui.innerText = "你已经拿到钥匙了。";
    }

    //explode the key cube
    scene.remove(keyCube.mesh);
    world.removeBody(keyCube.body);
  }

  if (underPointer(door)) {
    if (has_key === false) {
      if (selectedLanguage === "eng") {
        ui.innerText = "You need the key to unlock this door!";
      } else if (selectedLanguage === "ar") {
        ui.innerText = "تحتاج إلى المفتاح لفتح هذا الباب";
      } else {
        ui.innerText = "你需要钥匙才能打开这扇门。";
      }
    } else {
      if (selectedLanguage === "eng") {
        ui.innerText = "you've unlocked the door! You Win!";
      } else if (selectedLanguage === "ar") {
        ui.innerText = "لقد فتحت الباب! لقد فزت";
      } else {
        ui.innerText = "你已经打开了门！你赢了！";
      }
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
uiHint.innerText = ""; //starts blank
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

  //check the win/lose condition every frame
  checkLose();

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
    //TODO: add functionality such that when the player approaches the door, the scene changes
    scene.remove.apply(scene, scene.children);
    boot_second_scene();
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

  playerCube.body.velocity.set(0, 0, 0);
  playerCube.body.angularVelocity.set(0, 0, 0);

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
controlsUI.appendChild(document.createElement("div")); //empty cell
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
  //const uiHint = document.getElementById("ui-hint");
  if (!uiHint) return;

  const distKey = distance(playerCube, keyCube);
  const distDoor = distance(playerCube, door);

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

  //uiHint.innerText = "";
}

// ######################################################
//
// Save Game Functionality
//
// ######################################################

const saveButton = makeMenuButton("Save Game");
const loadButton = makeMenuButton("Load Game");

const saveLoadUI = document.createElement("div");
saveLoadUI.id = "save-load-ui";
document.body.appendChild(saveLoadUI);

saveLoadUI.appendChild(saveButton);
saveLoadUI.appendChild(loadButton);

saveButton.onclick = saveGame;
loadButton.onclick = loadGame;

function saveGame() {
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
    selectedLanguage,
  };

  localStorage.setItem("myGameSave", JSON.stringify(saveData));

  if (selectedLanguage === "eng") {
    uiHint.innerText = "You unlocked the door!";
  } else if (selectedLanguage === "ar") {
    uiHint.innerText = "تم حفظ اللعبة";
  } else {
    uiHint.innerText = "游戏已保存";
  }
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
  selectedLanguage = saveData.selectedLanguage;

  updateCameraPosition();

  //test if working :p
  //alert("Game loaded!");
  if (selectedLanguage === "eng") {
    uiHint.innerText = "You unlocked the door!";
  } else if (selectedLanguage === "ar") {
    uiHint.innerText = "تم تحميل اللعبة";
  } else {
    uiHint.innerText = "游戏已加载";
  }
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

  if (selectedLanguage === "eng") {
    ui.innerText = "Victory!!";
  } else if (selectedLanguage === "ar") {
    ui.innerText = "انتصار";
  } else {
    ui.innerText = "胜利";
  }
}
