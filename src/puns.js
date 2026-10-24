// Everything Chef Nori and the customers say. One pun per moment, please.

export const NORI = {
  title: 'Ugh. Another day of feeding everyone. Fine.',
  intro: "Ugh. Customers. Fine. I'll teach you once, kitten. Drag the RICE onto the board.",
  // Said when a level starts, by level id. Falls back to intro.
  levelIntro: {
    2: "Let's get this roll-ing. Maki time. Drag the NORI onto the board first.",
  },
  nextNigiri: 'Next customer. Rice first, then the fish. You know this.',
  nextMaki: 'A maki order. Nori, rice, filling, then roll it. Chop chop.',
  // What to add next while building a maki, by how many pieces are on the board.
  makiSteps: [
    null,
    'Now the RICE, right on the seaweed. Spread it like you mean it.',
    "Now the filling they asked for. Check the bubble. I'm not your secretary.",
  ],
  noriFirst: "Seaweed goes down FIRST. It's a wrap, not a hat. Trash it.",
  wrongOrder: "Wrong order, kitten. Nori, then rice, then filling. Trash it and try again.",
  rollIt: "Now drag the whole plate onto the bamboo mat. Let's get this roll-ing.",
  rolled: 'Rolled. Look at that. Barely a disaster. Now serve it.',
  needNori: "You can't roll that without nori. It'd just be a sad rice blanket.",
  tooSmall: 'Not done yet. Finish the stack, THEN roll it.',
  alreadyRolled: "It's already rolled. Roll it again and it's a carpet.",
  rolledFull: "It's rolled shut. You can't stuff more in. Serve it or trash it.",
  needsRoll: "A raw stack? Roll it on the mat first. Sheesh.",
  spiritKid: "A little lantern ghost. Past your bedtime, isn't it? Fine. What'll it be?",
  afterRice: 'Now drag the fish they want on top. Pay a-tension.',
  riceFirst: 'Rice goes FIRST. Everyone knows that. Even dogs know that.',
  wrongTopping: "That's not what they ordered. Drag the plate to the trash and start over.",
  ready: 'Looks right. Drag the plate to the customer. Go on.',
  tooMuch: "That's a sushi tower, not nigiri. Trash it.",
  trashed: 'Into the bin. Fishy business, that.',
  correct: [
    "Purr-fection. Don't get used to it.",
    'Claw-some. I guess.',
    "Not bad. For a kitten.",
    'Hmph. They liked it. Whatever.',
  ],
  wrongServe: "That's a cat-astrophe. They didn't order that.",
  spirit: "Oh great, a ghost. You're BOO-king a seat? Fine.",
  levelDone: 'Fin-ally. Shift over. Now let me nap.',

  // Chef's choice orders, where the customer wants something new.
  chefsChoice: "Chef's choice? They want us to INVENT something. Fine. Rice or nori first, then whatever they'd like.",
  invent: {
    rice_first: 'Even inventions start with RICE. Or nori, for a roll. Trash it.',
    rice_after_nori: 'After the nori comes rice. Always. Without it, it is just a sad leaf. Trash it.',
    not_a_topping: "Rice on top? Seaweed on top? That's not an invention, that's a cat-astrophe. Trash it.",
    need_topping: 'Now the tasty part. Check what they love. Go wild. Not TOO wild.',
    roll_it: "It's a roll, so roll it. Bamboo mat. Go.",
    ready: "That's sushi. Serve it, or add one more thing. Your call.",
  },
  notNew: "That's just a plain old menu plate. Very brave. Very boring.",
  newRecipe: 'A new recipe! Into the Recipe Book it goes. Don\'t let it go to your head.',
  // What Nori says about a rating, by number of stars.
  rating: {
    1: "One star. I've had hairballs rated higher.",
    2: 'Two stars. Hmph. We can do better than that.',
    3: 'Three stars. Fine. Middle of the road, like a lazy cat.',
    4: 'Four stars. Not bad. For a kitten.',
    5: "Five stars?! Purr-fect. ...I taught you that, you know.",
  },
  bookEmpty: 'Empty. Like my food bowl. Serve a chef\'s choice order to invent something.',
};

// What each customer says when they want Nori to invent something.
export const CHEFS_CHOICE_LINES = {
  mouse: 'S-surprise me? Something with salmon? N-no tuna please.',
  owl: 'Hoo, surprise me. Something with tuna, please.',
  kitsune: 'Amaze me, dear. I adore salmon.',
  dog: 'Surprise me! Tuna! Fast! No salmon! Woof!',
  tanuki: 'Something new, chef. Put it on the tab. I like tuna.',
  turtle: "Make me something new, young whiskers. I'm partial to salmon.",
  lantern: 'Make up a recipe! With cucumber! No fish, it makes my flame go fishy!',
  bunny: 'Invent me something! Cucumbers are hop-tastic!',
  kappa: 'Chef\'s choice. Yes, cucumber. I know. No salmon.',
  panda: 'Something new, please. Cucumber, no tuna. Bamboo-zle me!',
};

// Recipe Book wording.
export const BOOK = {
  title: 'Recipe Book',
  subtitle: 'Your Cat-ventions',
  button: 'Recipe Book',
  madeFor: (name) => `Invented for ${name}`,
  added: 'NEW RECIPE!\nAdded to your Recipe Book',
  better: 'Better rating saved\nin your Recipe Book',
  tapToRename: 'tap a recipe to rename it',
  renameTitle: 'Name your recipe',
  renameHint: "Nori says: make it a good one. Or a punny one. Ideally both.",
};

// Level map, title screen and results wording.
export const MAP = {
  title: 'Lantern Lane',
  subtitle: 'Each lantern is a shift. Tap a lit one to open the shop.',
  button: 'Level map',
  continue: (n) => `Continue: Level ${n}`,
  start: 'Open the shop',
  nori: [
    'Pick a lantern. Any lantern. My nap is waiting.',
    "Light them all, kitten. Then maybe I'll purr. Maybe.",
    "Stars? Coins? I'm not im-paw-ssed. Yet.",
    'Walk faster. These paws were made for napping.',
  ],
  locked: (n) => `That lantern's still dark. Finish Level ${n} first. No skipping, kitten.`,
  soon: "That one's still being built. Even I can't cook in an empty kitchen.",
  playAgain: 'Back again? Glutton for punish-mint. Fine.',
  locks: 'Locked',
  comingSoon: 'Coming soon',
  wallet: (coins) => `${coins} coins`,
};

export const RESULTS = {
  unlocked: (n) => `Level ${n} unlocked! A new lantern is lit.`,
  moreStars: 'New best stars for this level!',
  bestCoins: 'New best coins for this level!',
  wallet: (coins) => `${coins} coins in the wallet`,
};

export const RESET = {
  link: 'Reset progress (grown-ups)',
  title: 'Reset progress?',
  body: 'This wipes all stars, unlocked levels and coins, and starts again from Level 1.',
  clearBook: 'Also clear the Recipe Book',
  typeIt: 'Type RESET to confirm.',
  button: 'Reset',
};

export const CUSTOMER_LINES = {
  mouse: 'Um... s-salmon please. Please don\'t eat me.',
  owl: 'Hoo... tuna, please. I\'m up past my bedtime.',
  kitsune: 'One salmon nigiri. I can smell if it is not fresh, dear.',
  dog: 'Tuna! Fast! I have a meeting in five minutes! Woof!',
  tanuki: 'Salmon nigiri. And put it on the company tab. Forever.',
  turtle: "A tuna roll, young whiskers. No rush. I'm in no rush. Ever.",
  lantern: 'Cucumber roll please! Only cucumber! Fish makes my flame go fishy.',
  bunny: 'Salmon nigiri! Hop to it! I mean, please!',
  kappa: 'Tuna maki. Everyone thinks kappa only eat cucumber. Shell-ocking, I know.',
  panda: 'Cucumber roll, please. I like anything that comes in a bamboo mat.',
};

export const THANKS = {
  mouse: 'Th-thank you! It\'s squeak-tacular!',
  owl: 'Hoo-ray! Owl be back.',
  kitsune: 'Fox-tastic. You may keep your ears.',
  dog: 'Paw-some! Gotta run!',
  tanuki: 'Excellent. My spirit is lifted. Well, more lifted.',
  turtle: 'Shell-ebrate! Worth the wait.',
  lantern: "Yay! You're glow-rious!",
  bunny: 'Some-bunny here is a great chef!',
  kappa: 'Water-ful roll. I mean wonderful.',
  panda: "Bam-boo-tiful. Thank you!",
};

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
