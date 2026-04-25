"use client";

import { useLayeredGame } from "@/layers/presentation/game/useLayeredGame";
import styles from "@/layers/presentation/game/layeredGame.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CharacterCreation from "@/layers/presentation/game/CharacterCreation";

export default function CreatePage() {
  const { state, actions, ready } = useLayeredGame();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (state.mode === "menu") {
        router.push("/");
      } else if (state.mode === "playing") {
        router.push("/game");
      }
    }
  }, [state.mode, ready, router]);

  if (!ready || state.mode !== "create") {
    return <div className={styles.containerCenter}><div style={{color: 'white'}}>Memuat...</div></div>;
  }

  return <CharacterCreation onSetup={(formData) => {
    actions.setupCharacter(formData);
    router.push("/game");
  }} />;
}
