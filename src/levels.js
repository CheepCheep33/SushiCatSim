// Level data. Learning levels have no timer (timeLimit: null).

export const LEVELS = [
  {
    id: 1,
    title: 'Learning Level 1: Nigiri',
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
];
