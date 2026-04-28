import { cloneState, generateRandomName, pushLog } from "@/layers/domain/entities/stateUtils";

export function setupCharacter(state, { name, city, gender, birthDate }) {
  const next = cloneState(state);
  
  next.profile = {
    name: name || generateRandomName(gender),
    city: city || "Jakarta",
    gender,
    birthDate,
  };
  
  next.mode = "playing";
  next.age = 0;
  
  // Determine Family Wealth
  const wealthRoll = Math.random();
  let familyWealth = "middle";
  if (wealthRoll < 0.3) familyWealth = "poor";
  else if (wealthRoll > 0.9) familyWealth = "rich";

  next.familyWealth = familyWealth;
  
  // Initialize Family Finances
  let savings = 100_000_000; // default middle
  let monthlyIncome = 15_000_000;
  
  if (familyWealth === "poor") {
    savings = Math.floor(Math.random() * 2_000_000) + 500_000;
    monthlyIncome = Math.floor(Math.random() * 2_000_000) + 1_500_000; // 1.5jt - 3.5jt
  } else if (familyWealth === "rich") {
    savings = Math.floor(Math.random() * 5_000_000_000) + 500_000_000;
    monthlyIncome = Math.floor(Math.random() * 70_000_000) + 30_000_000; // 30jt - 100jt
  } else {
    savings = Math.floor(Math.random() * 40_000_000) + 10_000_000;
    monthlyIncome = Math.floor(Math.random() * 10_000_000) + 5_000_000; // 5jt - 15jt
  }

  next.family = {
    wealthStatus: familyWealth,
    savings,
    monthlyIncome,
    isScholarshipActive: false,
  };

  next.hasBPJS = familyWealth === "poor" ? "PBI" : false; // Poor gets free BPJS PBI

  // Generate Initial Stats
  const baseHealth = familyWealth === "rich" ? 80 : familyWealth === "poor" ? 40 : 60;
  const baseSmarts = familyWealth === "rich" ? 60 : familyWealth === "poor" ? 30 : 40;
  
  next.stats = {
    happy: Math.floor(Math.random() * 50) + 50,
    health: Math.floor(Math.random() * (100 - baseHealth)) + baseHealth,
    smarts: Math.floor(Math.random() * (100 - baseSmarts)) + baseSmarts,
    looks: Math.floor(Math.random() * 70) + 30,
  };

  // Create parents
  const fatherName = generateRandomName("male");
  const motherName = generateRandomName("female");
  
  const baseSupport = familyWealth === "rich" ? 90 : familyWealth === "poor" ? 40 : 65;

  next.relations = [
    { id: "father", label: "Bapak", name: fatherName, bond: 70, support: baseSupport },
    { id: "mother", label: "Ibu", name: motherName, bond: 75, support: baseSupport + 5 },
  ];
  
  pushLog(next, `Kehidupan baru dimulai!`);
  pushLog(next, `Perkenalkan nama saya ${next.profile.name}. Saya terlahir sebagai ${gender === 'male' ? 'laki-laki' : 'perempuan'}. Saya lahir di ${next.profile.city} pada tanggal ${birthDate.day} ${birthDate.month} ${birthDate.year}.`);
  
  const wealthText = familyWealth === "rich" ? "sangat kaya" : familyWealth === "poor" ? "miskin" : "sederhana";
  pushLog(next, `Bapak saya ${fatherName}, Ibu saya ${motherName}. Kami berasal dari keluarga yang ${wealthText}.`);
  if (next.hasBPJS === "PBI") {
    pushLog(next, `Pemerintah memberikan bantuan kesehatan gratis (BPJS PBI) untuk keluargamu.`);
  }
  
  return next;
}
