"use client";

import { useState, useEffect } from "react";
import Select, { components } from "react-select";
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

  const [dynamicDayOptions, setDynamicDayOptions] = useState([]);

  const genderOptions = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" }
  ];

  const cityOptions = [
    { label: "DKI Jakarta", options: [{ value: "Jakarta", label: "Jakarta" }] },
    { label: "Banten", options: [{ value: "Serang", label: "Serang" }, { value: "Tangerang", label: "Tangerang" }] },
    {
      label: "Jawa Barat", options: [
        { value: "Bandung", label: "Bandung" }, { value: "Bekasi", label: "Bekasi" },
        { value: "Bogor", label: "Bogor" }, { value: "Cirebon", label: "Cirebon" },
        { value: "Sukabumi", label: "Sukabumi" }, { value: "Tasikmalaya", label: "Tasikmalaya" }
      ]
    },
    {
      label: "Jawa Tengah", options: [
        { value: "Kudus", label: "Kudus" }, { value: "Pekalongan", label: "Pekalongan" },
        { value: "Purwokerto", label: "Purwokerto" }, { value: "Semarang", label: "Semarang" },
        { value: "Solo", label: "Solo" }, { value: "Tegal", label: "Tegal" }
      ]
    },
    { label: "Daerah Istimewa Yogyakarta", options: [{ value: "Yogyakarta", label: "Yogyakarta" }] },
    { label: "Jawa Timur", options: [{ value: "Malang", label: "Malang" }, { value: "Surabaya", label: "Surabaya" }] },
    { label: "Bali", options: [{ value: "Denpasar", label: "Denpasar" }] },
    { label: "Lampung", options: [{ value: "Bandar Lampung", label: "Bandar Lampung" }] },
    { label: "Sumatera Selatan", options: [{ value: "Palembang", label: "Palembang" }] },
    { label: "Sumatera Utara", options: [{ value: "Medan", label: "Medan" }] }
  ];

  const monthOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ].map(m => ({ value: m, label: m }));

  const yearOptions = [...Array(37)].map((_, i) => ({ value: String(2026 - i), label: String(2026 - i) }));

  // Date Logic Ported from script.js
  const getMaxDay = (m, y) => {
    if (m === 2) {
      if (y % 4 === 0) return 29;
      return 28;
    }
    if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
    return 31;
  };

  const validMonthMap = {
    "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6,
    "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12
  };

  const updateDayOptions = (maxDay) => {
    const newOptions = [...Array(maxDay)].map((_, i) => ({ value: String(i + 1), label: String(i + 1) }));
    setDynamicDayOptions(newOptions);

    // Auto-correct selected day if it exceeds the new maxDay
    const currentDay = parseInt(form.birthDate.day, 10);
    if (!isNaN(currentDay) && currentDay > maxDay) {
      setForm(prev => ({
        ...prev,
        birthDate: { ...prev.birthDate, day: String(maxDay) }
      }));
    }
  };

  useEffect(() => {
    // Initial load: 31 days
    updateDayOptions(31);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { month, year } = form.birthDate;
    if (month && year) {
      const monNum = validMonthMap[month];
      if (monNum) {
        const maxDay = getMaxDay(monNum, parseInt(year, 10));
        updateDayOptions(maxDay);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.birthDate.month, form.birthDate.year]);

  // Custom styles for react-select to exactly mimic default Select2
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '28px',
      height: '35px',
      backgroundColor: '#fff',
      border: '1px solid #aaa',
      borderRadius: '4px',
      boxShadow: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      '&:hover': {
        borderColor: '#aaa',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 4px',
      height: '33px',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#444',
      fontSize: '14px',
      lineHeight: '33px',
      textAlign: 'left',
      position: 'relative',
      transform: 'none',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#999',
      fontSize: '14px',
      lineHeight: '33px',
      textAlign: 'left',
      position: 'relative',
      transform: 'none',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px',
      color: '#444',
      textAlign: 'left',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#888',
      padding: '2px 6px',
      '&:hover': {
        color: '#555'
      }
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: '1px',
      border: '1px solid #aaa',
      borderRadius: '4px',
      boxShadow: '0 4px 5px rgba(0,0,0,0.15)',
      fontFamily: 'inherit',
      zIndex: 9999,
      textAlign: 'left',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#5897fb' : state.isFocused ? '#5897fb' : 'transparent',
      color: state.isSelected || state.isFocused ? 'white' : '#333',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '6px 12px',
      textAlign: 'left',
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: '#333',
      fontSize: '13px',
      fontWeight: 'bold',
      padding: '6px 12px',
      textTransform: 'none',
      textAlign: 'left',
    })
  };

  const CustomDropdownIndicator = (props) => {
    return (
      <div {...props.innerProps} style={{ padding: '0 8px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{
          borderColor: '#888 transparent transparent transparent',
          borderStyle: 'solid',
          borderWidth: '5px 4px 0 4px',
          height: 0,
          width: 0,
          display: 'inline-block',
          marginTop: '2px'
        }} />
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.gender || !form.city || !form.birthDate.day || !form.birthDate.month || !form.birthDate.year) {
      Swal.fire({
        icon: 'error',
        title: 'Ups...',
        text: 'Masukkan data yang benar!',
      });
      return;
    }

    onSetup(form);
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.legacyCard}>
        <div className={styles.judul}>AmpuLife</div>

        <div className={styles.inputGroup} style={{ marginTop: '25px', position: 'relative' }}>
          <input
            type="text"
            id="nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Lengkap"
            style={{ width: '100%', height: '45px', border: 'none', outline: 'none', fontSize: '16px', background: 'transparent', padding: '0', fontFamily: 'inherit' }}
          />
          <div className={styles.underline}></div>
        </div>

        <div style={{ marginTop: '25px', position: 'relative', zIndex: 3 }}>
          <Select
            options={genderOptions}
            placeholder="Pilih Jenis Kelamin"
            styles={customStyles}
            components={{ DropdownIndicator: CustomDropdownIndicator }}
            isSearchable={false}
            onChange={(selected) => setForm({ ...form, gender: selected.value })}
          />
        </div>

        <div style={{ marginTop: '25px', position: 'relative', zIndex: 2 }}>
          <Select
            options={cityOptions}
            placeholder="Pilih Kota"
            styles={customStyles}
            components={{ DropdownIndicator: CustomDropdownIndicator }}
            isSearchable={true}
            onChange={(selected) => setForm({ ...form, city: selected.value })}
          />
        </div>

        <div className={styles.teks} style={{ marginTop: '25px', marginBottom: '5px', textAlign: 'center' }}>Tanggal Lahir:</div>

        <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '0 0 22%' }}>
            <Select
              options={dynamicDayOptions}
              placeholder="Tgl"
              styles={customStyles}
              components={{ DropdownIndicator: CustomDropdownIndicator }}
              isSearchable={false}
              value={dynamicDayOptions.find(o => o.value === form.birthDate.day) || null}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, day: selected.value } })}
            />
          </div>
          <div style={{ flex: '0 0 45%' }}>
            <Select
              options={monthOptions}
              placeholder="Bulan"
              styles={customStyles}
              components={{ DropdownIndicator: CustomDropdownIndicator }}
              isSearchable={false}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, month: selected.value } })}
            />
          </div>
          <div style={{ flex: '0 0 30%' }}>
            <Select
              options={yearOptions}
              placeholder="Tahun"
              styles={customStyles}
              components={{ DropdownIndicator: CustomDropdownIndicator }}
              isSearchable={false}
              onChange={(selected) => setForm({ ...form, birthDate: { ...form.birthDate, year: selected.value } })}
            />
          </div>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '40px' }}>
          <button id="lahirkan" type="submit" className={styles.primaryButton} style={{ marginTop: 0, marginBottom: 0 }}>Lahirkan!</button>
        </div>
      </form>
    </div>
  );
}
