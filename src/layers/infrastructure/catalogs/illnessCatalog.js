export const illnessCatalog = [
  {
    id: "flu",
    name: "Flu",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "mild",
    yearlyPenalty: { health: 3 },
    mortalityRisk: 0,
    chanceWeight: 100,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "pertussis",
    name: "Batuk Rejan",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "mild",
    yearlyPenalty: { health: 15 },
    mortalityRisk: 0.01,
    chanceWeight: 40,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "measles",
    name: "Campak",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "mild",
    yearlyPenalty: { health: 15 },
    mortalityRisk: 0.005,
    chanceWeight: 40,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "dengue", //2
    name: "Demam Berdarah",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 15 },
    mortalityRisk: 0.02,
    chanceWeight: 30,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "cancer", //3
    name: "Kanker",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "severe",
    yearlyPenalty: {
      health: [
        { maxAge: 5, value: 35 },
        { maxAge: 11, value: 10 },
        { maxAge: 17, value: 5 },
        { maxAge: 999, value: 1 }
      ],
      happy: 0
    },
    mortalityRisk: 0.12,
    chanceWeight: 1,
    initialHealingRange: { min: 1000, max: 4000 },
  },
  {
    id: "coronavirus", //4
    name: "Coronavirus",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "severe",
    yearlyPenalty: { health: 8 },
    mortalityRisk: 0.08,
    chanceWeight: 20,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "alzheimer", //5
    name: "Alzheimer",
    minAge: 60,
    maxAge: 999,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 8 },
    mortalityRisk: 0.03,
    chanceWeight: 10,
    initialHealingRange: { min: 1000, max: 4000 },
  },
  {
    id: "epilepsy", //6
    name: "Epilepsi",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 5 },
    mortalityRisk: 0.01,
    chanceWeight: 3,
    initialHealingRange: { min: 500, max: 2000 },
  },
  {
    id: "diarrhea", //8
    name: "Diare",
    minAge: 0,
    maxAge: 999,
    baseSeverity: "mild",
    yearlyPenalty: { health: 3 },
    mortalityRisk: 0.005,
    chanceWeight: 100,
    initialHealingRange: { min: 1, max: 100 },
  },
  {
    id: "diabetes", //9
    name: "Diabetes",
    minAge: 40,
    maxAge: 999,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 3 },
    mortalityRisk: 0.02,
    chanceWeight: 15,
    initialHealingRange: { min: 1000, max: 4000 },
  },
  {
    id: "tuberculosis", //10
    name: "Tubercolosis",
    minAge: 18,
    maxAge: 999,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 15 },
    mortalityRisk: 0.04,
    chanceWeight: 10,
    initialHealingRange: { min: 80, max: 500 },
  },
  {
    id: "heart_disease", //11
    name: "Penyakit Jantung",
    minAge: 60,
    maxAge: 999,
    baseSeverity: "severe",
    yearlyPenalty: { health: 5 },
    mortalityRisk: 0.1,
    chanceWeight: 8,
    initialHealingRange: { min: 1, max: 100 },
  },
];

export function getIllnessById(illnessId) {
  return illnessCatalog.find((item) => item.id === illnessId) ?? null;
}

export function pickIllnessByAge(age, rng = Math.random) {
  const filtered = illnessCatalog.filter((item) => age >= item.minAge && age <= item.maxAge);
  if (filtered.length === 0) {
    return null;
  }

  const totalWeight = filtered.reduce((sum, item) => sum + (item.chanceWeight || 10), 0);
  let randomVal = rng() * totalWeight;

  for (const item of filtered) {
    const weight = item.chanceWeight || 10;
    if (randomVal < weight) {
      return item;
    }
    randomVal -= weight;
  }

  return filtered[0] ?? null;
}
