import { cookies } from "next/headers";
import { getSetting } from "./db";

export const PIN_SETTING = "app_pin_hash";
export const PIN_COOKIE = "ibm_pin";
export const RECOVERY_Q_SETTING = "app_recovery_question";
export const RECOVERY_A_SETTING = "app_recovery_answer";

export async function isPinEnabled(): Promise<boolean> {
  return !!(await getSetting(PIN_SETTING));
}

export async function isUnlocked(): Promise<boolean> {
  if (!(await isPinEnabled())) return true;
  const store = await cookies();
  return store.get(PIN_COOKIE)?.value === "1";
}

export interface RecoveryInfo {
  question: string | null;
  answerHash: string | null;
}

export async function getRecoveryInfo(): Promise<RecoveryInfo> {
  const [q, a] = await Promise.all([
    getSetting(RECOVERY_Q_SETTING),
    getSetting(RECOVERY_A_SETTING),
  ]);
  return { question: q, answerHash: a };
}