# F2 devlog - 12/4/2025

### How We Satisfied the Software Requirements

We continued to use Three.js and well as Cannon-es.js for our 3d rendering and physics simulation respectively.

We then tackled the idea of different scenes/rooms, so there are two adjacent rooms in the first scene, and then a door that once unlocked brings you to the next scene.

The player must first solve our physics based puzzle to actually reach the left room, (spoliers, you just have move a cube over to it lol). This requires some dexterity and exploration from the player to get the cube in the right place.

In this room there's a yellow cube that the player may interact with by clicking on it. This is the second "puzzle" but its not physics based really.
This puzzle is where we implement the inventory. The player may interact with the key object to pick up the key into their inventory, and once they obtain it, they may unlock the door.

The game reaches its one conculsive ending once the door is unlocked, and the player collides with it to change scenes!

### Reflection

Our plan changed drastically from our initial goal of a satirical AI dating sim, as when we made the plan, we didn't have access to the requirements and limitations. So our new goal was to just go with the flow. So we moved onto to just implementing the physics and rendering and seeing where things go from there. We mostly stuck with what roles we were assigned, only switching engines and tools as opposed to jobs. Overall not too bad, and hopefully we can get averything else done just as seamlessly.
