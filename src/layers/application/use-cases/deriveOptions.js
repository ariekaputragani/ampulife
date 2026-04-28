import { assetsCatalog } from "@/layers/infrastructure/catalogs/assetsCatalog";
import { crimeCatalog } from "@/layers/infrastructure/catalogs/crimeCatalog";
import { educationCatalog } from "@/layers/infrastructure/catalogs/educationCatalog";
import { jobsCatalog } from "@/layers/infrastructure/catalogs/jobsCatalog";
import { treatmentCatalog } from "@/layers/infrastructure/catalogs/treatmentCatalog";
import { canTakeJob } from "@/layers/domain/services/careerEngine";

export function getAvailableJobs(state) {
  if (state.legal.inJail || !state.life.isAlive) {
    return [];
  }

  return jobsCatalog.filter((job) => canTakeJob(state, job));
}

export function getAvailableAssets(state) {
  if (!state.life.isAlive) {
    return [];
  }

  return assetsCatalog.filter(
    (asset) =>
      state.age >= asset.minAge &&
      !state.assets.some((owned) => owned.id === asset.id)
  );
}

export function getAvailableEducation(state) {
  if (state.legal.inJail || !state.life.isAlive) {
    return [];
  }

  return educationCatalog.filter((item) => state.age >= item.minAge);
}

export function getAvailableCrimes(state) {
  if (!state.life.isAlive) {
    return [];
  }

  // If in jail, return jail actions
  if (state.legal.inJail) {
    return [
      { id: "escape", name: "Mencoba Kabur", minAge: 0 },
      { id: "riot", name: "Memulai Kerusuhan", minAge: 0 },
    ];
  }

  return crimeCatalog.filter((item) => state.age >= item.minAge);
}

export function getAvailableActivities(state) {
  if (!state.life.isAlive) {
    return [];
  }
  
  const acts = [
    { 
      id: "gym", 
      name: "Pergi ke Gym", 
      minAge: 14, 
      cost: 150_000, 
      description: "Berolahraga di pusat kebugaran untuk mempercantik tubuh.", 
      effects: "💪 +5 Health, ✨ +2 Looks" 
    },
    { 
      id: "library", 
      name: "Pergi ke Perpustakaan", 
      minAge: 6, 
      cost: 0, 
      description: "Membaca buku dan belajar mandiri untuk memperluas wawasan.", 
      effects: "🧠 +5 Smarts, 😊 +2 Happy" 
    },
    { 
      id: "apply_scholarship", 
      name: "Cari Beasiswa", 
      minAge: 7, 
      cost: 0, 
      description: "Mencoba melamar beasiswa pendidikan untuk meringankan beban orang tua.", 
      effects: "💰 Biaya Sekolah Gratis (Jika diterima)" 
    },
    { 
      id: "work_part_time", 
      name: "Kerja Part-time (Siswa)", 
      minAge: 15, 
      cost: 0, 
      description: "Bekerja sampingan sepulang sekolah untuk menambah uang saku.", 
      effects: "💸 +Uang, ❤️ -5 Health" 
    },
    { 
      id: "join_extracurricular", 
      name: "Ikut Ekstrakurikuler", 
      minAge: 12, 
      cost: 150_000, 
      description: "Aktif dalam organisasi sekolah untuk menambah teman dan keahlian.", 
      effects: "🧠 +3 Smarts, 😊 +5 Happy, ✨ +2 Looks" 
    },
  ];

  if (state.socialMedia.isJoined) {
    acts.push({ 
      id: "post_social", 
      name: "Posting di Sosmed", 
      minAge: 12, 
      cost: 0, 
      description: "Berbagi momen hidupmu di internet.", 
      effects: "📈 +Followers, 😊 +2 Happy" 
    });
  } else {
    acts.push({ 
      id: "join_social", 
      name: "Gabung Sosmed", 
      minAge: 12, 
      cost: 0, 
      description: "Mendaftar akun media sosial untuk pertama kalinya.", 
      effects: "🌐 Akses Fitur Sosmed" 
    });
  }

  return acts.filter(a => state.age >= a.minAge);
}

export function getAvailableTreatments(state) {
  if (!state.life.isAlive) {
    return [];
  }

  return treatmentCatalog
    .filter((item) => state.age >= item.minAge)
    .map((item) => {
      let effectiveCost = item.cost;
      let isFreeWithBPJS = false;
      let isCoveredByParents = false;

      if (item.bpjsCovered && state.hasBPJS) {
        effectiveCost = 0;
        isFreeWithBPJS = true;
      } else if (state.age <= 18) {
        // Not using player's money if underage, covered by parents
        isCoveredByParents = true;
      }

      // Determine if disabled
      let disabled = false;
      if (!isCoveredByParents && !isFreeWithBPJS && state.money < effectiveCost) {
        disabled = true;
      }

      return {
        ...item,
        effectiveCost,
        isFreeWithBPJS,
        isCoveredByParents,
        disabled,
      };
    });
}
