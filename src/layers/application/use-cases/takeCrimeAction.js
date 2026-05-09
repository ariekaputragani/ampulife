import { applyStatDelta, cloneState, clamp, pushLog } from "@/layers/domain/entities/stateUtils";
import { crimeCatalog } from "@/layers/infrastructure/catalogs/crimeCatalog";

function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function takeCrimeAction(state, crimeId, rng = Math.random) {
  const next = cloneState(state);
  const crime = crimeCatalog.find((item) => item.id === crimeId);

  if (!crime) {
    return next;
  }

  if (!next.life.isAlive) {
    pushLog(next, "Karakter sudah meninggal, aksi tidak bisa dilakukan.");
    return next;
  }

  if (next.legal.inJail) {
    pushLog(next, "Kamu sedang di penjara dan tidak bisa melakukan kriminal lagi.");
    return next;
  }

  if (next.age < crime.minAge) {
    pushLog(next, `Umur belum cukup untuk aksi ${crime.name}.`);
    return next;
  }

  if (next.legal.crimeAttemptsThisYear >= 3) {
    pushLog(next, "Polisi sedang mengawasi daerah ini dengan ketat. Kamu tidak berani melakukan kriminal lagi tahun ini.");
    return next;
  }

  next.legal.crimeAttemptsThisYear++;

  let actionDesc = crime.name;
  if (crime.id === "troublemaker") {
    const delinquencies = [
      'membuat order fiktif ojek online dengan kerugian ratusan ribu rupiah',
      'melakukan prank sembako sampah',
      'meledakkan buah menggunakan kembang api ilegal',
      'meledakkan kotak surat tetangga menggunakan petasan M-80',
      'menerobos masuk ke rumah tetangga saat mereka tidak di rumah untuk memainkan konsol game mereka',
      'mengumpulkan semua koin dari air mancur setempat',
      'menghancurkan kotak surat menggunakan tongkat pemukul',
      'melempar balon berisi air dari jembatan layang ke mobil-mobil yang lewat',
      'membuang semua sampah ke halaman tetangga',
      'melempar telur ke fasilitas umum',
      'membuang petasan yang menyala ke dalam toilet umum',
      'masuk ke dalam lift gedung tertinggi di kota dan menekan semua tombolnya',
      'pergi ke pusat kota dan menggores mobil sport mahal',
      'menonton pertandingan bola basket sekolah dan meneriakkan hinaan kepada para pemain',
      'pergi ke gedung pencakar langit dan meludah keluar jendela dari lantai atas',
      'bersembunyi di dalam rak pakaian di toko dan menakut-nakuti pembeli',
      'memasang taruhan secara ilegal pada pertandingan olahraga',
      'mengunci orang asing secara acak di dalam kamar mandi umum',
      'memotong rumput di kebun bunga tetangga dan membunuh semua bunganya',
      'mengendarai mobil sport tetangga yang tertinggal kuncinya untuk bersenang-senang',
      'menuangkan bergalon-galon pewarna makanan ke dalam air mancur kota',
      'menuangkan deterjen cucian ke dalam air mancur umum',
      'membunyikan alarm kebakaran di kompleks apartemen terbesar di kota pada jam 3 pagi',
      'menata ulang manekin di toko pakaian ke dalam berbagai posisi aneh',
      'melepaskan tiga ekor babi berlabel "Babi #1", "Babi #2", dan "Babi #4" ke sekolah',
      'mengendarai sepeda melintasi taman sambil mengenakan kostum badut',
      'berlari ke lapangan dan meluncur di tengah pertandingan olahraga',
      'menjual obat palsu dari tepung kepada mahasiswa',
      'menjual salinan film bajakan di pasar',
      'membakar sapu lalu melemparkannya dari atap gedung',
      'memasang speaker keras di balai kota dan memutar musik bising',
      'menampar orang asing tanpa alasan di jalanan',
      'menembak jendela-jendela sebuah bangunan terbengkalai',
      'menusuk ban mobil di tempat parkir yang ramai',
      'mencuri rambu jalan larut malam saat tidak ada orang',
      'mencuri sepeda yang tidak terkunci di kompleks apartemen',
      'menghentikan lalu lintas untuk pertunjukan lipsync di tengah jalan',
      'melepas pakaian dan berlari telanjang di sekitar kampus',
      'mengganti sejumlah label harga di toko elektronik lokal',
      'mencoret-coret tembok dengan tulisan konyol',
      'melempar botol minuman ke arah jalan raya',
      'melempar sisa makanan ke halaman tetangga',
      'melempar bola lumpur ke orang-orang di tempat parkir',
      'melempar puluhan tisu toilet ke atap rumah tetangga',
      'berjoget nyeleneh di depan orang asing di pusat kota',
      'menggunakan spidol permanen untuk menggambar hal tak pantas pada rambu jalan',
      'menggunakan peluncur untuk menembakkan balon air ke rumah tetangga',
      'mematikan semua televisi di bar olahraga saat momen penting menggunakan remote',
      'menulis "Hammer Time" di bawah kata "Stop" pada rambu berhenti'
    ];
    actionDesc = delinquencies[Math.floor(rng() * delinquencies.length)];
  }

  const reward = randInt(crime.rewardRange[0], crime.rewardRange[1], rng);
  const jailRisk = crime.jailChance + (next.stats.smarts < 35 ? 0.15 : 0);

  if (rng() < jailRisk) {
    // CAUGHT!
    next.legal.inJail = true;
    next.legal.isCaughtThisYear = true;
    next.legal.jailYearsLeft = randInt(crime.jailYears[0], crime.jailYears[1], rng);
    next.legal.records.push({
      type: crime.name,
      age: next.age,
      years: next.legal.jailYearsLeft,
    });

    // Money Confiscation (Punishment from parents/police)
    const confiscated = Math.floor(next.money * 0.5);
    next.money -= confiscated;

    // Consequences: Fired and Expelled
    let consequencesMsg = "";
    if (next.career.jobId) {
      next.career.jobId = null;
      next.career.yearsInRole = 0;
      consequencesMsg += " Kamu dipecat dari pekerjaan.";
    }
    if (next.education.level !== "none") {
      next.education.level = "none";
      next.education.schoolName = "";
      consequencesMsg += " Kamu dikeluarkan dari sekolah/kampus.";
    }

    // Family Fine (Legal fees / Bail)
    const fine = 5_000_000 + (Math.floor(rng() * 15_000_000));
    next.family.savings = Math.max(0, next.family.savings - fine);

    // Scaled Stat Penalties
    const penalty = crime.caughtPenalty || { happy: -40, health: -20, smarts: -5 };
    next.stats.happy = clamp(next.stats.happy + (penalty.happy || -40));
    next.stats.health = clamp(next.stats.health + (penalty.health || -20));
    next.stats.smarts = clamp(next.stats.smarts + (penalty.smarts || -5));

    let punishmentText = `Orang tuamu harus membayar denda Rp${fine.toLocaleString("id-ID")}${confiscated > 0 ? ` dan menyita Rp${confiscated.toLocaleString("id-ID")} uangmu` : ""}.`;
    if (next.legal.jailYearsLeft > 0) {
      punishmentText += ` Kamu dijebloskan ke penjara anak/lapas selama ${next.legal.jailYearsLeft} tahun!`;
    } else {
      next.legal.inJail = false; // Not actually jailed if 0 years
      punishmentText += ` Kamu mendapat teguran keras dari pihak berwajib dan masuk catatan kepolisian.`;
    }

    pushLog(
      next,
      `GAWAT! Aksimu ${actionDesc} ketahuan. ${punishmentText}${consequencesMsg}`
    );
  } else {
    // SUCCESS
    next.money += reward;
    next.stats = applyStatDelta(next.stats, crime.statDelta);
    if (crime.id === "troublemaker") {
      pushLog(next, `Aksi ${actionDesc} berhasil! Kamu merasa sangat puas!`);
    } else {
      pushLog(next, `Aksi ${crime.name} berhasil! Kamu mendapat Rp${reward.toLocaleString("id-ID")}.`);
    }
  }

  return next;
}
