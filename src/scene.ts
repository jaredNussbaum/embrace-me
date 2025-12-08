import * as CANNON from "cannon-es";
import * as THREE from "three";
import { GameObject } from "./object.ts";

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

class Scene {
  visualScene: THREE.Scene;
  world: CANNON.World;
  children: Map<number, GameObject>; //key is the GameObject's id
  customNames: Map<string, number>; //associates custom names with the id of the gameobject
  constructor() {
    //Three.js setup
    this.visualScene = new THREE.Scene();

    //Cannon-es.js setup
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    this.world.defaultContactMaterial = contactMaterial;

    this.children = new Map<number, GameObject>();
    this.customNames = new Map<string, number>();
  }
  addGameObject(object: GameObject, name?: string) {
    this.visualScene.add(object.mesh);
    this.world.addBody(object.body);
    this.children.set(object.id, object);
    if (name) {
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
    if (id) {
      return this.children.get(id);
    }
    return undefined;
  }
}

export { Scene };
