"use client";

import { useState } from "react";
import styles from "./layeredGame.module.css";

export default function CharacterCreation({ onSetup }) {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    city: "",
    birthDate: {
      day: "",
      month: "",
      year: "",
    },
  });

  const cities = [
    "Jakarta", "Serang", "Tangerang", "Bandung", "Bekasi", "Bogor", "Cirebon",
    "Sukabumi", "Tasikmalaya", "Kudus", "Pekalongan", "Purwokerto", "Semarang",
    "Solo", "Tegal", "Yogyakarta", "Malang", "Surabaya", "Denpasar",
    "Bandar Lampung", "Palembang", "Medan"
  ];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetup(form);
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.legacyCard}>
        <div className={styles.judul}>AmpuLife</div>

        <div className={styles.inputGroup}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Lengkap"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Jenis Kelamin</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Kota Kelahiran</label>
          <select
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            <option value="">Pilih Kota</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroupDate}>
          <label>Tanggal Lahir:</label>
          <div className={styles.row}>
            <select
              value={form.birthDate.day}
              onChange={(e) => setForm({ ...form, birthDate: { ...form.birthDate, day: e.target.value } })}
            >
              <option value="">Tgl</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
              ))}
            </select>
            <select
              value={form.birthDate.month}
              onChange={(e) => setForm({ ...form, birthDate: { ...form.birthDate, month: e.target.value } })}
            >
              <option value="">Bulan</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              value={form.birthDate.year}
              onChange={(e) => setForm({ ...form, birthDate: { ...form.birthDate, year: e.target.value } })}
            >
              <option value="">Tahun</option>
              {[...Array(30)].map((_, i) => (
                <option key={2026 - i} value={String(2026 - i)}>{2026 - i}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className={styles.primaryButton}>Lahirskan!</button>
      </form>
    </div>
  );
}
