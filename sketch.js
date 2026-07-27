/*
  Hearthvale – interactive presentation mockup
  -------------------------------------------------
  The project is intentionally built as a clear p5.js state machine so it
  is easy to edit for a beginner-level school presentation.

  Main flow:
  TITLE -> STORY -> VILLAGE -> FOREST -> COMBAT -> GUARDIAN -> VILLAGE RESTORED -> MAP
*/

const W = 1280;
const H = 720;

let scene = "title";
let images = {};
let buttons = [];
let sparkles = [];
let mist = [];
let player;
let resources = { bamboo: 0, stone: 0, lantern: 15 };
let questComplete = false;
let guardianUnlocked = false;
let villageRestored = false;
let storyPage = 0;
let combat = { enemyHP: 100, playerHP: 100, message: "A corrupted guardian blocks the shrine path.", turnReady: true };
let resourceNodes = [];
let enemyPos;
let fade = 255;
let playerChoice = { body: "female", hair: 0, outfit: 0 };
let activePanel = null;
let audioTracks = {};

// Mobile controls
let joystick = { active: false, touchId: null, baseX: 130, baseY: 590, knobX: 130, knobY: 590, radius: 68, dx: 0, dy: 0 };
let mobileAction = { x: 1135, y: 590, radius: 58 };
let lastTouchActionTime = 0;

function preload() {
  images.title = loadImage("assets/images/title_art.png");
  images.board = loadImage("assets/images/concept_board.png");
  images.map = loadImage("assets/images/realm_map.png");
  images.regions = loadImage("assets/images/regions.png");
  images.village = loadImage("assets/images/village_restoration.png");
  images.creatures = loadImage("assets/images/corrupted_creatures.png");
}

function setup() {
  setupAudio();
  const cnv = createCanvas(W, H);
  cnv.parent("game-container");
  textFont("Georgia");
  player = new Player(W * 0.27, H * 0.66);
  enemyPos = createVector(W * 0.72, H * 0.43);
  resetForest();
  for (let i = 0; i < 26; i++) mist.push(new MistParticle());
}

function draw() {
  buttons = [];

  if (scene === "title") drawTitle();
  else if (scene === "character") drawCharacterCreation();
  else if (scene === "story") drawStory();
  else if (scene === "village") drawVillage(false);
  else if (scene === "forest") drawForest();
  else if (scene === "combat") drawCombat();
  else if (scene === "guardian") drawGuardianReveal();
  else if (scene === "restored") drawVillage(true);
  else if (scene === "map") drawMap();
  else if (scene === "gallery") drawGallery();
  else if (scene === "quest") drawQuestLog();
  else if (scene === "inventory") drawInventory();
  else if (scene === "build") drawBuildMode();
  else if (scene === "profile") drawGuardianProfile();

  drawCursorGlow();
  drawFade();
}

function setupAudio() {
  audioTracks.forest = new Audio("assets/audios/bambooforest.mp3");
  audioTracks.fight = new Audio("assets/audios/bamboofight.mp3");
  audioTracks.active = null;

  for (const track of [audioTracks.forest, audioTracks.fight]) {
    track.loop = true;
    track.preload = "auto";
    track.volume = 0.55;
  }
}

function setSceneAudio(nextScene) {
  const nextTrack = nextScene === "forest" ? audioTracks.forest : nextScene === "combat" ? audioTracks.fight : null;

  if (audioTracks.active && audioTracks.active !== nextTrack) {
    audioTracks.active.pause();
    audioTracks.active.currentTime = 0;
    audioTracks.active = null;
  }

  if (!nextTrack) return;
  if (audioTracks.active === nextTrack && !nextTrack.paused) return;

  nextTrack.currentTime = 0;
  nextTrack.play().catch(() => {});
  audioTracks.active = nextTrack;
}

// ---------- SCENES ----------

function drawCharacterCreation() {
  background("#ead8b8");
  drawCoverImage(images.board);
  fill(24, 15, 10, 185);
  rect(0, 0, W, H);
  glassPanel(55, 55, 1170, 610, 0.92);
  fill("#f8e8c3"); textAlign(LEFT, TOP); textStyle(BOLD); textSize(42);
  text("CREATE YOUR LANTERN KEEPER", 90, 82);
  textStyle(NORMAL); textSize(18); fill("#ddc9a5");
  text("Choose a character style for the demo. This affects the on-screen hero only.", 92, 135);

  // preview
  fill(255,255,255,18); rect(90, 185, 440, 390, 20);
  drawPlayerAvatar(310, 395, 1.55, playerChoice.body);

  fill("#f3e1bf"); textStyle(BOLD); textSize(21); text("BODY", 585, 195);
  addButton("Female", 585, 235, 170, 52, () => playerChoice.body="female", playerChoice.body==="female"?"gold":"dark");
  addButton("Male", 770, 235, 170, 52, () => playerChoice.body="male", playerChoice.body==="male"?"gold":"dark");

  fill("#f3e1bf"); text("HAIRSTYLE", 585, 320);
  for (let i=0;i<3;i++) addButton(`Style ${i+1}`, 585+i*155, 360, 140, 48, () => playerChoice.hair=i, playerChoice.hair===i?"gold":"dark");

  fill("#f3e1bf"); text("OUTFIT", 585, 445);
  for (let i=0;i<3;i++) addButton(["Village Green","Lantern Gold","Mist Blue"][i], 585+i*155, 485, 140, 48, () => playerChoice.outfit=i, playerChoice.outfit===i?"gold":"dark");

  addButton("Continue", 950, 585, 220, 56, () => changeScene("story"), "gold");
  addButton("Back", 90, 585, 150, 56, () => changeScene("title"), "dark");
}

function drawPlayerAvatar(x,y,s,body="female") {
  push(); translate(x,y); scale(s); noStroke();
  fill("#2a211b"); ellipse(0,-74,64,70);
  if (body==="female") ellipse(0,-92,42,32);
  fill("#f1c7a6"); ellipse(0,-65,48,52);
  fill(["#315942","#b7772c","#315b70"][playerChoice.outfit]); rect(-28,-34,56,70,10);
  fill("#ead8b5"); rect(-22,-23,44,24,6);
  fill("#2f2a24"); rect(-23,34,18,38,6); rect(5,34,18,38,6);
  fill("#efb852"); rect(25,-5,13,30,4); ellipse(31,28,20);
  fill("#2c201b"); ellipse(-9,-68,5); ellipse(9,-68,5);
  pop();
}


function drawTitle() {
  drawCoverImage(images.title);
  fill(10, 8, 7, 80);
  rect(0, 0, W, H);
  drawVignette();

  glassPanel(55, 470, 625, 185, 0.76);
  fill("#f8e8bd");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(43);
  text("EXPERIENCE HEARTHVALE", 85, 495);
  textStyle(NORMAL);
  textSize(19);
  fill("#f5dfae");
  text("A short interactive vertical slice: explore, purify, recruit, rebuild, and relight the world.", 87, 554, 550, 56);

  addButton("Begin the Journey", 870, 565, 300, 70, () => changeScene("character"), "gold");
  addButton("View Concept Art", 870, 645, 300, 48, () => changeScene("gallery"), "dark");
}

function drawStory() {
  const pages = [
    {
      title: "A World Once Connected",
      body: "Long ago, the Heart Lantern connected humans, guardian spirits, and nature. Its light grew brighter whenever villages worked together, cared for the land, and celebrated as a community.",
      accent: "#e9b95e"
    },
    {
      title: "The Hollow Mist",
      body: "When trust and connection weakened, the Hollow Mist spread across the realm. It consumed memories and hope, corrupted guardian spirits, and left once-thriving settlements abandoned.",
      accent: "#9a78c4"
    },
    {
      title: "The New Lantern Keeper",
      body: "Centuries later, an ordinary traveller discovers the final surviving ember beneath Hearthvale. Chosen as the Lantern Keeper, the player must rebuild civilization one community at a time.",
      accent: "#f0c76b"
    }
  ];

  background("#191713");
  drawCoverImage(images.board);
  fill(12, 10, 10, 195);
  rect(0, 0, W, H);

  // Light vs mist visual metaphor
  noStroke();
  for (let i = 0; i < mist.length; i++) {
    mist[i].update();
    mist[i].display();
  }
  drawLantern(W * 0.76, H * 0.45, 1.4, pages[storyPage].accent);

  glassPanel(70, 85, 650, 525, 0.87);
  labelPill(`STORY ${storyPage + 1} / ${pages.length}`, 105, 120, 170);
  fill("#f6e7c5");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(52);
  text(pages[storyPage].title, 105, 170, 560, 130);
  textStyle(NORMAL);
  textSize(25);
  textLeading(38);
  fill("#eadcc2");
  text(pages[storyPage].body, 105, 305, 545, 220);

  if (storyPage < pages.length - 1) {
    addButton("Continue", 445, 535, 225, 58, () => storyPage++, "gold");
  } else {
    addButton("Enter Hearthvale", 405, 535, 265, 58, () => changeScene("village"), "gold");
  }
  addButton("Back", 105, 535, 130, 58, () => {
    if (storyPage > 0) storyPage--;
    else changeScene("title");
  }, "dark");
}

function drawVillage(restored) {
  background(restored ? "#b8d49a" : "#55565c");
  drawVillageWorld(restored);
  drawTopHUD(restored ? "RESTORED HEARTHVALE" : "HEARTHVALE VILLAGE");

  if (!restored) {
    questPanel();
    drawBrokenShrine(930, 360);
    drawLantern(640, 325, 0.9, "#f2b84f");

    addButton("Explore Bamboo Forest", 855, 620, 350, 60, () => changeScene("forest"), "gold");
    addButton("Quest Log", 65, 620, 180, 52, () => changeScene("quest"), "dark");
    addButton("Inventory", 260, 620, 180, 52, () => changeScene("inventory"), "dark");
  } else {
    drawRestoredShrine(930, 350);
    drawLantern(640, 310, 1.35, "#ffd76a");
    for (let i = 0; i < 2; i++) drawVillager(460 + i * 80, 465 + (i % 2) * 20, i);
    drawMoonRabbit(770, 470, 0.74);
    celebrationSparkles();

    glassPanel(65, 500, 570, 150, 0.88);
    fill("#f8ebca");
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(28);
    text("THE VILLAGE IS GROWING", 95, 525);
    textStyle(NORMAL);
    textSize(18);
    textLeading(27);
    text("The restored shrine welcomes villagers home. New services, quests, and guardian stories can now be unlocked.", 95, 565, 500, 75);
    addButton("Reveal the Realm Map", 855, 620, 350, 60, () => changeScene("map"), "gold");
    addButton("Customize Village", 65, 620, 240, 52, () => changeScene("build"), "dark");
    addButton("Guardian Profile", 320, 620, 220, 52, () => changeScene("profile"), "dark");
  }
}

function drawForest() {
  drawForestBackground();
  drawTopHUD("BAMBOO FOREST");
  drawMiniMap();

  for (const node of resourceNodes) node.display();

  player.update();
  player.display();

  drawCorruptedBeast(enemyPos.x, enemyPos.y, 0.7);
  drawQuestTracker();
  drawMobileControls();

  const nearbyNode = resourceNodes.find(n => !n.collected && dist(player.x, player.y, n.x, n.y) < 62);
  if (nearbyNode) {
    interactionPrompt("Tap INTERACT or press SPACE to collect bamboo");
  }

  if (dist(player.x, player.y, enemyPos.x, enemyPos.y) < 105) {
    interactionPrompt("Tap INTERACT or press SPACE to confront the beast");
  }

  if (resources.bamboo >= 5 && resources.stone >= 3) {
    questComplete = true;
  }
}

function drawCombat() {
  background("#18121e");
  drawCoverImage(images.creatures);
  fill(8, 5, 12, 188);
  rect(0, 0, W, H);
  drawBattleGround();
  drawTopHUD("PURIFICATION ENCOUNTER");

  drawPlayerBattle(280, 465);
  drawCorruptedBeast(885, 365, 1.18);

  // Health bars
  statusBar(120, 110, 380, 30, combat.playerHP, 100, "Lantern Keeper", "#5dc287");
  statusBar(780, 110, 380, 30, combat.enemyHP, 100, "Corrupted Bamboo Beast", "#be4e8f");

  glassPanel(95, 550, 1090, 130, 0.88);
  fill("#f3e6c6");
  textAlign(LEFT, TOP);
  textSize(19);
  text(combat.message, 125, 575, 460, 70);

  if (combat.enemyHP > 0) {
    addButton("Lantern Strike", 620, 575, 175, 64, () => combatAction("strike"), "dark");
    addButton("Guardian Light", 810, 575, 175, 64, () => combatAction("light"), "dark");
    addButton("Purify", 1000, 575, 150, 64, () => combatAction("purify"), combat.enemyHP <= 30 ? "gold" : "disabled");
  } else {
    addButton("Purify the Spirit", 850, 575, 300, 64, () => changeScene("guardian"), "gold");
  }
}

function drawGuardianReveal() {
  background("#efe3c9");
  // decorative radial rays
  push();
  translate(W / 2, H / 2);
  noStroke();
  for (let a = 0; a < TWO_PI; a += PI / 16) {
    fill(232, 180, 83, 22);
    triangle(0, 0, cos(a - 0.05) * 650, sin(a - 0.05) * 650, cos(a + 0.05) * 650, sin(a + 0.05) * 650);
  }
  pop();

  fill("#3b281c");
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(18);
  text("A GUARDIAN ANSWERS THE LANTERN'S CALL", W / 2, 52);
  textSize(52);
  text("Moon Rabbit Alchemist", W / 2, 85);
  textStyle(NORMAL);
  textSize(20);
  fill("#78614c");
  text("Water • Healer • Village Support", W / 2, 150);

  drawMoonRabbit(W / 2, 365, 1.65);

  glassPanel(65, 515, 720, 150, 0.92, true);
  fill("#3b281c");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(24);
  text("MOONLIT REMEDY", 95, 540);
  textStyle(NORMAL);
  textSize(18);
  textLeading(27);
  text("Restores the Lantern Keeper's health during battle and increases crop growth when assigned to Hearthvale.", 95, 580, 650, 70);

  addButton("Answer the Call", 870, 570, 300, 70, () => {
    guardianUnlocked = true;
    villageRestored = true;
    resources.lantern = 40;
    changeScene("restored");
  }, "gold");
}

function drawMap() {
  drawContainImage(images.map, 0, 0, W, H);
  fill(12, 9, 7, 35);
  rect(0, 0, W, H);
  drawTopHUD("THE SEVEN LANTERN FRAGMENTS");

  // Unlock pulse over Bamboo Forest
  const pulse = 56 + sin(frameCount * 0.08) * 7;
  noFill();
  stroke(255, 222, 112, 210);
  strokeWeight(5);
  ellipse(330, 235, pulse * 2);
  noStroke();

  glassPanel(65, 535, 560, 130, 0.9);
  fill("#f5e5c2");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(27);
  text("LANTERN FRAGMENT RESTORED: 1 / 7", 95, 560);
  textStyle(NORMAL);
  textSize(17);
  text("The Bamboo Forest is healed. New regions introduce new guardians, materials, stories, and village styles.", 95, 603, 500, 54);

  addButton("View Full Concept Board", 830, 585, 330, 58, () => changeScene("gallery"), "gold");
  addButton("Replay Demo", 830, 515, 330, 52, resetGame, "dark");
}

function drawGallery() {
  background("#1c1611");
  drawContainImage(images.board, 0, 0, W, H);
  fill(8, 7, 6, 30);
  rect(0, 0, W, H);
  drawTopHUD("CONCEPT ART & GAME SYSTEMS");
  addButton("Back to Demo", 1015, 642, 225, 50, () => changeScene(villageRestored ? "map" : "title"), "gold");
}


function drawQuestLog() {
  background("#211914"); drawCoverImage(images.village); fill(10,8,7,205); rect(0,0,W,H);
  glassPanel(150,70,980,575,0.94);
  fill("#f8e9c7"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(42); text("QUEST JOURNAL",190,105);
  labelPill("MAIN QUEST",190,175,150);
  textSize(30); text("Relight the Abandoned Shrine",190,225);
  textStyle(NORMAL); textSize(19); fill("#e1d0ad");
  text("Travel to the Bamboo Forest, collect materials, purify the corrupted guardian, and restore the shrine in Hearthvale.",190,275,820,80);
  questStep(210,385,"Collect 5 Bamboo",resources.bamboo>=5,`${min(resources.bamboo,5)} / 5`);
  questStep(210,445,"Collect 3 Spirit Stones",resources.stone>=3,`${min(resources.stone,3)} / 3`);
  questStep(210,505,"Restore the Shrine",villageRestored,villageRestored?"Complete":"Locked");
  addButton("Return",900,565,180,54,()=>changeScene(villageRestored?"restored":"village"),"gold");
}
function questStep(x,y,label,done,status){
  fill(done?"#5e9b67":"#554c42"); ellipse(x,y,28); fill("#f5e5c3"); textStyle(BOLD); textSize(18); text(done?"✓":"•",x-6,y-12);
  textAlign(LEFT,CENTER); text(label,x+30,y); textAlign(RIGHT,CENTER); fill("#dfc98f"); text(status,1020,y); textAlign(LEFT,TOP);
}

function drawInventory() {
  background("#1e1813"); drawCoverImage(images.board); fill(10,8,7,205); rect(0,0,W,H);
  glassPanel(95,65,1090,590,0.94);
  fill("#f8e8c4"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(42); text("INVENTORY",135,100);
  const items=[
    ["Bamboo",resources.bamboo,"Building material gathered in the forest."],
    ["Spirit Stone",resources.stone,"Purified stone used to restore shrines."],
    ["Lantern Energy",resources.lantern+"%","Strength gained by restoring connection."],
    ["Guardian Memory",guardianUnlocked?1:0,"A recovered memory belonging to Moon Rabbit."],
    ["Lantern Fragment",villageRestored?1:0,"One of seven fragments needed to heal the realm."]
  ];
  items.forEach((it,i)=>inventoryCard(140+(i%3)*330,190+floor(i/3)*190,it[0],it[1],it[2],i));
  addButton("Return",930,585,190,52,()=>changeScene(villageRestored?"restored":"village"),"gold");
}
function inventoryCard(x,y,name,amount,desc,i){
  fill(255,255,255,15); stroke(225,190,120,90); strokeWeight(2); rect(x,y,285,150,14); noStroke();
  fill(["#74a85d","#b79c78","#e6b74b","#8dc8ce","#d47556"][i]); ellipse(x+48,y+48,48);
  fill("#f3e2bf"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(20); text(name,x+82,y+25); textSize(26); text(amount,x+82,y+56);
  textStyle(NORMAL); textSize(14); fill("#d7c4a4"); text(desc,x+18,y+102,250,42);
}

function drawBuildMode(){
  drawVillageWorld(true); drawTopHUD("VILLAGE CUSTOMIZATION");
  glassPanel(45,105,310,500,0.92); fill("#f5e4c0"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(28); text("BUILD & DECORATE",75,135);
  textStyle(NORMAL); textSize(16); fill("#d8c5a4"); text("Choose an item, then place it in the highlighted village area.",75,180,240,60);
  const opts=["Cherry Tree","Lantern Stand","Lotus Pond","Bamboo Screen"];
  opts.forEach((o,i)=>addButton(o,75,260+i*70,230,50,()=>toast(o+" placed in the village!"),i===0?"gold":"dark"));
  noFill(); stroke(255,220,120,160); strokeWeight(3); rect(420,270,630,300); noStroke();
  drawCherryTree(710,390,1.15);
  fill("#f9e8c3"); textAlign(CENTER,TOP); textStyle(BOLD); textSize(18); text("DRAG / TAP TO PLACE",735,575);
  addButton("Confirm Layout",1010,625,210,52,()=>changeScene("restored"),"gold");
  addButton("Cancel",45,625,150,52,()=>changeScene("restored"),"dark");
}

function drawGuardianProfile(){
  background("#ede1c9");
  fill("#3b2a20"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(44); text("GUARDIAN PROFILE",70,55);
  drawMoonRabbit(350,365,1.55);
  glassPanel(560,95,640,500,0.95,true);
  fill("#3a291f"); textAlign(LEFT,TOP); textStyle(BOLD); textSize(38); text("Moon Rabbit Alchemist",600,135);
  textStyle(NORMAL); textSize(18); fill("#765f4a"); text("Water • Healer • Village Support",600,188);
  labelPill("FRIENDSHIP LV. 1",600,235,210);
  fill("#3a291f"); textStyle(BOLD); textSize(22); text("Moonlit Remedy",600,305);
  textStyle(NORMAL); textSize(17); fill("#6c5747"); text("Restores health during battle and increases crop growth when assigned to Hearthvale.",600,342,520,70);
  textStyle(BOLD); text("Recovered Memory",600,435); textStyle(NORMAL);
  text("A faded memory of tending a moonlit medicine garden has returned.",600,472,520,65);
  addButton("Give Friendship Gift",600,535,240,52,()=>toast("Friendship increased! New voice line unlocked."),"gold");
  addButton("Return",965,625,200,52,()=>changeScene("restored"),"dark");
}

// ---------- GAMEPLAY ----------

function resetForest() {
  player.x = 320;
  player.y = 560;
  resourceNodes = [
    new ResourceNode(380, 480, "bamboo"),
    new ResourceNode(520, 380, "bamboo"),
    new ResourceNode(685, 505, "bamboo"),
    new ResourceNode(760, 315, "bamboo"),
    new ResourceNode(940, 520, "bamboo")
  ];
}

function resetGame() {
  resources = { bamboo: 0, stone: 0, lantern: 15 };
  questComplete = false;
  guardianUnlocked = false;
  villageRestored = false;
  storyPage = 0;
  combat = { enemyHP: 100, playerHP: 100, message: "A corrupted guardian blocks the shrine path.", turnReady: true };
  sparkles = [];
  resetForest();
  changeScene("title");
}

function combatAction(type) {
  if (!combat.turnReady) return;
  if (type === "purify" && combat.enemyHP > 30) {
    combat.message = "The creature is still overwhelmed by the Hollow Mist. Weaken its corruption first.";
    return;
  }

  combat.turnReady = false;

  if (type === "strike") {
    combat.enemyHP = max(0, combat.enemyHP - 24);
    combat.message = "Lantern Strike breaks through the creature's corrupted armour.";
  } else if (type === "light") {
    combat.enemyHP = max(0, combat.enemyHP - 17);
    combat.playerHP = min(100, combat.playerHP + 8);
    combat.message = "Guardian Light weakens the mist and restores your strength.";
  } else if (type === "purify") {
    combat.enemyHP = 0;
    combat.message = "The Heart Lantern reaches the spirit beneath the corruption.";
  }

  burst(875, 350, type === "light" ? "#b8f2dc" : "#f3bd57", 22);

  setTimeout(() => {
    if (combat.enemyHP > 0) {
      combat.playerHP = max(15, combat.playerHP - floor(random(8, 15)));
      combat.message += " The beast answers with a wave of Hollow Mist.";
    } else {
      resources.stone = 3;
      resources.lantern = 25;
      combat.message = "Purification complete. You received 3 Spirit Stones and a Guardian Memory Fragment.";
    }
    combat.turnReady = true;
  }, 420);
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    changeScene("title");
    return false;
  }

  if (scene === "forest" && key === " ") {
    forestInteract();
    return false;
  }
}

function mousePressed() {
  // Touch events already handle mobile input, so avoid firing an action twice.
  if (millis() - lastTouchActionTime < 350) return false;
  handlePointerPress(mouseX, mouseY);
  return false;
}

function handlePointerPress(px, py) {
  for (let i = buttons.length - 1; i >= 0; i--) {
    if (buttons[i].contains(px, py) && !buttons[i].disabled) {
      buttons[i].action();
      return true;
    }
  }

  if (scene === "forest" && dist(px, py, mobileAction.x, mobileAction.y) <= mobileAction.radius + 18) {
    forestInteract();
    return true;
  }
  return false;
}

function touchStarted() {
  lastTouchActionTime = millis();
  for (const t of touches) {
    if (scene === "forest" && t.x < W * 0.42 && t.y > H * 0.48) {
      joystick.active = true;
      joystick.touchId = t.id;
      updateJoystick(t.x, t.y);
    } else {
      handlePointerPress(t.x, t.y);
    }
  }
  return false;
}

function touchMoved() {
  if (joystick.active) {
    const t = touches.find(item => item.id === joystick.touchId);
    if (t) updateJoystick(t.x, t.y);
  }
  return false;
}

function touchEnded() {
  const stillActive = touches.some(item => item.id === joystick.touchId);
  if (!stillActive) resetJoystick();
  return false;
}

function updateJoystick(px, py) {
  const vx = px - joystick.baseX;
  const vy = py - joystick.baseY;
  const length = Math.hypot(vx, vy) || 1;
  const limited = Math.min(length, joystick.radius);
  joystick.dx = vx / length * (limited / joystick.radius);
  joystick.dy = vy / length * (limited / joystick.radius);
  joystick.knobX = joystick.baseX + joystick.dx * joystick.radius;
  joystick.knobY = joystick.baseY + joystick.dy * joystick.radius;
}

function resetJoystick() {
  joystick.active = false;
  joystick.touchId = null;
  joystick.dx = 0;
  joystick.dy = 0;
  joystick.knobX = joystick.baseX;
  joystick.knobY = joystick.baseY;
}

function forestInteract() {
  const node = resourceNodes.find(n => !n.collected && dist(player.x, player.y, n.x, n.y) < 62);
  if (node) {
    node.collect();
    return;
  }

  if (dist(player.x, player.y, enemyPos.x, enemyPos.y) < 105) {
    if (resources.bamboo < 5) toast("Collect all 5 bamboo bundles before confronting the beast.");
    else changeScene("combat");
  }
}

// ---------- WORLD DRAWING ----------

function drawVillageWorld(restored) {
  const skyTop = restored ? color("#9fc6d2") : color("#666c74");
  const skyBottom = restored ? color("#f5d99f") : color("#a29b91");
  verticalGradient(0, 0, W, H, skyTop, skyBottom);

  // distant mountains
  noStroke();
  fill(restored ? "#718f7b" : "#575c5e");
  beginShape();
  vertex(0, 310); vertex(160, 170); vertex(290, 300); vertex(430, 125); vertex(610, 305);
  vertex(760, 180); vertex(930, 305); vertex(1080, 145); vertex(1280, 300); vertex(1280, 720); vertex(0, 720);
  endShape(CLOSE);

  fill(restored ? "#789454" : "#555a50");
  rect(0, 335, W, 385);

  // river
  fill(restored ? "#77b6b6" : "#687f83");
  beginShape();
  vertex(0, 565); vertex(250, 520); vertex(450, 545); vertex(650, 505); vertex(900, 550); vertex(1280, 510);
  vertex(1280, 720); vertex(0, 720);
  endShape(CLOSE);

  drawBridge(590, 500, restored);
  drawHouse(250, 405, 1.05, restored);
  drawHouse(430, 350, 0.82, restored);
  drawHouse(1040, 430, 0.95, restored);
  drawFarm(735, 430, restored);

  if (!restored) {
    fill(54, 45, 61, 85);
    for (let i = 0; i < mist.length; i++) {
      mist[i].update();
      ellipse(mist[i].x, 350 + (mist[i].y % 250), mist[i].size * 2.4, mist[i].size);
    }
  } else {
    drawCherryTree(170, 370, 1.0);
    drawCherryTree(1130, 350, 0.9);
  }
}

function drawForestBackground() {
  verticalGradient(0, 0, W, H, color("#213c30"), color("#6b704a"));
  noStroke();
  fill("#243b2c");
  rect(0, 470, W, 250);

  // bamboo layers
  for (let layer = 0; layer < 3; layer++) {
    for (let x = -20 + layer * 30; x < W; x += 80) {
      const h = 290 + ((x * 13 + layer * 61) % 180);
      drawBamboo(x, H - h + 20, h, 0.55 + layer * 0.2);
    }
  }

  // path
  fill("#98835b");
  beginShape();
  vertex(190, 720); vertex(360, 500); vertex(610, 450); vertex(840, 330); vertex(1050, 250);
  vertex(1150, 330); vertex(920, 420); vertex(700, 540); vertex(520, 610); vertex(430, 720);
  endShape(CLOSE);

  // warm shrine glow
  noStroke();
  fill(250, 184, 68, 30);
  ellipse(1040, 260, 230, 180);
  drawStoneLantern(1040, 300, 1);
}

function drawBattleGround() {
  noStroke();
  fill(25, 20, 30, 220);
  rect(0, 350, W, 370);
  fill(84, 60, 92, 100);
  ellipse(850, 520, 530, 130);
  fill(226, 173, 74, 70);
  ellipse(300, 555, 360, 90);
  for (const s of sparkles) {
    s.update();
    s.display();
  }
  sparkles = sparkles.filter(s => s.life > 0);
}

// ---------- UI ----------

function drawTopHUD(title) {
  noStroke();
  fill(20, 15, 12, 205);
  rect(0, 0, W, 78);
  fill("#d9a441");
  rect(0, 75, W, 3);
  drawMiniLantern(40, 38);

  fill("#f2e1bd");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(27);
  text(title, 75, 38);
  textStyle(NORMAL);

  if (scene !== "title" && scene !== "story") {
    resourceChip("Bamboo", resources.bamboo, 760, 17, "#82a85e");
    resourceChip("Spirit Stone", resources.stone, 920, 17, "#8cc3d5");
    resourceChip("Lantern", `${resources.lantern}%`, 1100, 17, "#e8b44e");
  }
}

function questPanel() {
  glassPanel(55, 120, 390, 238, 0.88);
  labelPill("MAIN QUEST", 85, 145, 160);
  fill("#f7e7c3");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(30);
  text("Relight the Abandoned Shrine", 85, 195, 330, 80);
  textStyle(NORMAL);
  textSize(18);
  textLeading(29);
  fill("#e4d5b9");
  text("Travel to the Bamboo Forest and recover the materials needed to restore the village shrine.", 85, 270, 320, 80);
}

function drawQuestTracker() {
  glassPanel(24, 105, 300, 184, 0.82);
  fill("#f1dfb8");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(19);
  text("MAIN QUEST", 48, 127);
  textSize(24);
  text("Purify the Grove", 48, 158);
  textStyle(NORMAL);
  textSize(17);
  fill(resources.bamboo >= 5 ? "#a9df9b" : "#f0dfbd");
  text(`• Collect Bamboo: ${resources.bamboo}/5`, 48, 205);
  fill(resources.stone >= 3 ? "#a9df9b" : "#f0dfbd");
  text(`• Spirit Stone: ${resources.stone}/3`, 48, 236);
}

function drawMiniMap() {
  push();
  translate(1155, 155);
  fill(15, 18, 14, 210);
  stroke("#d6b66c");
  strokeWeight(3);
  circle(0, 0, 150);
  noStroke();
  fill("#497b55");
  circle(0, 0, 130);
  fill("#c3ac71");
  beginShape();
  vertex(-55, 40); vertex(-15, 5); vertex(15, 15); vertex(42, -45); vertex(58, -20);
  vertex(30, 30); vertex(0, 50);
  endShape();
  fill("#f6c65a");
  circle(map(player.x, 0, W, -55, 55), map(player.y, 0, H, -55, 55), 10);
  fill("#a85b9e");
  circle(map(enemyPos.x, 0, W, -55, 55), map(enemyPos.y, 0, H, -55, 55), 12);
  pop();
}


function drawMobileControls() {
  // Large translucent controls remain visible on desktop so the audience
  // immediately understands that this is designed as a mobile game.
  push();
  noStroke();
  fill(12, 16, 12, 125);
  circle(joystick.baseX, joystick.baseY, joystick.radius * 2.25);
  stroke(239, 211, 145, 150);
  strokeWeight(3);
  noFill();
  circle(joystick.baseX, joystick.baseY, joystick.radius * 2);
  noStroke();
  fill(232, 198, 116, joystick.active ? 210 : 145);
  circle(joystick.knobX, joystick.knobY, 64);

  fill(20, 14, 10, 190);
  stroke(239, 190, 83, 210);
  strokeWeight(4);
  circle(mobileAction.x, mobileAction.y, mobileAction.radius * 2);
  noStroke();
  fill("#f8e6b9");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(15);
  text("INTERACT", mobileAction.x, mobileAction.y - 2);
  textStyle(NORMAL);
  pop();
}

function interactionPrompt(label) {
  const w = 390;
  fill(16, 12, 9, 225);
  stroke("#e0b85d");
  strokeWeight(2);
  rect(W / 2 - w / 2, H - 72, w, 46, 12);
  noStroke();
  fill("#f6e4ba");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(label, W / 2, H - 49);
  textStyle(NORMAL);
}

function addButton(label, x, y, w, h, action, style = "gold") {
  const b = new UIButton(label, x, y, w, h, action, style);
  b.display();
  buttons.push(b);
}

class UIButton {
  constructor(label, x, y, w, h, action, style) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.action = action;
    this.style = style;
    this.disabled = style === "disabled";
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }

  display() {
    const hover = this.contains(mouseX, mouseY) && !this.disabled;
    strokeWeight(2);
    if (this.style === "gold") {
      fill(hover ? "#f0c66a" : "#d6a747");
      stroke("#f5df9b");
    } else if (this.style === "disabled") {
      fill(80, 73, 66, 180);
      stroke(130, 120, 105);
    } else {
      fill(hover ? "#4a3828" : "#2d241d");
      stroke("#b69455");
    }
    rect(this.x, this.y, this.w, this.h, 12);
    noStroke();
    fill(this.style === "gold" ? "#2d2115" : "#f3dfb4");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(min(20, this.h * 0.34));
    text(this.label, this.x + this.w / 2, this.y + this.h / 2 + 1);
    textStyle(NORMAL);
  }
}

// ---------- CHARACTERS & OBJECTS ----------

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 3.6;
    this.facing = 1;
  }

  update() {
    let dx = 0;
    let dy = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx -= 1;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx += 1;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy -= 1;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy += 1;

    // Add the on-screen joystick vector for touch players.
    dx += joystick.dx;
    dy += joystick.dy;

    if (dx !== 0 || dy !== 0) {
      const m = sqrt(dx * dx + dy * dy);
      dx /= m;
      dy /= m;
      this.x = constrain(this.x + dx * this.speed, 100, W - 100);
      this.y = constrain(this.y + dy * this.speed, 180, H - 80);
      if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.facing, 1);
    drawChibiKeeper(0, 0, 0.82);
    pop();
  }
}

class ResourceNode {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.collected = false;
    this.phase = random(TWO_PI);
  }

  display() {
    if (this.collected) return;
    const bob = sin(frameCount * 0.06 + this.phase) * 4;
    push();
    translate(this.x, this.y + bob);
    noStroke();
    fill(242, 194, 79, 45);
    circle(0, 0, 72);
    fill("#7ea958");
    rect(-7, -25, 14, 48, 4);
    fill("#99c676");
    rect(5, -22, 11, 45, 4);
    stroke("#d3e39b");
    strokeWeight(2);
    line(-7, -10, 7, -10);
    line(5, 7, 16, 7);
    pop();
  }

  collect() {
    this.collected = true;
    resources.bamboo++;
    burst(this.x, this.y, "#d7e58c", 18);
    toast(`Bamboo collected: ${resources.bamboo}/5`);
  }
}

class MistParticle {
  constructor() {
    this.x = random(W);
    this.y = random(H);
    this.size = random(60, 150);
    this.speed = random(0.15, 0.55);
  }
  update() {
    this.x += this.speed;
    if (this.x > W + this.size) this.x = -this.size;
  }
  display() {
    noStroke();
    fill(87, 65, 105, 32);
    ellipse(this.x, this.y, this.size * 1.8, this.size);
  }
}

class Sparkle {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-4, 0.5);
    this.life = 255;
    this.c = color(c);
    this.size = random(4, 11);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life -= 5;
  }
  display() {
    noStroke();
    this.c.setAlpha(this.life);
    fill(this.c);
    circle(this.x, this.y, this.size);
  }
}

// ---------- DRAW HELPERS ----------

function drawChibiKeeper(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // lantern
  stroke("#60401f");
  strokeWeight(4);
  line(40, 22, 58, 52);
  fill("#f7b641");
  rect(48, 44, 24, 32, 5);
  fill(255, 224, 117, 190);
  rect(53, 49, 14, 20, 3);
  // body
  noStroke();
  fill("#f2dfbe");
  ellipse(0, 5, 72, 78);
  fill("#244b38");
  rect(-36, 42, 72, 74, 16);
  fill("#d4a13d");
  rect(-39, 72, 78, 12, 5);
  fill("#f1d7b7");
  ellipse(-40, 72, 18, 36);
  ellipse(40, 72, 18, 36);
  fill("#2d1f18");
  ellipse(0, -10, 74, 60);
  arc(0, -16, 82, 72, PI, TWO_PI);
  fill("#f4dcc0");
  ellipse(0, 4, 62, 58);
  fill("#2f2018");
  ellipse(-14, 4, 7, 10);
  ellipse(14, 4, 7, 10);
  arc(0, 17, 18, 10, 0, PI);
  fill("#d7a13c");
  circle(25, -27, 8);
  circle(34, -20, 7);
  pop();
}

function drawPlayerBattle(x, y) {
  drawChibiKeeper(x, y, 1.15);
  drawLantern(x + 150, y - 80, 0.55, "#ffd15f");
}

function drawCorruptedBeast(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill("#25222b");
  ellipse(0, 0, 190, 125);
  ellipse(-72, 20, 78, 95);
  ellipse(72, 20, 78, 95);
  fill("#19171e");
  ellipse(12, -45, 112, 92);
  triangle(-28, -78, -65, -118, -50, -35);
  triangle(42, -78, 74, -120, 62, -34);
  fill("#a83aa0");
  ellipse(-18, -50, 14, 12);
  ellipse(24, -50, 14, 12);
  fill("#ef7be8");
  circle(-18, -50, 5);
  circle(24, -50, 5);
  stroke("#7d2b8d");
  strokeWeight(8);
  noFill();
  arc(-35, -10, 120, 80, PI + 0.1, TWO_PI - 0.2);
  line(-80, 10, -115, -25);
  line(70, 10, 116, -20);
  noStroke();
  for (let i = 0; i < 7; i++) {
    fill(163, 54, 173, 70 + i * 12);
    ellipse(-70 + i * 24, -15 + sin(frameCount * 0.05 + i) * 10, 34, 50);
  }
  pop();
}

function drawMoonRabbit(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(255, 248, 232);
  ellipse(0, 35, 105, 125);
  ellipse(0, -35, 96, 88);
  ellipse(-27, -105, 30, 110);
  ellipse(27, -105, 30, 110);
  fill("#f0b5b9");
  ellipse(-27, -105, 13, 77);
  ellipse(27, -105, 13, 77);
  fill("#574334");
  ellipse(-19, -38, 10, 14);
  ellipse(19, -38, 10, 14);
  fill("#d9898f");
  circle(0, -19, 8);
  fill("#69aeb8");
  arc(0, 15, 85, 58, 0, PI);
  fill("#e8b74f");
  circle(0, 15, 15);
  fill("#8bcbd0");
  ellipse(-42, 25, 24, 65);
  ellipse(42, 25, 24, 65);
  // herb pouch
  fill("#a9703e");
  ellipse(55, 70, 46, 55);
  fill("#74a75d");
  ellipse(50, 35, 20, 34);
  ellipse(65, 38, 18, 30);
  pop();
}

function drawHouse(x, y, s, restored) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(restored ? "#caa26f" : "#7a6b5d");
  rect(-70, -20, 140, 95, 4);
  fill(restored ? "#374443" : "#3d3d3d");
  beginShape();
  vertex(-95, -20); vertex(-60, -65); vertex(60, -65); vertex(95, -20); vertex(55, -10); vertex(-55, -10);
  endShape(CLOSE);
  fill(restored ? "#d85d3f" : "#5e5048");
  rect(-14, 25, 28, 50);
  fill(restored ? "#f3c55c" : "#74706a");
  rect(-52, 10, 25, 25);
  rect(27, 10, 25, 25);
  if (restored) {
    fill(255, 195, 72, 100);
    ellipse(-40, 22, 50, 50);
    ellipse(40, 22, 50, 50);
  }
  pop();
}

function drawBrokenShrine(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill("#6b5d52");
  rect(-85, 5, 170, 105);
  fill("#343334");
  beginShape();
  vertex(-115, 10); vertex(-72, -40); vertex(20, -55); vertex(100, 5); vertex(55, 15); vertex(-60, 20);
  endShape(CLOSE);
  stroke("#252326");
  strokeWeight(6);
  line(-55, 5, -20, 95);
  line(20, -35, 48, 75);
  noStroke();
  fill("#342f31");
  ellipse(0, 115, 230, 40);
  pop();
}

function drawRestoredShrine(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill("#c69b65");
  rect(-95, 0, 190, 120, 4);
  fill("#2d4443");
  beginShape();
  vertex(-125, 0); vertex(-75, -60); vertex(75, -60); vertex(125, 0); vertex(75, 12); vertex(-75, 12);
  endShape(CLOSE);
  fill("#bd4e36");
  rect(-18, 42, 36, 78);
  fill("#f6c75f");
  rect(-70, 25, 35, 42);
  rect(35, 25, 35, 42);
  fill(255, 205, 75, 90);
  ellipse(-53, 46, 80, 80);
  ellipse(53, 46, 80, 80);
  pop();
}

function drawFarm(x, y, restored) {
  push();
  translate(x, y);
  noStroke();
  for (let r = 0; r < 4; r++) {
    fill(restored ? "#6c8d47" : "#716854");
    rect(-115, r * 26, 230, 17, 4);
    if (restored) {
      fill("#9fc95c");
      for (let c = -95; c <= 95; c += 30) ellipse(c, r * 26, 12, 24);
    }
  }
  pop();
}

function drawBridge(x, y, restored) {
  push();
  translate(x, y);
  stroke(restored ? "#8c623c" : "#655646");
  strokeWeight(18);
  noFill();
  arc(0, 25, 270, 130, PI, TWO_PI);
  strokeWeight(4);
  for (let a = PI + 0.2; a < TWO_PI - 0.2; a += 0.22) {
    line(cos(a) * 135, 25 + sin(a) * 65, cos(a) * 120, 40 + sin(a) * 55);
  }
  pop();
}

function drawCherryTree(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  stroke("#6d4b35");
  strokeWeight(16);
  line(0, 90, 0, 0);
  line(0, 30, -40, -10);
  line(0, 20, 45, -25);
  noStroke();
  fill("#e996a8");
  for (let i = 0; i < 20; i++) ellipse(random(-70, 70), random(-65, 15), random(30, 55));
  pop();
}

function drawBamboo(x, y, h, alphaScale) {
  push();
  translate(x, y);
  stroke(87, 128, 67, 210 * alphaScale);
  strokeWeight(15 * alphaScale);
  line(0, h, 0, 0);
  stroke(161, 186, 93, 180 * alphaScale);
  strokeWeight(3);
  for (let yy = 30; yy < h; yy += 55) line(-8, yy, 8, yy);
  noStroke();
  fill(75, 119, 60, 180 * alphaScale);
  for (let yy = 45; yy < h; yy += 85) {
    ellipse(-22, yy, 42 * alphaScale, 13 * alphaScale);
    ellipse(22, yy + 20, 42 * alphaScale, 13 * alphaScale);
  }
  pop();
}

function drawStoneLantern(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill("#82735e");
  rect(-14, 10, 28, 70);
  rect(-35, 75, 70, 16);
  fill("#675d50");
  rect(-30, -32, 60, 45, 5);
  fill("#f4c460");
  rect(-20, -22, 40, 24, 4);
  fill(255, 197, 70, 70);
  ellipse(0, -10, 110, 95);
  fill("#5f5549");
  beginShape();
  vertex(-42, -32); vertex(0, -62); vertex(42, -32); vertex(28, -24); vertex(-28, -24);
  endShape(CLOSE);
  pop();
}

function drawLantern(x, y, s, glowColor) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  const gc = color(glowColor);
  gc.setAlpha(40);
  fill(gc);
  ellipse(0, 0, 240, 240);
  gc.setAlpha(75);
  fill(gc);
  ellipse(0, 0, 150, 150);
  fill("#5b391d");
  rect(-30, -58, 60, 116, 10);
  fill(glowColor);
  rect(-22, -48, 44, 96, 7);
  fill(255, 245, 179, 180);
  ellipse(0, 0, 25, 48);
  fill("#3c2818");
  rect(-42, -66, 84, 12, 4);
  rect(-42, 54, 84, 12, 4);
  noFill();
  stroke("#4a2e18");
  strokeWeight(7);
  arc(0, -66, 70, 70, PI, TWO_PI);
  pop();
}

function drawMiniLantern(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(255, 197, 78, 50);
  circle(0, 0, 55);
  fill("#d8a644");
  rect(-9, -15, 18, 30, 4);
  fill("#fff2b2");
  rect(-5, -10, 10, 20, 3);
  pop();
}

function drawVillager(x, y, type) {
  push();
  translate(x, y);
  scale(0.65);
  fill(type ? "#d7a45d" : "#7da17c");
  noStroke();
  rect(-28, 10, 56, 70, 13);
  fill("#f1d5b5");
  ellipse(0, -12, 58, 60);
  fill("#30231c");
  arc(0, -20, 64, 50, PI, TWO_PI);
  circle(-12, -10, 5);
  circle(12, -10, 5);
  pop();
}

function statusBar(x, y, w, h, value, maxValue, label, c) {
  fill(20, 15, 18, 220);
  stroke("#c1a46b");
  strokeWeight(2);
  rect(x, y, w, h, 9);
  noStroke();
  fill(c);
  rect(x + 4, y + 4, (w - 8) * (value / maxValue), h - 8, 6);
  fill("#f3e5c4");
  textAlign(LEFT, BOTTOM);
  textStyle(BOLD);
  textSize(17);
  text(`${label}  ${value}/${maxValue}`, x, y - 8);
  textStyle(NORMAL);
}

function resourceChip(label, value, x, y, c) {
  fill(45, 36, 28, 220);
  stroke("#8f7448");
  strokeWeight(1.5);
  rect(x, y, 145, 44, 22);
  noStroke();
  fill(c);
  circle(x + 23, y + 22, 22);
  fill("#f4e2bd");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(14);
  text(`${label}: ${value}`, x + 42, y + 22);
  textStyle(NORMAL);
}

function labelPill(label, x, y, w) {
  fill("#b98c50");
  noStroke();
  rect(x, y, w, 34, 17);
  fill("#24180f");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  text(label, x + w / 2, y + 17);
  textStyle(NORMAL);
}

function glassPanel(x, y, w, h, opacity = 0.85, light = false) {
  fill(light ? color(248, 235, 207, 255 * opacity) : color(28, 22, 17, 255 * opacity));
  stroke(light ? "#b68b50" : "#c49a55");
  strokeWeight(2);
  rect(x, y, w, h, 18);
  noStroke();
}

function verticalGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = 0; i <= h; i++) {
    const inter = map(i, 0, h, 0, 1);
    stroke(lerpColor(c1, c2, inter));
    line(x, y + i, x + w, y + i);
  }
  noStroke();
}

function drawCoverImage(img) {
  const scaleFactor = max(W / img.width, H / img.height);
  const iw = img.width * scaleFactor;
  const ih = img.height * scaleFactor;
  image(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
}

function drawContainImage(img, x, y, w, h) {
  const scaleFactor = min(w / img.width, h / img.height);
  const iw = img.width * scaleFactor;
  const ih = img.height * scaleFactor;
  image(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function drawVignette() {
  noFill();
  for (let i = 0; i < 170; i += 8) {
    stroke(0, 0, 0, map(i, 0, 170, 0, 95));
    strokeWeight(10);
    rect(i / 2, i / 2, W - i, H - i, 18);
  }
  noStroke();
}

function drawCursorGlow() {
  noStroke();
  fill(255, 214, 113, 15);
  circle(mouseX, mouseY, 48 + sin(frameCount * 0.1) * 7);
}

function celebrationSparkles() {
  if (frameCount % 8 === 0) burst(random(W), random(100, H - 100), "#ffd56a", 2);
  for (const s of sparkles) {
    s.update();
    s.display();
  }
  sparkles = sparkles.filter(s => s.life > 0);
}

function burst(x, y, c, amount) {
  for (let i = 0; i < amount; i++) sparkles.push(new Sparkle(x, y, c));
}

let toastMessage = "";
let toastUntil = 0;
function toast(message) {
  toastMessage = message;
  toastUntil = millis() + 1800;
}

function drawFade() {
  if (toastMessage && millis() < toastUntil) {
    fill(16, 12, 9, 225);
    stroke("#d9a441");
    strokeWeight(2);
    rect(W / 2 - 230, 92, 460, 48, 12);
    noStroke();
    fill("#f6e5be");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(17);
    text(toastMessage, W / 2, 116);
    textStyle(NORMAL);
  }

  if (fade > 0) {
    noStroke();
    fill(0, fade);
    rect(0, 0, W, H);
    fade -= 15;
  }
}

function changeScene(next) {
  scene = next;
  setSceneAudio(next);
  fade = 185;
}
