import { applyStatDelta, cloneState, clamp, pushLog, pushNotification } from "@/layers/domain/entities/stateUtils";
import { crimeCatalog } from "@/layers/infrastructure/catalogs/crimeCatalog";

function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function takeCrimeAction(state, crimeId, payload = {}, rng = Math.random) {
  const next = cloneState(state);
  if (state.legal.inJail && (crimeId === "escape" || crimeId === "riot")) {
    return handlePrisonAction(next, crimeId, rng, payload);
  }

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

    let isLifeSentence = false;
    if (next.legal.jailYearsLeft > 20) {
      next.legal.jailYearsLeft = 999;
      isLifeSentence = true;
    }

    next.legal.records.push({
      type: crime.name,
      age: next.age,
      years: isLifeSentence ? "Seumur Hidup" : next.legal.jailYearsLeft,
    });

    // Money Confiscation (Punishment from parents/police)
    const confiscated = next.money > 0 ? Math.floor(next.money * 0.5) : 0;
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
    const penalty = crime.caughtPenalty || { happy: -40 };
    next.stats.happy = clamp(next.stats.happy + (penalty.happy || -40));

    let punishmentText = `Orang tuamu harus membayar denda Rp${fine.toLocaleString("id-ID")}${confiscated > 0 ? ` dan menyita Rp${confiscated.toLocaleString("id-ID")} uangmu` : ""}.`;
    if (next.legal.jailYearsLeft > 0) {
      const yearsText = next.legal.jailYearsLeft >= 999 ? "seumur hidup" : `${next.legal.jailYearsLeft} tahun`;
      punishmentText += ` Kamu dijebloskan ke penjara anak/lapas selama ${yearsText}!`;
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

function handlePrisonAction(next, actionId, rng, payload = {}) {
  if (actionId === "escape") {
    if (next.jailActions?.hasAttemptedEscape) {
      pushNotification(next, { title: "Penjara", message: "Kamu tidak bisa mencari cara untuk kabur.", icon: "warning" });
      return next;
    }

    if (!payload.confirmed) {
      pushNotification(next, {
        title: "Penjara",
        message: "Mau kabur dari penjara?",
        icon: "warning",
        type: "confirm",
        eventId: "prison_escape_confirm",
        options: [
          { id: "yes", label: "Ya", color: "red" },
          { id: "no", label: "Tidak", color: "gray" }
        ]
      });
      return next;
    }

    const r = rng();
    const smarts = next.stats.smarts;
    let success = false;

    if (r < 0.7 && smarts >= 90) success = true;
    else if (r < 0.5 && smarts >= 70) success = true;
    else if (r < 0.3 && smarts >= 50) success = true;
    else if (r < 0.2 && smarts >= 30) success = true;
    else if (r < 0.1 && smarts >= 10) success = true;

    if (success) {
      next.legal.inJail = false;
      next.legal.jailYearsLeft = 0;
      next.stats.happy = clamp(next.stats.happy + 20);
      const msg = "Kamu bebas dari penjara.";
      pushLog(next, "Saya bebas dari penjara.");
      pushNotification(next, { title: "Penjara", message: msg, icon: "success" });
    } else {
      const extraYears = randInt(2, 5, rng);
      next.legal.jailYearsLeft += extraYears;

      let msg = "";
      if (next.legal.jailYearsLeft > 20) {
        next.legal.jailYearsLeft = 999;
        msg = `Kamu ketangkap dan dijatuhi hukuman seumur hidup!`;
      } else {
        msg = `Kamu ketangkap dan hukuman ditambah menjadi ${next.legal.jailYearsLeft} tahun.`;
      }

      next.stats.happy = clamp(next.stats.happy - 10);
      pushLog(next, msg);
      pushNotification(next, { title: "Penjara", message: msg, icon: "error" });
    }

    if (!next.jailActions) next.jailActions = {};
    next.jailActions.hasAttemptedEscape = true;
  }
  else if (actionId === "riot") {
    if (next.jailActions?.hasRioted) {
      pushNotification(next, { title: "Penjara", message: "Suasana masih tegang, kamu tidak bisa memulai kerusuhan lagi sekarang.", icon: "warning" });
      return next;
    }

    if (!payload.confirmed) {
      pushNotification(next, {
        title: "Penjara",
        message: "Memulai kerusuhan?",
        icon: "warning",
        type: "confirm",
        eventId: "prison_riot_confirm",
        options: [
          { id: "yes", label: "Ya", color: "red" },
          { id: "no", label: "Tidak", color: "gray" }
        ]
      });
      return next;
    }

    const r = rng();
    let msg = "";
    const injured = randInt(10, 50, rng);
    const dead = randInt(1, 5, rng);

    if (r < 0.25) {
      msg = `Kamu memulai kerusuhan. ${injured} orang terluka.`;
    } else if (r < 0.5) {
      msg = `Kamu memulai kerusuhan. ${injured} orang terluka dan ${dead} orang meninggal dunia.`;
    } else if (r < 0.75) {
      msg = `Kamu memulai kerusuhan. ${injured} orang terluka. Kamu diserang!`;
      applySerangan(next, rng);
    } else {
      msg = `Kamu memulai kerusuhan. ${injured} orang terluka dan ${dead} orang meninggal dunia. Kamu diserang!`;
      applySerangan(next, rng);
    }

    pushLog(next, msg.replace("Kamu", "Saya"));
    pushNotification(next, { title: "Kerusuhan", message: msg, icon: "info" });

    if (rng() < 0.3) {
      const extraYears = randInt(1, 2, rng);
      next.legal.jailYearsLeft += extraYears;
      next.stats.happy = clamp(next.stats.happy - 10);

      let penaltyMsg = "";
      if (next.legal.jailYearsLeft > 20) {
        next.legal.jailYearsLeft = 999;
        penaltyMsg = `Kamu memicu kerusuhan parah dan dijatuhi hukuman seumur hidup!`;
      } else {
        penaltyMsg = `Hukuman ditambah menjadi ${next.legal.jailYearsLeft} tahun.`;
      }

      pushLog(next, penaltyMsg.replace("Kamu", "Saya"));
      pushNotification(next, { title: "Penjara", message: penaltyMsg, icon: "error" });
    }

    if (!next.jailActions) next.jailActions = {};
    next.jailActions.hasRioted = true;
  }

  return next;
}

function applySerangan(next, rng) {
  const r = rng();
  let penalty = { happy: -10, health: -4 };

  if (r < 0.4) {
    penalty = { happy: -10, health: -4 };
  } else if (r < 0.7) {
    penalty = { happy: -10, health: -8 };
  } else if (r < 0.9) {
    penalty = { happy: -10, health: -15 };
  } else if (r < 0.99) {
    penalty = { happy: -10, health: -30 };
  } else {
    if (rng() < 0.5) {
      // Evaded
      pushLog(next, "Seseorang mencoba menyerang saya, tapi saya berhasil menghindar.");
      pushNotification(next, { title: "Konflik", message: "Kamu berhasil menghindar dari serangan.", icon: "success" });
      return;
    } else if (rng() < 0.8) {
      penalty = { happy: -50, health: -50 };
    } else {
      penalty = { happy: -50, health: -100 };
    }
  }

  next.stats.happy = clamp(next.stats.happy + penalty.happy);
  next.stats.health = clamp(next.stats.health + penalty.health);

  if (penalty.health < -10) {
    pushNotification(next, { title: "Konflik", message: "Awwww! Kamu terluka parah akibat serangan.", icon: "error" });
    pushLog(next, "Saya diserang dan terluka parah!");
  } else {
    pushNotification(next, { title: "Konflik", message: "Awwww! Kamu terkena serangan.", icon: "warning" });
    pushLog(next, "Saya terkena serangan narapidana lain.");
  }
}
