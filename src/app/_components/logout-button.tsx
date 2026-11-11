"use client";

import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { getClientAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    // ブラウザ側のログイン状態を消してから、サーバーの Cookie を消す。
    await getClientAuth().signOut();
    await signOut();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="text-sm text-muted underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
    >
      ログアウト
    </button>
  );
}
