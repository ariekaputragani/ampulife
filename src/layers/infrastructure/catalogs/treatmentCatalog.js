export const treatmentCatalog = [
  {
    id: "basic_checkup",
    name: "Checkup Dasar",
    minAge: 0,
    cost: 750_000,
    effect: { health: 5, happy: 1 },
    canCure: false,
  },
  {
    id: "full_treatment",
    name: "Perawatan Lengkap",
    minAge: 0,
    cost: 8_000_000,
    effect: { health: 14, happy: 4 },
    canCure: true,
  },
];
