"use client";

import { useLayeredGame } from "@/layers/presentation/game/useLayeredGame";
import styles from "@/layers/presentation/game/layeredGame.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayeredGameView from "@/layers/presentation/game/LayeredGameView";

export default function GamePage() {
  const { state, ready, actions } = useLayeredGame();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (state.mode === "menu") {
        router.push("/");
      } else if (state.mode === "create") {
        router.push("/create");
      }
    }
  }, [state.mode, ready, router]);

  if (!ready || state.mode !== "playing") {
    return <div className={styles.containerCenter}><div style={{color: 'white'}}>Memuat...</div></div>;
  }

  // We wrap LayeredGameView or just call it directly, but since LayeredGameView
  // handles the actual game dashboard, we can just render it here.
  // Wait, LayeredGameView has its own useLayeredGame. We can just render LayeredGameView
  // and modify LayeredGameView to ONLY contain the playing layout.
  return <LayeredGameView />;
}
