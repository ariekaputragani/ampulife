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

  const fatherName = generateRandomName("male");
  const motherName = generateRandomName("female");

  const fatherAge = Math.floor(Math.random() * 33) + 18; // 18-50 thn
  const motherAge = Math.floor(Math.random() * 33) + 18; // 18-50 thn
  const baseSupport = familyWealth === "rich" ? 90 : familyWealth === "poor" ? 40 : 65;

  next.relations = [
    {
      id: "father",
      label: "Bapak",
      name: fatherName,
      age: fatherAge,
      relationship: 70,
      support: baseSupport,
      gender: "male",
      status: "family",
      lastInteractionAge: -1
    },
    {
      id: "mother",
      label: "Ibu",
      name: motherName,
      age: motherAge,
      relationship: 75,
      support: baseSupport + 5,
      gender: "female",
      status: "family",
      lastInteractionAge: -1
    },
  ];

  // Determine Pregnancy Status
  const isPlanned = Math.random() > 0.3;
  const pregnancyStatus = isPlanned ? "kehamilan terencana" : "kehamilan tidak sengaja";

  // Determine Zodiac
  const getZodiac = (day, month) => {
    const map = {
      "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6,
      "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12
    };
    const m = map[month] || 0;
    const d = day;
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Aries";
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Taurus";
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gemini";
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Cancer";
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Leo";
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Virgo";
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Libra";
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Scorpio";
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagittarius";
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricorn";
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Aquarius";
    if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return "Pisces";
    return "";
  };
  const zodiac = getZodiac(birthDate.day, birthDate.month);

  pushLog(next, `Kehidupan baru dimulai!`);
  pushLog(next, `Perkenalkan nama saya ${next.profile.name}. Saya terlahir sebagai ${gender === 'male' ? 'laki-laki' : 'perempuan'}. Saya lahir di ${next.profile.city} pada tanggal ${birthDate.day} ${birthDate.month} ${birthDate.year}. Saya adalah ${pregnancyStatus}. Saya seorang ${zodiac}.`);

  const wealthText = familyWealth === "rich" ? "sangat kaya" : familyWealth === "poor" ? "miskin" : "sederhana";
  pushLog(next, `Bapak saya ${fatherName} (umur ${fatherAge}), Ibu saya ${motherName} (umur ${motherAge}). Kami berasal dari keluarga yang ${wealthText}.`);
  if (next.hasBPJS === "PBI") {
    pushLog(next, `Pemerintah memberikan bantuan kesehatan gratis (BPJS PBI) untuk keluargamu.`);
  }

  return next;
}
