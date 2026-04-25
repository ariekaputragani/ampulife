export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function cloneState(state) {
  if (typeof structuredClone === "function") {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

export function applyStatDelta(stats, delta) {
  return {
    happy: clamp(stats.happy + (delta.happy ?? 0)),
    health: clamp(stats.health + (delta.health ?? 0)),
    smarts: clamp(stats.smarts + (delta.smarts ?? 0)),
    looks: clamp(stats.looks + (delta.looks ?? 0)),
  };
}

export function pushLog(state, message) {
  state.history.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    age: state.age,
    message,
    at: new Date().toISOString(),
  });

  if (state.history.length > 120) {
    state.history = state.history.slice(-120);
  }
}

const MALE_FIRST_NAMES = [
  "Aadiktri", "Aavya", "Amara", "Anik", "Anil", "Arpit", "Ayaan", "Banil", "Buyisiwe",
  "Cleveland", "Dinesh", "Donya", "Dhule", "Dube", "Dungi", "Dunyi", "Gordon", "Kabir",
  "Kabul", "Kadir", "Leuwinanggung", "Lucuss", "Maxim", "Megah", "Om", "Omnia", "Opiyo",
  "Panutan", "Pramana", "Rajiv", "Rohit", "Roman", "Sama", "Samar", "Sebastian", "Tej", "Zhiqiang"
];

const FEMALE_FIRST_NAMES = [
  "Aasmi", "Celine", "Eka", "Ekenedilichukwu", "Maria", "Navya", "Omnia", "Selena",
  "Serena", "Suyin", "Tasty", "Zhiqiuno"
];

const LAST_NAMES = [
  "Achaval", "Apolles", "Bhate", "Bhatta", "Bhave", "Chakarbarti", "Charlier", "Dikshit",
  "Ethulo", "Gayakvade", "Gerung", "Gerungan", "Goossens", "Gordon", "Gulati", "Ho", "Hu",
  "Ijendu", "Jamus", "Kamal", "Ketanggungan", "Khan", "Khatri", "Kohli", "Krueger", "Kumar",
  "Modi", "Misra", "Nasution", "Nunes", "Pagar", "Perry", "Pertanggungan", "Sakuda", "Salib",
  "Sellers", "Spinx", "Shah", "Stepanovna", "Tambunan", "Thakore", "Thakre", "Verheyen", "Wang", "Wong"
];

export function generateRandomName(gender) {
  const firstNames = gender === "male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}
