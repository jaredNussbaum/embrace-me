# F3 devlog - 12/8/2025

## Selected Requirements

The requirements that we decided to select for this iteration of our game were the implementation of a save system, touchscreen support, i18n and l10n language support, and an external DSL!

## How We Satisfied the Software Requirements

Firstly, we'll touch on our save system. Our save system implementation involves defining HTML elements for save buttons that handle manual interaction, allowing the player to save whenever they would like. It then assigns variables to a TS object that save the position of the cubes, inventory state, game progression, and language settings; it then further stringifies this object into a JSON string and saves it into local storage. Upon clicking "load game," the game state that was last saved locally as a JSON string (if it exists) and parses it back into a TS object, updating any objects using our "updateMesh()" and "setLanguage()" functions as well as variable assignment. To top it all off, we even set the save function up (not the load function) to automatically occur every 30 seconds using "setInterval()" as long as the game is running.

Next, we have our touchscreen support. We define 5 buttons to represent our movement inputs, and utilize a helper function to bind those actions to mouse inputs. We then go through each movement input and assign it to its respective button. With that, we have touchscreen inputs for our movement!

Furthermore, we have our language support for i18n and l10n language formats. We simply do this by loading all text we use for the game into a JSON file, with each text excerpt being assigned to a variable in the file, and then have the i18n and l10n counterparts of that sentence in the same variable block. We then use a language manager to use each language, enumerating each language and assigning it as a dictionary to call the specific text in the JSON variable blocks that we want!

Finally, we have our external DSL in the form of JSON files! These JSON files are used to construct different scenes in the game, holding the values for each game object at start-up. These scenes are stored and loaded using a "scene.ts" class, which parses each JSON file when loading a scene, adding objects and assigning their data, and clears a scene when it is no longer needed as well!

## Reflection

Looking back on our prior dev logs, it's so interesting seeing how far our game has come and how the scope has changed overall! In the wake of our need to drastically change our game idea, we successfully pivoted and were able to define new goals for our game, and were then able to meet those goals through our implementation. Our goals also changed with the new requirements for F3, and thus we changed our game's scope once again to include those requirements, once again meeting them and finishing our game!
