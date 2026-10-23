import { INGREDIENTS, RECIPES, MAX_BOARD, servePlate, boardHint, starsFor } from './logic.js';
import { LEVELS } from './levels.js';
import { NORI, CUSTOMER_LINES, THANKS, pick } from './puns.js';

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
  g.fillStyle(look.fur);
  g.fillEllipse(0, 80, 130, 110); // body
  if (look.ears === 'round') {
    g.fillCircle(-48, -56, 26).fillCircle(48, -56, 26);
    g.fillStyle(look.inner).fillCircle(-48, -56, 14).fillCircle(48, -56, 14);
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
  }
  g.fillStyle(0xffffff).fillCircle(-22, -18, 9).fillCircle(22, -18, 9);
  g.fillStyle(0x111111).fillCircle(-22, -16, 5).fillCircle(22, -16, 5);
  g.fillStyle(0x111111).fillCircle(0, 4, 5);
  if (cust.kind === 'tanuki') {
    g.fillStyle(0x333333).fillRect(-14, 50, 28, 60); // necktie
  }
  if (cust.kind === 'kitsune') {
    g.fillStyle(0xb02a3a).fillRoundedRect(-60, 50, 120, 80, 20); // kimono
    g.fillStyle(0xf2c14e).fillRect(-60, 80, 120, 14);
  }
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
    y -= ing === 'rice' ? 24 : 16;
  }
  return c;
}

function speechBubble(scene, x, y, w, h) {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.cream).fillRoundedRect(x, y, w, h, 16);
  g.lineStyle(3, COLORS.ink).strokeRoundedRect(x, y, w, h, 16);
  return g;
}

function button(scene, x, y, label, onClick) {
  const t = scene.add.text(x, y, label, {
    fontFamily: TITLE_FONT, fontSize: '28px', color: '#fffaf0', backgroundColor: '#d2452c', padding: { x: 22, y: 10 },
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
    button(this, 640, 470, 'Open the shop', () => this.scene.start('bar', { level: 0 }));
  }
}

class BarScene extends Phaser.Scene {
  constructor() { super('bar'); }

  init(data) {
    this.level = LEVELS[data.level ?? 0];
    this.levelIndex = data.level ?? 0;
    this.board = [];
    this.coins = 0;
    this.served = 0;
    this.customerIndex = -1;
    this.mistakes = 0;
    this.taughtRice = false;
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

    this.makeBins();
    this.boardImage = this.add.image(560, 470, 'board');
    this.boardZone = new Phaser.Geom.Rectangle(560 - 130, 470 - 75, 260, 150);
    this.trash = this.add.image(860, 470, 'trash');
    this.add.text(860, 535, 'Trash', { fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118' }).setOrigin(0.5);

    this.input.on('drag', (pointer, obj, x, y) => obj.setPosition(x, y));
    this.input.on('dragend', (pointer, obj) => this.onDrop(pointer, obj));

    this.updateHud();
    this.say(NORI.intro);
    this.nextCustomer();
  }

  makeBins() {
    this.level.ingredients.forEach((ing, i) => {
      const x = 80 + i * 110;
      const y = 470;
      this.add.image(x, y, 'bin');
      this.add.text(x, y + 56, INGREDIENTS[ing].name, { fontFamily: BODY_FONT, fontSize: '16px', color: '#2b2118' }).setOrigin(0.5);
      const piece = this.add.image(x, y, ing).setScale(0.8).setInteractive({ useHandCursor: true, draggable: true });
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
      }));
      return;
    }
    const cust = this.level.customers[this.customerIndex];
    this.customer = cust;
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
    const icon = drawStack(this, recipe.stack);
    icon.setPosition(670, 180).setScale(0.75);
    const name = this.add.text(670, 225, recipe.name, {
      fontFamily: TITLE_FONT, fontSize: '18px', color: '#d2452c', fontStyle: 'bold',
    }).setOrigin(0.5);
    const words = this.add.text(670, 245, `"${CUSTOMER_LINES[cust.kind]}"`, {
      fontFamily: BODY_FONT, fontSize: '13px', color: '#2b2118', wordWrap: { width: 150 }, align: 'center',
    }).setOrigin(0.5, 0);
    this.orderBubble = this.add.container(0, 0, [g, icon, name, words]);
    this.orderBubble.setDepth(5).setAlpha(0);
    this.tweens.add({ targets: this.orderBubble, alpha: 1, delay: 500, duration: 300 });

    if (this.customerIndex > 0) {
      this.say(cust.spirit ? NORI.spirit : (this.taughtRice ? 'Next customer. Rice first, then the fish. You know this.' : NORI.intro));
    }
  }

  rebuildPlate() {
    this.plate?.destroy();
    this.plate = null;
    if (this.board.length === 0) return;
    const stack = drawStack(this, this.board);
    this.plate = this.add.container(560, 470, [stack]);
    this.plate.setSize(150, 110);
    this.plate.setInteractive({ useHandCursor: true, draggable: true });
    this.plate.setData({ kind: 'plate', home: { x: 560, y: 470 } });
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
      this.board = [];
      this.rebuildPlate();
      this.say(NORI.trashed);
    } else {
      obj.setPosition(home.x, home.y);
    }
  }

  addToBoard(ing) {
    if (this.board.length >= MAX_BOARD) {
      this.say(NORI.tooMuch);
      return;
    }
    this.board.push(ing);
    this.rebuildPlate();
    const hint = boardHint(this.customer.order, this.board);
    if (hint === 'rice_first') { this.mistakes++; this.say(NORI.riceFirst); }
    else if (hint === 'wrong_topping') { this.mistakes++; this.say(this.board.length > RECIPES[this.customer.order].stack.length ? NORI.tooMuch : NORI.wrongTopping); }
    else if (hint === 'ready') this.say(NORI.ready);
    else if (this.board.length === 1) { this.taughtRice = true; this.say(NORI.afterRice); }
  }

  serve() {
    const result = servePlate(this.customer.order, this.board, { mistakes: this.mistakes });
    this.board = [];
    this.rebuildPlate();
    if (!result.correct) {
      this.mistakes++;
      this.say(NORI.wrongServe);
      this.tweens.add({ targets: this.customerSprite, x: '+=10', duration: 60, yoyo: true, repeat: 3 });
      return;
    }
    this.coins += result.coins;
    this.served++;
    this.updateHud();
    this.say(`${pick(NORI.correct)}\n+${result.coins} coins${result.tip ? ` (tip ${result.tip})` : ''}`);
    const cust = this.customer;
    this.customer = null;
    this.orderBubble.destroy();
    const thanks = this.add.text(760, 90, THANKS[cust.kind], {
      fontFamily: BODY_FONT, fontSize: '18px', color: '#2c3e6b', backgroundColor: '#fffaf0', padding: { x: 8, y: 6 }, wordWrap: { width: 220 },
    }).setOrigin(0.5).setDepth(5);
    const sprite = this.customerSprite;
    this.tweens.killTweensOf(sprite);
    this.tweens.add({ targets: [sprite, thanks], alpha: 0, delay: 1200, duration: 500 });
    this.tweens.add({
      targets: sprite, x: 1100, delay: 1200, duration: 700, onComplete: () => {
        sprite.destroy();
        thanks.destroy();
        this.nextCustomer();
      },
    });
  }
}

class ResultsScene extends Phaser.Scene {
  constructor() { super('results'); }

  create({ level, coins, stars }) {
    drawBackdrop(this);
    drawNori(this, 200, 300);
    speechBubble(this, 360, 90, 540, 300);
    this.add.text(630, 140, 'Shift complete!', { fontFamily: TITLE_FONT, fontSize: '44px', color: '#2c3e6b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(630, 215, '★'.repeat(stars) + '☆'.repeat(3 - stars), { fontFamily: BODY_FONT, fontSize: '56px', color: '#e0a82e' }).setOrigin(0.5);
    this.add.text(630, 285, `${coins} coins earned`, { fontFamily: BODY_FONT, fontSize: '24px', color: '#2b2118' }).setOrigin(0.5);
    this.add.text(630, 335, stars === 3 ? '"...Fine. That was purr-fect. Tell no one."' : '"Fin-ally. Now let me nap."', {
      fontFamily: BODY_FONT, fontSize: '18px', color: '#6b5a48', fontStyle: 'italic',
    }).setOrigin(0.5);
    button(this, 520, 470, 'Play again', () => this.scene.start('bar', { level }));
    const next = LEVELS[level + 1];
    button(this, 760, 470, next ? 'Next level' : 'More soon', () => {
      if (next) this.scene.start('bar', { level: level + 1 });
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
  scene: [TitleScene, BarScene, ResultsScene],
});
