import { pickIllnessByAge } from "@/layers/infrastructure/catalogs/illnessCatalog";

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
        return 0.2;
      }
      return state.stats.health < 45 ? 1.4 : 0.7;
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
];
