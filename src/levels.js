// Level data. Learning levels have no timer (timeLimit: null).

// The level map shows dark "coming soon" lanterns until there are this many levels.
export const MAP_SLOTS = 5;

export const LEVELS = [
  {
    id: 1,
    title: 'Learning Level 1: Nigiri',
    name: 'Nigiri',
    timeLimit: null,
    rollingMat: false,
    menu: ['salmon_nigiri', 'tuna_nigiri'],
    ingredients: ['rice', 'salmon', 'tuna'],
    customers: [
      { kind: 'mouse', name: 'Shy Mouse', order: 'salmon_nigiri' },
      { kind: 'owl', name: 'Sleepy Owl', order: 'tuna_nigiri' },
      { kind: 'kitsune', name: 'Kitsune Lady', order: 'salmon_nigiri', spirit: true },
      { kind: 'dog', name: 'Business Dog', order: 'tuna_nigiri' },
      { kind: 'tanuki', name: 'Tanuki Salaryman', order: 'salmon_nigiri', spirit: true },
    ],
    // Coins needed for 1, 2 and 3 stars. A perfect run (every plate right first try) is 79.
    starTargets: [30, 60, 79],
  },
  {
    id: 2,
    title: 'Learning Level 2: Maki rolls',
    name: 'Maki rolls',
    timeLimit: null,
    rollingMat: true,
    menu: ['tuna_maki', 'cucumber_maki', 'salmon_nigiri', 'tuna_nigiri'],
    ingredients: ['nori', 'rice', 'salmon', 'tuna', 'cucumber'],
    customers: [
      { kind: 'turtle', name: 'Old Turtle', order: 'tuna_maki' },
      { kind: 'lantern', name: 'Lantern Kid', order: 'cucumber_maki', spirit: true },
      { kind: 'bunny', name: 'Busy Bunny', order: 'salmon_nigiri' },
      { kind: 'kappa', name: 'Kappa', order: 'tuna_maki', spirit: true },
      { kind: 'panda', name: 'Bamboo Panda', order: 'cucumber_maki' },
    ],
    // A perfect run is 79 again: 14 + 8 + 10 + 14 + 8, plus a 5 coin tip each.
    starTargets: [30, 60, 79],
  },
  {
    id: 3,
    title: 'Learning Level 3: Fancy rolls',
    name: 'Fancy rolls',
    timeLimit: null,
    rollingMat: true,
    menu: ['caterpillar_roll', 'dragon_roll', 'rainbow_roll', 'cucumber_maki'],
    ingredients: ['nori', 'rice', 'cucumber', 'eel', 'salmon'],
    // Toppings sit in little dishes on the counter. They go on after the roll is rolled.
    tray: ['avocado', 'sesame', 'sauce'],
    customers: [
      { kind: 'bunny', name: 'Busy Bunny', order: 'caterpillar_roll', line: "A caterpillar roll! It's avocado on top, not bugs. I asked. Twice." },
      { kind: 'dragon', name: 'Little Dragon', order: 'dragon_roll', spirit: true },
      { kind: 'kitsune', name: 'Kitsune Lady', order: 'rainbow_roll', spirit: true, line: 'A rainbow roll, dear. Salmon, avocado and a little sesame on top.' },
      { kind: 'panda', name: 'Bamboo Panda', order: 'cucumber_maki', line: 'Just a plain cucumber roll, please. No toppings. I like it simple.' },
      { kind: 'turtle', name: 'Old Turtle', order: 'dragon_roll', line: "A dragon roll, young whiskers. I've waited four hundred years to try one." },
    ],
    // A perfect run is 111: 16 + 20 + 22 + 8 + 20, plus a 5 coin tip each. Three stars
    // needs 104, so a 5 star chef's choice in place of the 27 coin Rainbow Roll still gets there.
    starTargets: [45, 85, 104],
  },
];
