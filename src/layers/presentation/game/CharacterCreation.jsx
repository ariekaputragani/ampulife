"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import styles from "./layeredGame.module.css";
import "select2/dist/css/select2.min.css";
import $ from "jquery";
import "select2";

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

  const genderRef = useRef(null);
  const cityRef = useRef(null);
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const [dynamicDayOptions, setDynamicDayOptions] = useState([]);

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

  const monthOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const yearOptions = [...Array(30)].map((_, i) => String(2026 - i));

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

  useEffect(() => {
    // Initial load: 31 days
    updateDayOptions(31);
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
  }, [form.birthDate.month, form.birthDate.year]);

  const updateDayOptions = (maxDay) => {
    const newOptions = [...Array(maxDay)].map((_, i) => String(i + 1));
    setDynamicDayOptions(newOptions);
    
    // Auto-correct selected day if it exceeds the new maxDay
    const currentDay = parseInt(form.birthDate.day, 10);
    if (!isNaN(currentDay) && currentDay > maxDay) {
      setForm(prev => ({
        ...prev,
        birthDate: { ...prev.birthDate, day: String(maxDay) }
      }));
      // Also update select2 instance for day
      if (dayRef.current) {
        $(dayRef.current).val(String(maxDay)).trigger('change.select2');
      }
    }
  };

  useEffect(() => {
    // Initialize Select2 after component mount and when options change (specifically for days)
    if (typeof window !== "undefined") {
      
      const initSelect2 = (ref, options, keyPath, valValue, isSearchable = false) => {
        if (!ref.current) return;
        const $el = $(ref.current);
        
        // Destroy existing instance if present before re-init
        if ($el.hasClass("select2-hidden-accessible")) {
          $el.select2('destroy');
        }

        $el.select2({
          width: "100%",
          placeholder: options.placeholder || "",
          minimumResultsForSearch: isSearchable ? 0 : Infinity // Hide search box if not searchable
        });

        // Set initial value without triggering change event
        if (valValue) {
          $el.val(valValue).trigger('change.select2');
        }

        $el.off('change').on('change', function() {
          const val = $(this).val();
          if (keyPath.includes('.')) {
            const [parent, child] = keyPath.split('.');
            setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: val } }));
          } else {
            setForm(prev => ({ ...prev, [keyPath]: val }));
          }
        });
      };

      initSelect2(genderRef, { placeholder: "Pilih Jenis Kelamin" }, "gender", form.gender, false);
      initSelect2(cityRef, { placeholder: "Pilih Kota" }, "city", form.city, true);
      initSelect2(monthRef, { placeholder: "Bulan" }, "birthDate.month", form.birthDate.month, false);
      initSelect2(yearRef, { placeholder: "Tahun" }, "birthDate.year", form.birthDate.year, false);
    }
  }, []);

  // Day needs a separate effect because options change
  useEffect(() => {
    if (typeof window !== "undefined" && dayRef.current) {
      const $el = $(dayRef.current);
      if ($el.hasClass("select2-hidden-accessible")) {
        $el.select2('destroy');
      }
      $el.select2({
        width: "100%",
        placeholder: "Tgl",
        minimumResultsForSearch: Infinity
      });
      if (form.birthDate.day) {
        $el.val(form.birthDate.day).trigger('change.select2');
      }
      $el.off('change').on('change', function() {
        setForm(prev => ({ ...prev, birthDate: { ...prev.birthDate, day: $(this).val() } }));
      });
    }
  }, [dynamicDayOptions]);

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

        <div className={styles.inputGroup} style={{ marginTop: '25px' }}>
          <select ref={genderRef} id="jk" style={{ fontFamily: 'inherit' }}>
            <option value=""></option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '25px' }}>
          <select ref={cityRef} id="kota" style={{ fontFamily: 'inherit' }}>
            <option value=""></option>
            {cityOptions.map((group, i) => (
              <optgroup label={group.label} key={i}>
                {group.options.map((opt, j) => (
                  <option value={opt.value} key={j}>{opt.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className={styles.teks} style={{ marginTop: '25px', marginBottom: '5px', textAlign: 'center' }}>Tanggal Lahir:</div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '25px' }}>
          <div style={{ flex: '0 0 22%' }}>
            <select ref={dayRef} id="day" style={{ fontFamily: 'inherit' }}>
              <option value=""></option>
              {dynamicDayOptions.map(day => (
                <option value={day} key={day}>{day}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 0 45%' }}>
            <select ref={monthRef} id="month" style={{ fontFamily: 'inherit' }}>
              <option value=""></option>
              {monthOptions.map(month => (
                <option value={month} key={month}>{month}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 0 30%' }}>
            <select ref={yearRef} id="year" style={{ fontFamily: 'inherit' }}>
              <option value=""></option>
              {yearOptions.map(year => (
                <option value={year} key={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${styles.inputGroup} ${styles.tombol}`} style={{ marginTop: '40px' }}>
          <button id="lahirkan" type="submit" className={styles.primaryButton} style={{ marginTop: 0, marginBottom: 0 }}>Lahirkan!</button>
        </div>
      </form>
      
      {/* Global styles to override Select2 and enforce Poppins/Hover exactly like screenshot */}
      <style jsx global>{`
        .select2-container {
          font-family: 'Poppins', sans-serif !important;
          text-align: left;
        }
        .select2-container .select2-selection--single {
          height: 35px !important;
          border: 1px solid #aaa !important;
          border-radius: 4px !important;
          outline: none !important;
        }
        .select2-container--default .select2-selection--single .select2-selection__rendered {
          line-height: 33px !important;
          padding-left: 8px !important;
          color: #444 !important;
        }
        .select2-container--default .select2-selection--single .select2-selection__arrow {
          height: 33px !important;
        }
        .select2-container--default .select2-results__option--highlighted[aria-selected] {
          background-color: #5897fb !important;
          color: white !important;
        }
        .select2-search__field {
          outline: none !important;
          font-family: 'Poppins', sans-serif !important;
        }
        .select2-results__group {
          color: #333 !important;
          font-weight: bold !important;
          font-size: 13px !important;
          padding: 6px 12px !important;
        }
        .select2-results__option {
          padding: 6px 12px !important;
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
}
