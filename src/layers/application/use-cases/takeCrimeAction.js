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

    // Family Fine (Legal fees / Bail)
    const fine = 5_000_000 + (Math.floor(Math.random() * 15_000_000));
    next.family.savings = Math.max(0, next.family.savings - fine);

    // Severe Stat Penalties
    next.stats.happy = clamp(next.stats.happy - 40);
    next.stats.health = clamp(next.stats.health - 20);
    next.stats.smarts = clamp(next.stats.smarts - 5);

    pushLog(
      next,
      `GAWAT! Aksi ${crime.name} terdeteksi polisi. Orang tuamu harus membayar denda Rp${fine.toLocaleString("id-ID")} dan menyita Rp${confiscated.toLocaleString("id-ID")} uangmu. Kamu dipenjara ${next.legal.jailYearsLeft} tahun.`
    );
  } else {
    // SUCCESS
    next.money += reward;
    next.stats = applyStatDelta(next.stats, crime.statDelta);
    pushLog(next, `Aksi ${crime.name} berhasil! Kamu mendapat Rp${reward.toLocaleString("id-ID")}.`);
  }

  return next;
}
