"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/session";

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unverified" | "domain" };

/** ID トークンを受け取り、検証して Cookie に保存する。ログイン時と、トークンの更新時に使う。 */
export async function signIn(idToken: string): Promise<SignInResult> {
  if (typeof idToken !== "string" || idToken === "") {
    return { ok: false, reason: "invalid" };
  }
  return createSession(idToken);
}

/** ログアウトして、トップに戻る。 */
export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
