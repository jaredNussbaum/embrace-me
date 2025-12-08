import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Box, GameObject, Player } from "./object.ts";

// define the default contact material for no friction
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

interface BoxConfig {
  name?: string;
  position: number[];
  size: number[];
  color: string;
  mass: number;
}

interface SceneConfig {
  player: BoxConfig;
  boxes: BoxConfig[];
}

class Scene {
  visualScene: THREE.Scene;
  world: CANNON.World;
  children: Map<number, GameObject>; //key is the GameObject's id
  customNames: Map<string, number>; //associates custom names with the id of the gameobject
  constructor(config?: SceneConfig) {
    //Three.js setup
    this.visualScene = new THREE.Scene();

    //Cannon-es.js setup
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    this.world.defaultContactMaterial = contactMaterial;

    this.children = new Map<number, GameObject>();
    this.customNames = new Map<string, number>();

    if (config !== undefined) this.loadSceneConfig(config);
  }
  loadSceneConfig(config: SceneConfig) {
    // Create and add player
    const PC = config.player;
    const player = new Player(
      new CANNON.Vec3(PC.size[0], PC.size[1], PC.size[2]),
      new CANNON.Vec3(PC.position[0], PC.position[1], PC.position[2]),
      new THREE.Color(PC.color),
      PC.mass,
    );
    this.addGameObject(player, PC.name);

    // Create and add every box
    for (const BC of config.boxes) {
      const box = new Box(
        new CANNON.Vec3(BC.size[0], BC.size[1], BC.size[2]),
        new CANNON.Vec3(BC.position[0], BC.position[1], BC.position[2]),
        new THREE.Color(BC.color),
        BC.mass,
      );
      this.addGameObject(box, BC.name);
    }
  }
  addGameObject(object: GameObject, name?: string) {
    this.visualScene.add(object.mesh);
    this.world.addBody(object.body);
    this.children.set(object.id, object);
    if (name !== undefined) {
      this.customNames.set(name, object.id);
    }
  }
  removeGameObject(object: GameObject) {
    this.visualScene.remove(object.mesh);
    this.world.removeBody(object.body);
    this.children.delete(object.id);
  }
  clearScene() {
    for (const object of this.children.values()) {
      this.removeGameObject(object);
    }
  }
  getGameObjectByName(name: string): GameObject | undefined {
    const id = this.customNames.get(name);
    if (id !== undefined) {
      return this.children.get(id);
    }
    return undefined;
  }
}

export { Scene };
