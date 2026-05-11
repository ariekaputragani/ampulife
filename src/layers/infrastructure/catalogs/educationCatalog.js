export const educationCatalog = [
  {
    id: "elementary",
    name: "SD",
    minAge: 6,
    maxAge: 12,
    costPerYear: 0,
    yearsToComplete: 6,
    jobBoost: 0,
  },
  {
    id: "junior_high",
    name: "SMP",
    minAge: 12,
    maxAge: 15,
    costPerYear: 0,
    yearsToComplete: 3,
    jobBoost: 2,
    requirement: (state) => (state.education.completed.includes("elementary") || state.education.completed.includes("paket_a")) && !state.education.completed.includes("junior_high") && !state.education.completed.includes("paket_b"),
  },
  {
    id: "paket_a",
    name: "Program Paket A (Setara SD)",
    minAge: 11,
    costPerYear: 3_000_000,
    yearsToComplete: 1,
    smartsPerYear: 2,
    jobBoost: 0,
    requirement: (state) => !state.education.completed.includes("elementary") && !state.education.completed.includes("paket_a"),
  },
  {
    id: "sma",
    name: "SMA",
    minAge: 15,
    maxAge: 18,
    costPerYear: 0,
    yearsToComplete: 3,
    jobBoost: 8,
    requirement: (state) => (state.education.completed.includes("junior_high") || state.education.completed.includes("paket_b")) && !state.education.completed.includes("sma") && !state.education.completed.includes("smk"),
  },
  {
    id: "smk",
    name: "SMK",
    minAge: 15,
    maxAge: 18,
    costPerYear: 0,
    yearsToComplete: 3,
    jobBoost: 8,
    requirement: (state) => (state.education.completed.includes("junior_high") || state.education.completed.includes("paket_b")) && !state.education.completed.includes("sma") && !state.education.completed.includes("smk"),
  },
  {
    id: "paket_b",
    name: "Program Paket B (Setara SMP)",
    minAge: 14,
    costPerYear: 5_000_000,
    yearsToComplete: 1,
    smartsPerYear: 2,
    jobBoost: 2,
    requirement: (state) => !state.education.completed.includes("junior_high") && !state.education.completed.includes("paket_b") && (state.education.completed.includes("elementary") || state.education.completed.includes("paket_a")),
  },
  {
    id: "paket_c",
    name: "Program Paket C (Setara SMA)",
    minAge: 17,
    costPerYear: 8_000_000,
    yearsToComplete: 1,
    smartsPerYear: 3,
    jobBoost: 6,
    requirement: (state) => (!state.education.completed.includes("sma") && !state.education.completed.includes("smk") && !state.education.completed.includes("paket_c")) && (state.education.completed.includes("junior_high") || state.education.completed.includes("paket_b")),
  },
  {
    id: "university_ptn_snbp",
    name: "Universitas Negeri (Jalur SNBP)",
    level: "university",
    minAge: 18,
    yearsToComplete: 4,
    costPerYear: 500_000,
    delta: { happy: 10, health: -2, smarts: 15, looks: 5 },
    requirement: (state) => {
      const currentYear = Number(state.profile.birthDate.year) + state.age;
      const gradYear = state.education.graduationYear || (currentYear - 1);
      const yearsSinceGrad = currentYear - gradYear;
      const isFreshGrad = yearsSinceGrad === 0;
      // SNBP is ONLY for regular SMA/SMK fresh grads
      const isRegularGrad = state.education.completed.includes("sma") || state.education.completed.includes("smk");
      return isFreshGrad && isRegularGrad;
    },
  },
  {
    id: "university_ptn_snbt",
    name: "Universitas Negeri (Jalur SNBT)",
    level: "university",
    minAge: 18,
    yearsToComplete: 4,
    costPerYear: 6_000_000,
    delta: { happy: 5, health: -2, smarts: 15, looks: 5 },
    requirement: (state) => {
      const currentYear = Number(state.profile.birthDate.year) + state.age;
      const gradYear = state.education.graduationYear || (currentYear - 1);
      const yearsSinceGrad = currentYear - gradYear;
      const isSMA_SMK = state.education.completed.includes("sma") || state.education.completed.includes("smk");
      const isPaketC = state.education.completed.includes("paket_c");
      return (isSMA_SMK && yearsSinceGrad <= 2) || (isPaketC && state.age <= 25);
    },
  },
  {
    id: "university_ptn_mandiri",
    name: "Universitas Negeri (Jalur Mandiri)",
    level: "university",
    minAge: 18,
    yearsToComplete: 4,
    costPerYear: 20_000_000,
    delta: { happy: 2, health: -2, smarts: 15, looks: 5 },
    requirement: (state) => {
      const currentYear = Number(state.profile.birthDate.year) + state.age;
      const gradYear = state.education.graduationYear || (currentYear - 1);
      const yearsSinceGrad = currentYear - gradYear;
      const hasSecondary = state.education.completed.includes("sma") || state.education.completed.includes("smk") || state.education.completed.includes("paket_c");
      return yearsSinceGrad <= 10 && hasSecondary;
    },
  },
  {
    id: "university_terbuka",
    name: "Universitas Terbuka (UT)",
    level: "university",
    minAge: 18,
    yearsToComplete: 4,
    costPerYear: 2_500_000,
    delta: { happy: 0, health: 0, smarts: 10, looks: 2 },
    requirement: (state) => state.education.completed.includes("sma") || state.education.completed.includes("smk") || state.education.completed.includes("paket_c"),
  },
  {
    id: "university_swasta",
    name: "Universitas Swasta",
    level: "university",
    minAge: 18,
    yearsToComplete: 4,
    costPerYear: 45_000_000,
    delta: { happy: 15, health: -2, smarts: 12, looks: 15 },
    requirement: (state) => state.education.completed.includes("sma") || state.education.completed.includes("smk") || state.education.completed.includes("paket_c"),
  },
];
