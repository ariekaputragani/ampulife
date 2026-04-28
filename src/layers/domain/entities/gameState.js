export const SAVE_VERSION = 5;

export function createInitialGameState() {
  return {
    version: SAVE_VERSION,
    mode: "menu", // menu, create, playing, dead
    profile: {
      name: "",
      city: "Jakarta",
      gender: "male",
      birthDate: {
        day: 1,
        month: "Januari",
        year: 2026,
      },
    },
    actions: [
      {
        id: "do_crime",
        name: "Lakukan Kriminal",
        minAge: 12,
        cost: 0,
        delta: { happy: 5, health: -5, smarts: 2, looks: -2 },
      },
      {
        id: "ged_test",
        name: "Ikuti Tes GED",
        minAge: 16,
        cost: 15_000_000,
        delta: { happy: 10, health: 0, smarts: 20, looks: 0 },
      },
      {
        id: "post_social",
        name: "Posting di Sosmed",
        minAge: 12,
        cost: 0,
        delta: { happy: 2, health: 0, smarts: 0, looks: 1 },
      },
      {
        id: "apply_scholarship",
        name: "Cari Beasiswa",
        minAge: 7,
        cost: 0,
        delta: { happy: 0, health: 0, smarts: 2, looks: 0 },
      },
      {
        id: "work_part_time",
        name: "Kerja Part-time (Siswa)",
        minAge: 15,
        cost: 0,
        delta: { happy: -5, health: -5, smarts: 0, looks: 0 },
      },
    ],
    age: 0,
    money: 0,
    financial: {
      lifestyle: "normal", // hemat, normal, mewah
    },
    family: {
      wealthStatus: "middle", // poor, middle, rich
      savings: 0,
      monthlyIncome: 0,
      isScholarshipActive: false,
      assets: {
        motor: false,
        car: false,
      },
    },
    stats: {
      happy: 62,
      health: 76,
      smarts: 42,
      looks: 48,
    },
    career: {
      jobId: null,
      yearsWorked: 0,
      yearsInRole: 0,
      promotions: 0,
    },
    education: {
      level: "none",
      major: null,
      yearsStudied: 0,
      completed: [],
    },
    socialMedia: {
      isJoined: false,
      followers: 0,
    },
    legal: {
      inJail: false,
      jailYearsLeft: 0,
      records: [],
    },
    healthStatus: {
      condition: "healthy",
      illnessId: null,
      severity: "none",
      untreatedYears: 0,
      treatmentCount: 0,
    },
    life: {
      isAlive: true,
      causeOfDeath: null,
    },
    assets: [],
    relations: [
      { id: "father", label: "Bapak", name: "Rahmat", bond: 68, support: 72 },
      { id: "mother", label: "Ibu", name: "Anisa", bond: 72, support: 70 },
    ],
    currentEvent: null, // Used for interactive events
    jailActions: {
      hasRioted: false,
      hasAttemptedEscape: false,
    },
    history: [
      {
        id: "boot",
        age: 0,
        at: new Date().toISOString(),
        message: "Kehidupan baru dimulai.",
      },
    ],
  };
}
