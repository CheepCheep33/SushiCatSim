import {
  INGREDIENTS, RECIPES, MAX_BOARD, MAKI_BASE, TASTES, INVENT_MISTAKES, servePlate, boardHint, rollProblem, starsFor,
  pickChefsChoice, inventProblem, serveChefsChoice, rateOrder,
} from './logic.js';
import { LEVELS } from './levels.js';
import { NORI, CUSTOMER_LINES, CHEFS_CHOICE_LINES, THANKS, BOOK, pick } from './puns.js';
import { loadSave, writeSave, addToRecipeBook, renameRecipe, MAX_NAME } from './save.js';

const W = 960;
const H = 600;

const COLORS = {
  wall: 0xf3e9d2,
  shojiLine: 0xc9b48a,
  wood: 0xd9a86c,
  woodDark: 0xa8723f,
  counter: 0xe8c58f,
  indigo: 0x2c3e6b,
  vermilion: 0xd2452c,
  ink: 0x2b2118,
  cream: 0xfffaf0,
};

const TITLE_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = '"Trebuchet MS", Verdana, sans-serif';

// Placeholder art: everything is drawn with shapes and baked into textures once.
function makeTextures(scene) {
  const g = scene.add.graphics();

  // Ingredient pieces as they sit on the board.
  g.fillStyle(0xe6dfcf).fillRoundedRect(0, 4, 96, 36, 14);
  g.fillStyle(INGREDIENTS.rice.color).fillRoundedRect(0, 0, 96, 34, 14);
  g.fillStyle(0xe9e2d0);
  for (let i = 0; i < 9; i++) g.fillCircle(10 + i * 10, 12 + (i % 3) * 6, 3);
  g.generateTexture('rice', 96, 40);
  g.clear();

  for (const fish of ['salmon', 'tuna']) {
    g.fillStyle(INGREDIENTS[fish].color).fillRoundedRect(0, 0, 112, 26, 12);
    g.lineStyle(3, fish === 'salmon' ? 0xffd2b8 : 0xe0707f, 0.9);
    for (let i = 0; i < 5; i++) g.lineBetween(18 + i * 18, 4, 10 + i * 18, 22);
    g.generateTexture(fish, 112, 26);
    g.clear();
  }

  // Nori: a dark seaweed sheet with a few ridges.
  g.fillStyle(INGREDIENTS.nori.color).fillRoundedRect(0, 0, 120, 18, 4);
  g.lineStyle(2, 0x2f5a3e, 0.8);
  for (let i = 0; i < 6; i++) g.lineBetween(10 + i * 20, 3, 18 + i * 20, 15);
  g.generateTexture('nori', 120, 18);
  g.clear();

  // Cucumber: a long green stick with a pale inside.
  g.fillStyle(0x2f6a22).fillRoundedRect(0, 0, 104, 22, 10);
  g.fillStyle(0xbfe38f).fillRoundedRect(6, 5, 92, 12, 6);
  g.fillStyle(0x8cc45a);
  for (let i = 0; i < 6; i++) g.fillCircle(16 + i * 15, 11, 2);
  g.generateTexture('cucumber', 104, 22);
  g.clear();

  // Bamboo rolling mat (makisu): slats with string ties.
  g.fillStyle(0x9a8a4a).fillRoundedRect(0, 0, 140, 112, 8);
  for (let i = 0; i < 13; i++) {
    g.fillStyle(i % 2 ? 0xd8cc7a : 0xc9bb62).fillRect(6 + i * 10, 6, 9, 100);
  }
  g.lineStyle(2, 0x6a5a2a).lineBetween(4, 34, 136, 34).lineBetween(4, 78, 136, 78);
  g.generateTexture('mat', 140, 112);
  g.clear();

  // Ingredient bins (wooden boxes).
  g.fillStyle(COLORS.woodDark).fillRoundedRect(0, 0, 100, 84, 10);
  g.fillStyle(COLORS.wood).fillRoundedRect(6, 6, 88, 72, 8);
  g.generateTexture('bin', 100, 84);
  g.clear();

  // Cutting board.
  g.fillStyle(0x8a5a2b).fillRoundedRect(0, 6, 240, 124, 16);
  g.fillStyle(0xe0b47a).fillRoundedRect(0, 0, 240, 120, 16);
  g.lineStyle(2, 0xc99a5e, 0.6);
  for (let i = 0; i < 4; i++) g.lineBetween(20, 24 + i * 24, 220, 20 + i * 24);
  g.generateTexture('board', 240, 130);
  g.clear();

  // Trash bucket.
  g.fillStyle(0x5a5a5a).fillRoundedRect(10, 10, 80, 90, 10);
  g.fillStyle(0x777777).fillRoundedRect(0, 0, 100, 18, 6);
  g.lineStyle(3, 0x4a4a4a).lineBetween(30, 30, 30, 90).lineBetween(50, 30, 50, 90).lineBetween(70, 30, 70, 90);
  g.generateTexture('trash', 100, 100);
  g.clear();

  // Paper lantern.
  g.fillStyle(COLORS.vermilion).fillEllipse(30, 45, 56, 70);
  g.fillStyle(0x1a1a1a).fillRect(14, 4, 32, 8).fillRect(14, 78, 32, 8);
  g.lineStyle(2, 0xa83420, 0.7);
  for (let i = 0; i < 4; i++) g.strokeEllipse(30, 45, 56 - i * 14, 70);
  g.generateTexture('lantern', 60, 90);
  g.clear();

  g.destroy();
}

// Chef Nori: a fat, grumpy black cat in a white hachimaki.
function drawNori(scene, x, y) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x161616);
  g.fillEllipse(0, 70, 230, 190); // big round body
  g.fillCircle(0, -40, 78); // head
  g.fillTriangle(-70, -70, -40, -140, -14, -100); // ears
  g.fillTriangle(70, -70, 40, -140, 14, -100);
  g.fillStyle(0x3a2a2a);
  g.fillTriangle(-58, -82, -42, -122, -26, -100);
  g.fillTriangle(58, -82, 42, -122, 26, -100);
  // Hachimaki headband.
  g.fillStyle(0xffffff).fillRect(-78, -86, 156, 18);
  g.fillStyle(COLORS.vermilion).fillCircle(0, -77, 7);
  g.fillStyle(0xffffff).fillTriangle(70, -80, 104, -96, 98, -70);
  // Grumpy half-closed eyes.
  g.fillStyle(0xf5c518).fillEllipse(-30, -40, 34, 22).fillEllipse(30, -40, 34, 22);
  g.fillStyle(0x161616).fillRect(-50, -54, 40, 13).fillRect(10, -54, 40, 13);
  g.fillStyle(0x000000).fillEllipse(-30, -36, 6, 12).fillEllipse(30, -36, 6, 12);
  g.lineStyle(4, 0x161616).lineBetween(-50, -56, -12, -48).lineBetween(50, -56, 12, -48);
  // Frown and whiskers.
  g.fillStyle(0xe58a9a).fillTriangle(-7, -16, 7, -16, 0, -8);
  g.lineStyle(3, 0x888888).beginPath().arc(0, 6, 14, Math.PI * 1.15, Math.PI * 1.85).strokePath();
  g.lineStyle(2, 0x999999);
  g.lineBetween(-30, -10, -82, -18).lineBetween(-30, -4, -82, 2);
  g.lineBetween(30, -10, 82, -18).lineBetween(30, -4, 82, 2);
  // White chef apron.
  g.fillStyle(0xf4f1ea).fillRoundedRect(-60, 40, 120, 110, 18);
  g.lineStyle(3, COLORS.indigo).strokeRoundedRect(-60, 40, 120, 110, 18);
  c.add(g);
  c.add(scene.add.text(0, 92, 'NORI', { fontFamily: TITLE_FONT, fontSize: '22px', color: '#2c3e6b', fontStyle: 'bold' }).setOrigin(0.5));
  scene.tweens.add({ targets: c, scaleY: 1.02, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

const CUSTOMER_LOOKS = {
  mouse: { fur: 0xb0a8a0, inner: 0xf0b8c0, ears: 'round' },
  owl: { fur: 0x8a6a4a, inner: 0xe8d8b8, ears: 'tufts' },
  kitsune: { fur: 0xf08a3a, inner: 0xffffff, ears: 'pointy' },
  dog: { fur: 0xc89a6a, inner: 0x8a5a3a, ears: 'floppy' },
  tanuki: { fur: 0x7a6a5a, inner: 0x3a302a, ears: 'round' },
  turtle: { fur: 0x8fb070, inner: 0xd8e4b0, ears: 'none' },
  lantern: { fur: 0xf4e6c8, inner: 0xfff6e0, ears: 'antennae', scale: 0.8 },
  bunny: { fur: 0xf2efe8, inner: 0xf0b8c0, ears: 'long' },
  kappa: { fur: 0x5fa86a, inner: 0xe8d070, ears: 'none' },
  panda: { fur: 0xf6f4ee, inner: 0xffffff, ears: 'round', earColor: 0x1c1c1c },
};

function drawCustomer(scene, x, y, cust) {
  const look = CUSTOMER_LOOKS[cust.kind];
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  if (cust.spirit) {
    // Spirits glow, have a wispy tail instead of legs, and float.
    g.fillStyle(0xbfe6ff, 0.35).fillCircle(0, 0, 110);
    g.fillStyle(0xdff2ff, 0.9).fillTriangle(-50, 60, 50, 60, 10, 150);
  }
  if (cust.kind === 'turtle' || cust.kind === 'kappa') {
    // A shell on the back, peeking out on both sides.
    g.fillStyle(cust.kind === 'turtle' ? 0x6a5030 : 0x3f6a3a).fillEllipse(0, 70, 170, 130);
    g.lineStyle(3, 0x2a2014, 0.5).strokeEllipse(0, 70, 140, 100);
  }
  g.fillStyle(look.fur);
  g.fillEllipse(0, 80, 130, 110); // body
  if (look.ears === 'round') {
    g.fillStyle(look.earColor ?? look.fur).fillCircle(-48, -56, 26).fillCircle(48, -56, 26);
    if (!look.earColor) g.fillStyle(look.inner).fillCircle(-48, -56, 14).fillCircle(48, -56, 14);
  } else if (look.ears === 'long') {
    g.fillEllipse(-26, -100, 28, 90).fillEllipse(26, -100, 28, 90);
    g.fillStyle(look.inner).fillEllipse(-26, -100, 14, 66).fillEllipse(26, -100, 14, 66);
  } else if (look.ears === 'antennae') {
    // Moth antennae: this little spirit is part moth, drawn to its own lantern.
    g.lineStyle(4, 0x6a5a3a).lineBetween(-16, -64, -40, -112).lineBetween(16, -64, 40, -112);
    g.fillStyle(0x6a5a3a).fillEllipse(-42, -114, 18, 10).fillEllipse(42, -114, 18, 10);
    g.fillStyle(0xe8d8b0, 0.9).fillEllipse(-62, 60, 50, 80).fillEllipse(62, 60, 50, 80); // wings
  } else if (look.ears === 'none') {
    // No ears.
  } else if (look.ears === 'pointy') {
    g.fillTriangle(-60, -30, -40, -100, -14, -50).fillTriangle(60, -30, 40, -100, 14, -50);
    g.fillStyle(look.inner).fillTriangle(-50, -44, -40, -84, -26, -54).fillTriangle(50, -44, 40, -84, 26, -54);
  } else if (look.ears === 'tufts') {
    g.fillTriangle(-56, -36, -50, -90, -24, -54).fillTriangle(56, -36, 50, -90, 24, -54);
  } else {
    g.fillEllipse(-62, -4, 30, 70).fillEllipse(62, -4, 30, 70);
  }
  g.fillStyle(look.fur).fillCircle(0, -10, 62); // head
  g.fillStyle(look.inner).fillEllipse(0, 10, 70, 46);
  if (cust.kind === 'owl') {
    g.fillStyle(0xffffff).fillCircle(-22, -18, 20).fillCircle(22, -18, 20);
    g.fillStyle(0xe8a13a).fillTriangle(-8, 2, 8, 2, 0, 18);
  } else if (cust.kind === 'tanuki') {
    g.fillStyle(0x2a221c).fillEllipse(-24, -16, 38, 26).fillEllipse(24, -16, 38, 26);
  } else if (cust.kind === 'panda') {
    g.fillStyle(0x1c1c1c).fillEllipse(-22, -16, 30, 36).fillEllipse(22, -16, 30, 36);
  } else if (cust.kind === 'kappa') {
    // The water dish on a kappa's head, and a little beak.
    g.fillStyle(0xbfe6ff).fillEllipse(0, -66, 70, 22);
    g.lineStyle(3, 0x3a7a8a).strokeEllipse(0, -66, 70, 22);
  }
  g.fillStyle(0xffffff).fillCircle(-22, -18, 9).fillCircle(22, -18, 9);
  g.fillStyle(0x111111).fillCircle(-22, -16, 5).fillCircle(22, -16, 5);
  g.fillStyle(0x111111).fillCircle(0, 4, 5);
  if (cust.kind === 'tanuki') {
    g.fillStyle(0x333333).fillRect(-14, 50, 28, 60); // necktie
  }
  if (cust.kind === 'kappa') {
    g.fillStyle(0xe8a13a).fillTriangle(-10, 0, 10, 0, 0, 14); // beak
  }
  if (cust.kind === 'bunny') {
    g.fillStyle(COLORS.indigo).fillRect(-50, 64, 100, 10); // backpack strap
  }
  if (cust.kind === 'lantern') {
    // A tiny paper lantern held in front.
    g.fillStyle(0xffe080, 0.5).fillCircle(46, 40, 30);
    g.fillStyle(COLORS.vermilion).fillEllipse(46, 40, 30, 38);
    g.fillStyle(0x1a1a1a).fillRect(38, 20, 16, 4).fillRect(38, 57, 16, 4);
  }
  if (cust.kind === 'kitsune') {
    g.fillStyle(0xb02a3a).fillRoundedRect(-60, 50, 120, 80, 20); // kimono
    g.fillStyle(0xf2c14e).fillRect(-60, 80, 120, 14);
  }
  if (look.scale) g.setScale(look.scale).setY(24);
  c.add(g);
  c.add(scene.add.text(0, 150, cust.spirit ? `${cust.name} (spirit)` : cust.name, {
    fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118', backgroundColor: '#fffaf0', padding: { x: 6, y: 2 },
  }).setOrigin(0.5));
  return c;
}

// Draws a finished or half-built stack of ingredients, centered on (0, 0).
function drawStack(scene, stack) {
  const c = scene.add.container(0, 0);
  let y = 20;
  for (const ing of stack) {
    const img = scene.add.image(0, y, ing);
    c.add(img);
    y -= ing === 'rice' ? 24 : ing === 'nori' ? 10 : 16;
  }
  return c;
}

// A rolled maki cut into three pieces, showing its fillings. Made the first time it's needed.
function makiTexture(scene, fillings) {
  const key = `maki_${fillings.join('_')}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  for (let i = 0; i < 3; i++) {
    const cx = 22 + i * 40;
    g.fillStyle(INGREDIENTS.nori.color).fillCircle(cx, 22, 20);
    g.fillStyle(INGREDIENTS.rice.color).fillCircle(cx, 22, 15);
    if (fillings.length === 1) g.fillStyle(INGREDIENTS[fillings[0]].color).fillCircle(cx, 22, 7);
    else fillings.forEach((ing, j) => g.fillStyle(INGREDIENTS[ing].color).fillCircle(cx - 4 + j * 8, 22, 5));
  }
  g.generateTexture(key, 124, 44);
  g.destroy();
  return key;
}

// A plate: a loose stack, or once rolled, cut maki pieces showing the filling.
function drawPlate(scene, stack, rolled) {
  if (!rolled) return drawStack(scene, stack);
  const key = makiTexture(scene, stack.slice(MAKI_BASE.length));
  return scene.add.container(0, 0, [scene.add.image(0, 10, key)]);
}

function starText(stars, max = 5) {
  return '★'.repeat(stars) + '☆'.repeat(max - stars);
}

function speechBubble(scene, x, y, w, h) {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.cream).fillRoundedRect(x, y, w, h, 16);
  g.lineStyle(3, COLORS.ink).strokeRoundedRect(x, y, w, h, 16);
  return g;
}

function button(scene, x, y, label, onClick, size = 28) {
  const t = scene.add.text(x, y, label, {
    fontFamily: TITLE_FONT, fontSize: `${size}px`, color: '#fffaf0', backgroundColor: '#d2452c', padding: { x: 22, y: 10 },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  t.on('pointerover', () => t.setBackgroundColor('#b0341f'));
  t.on('pointerout', () => t.setBackgroundColor('#d2452c'));
  t.on('pointerup', onClick);
  return t;
}

// Returns a layer that sits between the wall and the counter, for customers.
function drawBackdrop(scene) {
  let g = scene.add.graphics();
  g.fillStyle(COLORS.wall).fillRect(0, 0, W, 360);
  g.lineStyle(3, COLORS.shojiLine);
  for (let x = 0; x <= W; x += 80) g.lineBetween(x, 0, x, 360);
  for (let y = 0; y <= 360; y += 90) g.lineBetween(0, y, W, y);
  // Noren curtain over the doorway on the right.
  g.fillStyle(COLORS.indigo);
  for (let i = 0; i < 4; i++) g.fillRect(560 + i * 70, 0, 64, 70);
  g.fillStyle(0xffffff);
  for (let i = 0; i < 4; i++) g.fillCircle(592 + i * 70, 36, 12);
  scene.add.image(250, 55, 'lantern').setScale(0.8);
  scene.add.image(925, 50, 'lantern').setScale(0.8);
  const customers = scene.add.layer();
  // Counter and prep area.
  g = scene.add.graphics();
  g.fillStyle(COLORS.counter).fillRect(0, 340, W, 44);
  g.fillStyle(0xc99a5e).fillRect(0, 384, W, 8);
  g.fillStyle(COLORS.wood).fillRect(0, 392, W, H - 392);
  g.lineStyle(2, 0xc4915a, 0.5);
  for (let y = 410; y < H; y += 28) g.lineBetween(0, y, W, y + 6);
  return customers;
}

class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }

  create() {
    makeTextures(this);
    drawBackdrop(this);
    drawNori(this, 220, 300);
    speechBubble(this, 380, 120, 520, 220);
    this.add.text(640, 175, 'Neko Nigiri', { fontFamily: TITLE_FONT, fontSize: '56px', color: '#2c3e6b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 235, 'A sushi bar run by a very grumpy cat', { fontFamily: BODY_FONT, fontSize: '20px', color: '#2b2118' }).setOrigin(0.5);
    this.add.text(640, 290, `"${NORI.title}"`, { fontFamily: BODY_FONT, fontSize: '18px', color: '#6b5a48', fontStyle: 'italic' }).setOrigin(0.5);
    // ?level=2 in the address jumps straight to that level, handy for testing.
    const wanted = Number(new URLSearchParams(location.search).get('level')) - 1;
    const level = LEVELS[wanted] ? wanted : 0;
    button(this, 640, 440, 'Open the shop', () => this.scene.start('bar', { level }));
    button(this, 640, 520, BOOK.button, () => this.scene.start('book', { back: 'title' }), 22);
  }
}

class BarScene extends Phaser.Scene {
  constructor() { super('bar'); }

  init(data) {
    this.level = LEVELS[data.level ?? 0];
    this.levelIndex = data.level ?? 0;
    this.board = [];
    this.rolled = false;
    this.coins = 0;
    this.served = 0;
    this.customerIndex = -1;
    this.mistakes = 0;
    this.taughtRice = false;
    this.ratings = [];
    this.newRecipes = 0;
    // ?chef=1 makes every customer after the first ask for chef's choice, handy for testing.
    const always = new URLSearchParams(location.search).get('chef') === '1';
    const count = this.level.customers.length;
    this.chefsChoice = always ? pickChefsChoice(count, () => 0, 1, count) : pickChefsChoice(count);
  }

  create() {
    this.customerLayer = drawBackdrop(this);
    this.nori = drawNori(this, 150, 250);

    speechBubble(this, 280, 20, 290, 130);
    this.noriText = this.add.text(294, 32, '', {
      fontFamily: BODY_FONT, fontSize: '17px', color: '#2b2118', wordWrap: { width: 262 }, lineSpacing: 2,
    });

    this.hud = this.add.text(W - 16, H - 16, '', {
      fontFamily: TITLE_FONT, fontSize: '22px', color: '#fffaf0', backgroundColor: '#2c3e6b', padding: { x: 10, y: 4 },
    }).setOrigin(1, 1);
    this.add.text(16, H - 16, this.level.title + ' (no timer)', {
      fontFamily: BODY_FONT, fontSize: '16px', color: '#fffaf0', backgroundColor: '#2c3e6b', padding: { x: 8, y: 4 },
    }).setOrigin(0, 1);

    // Levels with a rolling mat squeeze the bins and trash over to make room for it.
    const mat = this.level.rollingMat;
    this.boardX = mat ? 580 : 560;
    this.makeBins(mat ? { x: 56, step: 88, scale: 0.85 } : { x: 80, step: 110, scale: 1 });
    this.boardImage = this.add.image(this.boardX, 470, 'board');
    this.boardZone = new Phaser.Geom.Rectangle(this.boardX - 130, 470 - 75, 260, 150);
    if (mat) {
      this.mat = this.add.image(790, 470, 'mat');
      this.matZone = new Phaser.Geom.Rectangle(790 - 75, 470 - 62, 150, 124);
      this.add.text(790, 538, 'Rolling mat', { fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118' }).setOrigin(0.5);
    }
    const trashX = mat ? 905 : 860;
    this.trash = this.add.image(trashX, 470, 'trash').setScale(mat ? 0.75 : 1);
    this.add.text(trashX, mat ? 520 : 535, 'Trash', { fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118' }).setOrigin(0.5);

    // Whatever is being dragged floats above the board, mat and trash.
    this.input.on('dragstart', (pointer, obj) => obj.setDepth(10));
    this.input.on('drag', (pointer, obj, x, y) => obj.setPosition(x, y));
    this.input.on('dragend', (pointer, obj) => { obj.setDepth(0); this.onDrop(pointer, obj); });

    this.updateHud();
    this.say(NORI.levelIntro[this.level.id] ?? NORI.intro);
    this.nextCustomer();
  }

  makeBins({ x: startX, step, scale }) {
    this.level.ingredients.forEach((ing, i) => {
      const x = startX + i * step;
      const y = 470;
      this.add.image(x, y, 'bin').setScale(scale);
      this.add.text(x, y + 56 * scale, INGREDIENTS[ing].name, { fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118' }).setOrigin(0.5);
      // The hit area covers the whole bin, so grabbing anywhere in the box picks up the piece.
      const piece = this.add.image(x, y, ing).setScale(0.8 * scale);
      const binW = 100 / 0.8;
      const binH = 84 / 0.8;
      const hitArea = new Phaser.Geom.Rectangle(piece.width / 2 - binW / 2, piece.height / 2 - binH / 2, binW, binH);
      piece.setInteractive({ hitArea, hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true, draggable: true });
      piece.setData({ kind: 'ingredient', ingredient: ing, home: { x, y } });
    });
  }

  say(line) {
    this.noriText.setText(line);
    this.tweens.add({ targets: this.nori, angle: { from: -3, to: 3 }, duration: 80, yoyo: true, repeat: 1, onComplete: () => this.nori.setAngle(0) });
  }

  updateHud() {
    const total = this.level.customers.length;
    this.hud.setText(`Coins ${this.coins}   Served ${this.served}/${total}`);
  }

  nextCustomer() {
    this.customerIndex++;
    this.mistakes = 0;
    if (this.customerIndex >= this.level.customers.length) {
      this.say(NORI.levelDone);
      this.time.delayedCall(1600, () => this.scene.start('results', {
        level: this.levelIndex, coins: this.coins, stars: starsFor(this.coins, this.level.starTargets),
        ratings: this.ratings, newRecipes: this.newRecipes,
      }));
      return;
    }
    const cust = this.level.customers[this.customerIndex];
    this.customer = cust;
    this.inventing = this.chefsChoice[this.customerIndex];
    this.customerSprite = drawCustomer(this, 850, 420, cust);
    this.customerLayer.add(this.customerSprite);
    this.customerSprite.setAlpha(0);
    this.tweens.add({
      targets: this.customerSprite, y: 250, alpha: cust.spirit ? 0.85 : 1, duration: 600, ease: 'Back.out',
      onComplete: (tween, [sprite]) => {
        // Spirits bob up and down instead of standing still.
        if (cust.spirit) this.tweens.add({ targets: sprite, y: 238, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      },
    });
    this.customerZone = new Phaser.Geom.Rectangle(760, 100, 200, 280);

    const g = speechBubble(this, 585, 130, 170, 205);
    g.fillStyle(COLORS.cream).fillTriangle(752, 180, 752, 210, 775, 195);
    const recipe = RECIPES[cust.order];
    this.orderBubble = this.add.container(0, 0, [g, ...(this.inventing ? this.chefsChoiceBubble(cust) : this.menuBubble(cust, recipe))]);
    this.orderBubble.setDepth(5).setAlpha(0);
    this.tweens.add({ targets: this.orderBubble, alpha: 1, delay: 500, duration: 300 });

    if (this.inventing) {
      this.say(NORI.chefsChoice);
    } else if (this.customerIndex > 0) {
      if (cust.kind === 'lantern') this.say(NORI.spiritKid);
      else if (cust.spirit) this.say(NORI.spirit);
      else if (recipe.rolled) this.say(NORI.nextMaki);
      else this.say(this.taughtRice ? NORI.nextNigiri : NORI.intro);
    }
  }

  menuBubble(cust, recipe) {
    const icon = drawPlate(this, recipe.stack, recipe.rolled);
    icon.setPosition(670, 180).setScale(0.75);
    const name = this.add.text(670, 225, recipe.name, {
      fontFamily: TITLE_FONT, fontSize: '18px', color: '#d2452c', fontStyle: 'bold',
    }).setOrigin(0.5);
    const words = this.add.text(670, 245, `"${CUSTOMER_LINES[cust.kind]}"`, {
      fontFamily: BODY_FONT, fontSize: '13px', color: '#2b2118', wordWrap: { width: 150 }, align: 'center',
    }).setOrigin(0.5, 0);
    return [icon, name, words];
  }

  // A chef's choice order shows what they love and what they won't eat, in pictures.
  chefsChoiceBubble(cust) {
    const tastes = TASTES[cust.kind];
    const parts = [
      this.add.text(670, 150, "Chef's Choice!", { fontFamily: TITLE_FONT, fontSize: '19px', color: '#d2452c', fontStyle: 'bold' }).setOrigin(0.5),
      this.add.text(670, 172, 'Invent something new', { fontFamily: BODY_FONT, fontSize: '12px', color: '#6b5a48' }).setOrigin(0.5),
      this.add.text(600, 196, '♥', { fontFamily: BODY_FONT, fontSize: '22px', color: '#d2452c' }).setOrigin(0.5),
      this.add.image(682, 196, tastes.likes).setScale(0.6),
    ];
    if (tastes.dislikes.length) {
      parts.push(this.add.text(600, 226, '✗', { fontFamily: BODY_FONT, fontSize: '22px', color: '#2b2118' }).setOrigin(0.5));
      tastes.dislikes.forEach((ing, i, all) => {
        const x = all.length === 1 ? 682 : 650 + i * 64;
        const img = this.add.image(x, 226, ing).setScale(all.length === 1 ? 0.6 : 0.45).setAlpha(0.6);
        parts.push(img, this.add.text(x, 226, '✗', { fontFamily: BODY_FONT, fontSize: '20px', color: '#2b2118' }).setOrigin(0.5));
      });
    }
    parts.push(this.add.text(670, tastes.dislikes.length ? 248 : 222, `"${CHEFS_CHOICE_LINES[cust.kind]}"`, {
      fontFamily: BODY_FONT, fontSize: '12px', color: '#2b2118', wordWrap: { width: 152 }, align: 'center',
    }).setOrigin(0.5, 0));
    return parts;
  }

  clearBoard() {
    this.board = [];
    this.rolled = false;
    this.rebuildPlate();
  }

  rebuildPlate() {
    this.plate?.destroy();
    this.plate = null;
    if (this.board.length === 0) return;
    const stack = drawPlate(this, this.board, this.rolled);
    this.plate = this.add.container(this.boardX, 470, [stack]);
    this.plate.setSize(240, 120); // the whole cutting board is the handle
    this.plate.setInteractive({ useHandCursor: true, draggable: true });
    this.plate.setData({ kind: 'plate', home: { x: this.boardX, y: 470 } });
  }

  onDrop(pointer, obj) {
    const home = obj.getData('home');
    const { x, y } = pointer;
    if (obj.getData('kind') === 'ingredient') {
      obj.setPosition(home.x, home.y);
      if (Phaser.Geom.Rectangle.Contains(this.boardZone, x, y)) this.addToBoard(obj.getData('ingredient'));
      return;
    }
    if (Phaser.Geom.Rectangle.Contains(this.customerZone, x, y) && this.customer) {
      this.serve();
    } else if (this.trash.getBounds().contains(x, y)) {
      this.clearBoard();
      this.say(NORI.trashed);
    } else if (this.matZone && Phaser.Geom.Rectangle.Contains(this.matZone, x, y)) {
      this.roll(obj);
    } else {
      obj.setPosition(home.x, home.y);
    }
  }

  addToBoard(ing) {
    if (this.rolled) {
      this.say(NORI.rolledFull);
      return;
    }
    if (this.board.length >= MAX_BOARD) {
      this.say(NORI.tooMuch);
      return;
    }
    this.board.push(ing);
    this.rebuildPlate();
    if (this.inventing) {
      const problem = inventProblem(this.board) ?? 'ready';
      if (INVENT_MISTAKES.includes(problem)) this.mistakes++;
      this.say(NORI.invent[problem]);
      return;
    }
    const recipe = RECIPES[this.customer.order];
    const hint = boardHint(this.customer.order, this.board);
    const mistakeLines = {
      rice_first: NORI.riceFirst, nori_first: NORI.noriFirst, too_much: NORI.tooMuch,
      wrong_order: NORI.wrongOrder, wrong_topping: NORI.wrongTopping,
    };
    if (mistakeLines[hint]) { this.mistakes++; this.say(mistakeLines[hint]); }
    else if (hint === 'roll_it') this.say(NORI.rollIt);
    else if (hint === 'ready') this.say(NORI.ready);
    else if (recipe.rolled) this.say(NORI.makiSteps[this.board.length]);
    else if (this.board.length === 1) { this.taughtRice = true; this.say(NORI.afterRice); }
  }

  // Dropping the plate on the bamboo mat rolls the stack into maki.
  roll(plate) {
    const problem = rollProblem(this.board, this.rolled);
    if (problem) {
      plate.setPosition(this.boardX, 470);
      this.say({ need_nori: NORI.needNori, too_small: NORI.tooSmall, already_rolled: NORI.alreadyRolled }[problem]);
      return;
    }
    plate.disableInteractive();
    this.tweens.add({ targets: plate, x: this.mat.x, y: this.mat.y, duration: 150 });
    this.tweens.add({
      targets: plate, scaleY: 0.2, delay: 150, duration: 250, yoyo: true, ease: 'Sine.inOut',
      onComplete: () => {
        this.rolled = true;
        this.rebuildPlate();
        if (this.inventing) {
          this.say(inventProblem(this.board, true) ? NORI.invent.not_a_topping : NORI.rolled);
          return;
        }
        const hint = boardHint(this.customer.order, this.board, true);
        this.say(hint === 'ready' ? NORI.rolled : NORI.wrongTopping);
      },
    });
    this.tweens.add({ targets: this.mat, angle: { from: -4, to: 4 }, delay: 150, duration: 100, yoyo: true, repeat: 1, onComplete: () => this.mat.setAngle(0) });
  }

  serve() {
    if (this.inventing) {
      this.serveInvention();
      return;
    }
    const result = servePlate(this.customer.order, this.board, { mistakes: this.mistakes, rolled: this.rolled });
    if (result.needsRoll) {
      // Right stack, just not rolled yet: send it back to the board instead of wasting it.
      this.rebuildPlate();
      this.say(NORI.needsRoll);
      return;
    }
    this.clearBoard();
    if (!result.correct) {
      this.mistakes++;
      this.say(NORI.wrongServe);
      this.tweens.add({ targets: this.customerSprite, x: '+=10', duration: 60, yoyo: true, repeat: 3 });
      return;
    }
    const stars = rateOrder(this.mistakes);
    this.say(`${pick(NORI.correct)}\n+${result.coins} coins${result.tip ? ` (tip ${result.tip})` : ''}`);
    this.finishOrder(result.coins, stars);
  }

  serveInvention() {
    const cust = this.customer;
    const result = serveChefsChoice(this.board, {
      rolled: this.rolled, mistakes: this.mistakes, tastes: TASTES[cust.kind], customerName: cust.name,
    });
    if (!result.ok) {
      // Not sushi yet: hand it back so it can be finished or trashed.
      if (result.problem !== 'roll_it' && INVENT_MISTAKES.includes(result.problem)) this.mistakes++;
      this.rebuildPlate();
      this.say(result.problem === 'roll_it' ? NORI.needsRoll : NORI.invent[result.problem]);
      this.tweens.add({ targets: this.customerSprite, x: '+=10', duration: 60, yoyo: true, repeat: 3 });
      return;
    }
    const plate = { stack: [...this.board], rolled: this.rolled };
    this.clearBoard();
    let note = null;
    if (result.recipe) {
      const save = loadSave();
      const added = addToRecipeBook(save, result.recipe, { stars: result.stars, customer: cust.name });
      writeSave(save);
      if (added === 'new') this.newRecipes++;
      note = { new: BOOK.added, better: BOOK.better }[added];
      if (note) this.showRecipeNote(note, result.recipe.name, plate);
    }
    const line = result.reasons.isNew ? (note === BOOK.added ? NORI.newRecipe : NORI.rating[result.stars]) : NORI.notNew;
    this.say(`${line}\n+${result.coins} coins`);
    this.finishOrder(result.coins, result.stars);
  }

  // A little card that pops up over the board when the Recipe Book changes.
  showRecipeNote(note, name, plate) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.cream).fillRoundedRect(-140, -70, 280, 140, 14);
    g.lineStyle(3, COLORS.vermilion).strokeRoundedRect(-140, -70, 280, 140, 14);
    const dish = drawPlate(this, plate.stack, plate.rolled).setScale(0.6).setPosition(0, 2);
    const card = this.add.container(this.boardX, 470, [
      g,
      this.add.text(0, -50, note, { fontFamily: TITLE_FONT, fontSize: '16px', color: '#d2452c', fontStyle: 'bold', align: 'center' }).setOrigin(0.5, 0),
      dish,
      this.add.text(0, 40, name, { fontFamily: BODY_FONT, fontSize: '14px', color: '#2b2118', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5, 0),
    ]).setDepth(20).setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: card, alpha: 0, y: 440, delay: 1900, duration: 400, onComplete: () => card.destroy() });
  }

  // Pays up, shows the customer's star rating, and sends them on their way.
  finishOrder(coins, stars) {
    this.coins += coins;
    this.served++;
    this.ratings.push(stars);
    this.updateHud();
    const cust = this.customer;
    this.customer = null;
    this.inventing = false;
    this.orderBubble.destroy();
    const rating = this.add.text(760, 44, starText(stars), {
      fontFamily: BODY_FONT, fontSize: '30px', color: '#e0a82e', backgroundColor: '#fffaf0', padding: { x: 8, y: 0 },
    }).setOrigin(0.5).setDepth(5).setScale(0.3);
    this.tweens.add({ targets: rating, scale: 1, duration: 350, ease: 'Back.out' });
    const thanks = this.add.text(760, 96, THANKS[cust.kind], {
      fontFamily: BODY_FONT, fontSize: '18px', color: '#2c3e6b', backgroundColor: '#fffaf0', padding: { x: 8, y: 6 }, wordWrap: { width: 220 },
    }).setOrigin(0.5).setDepth(5);
    const sprite = this.customerSprite;
    this.tweens.killTweensOf(sprite);
    this.tweens.add({ targets: [sprite, thanks, rating], alpha: 0, delay: 1700, duration: 500 });
    this.tweens.add({
      targets: sprite, x: 1100, delay: 1700, duration: 700, onComplete: () => {
        sprite.destroy();
        thanks.destroy();
        rating.destroy();
        this.nextCustomer();
      },
    });
  }
}

class ResultsScene extends Phaser.Scene {
  constructor() { super('results'); }

  create({ level, coins, stars, ratings = [], newRecipes = 0 }) {
    drawBackdrop(this);
    drawNori(this, 200, 300);
    speechBubble(this, 360, 70, 540, 330);
    this.add.text(630, 115, 'Shift complete!', { fontFamily: TITLE_FONT, fontSize: '44px', color: '#2c3e6b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(630, 185, starText(stars, 3), { fontFamily: BODY_FONT, fontSize: '56px', color: '#e0a82e' }).setOrigin(0.5);
    this.add.text(630, 245, `${coins} coins earned`, { fontFamily: BODY_FONT, fontSize: '24px', color: '#2b2118' }).setOrigin(0.5);
    const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    this.add.text(630, 282, `Customers rated you ${average.toFixed(1)} out of 5 ★`, { fontFamily: BODY_FONT, fontSize: '20px', color: '#2b2118' }).setOrigin(0.5);
    if (newRecipes) {
      this.add.text(630, 312, `${newRecipes} new recipe${newRecipes > 1 ? 's' : ''} in your Recipe Book`, { fontFamily: BODY_FONT, fontSize: '18px', color: '#d2452c' }).setOrigin(0.5);
    }
    this.add.text(630, 355, stars === 3 ? '"...Fine. That was purr-fect. Tell no one."' : '"Fin-ally. Now let me nap."', {
      fontFamily: BODY_FONT, fontSize: '18px', color: '#6b5a48', fontStyle: 'italic',
    }).setOrigin(0.5);
    button(this, 520, 460, 'Play again', () => this.scene.start('bar', { level }));
    const next = LEVELS[level + 1];
    button(this, 760, 460, next ? 'Next level' : 'More soon', () => {
      if (next) this.scene.start('bar', { level: level + 1 });
    });
    button(this, 640, 540, BOOK.button, () => this.scene.start('book', { back: 'results', data: { level, coins, stars, ratings, newRecipes } }), 22);
  }
}

// A plain HTML box over the game for typing a recipe's name, since a canvas can't take
// typing (or bring up a tablet keyboard) on its own. Calls onDone with the text, or null.
function askForName(current, onDone) {
  const shade = document.createElement('div');
  shade.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:10;';
  shade.innerHTML = `
    <form style="background:#fffaf0;border:3px solid #2b2118;border-radius:16px;padding:20px;width:min(380px,90vw);font-family:${BODY_FONT.replace(/"/g, "'")};color:#2b2118;">
      <div style="font:bold 22px ${TITLE_FONT.replace(/"/g, "'")};color:#2c3e6b;margin-bottom:6px;">${BOOK.renameTitle}</div>
      <div style="font-size:14px;color:#6b5a48;margin-bottom:12px;">${BOOK.renameHint}</div>
      <input name="n" maxlength="${MAX_NAME}" autocomplete="off" style="box-sizing:border-box;width:100%;font-size:18px;padding:8px 10px;border:2px solid #c9b48a;border-radius:8px;">
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
        <button type="button" data-cancel style="font-size:16px;padding:8px 14px;border:2px solid #2c3e6b;border-radius:8px;background:#fffaf0;color:#2c3e6b;">Cancel</button>
        <button type="submit" style="font-size:16px;padding:8px 14px;border:0;border-radius:8px;background:#d2452c;color:#fffaf0;">Save</button>
      </div>
    </form>`;
  const form = shade.querySelector('form');
  const input = form.elements.n;
  input.value = current;
  const close = (value) => { shade.remove(); onDone(value); };
  form.addEventListener('submit', (e) => { e.preventDefault(); close(input.value); });
  shade.querySelector('[data-cancel]').addEventListener('click', () => close(null));
  shade.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(null); });
  document.body.appendChild(shade);
  input.focus();
  input.select();
}

// Every recipe the player has invented, eight to a page. Tap one to rename it.
class RecipeBookScene extends Phaser.Scene {
  constructor() { super('book'); }

  create({ back = 'title', data = {}, page = 0 }) {
    const book = loadSave().recipeBook;
    drawBackdrop(this);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25).fillRect(0, 0, W, H);
    g.fillStyle(0x8a3a2a).fillRoundedRect(30, 24, W - 60, H - 48, 18); // the book's cover
    g.fillStyle(COLORS.cream).fillRoundedRect(44, 36, W - 88, H - 72, 12);
    if (book.length) g.lineStyle(2, COLORS.shojiLine).lineBetween(W / 2, 110, W / 2, H - 90);
    this.add.text(W / 2, 64, BOOK.title, { fontFamily: TITLE_FONT, fontSize: '36px', color: '#2c3e6b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(W / 2, 96, `${BOOK.subtitle} (${book.length})${book.length ? ` · ${BOOK.tapToRename}` : ''}`, { fontFamily: BODY_FONT, fontSize: '16px', color: '#6b5a48', fontStyle: 'italic' }).setOrigin(0.5);

    if (book.length === 0) {
      this.add.container(W / 2, 360, [drawNori(this, 0, 0)]).setScale(0.65); // wrapped so his breathing tween keeps its shape
      this.add.text(W / 2, 140, `"${NORI.bookEmpty}"`, {
        fontFamily: BODY_FONT, fontSize: '18px', color: '#2b2118', wordWrap: { width: 560 }, align: 'center',
      }).setOrigin(0.5, 0);
    }

    const perPage = 8;
    const pages = Math.max(1, Math.ceil(book.length / perPage));
    page = Math.min(page, pages - 1);
    book.slice(page * perPage, page * perPage + perPage).forEach((r, i) => {
      // Two cards on each page of the open book.
      const x = [157, 367, 593, 803][i % 4];
      const y = 190 + Math.floor(i / 4) * 175;
      this.add.graphics().fillStyle(0xf6ecd6).fillRoundedRect(x - 98, y - 70, 196, 160, 10);
      this.add.text(x + 86, y - 60, '✎', { fontFamily: BODY_FONT, fontSize: '18px', color: '#6b5a48' }).setOrigin(1, 0);
      const hit = this.add.zone(x, y + 10, 196, 160).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => this.rename(r, { back, data, page }));
      drawPlate(this, r.stack, r.rolled).setPosition(x, y - 28).setScale(0.6);
      this.add.text(x, y + 6, r.name, {
        fontFamily: TITLE_FONT, fontSize: '15px', color: '#d2452c', fontStyle: 'bold', wordWrap: { width: 180 }, align: 'center',
      }).setOrigin(0.5, 0);
      this.add.text(x, y + 46, starText(r.bestStars), { fontFamily: BODY_FONT, fontSize: '18px', color: '#e0a82e' }).setOrigin(0.5, 0);
      this.add.text(x, y + 68, BOOK.madeFor(r.inventedFor), { fontFamily: BODY_FONT, fontSize: '12px', color: '#6b5a48' }).setOrigin(0.5, 0);
    });

    const flip = (p) => this.scene.restart({ back, data, page: p });
    if (page > 0) button(this, 130, H - 66, '◀', () => flip(page - 1), 22);
    if (page < pages - 1) button(this, W - 130, H - 66, '▶', () => flip(page + 1), 22);
    if (pages > 1) this.add.text(W / 2, H - 112, `Page ${page + 1} of ${pages}`, { fontFamily: BODY_FONT, fontSize: '14px', color: '#6b5a48' }).setOrigin(0.5);
    button(this, W / 2, H - 66, 'Back', () => this.scene.start(back, data), 22);
  }

  rename(recipe, where) {
    this.input.enabled = false;
    askForName(recipe.name, (name) => {
      this.input.enabled = true;
      if (name === null) return;
      const save = loadSave();
      renameRecipe(save, recipe.id, name);
      writeSave(save);
      this.scene.restart(where);
    });
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#f3e9d2',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene, BarScene, ResultsScene, RecipeBookScene],
});
