# Neko Nigiri

A sushi game starring Chef Nori, a fat, grumpy black cat. Customers (animals, and the occasional animal-ish spirit) sit at the counter and order sushi. You drag ingredients onto the board, then drag the finished plate to the customer.

The first levels are untimed Learning Levels: Level 1 teaches nigiri, Level 2 teaches maki (nori, rice, filling, then roll it on the bamboo mat). Timed levels come after.

The design plan lives in the [game design doc](https://claude.ai/artifact/GVU7KHzPCkyxkKstf7FEHe).

## Run it

```sh
npm install
npm start      # builds dist/ and serves it locally
npm test       # game rule tests
```

Add `?level=2` to the address to start the shop at that level.

Built with [Phaser 3](https://phaser.io). There's no bundler: `index.html` loads `src/main.js` as an ES module.

## Layout

- `src/logic.js` holds the game rules (recipes, payouts, hints, stars), with no Phaser in it, so it's testable in Node.
- `src/levels.js` holds level data. Add a level by adding an entry.
- `src/puns.js` holds everything Chef Nori and the customers say.
- `src/main.js` holds the Phaser scenes and placeholder art, all drawn with shapes.

## Builds

Every pull request gets a playable build on Cloudflare Pages, linked in a comment on the PR. The latest `main` build is the production URL.

Publishing needs two repo secrets: `CLOUDFLARE_API_TOKEN` (a token with the Cloudflare Pages: Edit permission) and `CLOUDFLARE_ACCOUNT_ID`.
