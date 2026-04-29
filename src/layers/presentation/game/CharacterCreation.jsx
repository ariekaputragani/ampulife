"use client";

import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
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

  const genderOptions = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" }
  ];

  const cityOptions = [
    { label: "DKI Jakarta", options: [{ value: "Jakarta", label: "Jakarta" }] },
    { label: "Banten", options: [{ value: "Serang", label: "Serang" }, { value: "Tangerang", label: "Tangerang" }] },
    { label: "Jawa Barat", options: [
      { value: "Bandung", label: "Bandung" }, { value: "Bekasi", label: "Bekasi" }, 
      { value: "Bogor", label: "Bogor" }, { value: "Cirebon", label: "Cirebon" },
      { value: "Sukabumi", label: "Sukabumi" }, { value: "Tasikmalaya", label: "Tasikmalaya" }
    ]},
    { label: "Jawa Tengah", options: [
      { value: "Kudus", label: "Kudus" }, { value: "Pekalongan", label: "Pekalongan" },
      { value: "Purwokerto", label: "Purwokerto" }, { value: "Semarang", label: "Semarang" },
      { value: "Solo", label: "Solo" }, { value: "Tegal", label: "Tegal" }
    ]},
    { label: "Daerah Istimewa Yogyakarta", options: [{ value: "Yogyakarta", label: "Yogyakarta" }] },
    { label: "Jawa Timur", options: [{ value: "Malang", label: "Malang" }, { value: "Surabaya", label: "Surabaya" }] },
    { label: "Bali", options: [{ value: "Denpasar", label: "Denpasar" }] },
    { label: "Lampung", options: [{ value: "Bandar Lampung", label: "Bandar Lampung" }] },
    { label: "Sumatera Selatan", options: [{ value: "Palembang", label: "Palembang" }] },
    { label: "Sumatera Utara", options: [{ value: "Medan", label: "Medan" }] }
  ];

  const dayOptions = [...Array(31)].map((_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const monthOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ].map(m => ({ value: m, label: m }));
  const yearOptions = [...Array(30)].map((_, i) => ({ value: String(2026 - i), label: String(2026 - i) }));

  // Custom styles for react-select to match input-box
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: 'none',
      borderBottom: '2px solid #ccc',
      borderRadius: 0,
      boxShadow: 'none',
      '&:hover': { borderBottom: '2px solid rgb(68, 68, 255)' },
      minHeight: '45px',
      background: 'transparent'
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 10px'
    }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.gender || !form.city || !form.birthDate.day || !form.birthDate.month || !form.birthDate.year) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Mohon lengkapi semua data!',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Karakter berhasil dilahirkan.',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      onSetup(form);
    });
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.legacyCard}>
        <div className={styles.judul}>AmpuLife</div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Lengkap"
            style={{ width: '100%', height: '45px', border: 'none', borderBottom: '2px solid #ccc', outline: 'none', fontSize: '16px', background: 'transparent' }}
          />
          <div className={styles.underline}></div>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '25px', zIndex: 3 }}>
          <Select
            options={genderOptions}
            placeholder="Jenis Kelamin"
            styles={customStyles}
            onChange={(selected) => setForm({ ...form, gender: selected.value })}
          />
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '25px', zIndex: 2 }}>
          <Select
            options={cityOptions}
            placeholder="Kota Kelahiran"
            styles={customStyles}
            onChange={(selected) => setForm({ ...form, city: selected.value })}
          />
        </div>

        <div className={styles.sdgText} style={{ marginTop: '25px', marginBottom: '5px', textAlign: 'left', fontSize: '14px' }}>Tanggal Lahir:</div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', zIndex: 1, position: 'relative' }}>
          <div style={{ flex: 1 }}>
            <Select
              options={dayOptions}
              placeholder="Tgl"
              styles={customStyles}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, day: selected.value } })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select
              options={monthOptions}
              placeholder="Bulan"
              styles={customStyles}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, month: selected.value } })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select
              options={yearOptions}
              placeholder="Tahun"
              styles={customStyles}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, year: selected.value } })}
            />
          </div>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '40px' }}>
          <button type="submit" className={styles.primaryButton}>Lahirkan!</button>
        </div>
      </form>
    </div>
  );
}
