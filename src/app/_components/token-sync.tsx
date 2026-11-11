"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { signIn } from "@/app/actions/auth";
import { getClientAuth } from "@/lib/firebase/client";

/**
 * ログイン中、Firebase が ID トークンを更新する(約1時間ごと)たびに、
 * サーバーの Cookie を新しいトークンに差し替える。画面には何も表示しない。
 */
export function TokenSync() {
  useEffect(() => {
    return onIdTokenChanged(getClientAuth(), async (user) => {
      if (!user) return;
      try {
        await signIn(await user.getIdToken());
      } catch {
        // 失敗しても、次の更新かページの再読み込みでやり直せる。
      }
    });
  }, []);

  return null;
}
