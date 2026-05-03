export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}
export function clampStatus(value) {
  return Math.max(0, Math.min(100, value));
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
}

export function pushNotification(state, { title, message, icon = "info", type = "message", eventId = null, options = [], payload = {} }) {
  if (!state.notificationQueue) state.notificationQueue = [];
  state.notificationQueue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    icon,
    type,
    eventId,
    options,
    payload
  });
}

const MALE_FIRST_NAMES = [
  "Ade", "Adib", "Adit", "Aditya", "Agung", "Agus", "Ahmad", "Akbar", "Alamsyah",
  "Alif", "Ammar", "Ardi", "Arya", "Bayu", "Bimo", "Budi", "Danis", "Dedi",
  "Deni", "Didi", "Diaz", "Edi", "Eko", "Fadil", "Fajar", "Faozan", "Farhan",
  "Fauzan", "Fiki", "Gilang", "Gunawan", "Hendra", "Heru", "Hidayat", "Ilham",
  "Indra", "Irfan", "Iwan", "Joko", "Kevin", "Kurniawan", "Lukman", "Lutfi",
  "Maulana", "Mei", "Miko", "Muhammad", "Nizar", "Nova", "Novan", "Nugroho",
  "Oktavian", "Praditya", "Rafi", "Rian", "Rizky", "Rudi", "Rudy", "Salman",
  "Santoso", "Satria", "Setiawan", "Setya", "Slamet", "Suherman", "Surya",
  "Syafik", "Taufik", "Tito", "Tono", "Tubagus", "Vandi", "Veri", "Wahyu",
  "Wisnu", "Yusuf", "Zikri"
];

const FEMALE_FIRST_NAMES = [
  "Adinda", "Adiratna", "Aisyah", "Alya", "Amalia", "Amisha", "Angkasa", "Ani",
  "Anita", "Annisa", "Astuti", "Aulia", "Ayu", "Bella", "Budiwati", "Bulan",
  "Cahya", "Cindy", "Citra", "Defi", "Dewi", "Diah", "Dian", "Dina", "Dinda",
  "Dini", "Eka", "Elok", "Endah", "Eva", "Fani", "Farah", "Fitri", "Gemi",
  "Gita", "Guritno", "Hana", "Harum", "Icha", "Imelda", "Indah", "Intan",
  "Inten", "Irene", "Jayachandra", "Kartini", "Kemala", "Kemuning", "Kezia",
  "Kristiyana", "Lani", "Legi", "Lestari", "Lia", "Lusi", "Maharani", "Maria",
  "Marshanda", "Mawar", "Maya", "Mega", "Melati", "Mentari", "Merpati",
  "Misrina", "Murni", "Mustika", "Nabila", "Nadira", "Nadya", "Nanda", "Ndari",
  "Ningrat", "Ningrum", "Ningsih", "Nisa", "Nisi", "Nisrina", "Nova", "Novalia",
  "Novi", "Novia", "Novita", "Nur", "Nurul", "Permata", "Pertiwi", "Puji",
  "Puspita", "Putri", "Rani", "Rara", "Ratih", "Ratu", "Rika", "Rina", "Rini",
  "Sarah", "Sari", "Sarwendah", "Sella", "Setiawati", "Shinta", "Siska",
  "Siti", "Sri", "Susil", "Syifa", "Taman", "Tasya", "Tika", "Utama", "Vania",
  "Vina", "Wangi", "Wati", "Wening", "Wulan", "Yuni"
];

const LAST_NAMES = [
  "Aji", "Alfian", "Anwar", "Ardian", "Ardiansyah", "Ardianto", "Arifudin",
  "Ariyanto", "Azhar", "Ayadin", "Batubara", "Cahyanto", "Daulay", "Dewantoro",
  "Dikara", "Dwi", "Fadhil", "Faizin", "Fauzi", "Firmansyah",
  "Ginting", "Gunawan", "Hakim", "Hanif", "Harahap", "Hendrawan", "Hidayat",
  "Kencana", "Kusuma", "Lubis", "Mahardika", "Mahesa", "Maheswara", "Maulana",
  "Nasution", "Nugraha", "Nugroho", "Pane", "Permana", "Pohan", "Pradipta",
  "Prasetya", "Prasetyo", "Pratama", "Putra", "Ramadhan", "Ridho", "Rianto",
  "Rizky", "Rosyid", "Santosa", "Santoso", "Santos", "Saputra", "Septian",
  "Setiawan", "Simanjuntak", "Sinaga", "Siregar", "Sitorus", "Suripto",
  "Syahputra", "Utama", "Wahyu", "Warsito", "Wijaya", "Zaky"
];

export function generateRandomName(gender) {
  const firstNames = gender === "male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}
