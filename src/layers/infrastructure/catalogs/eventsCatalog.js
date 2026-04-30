import { pickIllnessByAge } from "@/layers/infrastructure/catalogs/illnessCatalog";
import { pushLog } from "@/layers/domain/entities/stateUtils";

export const eventsCatalog = [
  {
    id: "school_award",
    label: "Prestasi sekolah",
    minAge: 7,
    maxAge: 18,
    weight: (state) => (state.stats.smarts > 55 ? 1.2 : 0.6),
    apply: (state) => {
      state.stats.happy = Math.min(100, state.stats.happy + 6);
      state.stats.smarts = Math.min(100, state.stats.smarts + 3);
      return { summary: "Kamu mendapat penghargaan di sekolah." };
    },
  },
  {
    id: "illness",
    label: "Sakit musiman",
    minAge: 0,
    maxAge: 90,
    weight: (state) => {
      if (state.healthStatus.condition !== "healthy") {
        return 0.1;
      }
      if (state.stats.health > 80) return 0.1; // Sehat banget, jarang sakit
      return state.stats.health < 45 ? 1.5 : 0.6;
    },
    apply: (state) => {
      const illness = pickIllnessByAge(state.age);
      state.stats.health = Math.max(0, state.stats.health - 8);
      state.stats.happy = Math.max(0, state.stats.happy - 4);
      state.healthStatus.condition = "ill";
      state.healthStatus.illnessId = illness?.id ?? "flu";
      state.healthStatus.severity = illness?.baseSeverity ?? "mild";
      state.healthStatus.untreatedYears = 0;
      return { summary: `Kamu terkena ${illness?.name ?? "penyakit musiman"}.` };
    },
  },
  {
    id: "lightning_strike",
    label: "Tersambar Petir",
    minAge: 5,
    weight: 0.01,
    isInteractive: false,
    apply: (state) => {
      const isMiracle = Math.random() < 0.5;
      if (isMiracle) {
        state.stats = { happy: 100, health: 100, smarts: 100, looks: 100 };
        return { summary: "⚡ KEJADIAN LUAR BIASA: Kamu tersambar petir! AJAIB, tubuhmu justru terasa sangat bertenaga dan jenius!" };
      } else {
        state.life.isAlive = false;
        state.life.causeOfDeath = "meninggal setelah tersambar petir";
        return { summary: "⚡ KEJADIAN LUAR BIASA: Kamu tersambar petir! Tragis, sambaran itu langsung mengakhiri hidupmu." };
      }
    },
  },
  {
    id: "animal_encounter",
    label: "Pertemuan Hewan",
    minAge: 5,
    weight: 0.1,
    isInteractive: true,
    apply: (state) => {
      const animals = ["anjing", "babi hutan", "badak", "buaya", "gajah", "harimau", "ular", "tawon"];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      return {
        summary: `🌲 Saat sedang jalan-jalan, kamu berpapasan dengan seekor ${animal}! Apa yang akan kamu lakukan?`,
        options: [
          {
            id: "run_away",
            label: "Lari Sekencang-kencangnya",
            resolve: (s) => "Kamu langsung lari sekencang mungkin dan berhasil selamat.",
          },
          {
            id: "pet_animal",
            label: "Mencoba Mendekat/Mengelus",
            resolve: (s) => {
              const friendly = Math.random() > 0.7;
              if (friendly) {
                s.stats.happy = Math.min(100, s.stats.happy + 20);
                return `Ajaib! Hewan itu ternyata jinak dan sangat ramah.`;
              } else {
                s.stats.health = Math.max(0, s.stats.health - 25);
                return `Aduh! Hewan itu menyerangmu saat kamu mencoba mendekat.`;
              }
            },
          },
        ],
      };
    },
  },
  {
    id: "drop_out_school",
    label: "Ancaman Putus Sekolah",
    minAge: 12,
    maxAge: 17,
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
    label: "Dibully di sekolah",
    minAge: 7,
    maxAge: 18,
    weight: (state) => (state.stats.looks < 40 || state.stats.smarts > 70 ? 1.1 : 0.5),
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
    minAge: 16,
    maxAge: 40,
    weight: (state) => (state.stats.happy < 40 ? 1.2 : 0.4),
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
    minAge: 6,
    maxAge: 90,
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
    minAge: 12,
    maxAge: 22,
    weight: (state) => {
      if (state.education.level === "none" || state.family.isScholarshipActive) return 0;
      return state.stats.smarts > 75 ? 0.8 : 0.2;
    },
    isInteractive: true,
    apply: (state) => ({
      summary: "Sekolahmu menawarkan program beasiswa bagi siswa terpilih. Apakah kamu ingin mendaftar?",
      options: [
        {
          id: "apply",
          label: "Daftar Sekarang",
          resolve: (s) => {
            const chance = 0.35 + (s.stats.smarts - 75) * 0.02; // higher chance than manual
            if (Math.random() < chance) {
              s.family.isScholarshipActive = true;
              s.stats.happy += 10;
              return "Luar biasa! Kamu memenangkan beasiswa tersebut.";
            }
            return "Sayang sekali, kamu belum berhasil mendapatkan beasiswa kali ini.";
          },
        },
        {
          id: "ignore",
          label: "Tidak Tertarik",
          resolve: (s) => "Kamu melewatkan kesempatan tersebut.",
        },
      ],
    }),
  },
  {
    id: "financial_crisis",
    label: "Krisis Keuangan Keluarga",
    minAge: 6,
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
    id: "household_crisis",
    label: "Masalah Rumah Tangga",
    minAge: 5,
    maxAge: 18,
    weight: (state) => (state.family.savings > 5_000_000 ? 0.6 : 0.2),
    apply: (state) => {
      const repairs = [
        { msg: "Atap rumah kami bocor dan Ayah harus memanggil tukang untuk memperbaikinya.", cost: 2_500_000 },
        { msg: "Motor Bapak tiba-tiba mogok dan butuh servis besar agar bisa dipakai kerja lagi.", cost: 1_500_000 },
        { msg: "Pipa air di rumah kami pecah, Ibu sibuk membersihkan air yang menggenang.", cost: 800_000 },
      ];
      const picked = repairs[Math.floor(Math.random() * repairs.length)];
      state.family.savings -= picked.cost;
      return { summary: picked.msg };
    },
  },
  {
    id: "parent_sick",
    label: "Orang Tua Sakit",
    minAge: 0,
    maxAge: 25,
    weight: (state) => (state.family.wealthStatus === "poor" ? 0.8 : 0.4),
    apply: (state) => {
      let cost = 5_000_000;
      if (state.family.wealthStatus === "rich") cost = 35_000_000;
      if (state.family.wealthStatus === "poor") cost = 500_000; // Diasumsikan pakai BPJS PBI, hanya bayar obat luar/admin
      
      state.family.savings -= cost;
      state.stats.happy -= 10;
      const person = Math.random() > 0.5 ? "Ibu" : "Bapak";
      return { summary: `${person} ku jatuh sakit dan harus dirawat di rumah sakit. Beruntung ada BPJS sehingga biaya tidak terlalu mencekik.` };
    },
  },
  {
    id: "parent_phk",
    label: "Krisis Ekonomi (PHK)",
    minAge: 0,
    maxAge: 30,
    weight: (state) => {
      // Only for middle/rich who are not already bankrupt
      if (state.family.wealthStatus === "poor" || state.family.isBankrupt || state.profile.isIndependent) return 0;
      return 0.4; // Small chance every year
    },
    apply: (state) => {
      state.family.isBankrupt = true;
      state.family.monthlyIncome = 1_500_000; // Survival mode
      state.stats.happy = Math.max(0, state.stats.happy - 25);
      return { summary: "Ayahmu terkena PHK mendadak akibat perusahaannya bangkrut. Ekonomi keluargamu kini dalam krisis besar." };
    },
  },
  {
    id: "parent_job_recovery",
    label: "Pemulihan Karier",
    minAge: 0,
    maxAge: 30,
    weight: (state) => {
      if (!state.family.isBankrupt || state.profile.isIndependent) return 0;
      return 0.6; // Higher chance to recover each year
    },
    apply: (state) => {
      state.family.isBankrupt = false;
      const isSerabutan = Math.random() > 0.4;
      
      if (isSerabutan) {
        state.family.monthlyIncome = 3_500_000;
        state.stats.happy += 10;
        return { summary: "Ayahmu akhirnya mendapat pekerjaan baru, meski gajinya lebih kecil dari sebelumnya. Paling tidak keluarga kita bisa bernapas lega." };
      } else {
        state.family.monthlyIncome = 8_000_000 + Math.floor(Math.random() * 5_000_000);
        state.stats.happy += 20;
        return { summary: "Kabar gembira! Ayahmu diterima bekerja di perusahaan besar dengan gaji yang mapan. Masa krisis telah berlalu." };
      }
    },
  },
  {
    id: "adult_transition",
    label: "Fase Kedewasaan",
    minAge: 18,
    maxAge: 18,
    weight: (state) => {
      if (state.profile.isIndependent) return 0;
      return 100; // Guaranteed to trigger at age 18
    },
    isInteractive: true,
    apply: (state) => ({
      summary: "Kamu telah lulus SMA dan beranjak dewasa. Apa rencanamu selanjutnya?",
      options: [
        {
          id: "college",
          label: "Lanjut Kuliah (Tanggungan Ortu)",
          resolve: (s) => {
            if (s.family.savings < 50_000_000) {
              s.profile.isIndependent = true;
              s.stats.happy -= 10;
              return "Orang tuamu tidak memiliki cukup tabungan untuk membiayai kuliah. Kamu terpaksa mencari kerja dan hidup mandiri.";
            }
            s.education.level = "university";
            s.education.yearsStudied = 0;
            return "Kamu memutuskan untuk melanjutkan kuliah. Orang tua masih akan menanggung biaya hidupmu.";
          },
        },
        {
          id: "work",
          label: "Langsung Kerja (Mandiri)",
          resolve: (s) => {
            s.profile.isIndependent = true;
            s.stats.happy += 5;
            return "Kamu memutuskan untuk hidup mandiri, mencari kos-kosan, dan mengelola keuanganmu sendiri mulai sekarang.";
          },
        },
      ],
    }),
  },
];
