# Hearthvale Interactive Mockup

A presentation-ready p5.js vertical slice based on the Hearthvale concept art.

## How to run in Visual Studio Code

1. Open the `hearthvale_p5_mockup` folder in VS Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Keep the `assets/images` and `assets/audios` folders beside `index.html` and `sketch.js`.

The p5.js library loads from a CDN, so an internet connection is needed when the page first opens.

## Demo flow

1. Title screen
2. Three-page story introduction
3. Hearthvale village and main quest
4. Interactive Bamboo Forest exploration
5. Collect five bamboo bundles using WASD/arrow keys and Space
6. Approach the corrupted beast and press Space
7. Use combat buttons to weaken and purify it
8. Recruit the Moon Rabbit Alchemist
9. View the restored village
10. Reveal the seven-region realm map

## Main controls

- **Mouse / touch:** Choose interface buttons
- **WASD / arrow keys:** Move in the Bamboo Forest
- **Space:** Collect resources or begin the enemy encounter
- **Esc:** Return to the title screen

## Easy changes

At the top of `sketch.js`, edit:

- Canvas size: `W` and `H`
- Starting resources: `resources`
- Scene names and presentation flow
- Dialogue in the `pages` array inside `drawStory()`
- Quest requirements in `drawQuestTracker()`
- Combat damage values inside `combatAction()`

## Files

- `index.html` — webpage and p5.js import
- `style.css` — page styling around the canvas
- `sketch.js` — all game logic, scenes, characters, and interactions
- `assets/images/` — the supplied Hearthvale concept art and UI mockup images

## Mobile controls

The prototype is now optimized for phones and tablets in landscape orientation.

- Drag the on-screen joystick in the lower-left corner to move.
- Tap the INTERACT button in the lower-right corner to collect resources or begin an encounter.
- Tap all menu, dialogue, battle, and navigation buttons directly.
- Portrait phones display a prompt asking the player to rotate the device.
- The page disables browser scrolling and text selection while playing so gestures stay inside the game.

## Assets
| File |  Source |
|----|----|
| `assets/images/title_art.png` | Created by ChatGPT |
| `assets/images/concept_board.png` | Created by ChatGPT |
| `assets/images/realm_map.png` | Created by ChatGPT |
| `assets/images/regions.png` | Created by ChatGPT |
| `assets/images/village_restoration.png` | Created by ChatGPT |
| `assets/images/corrupted_creatures.png` | Created by ChatGPT |
| `assets/audios/bamboofight.mp3` [1]| pixabay.com |
| `assets/audios/bambooforest.mp3` [2]| pixabay.com |
| `assets/audios/story.mp3` [3]| pixabay.com |
| `assets/audios/background.mp3` [4]| pixabay.com |

## References

[1] https://pixabay.com/music/percussion-bamboo-forest-taiko-drums-trailer-572681/
[2] https://pixabay.com/music/meditationspiritual-bamboo-grove-dream-497192/ 
[3] https://pixabay.com/music/main-title-hometown-in-my-dream-171523/
[4] https://pixabay.com/music/main-title-anime-piano-437378/ 