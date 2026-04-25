export const treatmentCatalog = [
  {
    id: "puskesmas",
    name: "Berobat ke Puskesmas",
    minAge: 0,
    cost: 50_000,
    bpjsCovered: true, // Gratis jika pakai BPJS
    effect: { health: 6, happy: 1 },
    canCure: false, // Hanya meredakan gejala
  },
  {
    id: "basic_checkup",
    name: "Checkup Klinik Swasta",
    minAge: 0,
    cost: 750_000,
    bpjsCovered: false,
    effect: { health: 10, happy: 2 },
    canCure: true, // Bisa menyembuhkan penyakit ringan
  },
  {
    id: "full_treatment",
    name: "Perawatan Rumah Sakit Spesialis",
    minAge: 0,
    cost: 15_000_000,
    bpjsCovered: false, // Tidak tercover full, harus bayar mahal
    effect: { health: 25, happy: 5 },
    canCure: true, // Mengobati penyakit berat
  },
];
