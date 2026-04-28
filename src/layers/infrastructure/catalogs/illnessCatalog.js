export const illnessCatalog = [
  {
    id: "flu",
    name: "Flu",
    minAge: 0,
    maxAge: 80,
    baseSeverity: "mild",
    yearlyPenalty: { health: 3, happy: 1 },
    mortalityRisk: 0,
    chanceWeight: 100,
  },
  {
    id: "pertussis",
    name: "Batuk Rejan",
    minAge: 0,
    maxAge: 10,
    baseSeverity: "mild",
    yearlyPenalty: { health: 4, happy: 2 },
    mortalityRisk: 0.01,
    chanceWeight: 40,
  },
  {
    id: "measles",
    name: "Campak",
    minAge: 0,
    maxAge: 12,
    baseSeverity: "mild",
    yearlyPenalty: { health: 5, happy: 2 },
    mortalityRisk: 0.005,
    chanceWeight: 40,
  },
  {
    id: "dengue",
    name: "Demam Berdarah",
    minAge: 5,
    maxAge: 65,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 8, happy: 4 },
    mortalityRisk: 0.02,
    chanceWeight: 30,
  },
  {
    id: "cancer",
    name: "Kanker",
    minAge: 0,
    maxAge: 100,
    baseSeverity: "severe",
    yearlyPenalty: { health: 15, happy: 10 },
    mortalityRisk: 0.12,
    chanceWeight: 1, // Sangat jarang
  },
  {
    id: "coronavirus",
    name: "Coronavirus",
    minAge: 0,
    maxAge: 100,
    baseSeverity: "severe",
    yearlyPenalty: { health: 12, happy: 8 },
    mortalityRisk: 0.08,
    chanceWeight: 20,
  },
  {
    id: "alzheimer",
    name: "Alzheimer",
    minAge: 60,
    maxAge: 100,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 5, happy: 5, smarts: 10 },
    mortalityRisk: 0.03,
    chanceWeight: 10,
  },
  {
    id: "epilepsy",
    name: "Epilepsi",
    minAge: 0,
    maxAge: 100,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 4, happy: 3 },
    mortalityRisk: 0.01,
    chanceWeight: 3,
  },
  {
    id: "diarrhea",
    name: "Diare",
    minAge: 0,
    maxAge: 90,
    baseSeverity: "mild",
    yearlyPenalty: { health: 4, happy: 2 },
    mortalityRisk: 0.005,
    chanceWeight: 100,
  },
  {
    id: "diabetes",
    name: "Diabetes",
    minAge: 20,
    maxAge: 100,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 6, happy: 3 },
    mortalityRisk: 0.02,
    chanceWeight: 15,
  },
  {
    id: "tuberculosis",
    name: "Tubercolosis",
    minAge: 10,
    maxAge: 90,
    baseSeverity: "moderate",
    yearlyPenalty: { health: 10, happy: 5 },
    mortalityRisk: 0.04,
    chanceWeight: 10,
  },
  {
    id: "heart_disease",
    name: "Penyakit Jantung",
    minAge: 40,
    maxAge: 100,
    baseSeverity: "severe",
    yearlyPenalty: { health: 12, happy: 5 },
    mortalityRisk: 0.1,
    chanceWeight: 8,
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
