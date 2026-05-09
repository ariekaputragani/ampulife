export const crimeCatalog = [
  {
    id: "pickpocket",
    name: "Copet",
    minAge: 12,
    rewardRange: [500_000, 3_000_000],
    jailChance: 0.18,
    jailYears: [1, 2],
    statDelta: { happy: 2, health: 0, smarts: 0, looks: 0 },
    caughtPenalty: { happy: -20, health: 0, smarts: 0 }
  },
  {
    id: "car_theft",
    name: "Curi Mobil",
    minAge: 16,
    rewardRange: [6_000_000, 28_000_000],
    jailChance: 0.36,
    jailYears: [2, 5],
    statDelta: { happy: 5, health: 0, smarts: 0, looks: 0 },
    caughtPenalty: { happy: -30, health: 0, smarts: 0 }
  },
  {
    id: "fraud",
    name: "Penipuan Finansial",
    minAge: 18,
    rewardRange: [12_000_000, 55_000_000],
    jailChance: 0.44,
    jailYears: [3, 7],
    statDelta: { happy: 6, health: 0, smarts: 0, looks: 0 },
    caughtPenalty: { happy: -35, health: 0, smarts: 0 }
  },
  {
    id: "troublemaker",
    name: "Pembuat Onar",
    minAge: 8,
    rewardRange: [0, 0],
    jailChance: 0.05,
    jailYears: [0, 1],
    statDelta: { happy: 5, health: 0, smarts: 0, looks: 0 },
    description: "Melakukan aksi meresahkan seperti order fiktif ojek online.",
    caughtPenalty: { happy: -10, health: 0, smarts: 0 }
  },
];
