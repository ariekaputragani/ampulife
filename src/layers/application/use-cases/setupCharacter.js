import { cloneState, generateRandomName, pushLog } from "@/layers/domain/entities/stateUtils";

export function setupCharacter(state, { name, city, gender, birthDate }) {
  const next = cloneState(state);
  
  next.profile = {
    name: name || generateRandomName(gender),
    city: city || "Jakarta",
    gender,
    birthDate,
  };
  
  next.mode = "playing";
  next.age = 0;
  
  // Create parents
  const fatherName = generateRandomName("male");
  const motherName = generateRandomName("female");
  
  next.relations = [
    { id: "father", label: "Bapak", name: fatherName, bond: 70, support: 65 },
    { id: "mother", label: "Ibu", name: motherName, bond: 75, support: 70 },
  ];
  
  pushLog(next, `Perkenalkan nama saya ${next.profile.name}. Saya terlahir sebagai ${gender === 'male' ? 'laki-laki' : 'perempuan'}. Saya lahir di ${next.profile.city} pada tanggal ${birthDate.day} ${birthDate.month} ${birthDate.year}.`);
  pushLog(next, `Bapak saya ${fatherName}, Ibu saya ${motherName}.`);
  
  return next;
}
