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
    return <div className={styles.containerCenter}><div style={{color: 'white'}}>Memuat Kehidupan...</div></div>;
  }

  return (
    <div className={styles.containerCenter}>
      <div className={styles.legacyCard}>
        <div className={styles.judul}>AmpuLife</div>
        <img src="/legacy/images/logo.png" alt="AmpuLife Logo" className={styles.logo} />
        <p className={styles.sdgText}>Mengandung 17 SDGs</p>
        <div className={styles.inputGroup}>
          <button onClick={() => {
            actions.startNewGame();
            router.push("/create");
          }} className={styles.primaryButton}>Mainkan!</button>
        </div>
        <div>
          <button className={styles.secondaryButton}>ℹ Informasi Pengembang</button>
          {state.age > 0 && (
            <button onClick={() => {
              actions.setupCharacter(state.profile);
              router.push("/game");
            }} className={styles.secondaryButton}>Lanjutkan Hidup</button>
          )}
        </div>
      </div>
    </div>
  );
}
