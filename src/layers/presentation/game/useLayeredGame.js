"use client";

import { useEffect, useMemo, useState } from "react";
import { createInitialGameState } from "@/layers/domain/entities/gameState";
import { ageUpYear } from "@/layers/application/use-cases/ageUpYear";
import { applyJobAction, resignJobAction } from "@/layers/application/use-cases/careerActions";
import { takeAssetAction } from "@/layers/application/use-cases/takeAssetAction";
import { takeRelationAction } from "@/layers/application/use-cases/takeRelationAction";
import { takeEducationAction } from "@/layers/application/use-cases/takeEducationAction";
import { takeCrimeAction } from "@/layers/application/use-cases/takeCrimeAction";
import { takeTreatmentAction } from "@/layers/application/use-cases/takeTreatmentAction";
import { takePromotionAction } from "@/layers/application/use-cases/takePromotionAction";
import { setupCharacter } from "@/layers/application/use-cases/setupCharacter";
import { handleEventChoice } from "@/layers/application/use-cases/handleEventChoice";
import { takeActivityAction } from "@/layers/application/use-cases/takeActivityAction";
import { askParentsAction } from "@/layers/application/use-cases/askParentsAction";
import { changeLifestyleAction } from "@/layers/application/use-cases/changeLifestyleAction";
import { dropOutAction } from "@/layers/application/use-cases/dropOutAction";
import { resolveChoice } from "@/layers/application/use-cases/resolveChoice";
import {
  clearGameState,
  loadGameState,
  saveGameState,
} from "@/layers/infrastructure/persistence/gameRepository";
import {
  getAvailableAssets,
  getAvailableCrimes,
  getAvailableEducation,
  getAvailableJobs,
  getAvailableTreatments,
  getAvailableActivities,
} from "@/layers/application/use-cases/deriveOptions";
import { generateRandomName } from "@/layers/domain/entities/stateUtils";
import { getPromotionRequirements } from "@/layers/domain/services/careerEngine";

export function useLayeredGame() {
  const [state, setState] = useState(createInitialGameState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      // eslint-disable-next-line
      setState(saved);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    saveGameState(state);
  }, [ready, state]);

  const options = useMemo(
    () => ({
      jobs: getAvailableJobs(state),
      assets: getAvailableAssets(state),
      education: getAvailableEducation(state),
      crimes: getAvailableCrimes(state),
      treatments: getAvailableTreatments(state),
      activities: getAvailableActivities(state),
    }),
    [state]
  );

  const promotionInfo = useMemo(() => getPromotionRequirements(state), [state]);

  const actions = {
    setupCharacter: (formData) => setState((current) => setupCharacter(current, formData)),
    handleEventChoice: (optionId) => setState((current) => handleEventChoice(current, optionId)),
    resolveChoice: (eventId, choiceId, payload) => setState((current) => resolveChoice(current, eventId, choiceId, payload)),
    ageUp: () => setState((current) => ageUpYear(current)),
    applyJob: (jobId) => setState((current) => applyJobAction(current, jobId)),
    resignJob: () => setState((current) => resignJobAction(current)),
    buyAsset: (assetId) =>
      setState((current) => takeAssetAction(current, assetId)),
    askParents: (assetId) =>
      setState((current) => askParentsAction(current, assetId)),
    interact: (relationId, actionKey, payload) =>
      setState((current) => takeRelationAction(current, relationId, actionKey, payload)),
    study: (educationId) =>
      setState((current) => takeEducationAction(current, educationId)),
    doCrime: (crimeId) => setState((current) => takeCrimeAction(current, crimeId)),
    treatment: (treatmentId) =>
      setState((current) => takeTreatmentAction(current, treatmentId)),
    promote: () => setState((current) => takePromotionAction(current)),
    takeActivity: (activityId) => setState((current) => takeActivityAction(current, activityId)),
    changeLifestyle: (lifestyleId) => setState((current) => changeLifestyleAction(current, lifestyleId)),
    dropOut: () => setState((current) => dropOutAction(current, "voluntary")),
    startNewGame: () => setState((current) => ({ ...createInitialGameState(), mode: "create" })),
    setupRandomCharacter: () => {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const name = generateRandomName(gender);
      const cities = [
        "Jakarta", "Serang", "Tangerang", "Bandung", "Bekasi", "Bogor", "Cirebon", "Sukabumi", "Tasikmalaya",
        "Kudus", "Pekalongan", "Purwokerto", "Semarang", "Solo", "Tegal", "Yogyakarta", "Malang", "Surabaya",
        "Denpasar", "Bandar Lampung", "Palembang", "Medan"
      ];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const month = months[Math.floor(Math.random() * months.length)];
      const year = Math.floor(Math.random() * 37) + 1990;

      const getMaxDay = (m, y) => {
        const days = {
          "Januari": 31, "Februari": (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28,
          "Maret": 31, "April": 30, "Mei": 31, "Juni": 30,
          "Juli": 31, "Agustus": 31, "September": 30, "Oktober": 31,
          "November": 30, "Desember": 31
        };
        return days[m] || 31;
      };

      const birthDate = {
        day: Math.floor(Math.random() * getMaxDay(month, year)) + 1,
        month: month,
        year: year,
      };

      setState((current) => setupCharacter(current, { name, city, gender, birthDate }));
    },
    reset: () => {
      clearGameState();
      setState(createInitialGameState());
    },
    popNotification: () => {
      setState((current) => {
        const queue = [...(current.notificationQueue || [])];
        queue.shift();
        return { ...current, notificationQueue: queue };
      });
    },
  };

  return {
    state,
    options,
    actions,
    ready,
  };
}
