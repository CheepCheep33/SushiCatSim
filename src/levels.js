// Level data. Learning levels have no timer (timeLimit: null).

export const LEVELS = [
  {
    id: 1,
    title: 'Learning Level 1: Nigiri',
    timeLimit: null,
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
];
