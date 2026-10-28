# Neko Nigiri

A sushi game starring Chef Nori, a fat, grumpy black cat. Customers (animals, and the occasional animal-ish spirit) sit at the counter and order sushi. You drag ingredients onto the board, then drag the finished plate to the customer.

The first levels are untimed Learning Levels: Level 1 teaches nigiri, Level 2 teaches maki (nori, rice, filling, then roll it on the bamboo mat), and Level 3 teaches fancy rolls with toppings. Timed levels come after.

In Level 3 a tray of toppings (avocado, sesame and sauce) sits on the counter. Roll the maki first, then drag toppings onto it: a **Caterpillar Roll** is a cucumber roll with avocado on top, a **Dragon Roll** is an eel roll with avocado and then sauce, and a **Rainbow Roll** is a cucumber roll with salmon, avocado and sesame. Toppings can go on in any order, except sauce, which always goes on last. A roll served before its toppings are all on goes back to the board instead of the bin. Chef's choice inventions can have toppings too.

About 1 in 4 levels has a customer (never the first, and at most one per level) who orders **Chef's Choice**: they show what they love and what they won't eat, and you invent something. Every finished order gets a 1 to 5 star rating:

- Menu orders: 5 stars for a clean plate, one less per mistake, never below 3.
- Chef's choice: 1 star for real sushi (rice then toppings, or a rolled nori-rice-filling maki), plus 1 each for being new (not a menu plate), using their favourite, leaving out what they hate, and no mistakes. It pays 4 coins per star.

Progress is saved too. **Lantern Lane**, the level map, hangs one paper lantern per level along a street at dusk: lit lanterns are open and show the best stars earned, dark ones are locked until you finish the level before. Coins from every shift go into a wallet that the shop will spend later. The title screen has **Continue**, which opens the next unfinished level, and a small "Reset progress (grown-ups)" link that asks you to type RESET. The Recipe Book stays unless you tick "Also clear the Recipe Book".

New inventions are saved in the **Recipe Book** (title screen or end of a shift), named after the customer who asked, like "Kappa's Cucumber-Tuna Roll". Tap a recipe in the book to give it your own name. It lives in the browser's localStorage, so it stays between visits on the same device.

The design plan lives in the [game design doc](https://claude.ai/artifact/GVU7KHzPCkyxkKstf7FEHe).

## Run it

```sh
npm install
npm start      # builds dist/ and serves it locally
npm test       # game rule tests
```

Add `?level=2` to the address to start the shop at that level, and `?chef=1` to make every customer after the first order chef's choice.

Built with [Phaser 3](https://phaser.io). There's no bundler: `index.html` loads `src/main.js` as an ES module.

## Layout

- `src/logic.js` holds the game rules (recipes, payouts, hints, stars), with no Phaser in it, so it's testable in Node.
- `src/levels.js` holds level data. Add a level by adding an entry.
- `src/save.js` holds saved progress in localStorage under one key (`neko-nigiri-save`): stars and best coins per level, the coin wallet, upgrades owned, and the Recipe Book. The save has a version number; older saves are upgraded when loaded.
- `src/puns.js` holds everything Chef Nori and the customers say.
- `src/main.js` holds the Phaser scenes and placeholder art, all drawn with shapes.

## Builds

Every pull request gets a playable build on Cloudflare Pages, linked in a comment on the PR. The latest `main` build is the production URL.

Publishing needs two repo secrets: `CLOUDFLARE_API_TOKEN` (a token with the Cloudflare Pages: Edit permission) and `CLOUDFLARE_ACCOUNT_ID`.
