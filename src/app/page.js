"use client";

import { useLayeredGame } from "@/layers/presentation/game/useLayeredGame";
import styles from "@/layers/presentation/game/layeredGame.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { state, actions, ready } = useLayeredGame();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (state.mode === "create") {
        router.push("/create");
      } else if (state.mode === "playing") {
        router.push("/game");
      }
    }
  }, [state.mode, ready, router]);

  if (!ready || state.mode !== "menu") {
    return <div className={styles.containerCenter}><div style={{ color: 'white' }}>Memuat Kehidupan...</div></div>;
  }

  return (
    <div className={styles.containerCenter}>
      <div className={styles.legacyCard}>
        <div className={styles.judul}>AmpuLife</div>
        <div className={styles.teks}>
          <img src="/legacy/images/logo.png" alt="Logo" />
        </div>
        <div className={styles.teks}>Mengandung 17 SDGs</div>

        <div className={styles.inputGroup} style={{ marginTop: '40px', marginBottom: '20px' }}>
          <button onClick={() => {
            actions.startNewGame();
            router.push("/create");
          }} className={styles.primaryButton}>Mainkan!</button>
        </div>

        <div className={styles.tombol1Button} style={{ padding: 0 }}>
          <button onClick={() => {
            import('sweetalert2').then((Swal) => {
              Swal.default.fire({
                icon: 'info',
                title: 'Info Pengembang',
                html: 'By Ari Eka Putragani<br><br>' +
                  'Dosen Pembimbing:<br>' +
                  'Dani Arifudin, M.Kom.<br>' +
                  'Banu Dwi Putranto, M.Kom.'
              });
            });
          }} className={styles.tombol1Button}><i className="fa fa-info"></i> Informasi Pengembang</button>
        </div>

        {state.age > 0 && (
          <div className={styles.tombol2Button} style={{ padding: 0 }}>
            <button onClick={() => {
              actions.setupCharacter(state.profile);
              router.push("/game");
            }} className={styles.tombol2Button}><i className="fa fa-play"></i> Lanjutkan Hidup</button>
          </div>
        )}
      </div>
    </div >
  );
}
