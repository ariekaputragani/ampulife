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

  const reward = randInt(crime.rewardRange[0], crime.rewardRange[1], rng);
  next.money += reward;
  next.stats = applyStatDelta(next.stats, crime.statDelta);

  const jailRisk = crime.jailChance + (next.stats.smarts < 35 ? 0.1 : 0);
  if (rng() < jailRisk) {
    next.legal.inJail = true;
    next.legal.jailYearsLeft = randInt(crime.jailYears[0], crime.jailYears[1], rng);
    next.legal.records.push({
      type: crime.name,
      age: next.age,
      years: next.legal.jailYearsLeft,
    });

    next.stats.happy = clamp(next.stats.happy - 6);
    next.stats.health = clamp(next.stats.health - 4);
    pushLog(
      next,
      `Aksi ${crime.name} terdeteksi polisi. Kamu dipenjara ${next.legal.jailYearsLeft} tahun.`
    );
  } else {
    pushLog(next, `Aksi ${crime.name} berhasil. Kamu mendapat Rp${reward.toLocaleString("id-ID")}.`);
  }

  return next;
}
