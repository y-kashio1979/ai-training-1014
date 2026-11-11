"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { getClientAuth, getClientDb } from "@/lib/firebase/client";
import { loadLunchData } from "@/lib/firebase/lunch-store";
import type { LunchData } from "@/lib/lunch-data";
import { ShuffleLunch } from "./shuffle-lunch";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: LunchData };

/** アプリ起動時に Firestore から名簿・お店・時刻を読み込み、読めたらランチの画面を出す。 */
export function LunchLoader({
  user,
  logoutButton,
}: {
  user: SessionUser;
  logoutButton: ReactNode;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const auth = getClientAuth();
        await auth.authStateReady();
        // Firestore のルールはブラウザ側のログインで判定する。残っていなければ入り直してもらう。
        if (!auth.currentUser) throw new Error("ブラウザ側のログインがありません");
        const data = await loadLunchData(getClientDb());
        if (!cancelled) setState({ status: "ready", data });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "ready") {
    return (
      <ShuffleLunch user={user} data={state.data} logoutButton={logoutButton} />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-6 px-6 pb-8 pt-7">
      {state.status === "loading" ? (
        <p role="status" className="text-center text-muted">
          読み込み中…
        </p>
      ) : (
        <>
          <p role="alert" className="text-base text-red-700">
            データを読み込めませんでした。ログインし直すか、時間をおいてもう一度お試しください。
          </p>
          <div>{logoutButton}</div>
        </>
      )}
    </div>
  );
}
