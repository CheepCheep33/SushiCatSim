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
