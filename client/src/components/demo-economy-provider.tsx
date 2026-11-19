"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BOX_COST,
  STARTING_CREDITS,
  type RolledAbility
} from "@/lib/ability-economy";

export type OwnedAbility = RolledAbility & {
  id: string;
  boxCost: number;
  acquiredAt: string;
};

type EconomyState = {
  credits: number;
  boxesOwned: number;
  inventory: OwnedAbility[];
  realizedProfit: number;
};

type DemoEconomyContextValue = EconomyState & {
  ready: boolean;
  storageError: string | null;
  estimatedProfit: number;
  buyBox: () => void;
  addAbility: (ability: RolledAbility) => void;
  sellAbility: (id: string) => void;
};

const STORAGE_KEY = "lootlane-demo-economy-v1";
const INITIAL_STATE: EconomyState = {
  credits: STARTING_CREDITS,
  boxesOwned: 0,
  inventory: [],
  realizedProfit: 0
};

const DemoEconomyContext = createContext<DemoEconomyContextValue | null>(null);

function isOwnedAbility(value: unknown): value is OwnedAbility {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.element === "string" &&
    typeof item.condition === "string" &&
    typeof item.baseDanger === "string" &&
    typeof item.effectiveDanger === "string" &&
    typeof item.rarity === "string" &&
    typeof item.baseStars === "number" &&
    typeof item.conditionStarAdjustment === "number" &&
    typeof item.dangerStarAdjustment === "number" &&
    typeof item.finalStars === "number" &&
    typeof item.conditionValuePercent === "number" &&
    typeof item.starValueMultiplier === "number" &&
    typeof item.baseValue === "number" &&
    typeof item.marketValue === "number" &&
    typeof item.boxCost === "number" &&
    typeof item.acquiredAt === "string" &&
    typeof item.symbol === "string" &&
    typeof item.tone === "string"
  );
}

function isEconomyState(value: unknown): value is EconomyState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.credits === "number" &&
    state.credits >= 0 &&
    Number.isInteger(state.credits) &&
    typeof state.boxesOwned === "number" &&
    state.boxesOwned >= 0 &&
    Number.isInteger(state.boxesOwned) &&
    typeof state.realizedProfit === "number" &&
    Number.isFinite(state.realizedProfit) &&
    Array.isArray(state.inventory) &&
    state.inventory.every(isOwnedAbility)
  );
}

export function DemoEconomyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isEconomyState(parsed)) throw new Error("Saved demo economy data has an invalid shape.");
        setState(parsed);
      }
    } catch (error) {
      console.error("Could not load the saved demo economy.", error);
      setStorageError("Saved demo data could not be loaded. A fresh balance is being used.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save the demo economy.", error);
      setStorageError("Demo changes cannot be saved in this browser session.");
    }
  }, [ready, state]);

  const buyBox = useCallback(() => {
    setState((current) => {
      if (current.credits < BOX_COST) return current;
      return {
        ...current,
        credits: current.credits - BOX_COST,
        boxesOwned: current.boxesOwned + 1
      };
    });
  }, []);

  const addAbility = useCallback((ability: RolledAbility) => {
    setState((current) => {
      if (current.boxesOwned < 1) return current;
      const owned: OwnedAbility = {
        ...ability,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        boxCost: BOX_COST,
        acquiredAt: new Date().toISOString()
      };
      return {
        ...current,
        boxesOwned: current.boxesOwned - 1,
        inventory: [owned, ...current.inventory]
      };
    });
  }, []);

  const sellAbility = useCallback((id: string) => {
    setState((current) => {
      const ability = current.inventory.find((item) => item.id === id);
      if (!ability) return current;
      return {
        ...current,
        credits: current.credits + ability.marketValue,
        realizedProfit: current.realizedProfit + ability.marketValue - ability.boxCost,
        inventory: current.inventory.filter((item) => item.id !== id)
      };
    });
  }, []);

  const estimatedProfit =
    state.realizedProfit +
    state.inventory.reduce((profit, ability) => profit + ability.marketValue - ability.boxCost, 0);

  const value = useMemo(
    () => ({ ...state, ready, storageError, estimatedProfit, buyBox, addAbility, sellAbility }),
    [state, ready, storageError, estimatedProfit, buyBox, addAbility, sellAbility]
  );

  return <DemoEconomyContext.Provider value={value}>{children}</DemoEconomyContext.Provider>;
}

export function useDemoEconomy() {
  const context = useContext(DemoEconomyContext);
  if (!context) throw new Error("useDemoEconomy must be used inside DemoEconomyProvider.");
  return context;
}
