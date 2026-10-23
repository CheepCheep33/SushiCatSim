// Everything Chef Nori and the customers say. One pun per moment, please.

export const NORI = {
  title: 'Ugh. Another day of feeding everyone. Fine.',
  intro: "Ugh. Customers. Fine. I'll teach you once, kitten. Drag the RICE onto the board.",
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
};

export const THANKS = {
  mouse: 'Th-thank you! It\'s squeak-tacular!',
  owl: 'Hoo-ray! Owl be back.',
  kitsune: 'Fox-tastic. You may keep your ears.',
  dog: 'Paw-some! Gotta run!',
  tanuki: 'Excellent. My spirit is lifted. Well, more lifted.',
};

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
