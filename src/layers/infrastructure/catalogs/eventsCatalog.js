import { pushLog, pushNotification } from "@/layers/domain/entities/stateUtils";

export const eventsCatalog = [
  {
    id: "medan_peril",
    label: "Korban",
    minAge: 1,
    maxAge: 999,
    weight: (state) => (state.profile.city === "Medan" ? 0.001 : 0),
    isInteractive: false,
    apply: (state) => {
      state.life.isAlive = false;
      state.life.causeOfDeath = "meninggal karena pembunuhan";
      return { summary: "Kamu menjadi korban kriminalitas di Medan. Kamu meninggal dunia." };
    },
  },
  {
    id: "school_award",
    label: "Sekolah",
    minAge: 7,
    maxAge: 16,
    weight: (state) => (state.stats.smarts > 55 ? 0.1 : 0.02),
    apply: (state) => {
      state.stats.happy = Math.min(100, state.stats.happy + 6);
      state.stats.smarts = Math.min(100, state.stats.smarts + 3);
      return { summary: "Kamu mendapat penghargaan di sekolah." };
    },
  },
  {
    id: "illness_flu",
    label: "Penyakit",
    minAge: 1,
    maxAge: 999,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.03 : 0),
    isInteractive: false,
    apply: (state) => {
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = "flu";
      state.healthStatus.severity = "mild";
      state.healthStatus.untreatedYears = 0;
      const msg = "Saya terkena Flu. Tubuh Saya terasa lemas.";
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "illness_diare",
    label: "Penyakit",
    minAge: 1,
    maxAge: 999,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.02 : 0),
    isInteractive: false,
    apply: (state) => {
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = "diarrhea";
      state.healthStatus.severity = "mild";
      state.healthStatus.untreatedYears = 0;
      const msg = "Saya terkena Diare. Perut Saya terasa tidak enak.";
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "illness_infant",
    label: "Penyakit",
    minAge: 1,
    maxAge: 5,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.05 : 0),
    isInteractive: false,
    apply: (state) => {
      const illness = pickIllnessByAge(state.age) || { name: "Penyakit", id: "flu" };
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = illness.id;
      state.healthStatus.severity = "mild";
      state.healthStatus.untreatedYears = 0;
      const msg = `Saya didiagnosis menderita ${illness.name}.`;
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "lightning_strike",
    label: "Korban",
    minAge: 19,
    maxAge: 999,
    weight: (state) => 0.0001,
    isInteractive: false,
    apply: (state) => {
      const isMiracle = Math.random() < 0.5;
      if (isMiracle) {
        state.stats = { happy: 100, health: 100, smarts: 100, looks: 100 };
        const msg = "Aku tersambar petir!";
        pushNotification(state, { title: "Korban", message: "Kamu tersambar gledek!", icon: "warning" });
        return { summary: msg };
      } else {
        const msg = "Aku tersambar gledek!";
        pushNotification(state, { title: "Korban", message: "Kamu tersambar gledek!", icon: "warning" });
        state.life.isAlive = false;
        state.life.causeOfDeath = "meninggal setelah tersambar petir";
        return { summary: msg };
      }
    },
  },
  {
    id: "illness_tbc",
    label: "Penyakit",
    minAge: 19,
    maxAge: 999,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.0049 : 0),
    isInteractive: false,
    apply: (state) => {
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = "tuberculosis";
      state.healthStatus.severity = "moderate";
      state.healthStatus.untreatedYears = 0;
      const msg = "Saya didiagnosis menderita TBC.";
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "animal_encounter",
    label: "Pertemuan",
    minAge: 19,
    maxAge: 999,
    weight: (state) => 0.05,
    isInteractive: true,
    apply: (state) => {
      const animals = ["anjing", "babi hutan", "badak", "buaya", "gajah", "harimau", "ular", "tawon", "kalajengking", "kuda nil", "tokek"];

      // Get from existing payload if we're resolving, otherwise pick new
      let animal = state.currentEvent?.payload?.animal;
      if (!animal) {
        animal = animals[Math.floor(Math.random() * animals.length)];
      }

      return {
        summary: `Kamu menemui ${animal}.`,
        payload: { animal }, // Send payload back to be saved in state
        options: [
          { id: "retreat", label: "Mundur Perlahan", resolve: () => `Saya bertemu seekor ${animal}. Saya mundur perlahan.` },
          { id: "pet", label: "Peliharalah", resolve: () => `Saya bertemu seekor ${animal}. Saya memeliharanya.` },
          { id: "run", label: "Lari!", resolve: () => `Saya bertemu seekor ${animal}. Saya menghindarinya.` }
        ],
      };
    },
  },
  {
    id: "illness_diabetes",
    label: "Penyakit",
    minAge: 40,
    maxAge: 999,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.01 : 0),
    isInteractive: false,
    apply: (state) => {
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = "diabetes";
      state.healthStatus.severity = "moderate";
      state.healthStatus.untreatedYears = 0;
      const msg = "Saya didiagnosis menderita Diabetes.";
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "illness_old_age",
    label: "Penyakit",
    minAge: 60,
    maxAge: 999,
    weight: (state) => (state.healthStatus.condition === "healthy" ? 0.09 : 0),
    isInteractive: false,
    apply: (state) => {
      const r = Math.random();
      let id, name;
      if (r < 0.1) {
        id = "alzheimer";
        name = "Alzheimer";
      } else if (r < 0.5) {
        id = "cancer";
        name = "Kanker";
      } else {
        id = "heart_disease";
        name = "Sakit Jantung";
      }
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = id;
      state.healthStatus.severity = "moderate";
      state.healthStatus.untreatedYears = 0;
      const msg = `Saya didiagnosis menderita ${name}.`;
      pushNotification(state, { title: "Penyakit", message: msg, icon: "warning" });
      return { summary: msg };
    },
  },
  {
    id: "drop_out_school",
    label: "Ancaman Putus Sekolah",
    minAge: 13,
    maxAge: 16,
    weight: (state) => {
      // Hanya muncul jika miskin dan masih sekolah (belum drop out)
      if (state.familyWealth !== "poor") return 0;
      if (state.education.level === "none") return 0;
      return 0.8;
    },
    isInteractive: true,
    apply: (state) => ({
      summary: "Orang tuamu menangis dan berkata mereka tidak mampu lagi membiayai kebutuhan sekolahmu.",
      options: [
        {
          id: "dropout",
          label: "Putus Sekolah & Bekerja",
          resolve: (s) => {
            s.education.level = "none";
            s.education.yearsStudied = 0;
            s.stats.happy = Math.max(0, s.stats.happy - 15);
            return "Kamu memilih berhenti sekolah untuk membantu keluarga.";
          },
        },
        {
          id: "beg",
          label: "Memohon Cari Pinjaman",
          resolve: (s) => {
            s.stats.happy = Math.max(0, s.stats.happy - 5);
            s.stats.smarts = Math.max(0, s.stats.smarts - 5);
            s.money = Math.max(0, s.money - 500000); // Nguras tabungan anak
            return "Kamu memohon untuk tetap sekolah dengan menghabiskan sisa tabungan.";
          },
        },
      ],
    }),
  },
  {
    id: "bully",
    label: "Sekolah",
    minAge: 7,
    maxAge: 16,
    weight: (state) => (state.education.level !== "none" ? 0.25 : 0),
    isInteractive: true,
    apply: (state) => ({
      summary: "Seseorang mengejekmu di koridor sekolah. Apa yang kamu lakukan?",
      options: [
        {
          id: "ignore",
          label: "Abaikan",
          resolve: (s) => {
            s.stats.happy = Math.max(0, s.stats.happy - 5);
            return "Kamu mengabaikannya, tapi merasa sedih.";
          },
        },
        {
          id: "report",
          label: "Laporkan Guru",
          resolve: (s) => {
            s.stats.smarts = Math.min(100, s.stats.smarts + 2);
            return "Guru memberikan teguran kepada pelaku.";
          },
        },
        {
          id: "fight",
          label: "Lawan!",
          resolve: (s) => {
            s.stats.health = Math.max(0, s.stats.health - 10);
            s.stats.happy = Math.min(100, s.stats.happy + 10);
            return "Kamu berkelahi! Kamu menang tapi terluka sedikit.";
          },
        },
      ],
    }),
  },
  {
    id: "drug_offer",
    label: "Tawaran Narkoba",
    minAge: 19,
    maxAge: 999,
    weight: (state) => 0.05,
    isInteractive: true,
    apply: (state) => ({
      summary: "Seorang asing menawarimu obat terlarang di pesta.",
      options: [
        {
          id: "refuse",
          label: "Tolak",
          resolve: (s) => {
            s.stats.smarts = Math.min(100, s.stats.smarts + 5);
            return "Kamu menolak dengan tegas.";
          },
        },
        {
          id: "accept",
          label: "Coba saja",
          resolve: (s) => {
            if (!s.flags) s.flags = {};
            s.flags.isDrugAttempted = true;
            s.stats.health = Math.max(0, s.stats.health - 40);
            s.stats.happy = Math.min(100, s.stats.happy + 20);
            return "Kamu mencobanya dan merasa melayang, tapi tubuhmu hancur.";
          },
        },
      ],
    }),
  },
  {
    id: "side_income",
    label: "Proyek sampingan",
    minAge: 16,
    maxAge: 70,
    weight: (state) => (state.stats.smarts > 50 ? 1.1 : 0.4),
    apply: (state) => {
      state.money += 12_000_000;
      return { summary: "Kamu mendapat proyek sampingan dan bonus uang." };
    },
  },
  {
    id: "family_support",
    label: "Dukungan keluarga",
    minAge: 7,
    maxAge: 999,
    weight: (state) => {
      const avgSupport =
        state.relations.reduce((acc, item) => acc + item.support, 0) /
        Math.max(1, state.relations.length);
      return avgSupport > 65 ? 1.1 : 0.4;
    },
    apply: (state) => {
      state.stats.happy = Math.min(100, state.stats.happy + 5);
      state.money += 3_000_000;
      return { summary: "Keluargamu memberi dukungan moral dan bantuan dana kecil." };
    },
  },
  {
    id: "scholarship_offer",
    label: "Tawaran Beasiswa",
    minAge: 13,
    maxAge: 22,
    weight: (state) => {
      if (state.education.level === "none" || state.family.isScholarshipActive) return 0;
      return state.stats.smarts > 75 ? 0.8 : 0.2;
    },
    isInteractive: false,
    apply: (state) => {
      pushNotification(state, {
        title: "Tawaran Beasiswa",
        message: "Sekolahmu menawarkan program beasiswa bagi siswa terpilih. Apakah kamu ingin mendaftar?",
        icon: "question",
        type: "confirm",
        eventId: "scholarship_offer",
        options: [
          { id: "yes", label: "Gass daftar sekarang!" },
          { id: "no", label: "Maaf, saya tidak tertarik" }
        ]
      });
      return { summary: "Sekolah menawarkan program beasiswa." };
    },
  },
  {
    id: "financial_crisis",
    label: "Krisis Keuangan Keluarga",
    minAge: 7,
    maxAge: 22,
    weight: (state) => {
      if (state.family.savings > 0 || state.education.level === "none" || state.family.isScholarshipActive) return 0;
      return 2.0; // High weight if savings are negative
    },
    isInteractive: true,
    apply: (state) => ({
      summary: "Tabungan keluargamu habis. Orang tuamu tidak sanggup lagi membayar biaya sekolahmu.",
      options: [
        {
          id: "dropout",
          label: "Berhenti Sekolah & Kerja",
          resolve: (s) => {
            s.education.level = "none";
            s.stats.happy -= 20;
            s.family.savings += 2_000_000;
            return "Kamu putus sekolah dan mulai bekerja serabutan untuk membantu keluarga.";
          },
        },
        {
          id: "parttime",
          label: "Kerja Part-time (Tetap Sekolah)",
          resolve: (s) => {
            s.stats.health -= 15;
            s.stats.happy -= 10;
            s.family.savings += 5_000_000;
            return "Kamu memaksakan diri bekerja malam hari agar tetap bisa sekolah. Tubuhmu sangat lelah.";
          },
        },
      ],
    }),
  },
  {
    id: "academic_achievement",
    label: "Juara Lomba Akademik",
    minAge: 10,
    maxAge: 22,
    weight: (state) => (state.stats.smarts > 80 ? 0.9 : 0.1),
    apply: (state) => {
      const prize = 5_000_000 + Math.floor(Math.random() * 10_000_000);
      state.family.savings += prize;
      state.stats.happy += 15;
      state.stats.smarts += 5;
      return { summary: `Kamu menjuarai lomba tingkat nasional dan mendapat hadiah Rp${prize.toLocaleString("id-ID")}!` };
    },
  },
  {
    id: "osis_election",
    label: "Organisasi",
    minAge: 13,
    maxAge: 17,
    weight: (state) => (state.education.level !== "none" ? 0.3 : 0),
    isInteractive: true,
    apply: (state) => ({
      summary: "Pendaftaran pengurus OSIS baru telah dibuka. Teman-temanmu menyarankanmu untuk ikut. Apa posisimu?",
      options: [
        { id: "chairman", label: "Calon Ketua" },
        { id: "member", label: "Anggota Biasa" },
        { id: "none", label: "Tidak Ikut" }
      ],
    }),
  },
  {
    id: "national_competition_invite",
    label: "Prestasi",
    minAge: 10,
    maxAge: 18,
    weight: (state) => (state.stats.smarts > 70 && state.education.level !== "none" ? 0.4 : 0),
    isInteractive: true,
    apply: (state) => ({
      summary: "Guru melihat potensi besarmu dan menawarimu untuk mewakili sekolah di Lomba Sains Nasional.",
      options: [
        { id: "accept", label: "Terima & Belajar Keras" },
        { id: "refuse", label: "Tolak (Terlalu Sibuk)" }
      ],
    }),
  },
  {
    id: "first_crush",
    label: "Dinamika Sosial",
    minAge: 12,
    maxAge: 16,
    weight: (state) => (state.relations.some(r => !r.isDead && r.status === "friend") ? 0.25 : 0),
    isInteractive: true,
    apply: (state) => {
      const friends = state.relations.filter(r => !r.isDead && r.status === "friend");
      const crush = friends[Math.floor(Math.random() * friends.length)];
      return {
        summary: `Kamu mulai menyukai teman sekolahmu yang bernama ${crush.name}. Jantungmu berdegup kencang saat di dekatnya.`,
        payload: { crushId: crush.id, crushName: crush.name },
        options: [
          { id: "confess", label: "Ungkapkan Perasaan" },
          { id: "wait", label: "Tunggu Waktu yang Pas" },
          { id: "ignore", label: "Kubur Perasaan Ini" }
        ],
      };
    },
  },
  {
    id: "truancy_invitation",
    label: "Pergaulan",
    minAge: 14,
    maxAge: 17,
    weight: (state) => (state.education.level !== "none" ? 0.2 : 0),
    isInteractive: true,
    apply: (state) => ({
      summary: "Sekelompok teman mengajakmu bolos sekolah saat jam pelajaran kosong untuk nongkrong di kantin belakang.",
      options: [
        { id: "join", label: "Ikut Bolos" },
        { id: "refuse", label: "Tetap di Kelas" }
      ],
    }),
  },
  {
    id: "bullying_intervention",
    label: "Moralitas",
    minAge: 8,
    maxAge: 16,
    weight: (state) => (state.education.level !== "none" ? 0.15 : 0),
    isInteractive: true,
    apply: (state) => ({
      summary: "Kamu melihat seorang siswa kelas bawah sedang di-bully oleh kakak kelas di kantin. Apa yang kamu lakukan?",
      options: [
        { id: "help", label: "Bela Siswa Tersebut" },
        { id: "report", label: "Laporkan ke Guru" },
        { id: "ignore", label: "Pura-pura Tidak Lihat" }
      ],
    }),
  },
  {
    id: "driving_test",
    label: "Lisensi",
    minAge: 17,
    maxAge: 18,
    weight: (state) => {
      const hasSIM = state.profile.licenses && state.profile.licenses.includes("SIM A/C");
      return !hasSIM ? 0.8 : 0;
    },
    isInteractive: false,
    apply: (state) => {
      pushNotification(state, {
        title: "Ujian SIM",
        message: "Kamu sudah cukup umur untuk mendapatkan SIM. Apakah kamu ingin mengambil ujian resmi sekarang? (Biaya: Rp250.000)",
        icon: "question",
        type: "confirm",
        eventId: "driving_test",
        options: [
          { id: "yes", label: "Ya, saya siap ujian!" },
          { id: "no", label: "Nanti saja" }
        ]
      });
      return { summary: "Tawaran untuk mengambil ujian SIM resmi." };
    },
  },
];
