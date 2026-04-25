export const crimeCatalog = [
  {
    id: "pickpocket",
    name: "Copet",
    minAge: 12,
    rewardRange: [500_000, 3_000_000],
    jailChance: 0.18,
    jailYears: [1, 2],
    statDelta: { happy: -2, health: -1, smarts: 0, looks: -1 },
  },
  {
    id: "car_theft",
    name: "Curi Mobil",
    minAge: 16,
    rewardRange: [6_000_000, 28_000_000],
    jailChance: 0.36,
    jailYears: [2, 5],
    statDelta: { happy: -5, health: -2, smarts: 1, looks: -3 },
  },
  {
    id: "fraud",
    name: "Penipuan Finansial",
    minAge: 18,
    rewardRange: [12_000_000, 55_000_000],
    jailChance: 0.44,
    jailYears: [3, 7],
    statDelta: { happy: -6, health: -2, smarts: 2, looks: -4 },
  },
];
