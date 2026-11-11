"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signIn } from "@/app/actions/auth";
import { getClientAuth } from "@/lib/firebase/client";

const MESSAGES = {
  invalid: "ログインに失敗しました。もう一度お試しください。",
  unverified: "メールアドレスが確認できないアカウントです。",
  domain: "このメールアドレスではログインできません。会社のアカウントを使ってください。",
  cancelled: "",
  unknown: "ログインできませんでした。時間をおいてもう一度お試しください。",
} as const;

export function LoginScreen() {
  const router = useRouter();
  // 最初は、ブラウザに残っているログインを確かめている間。
  const [pending, setPending] = useState(true);
  const [message, setMessage] = useState("");

  /** ID トークンをサーバーに渡す。失敗したらブラウザ側のログインも消して、メッセージを出す。 */
  async function sendToken(getToken: () => Promise<string>) {
    const auth = getClientAuth();
    const result = await signIn(await getToken());
    if (result.ok) {
      router.refresh();
      return;
    }
    await auth.signOut();
    setMessage(MESSAGES[result.reason]);
  }

  // サーバーの Cookie が切れていても、ブラウザにログインが残っていれば自動で復元する。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const auth = getClientAuth();
      try {
        await auth.authStateReady();
        const user = auth.currentUser;
        if (user && !cancelled) await sendToken(() => user.getIdToken());
      } catch {
        // 復元できなければ、ボタンから入り直してもらう。
      } finally {
        if (!cancelled) setPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin() {
    setPending(true);
    setMessage("");
    try {
      const credential = await signInWithPopup(
        getClientAuth(),
        new GoogleAuthProvider(),
      );
      await sendToken(() => credential.user.getIdToken());
    } catch (e) {
      const code = (e as { code?: string }).code;
      const closed =
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request";
      setMessage(closed ? MESSAGES.cancelled : MESSAGES.unknown);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-6 px-6 pb-8 pt-7">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-brand" />
        <span className="text-base font-bold">シャッフルランチ</span>
      </div>

      <h1 className="mt-2 text-[26px] font-bold leading-snug">
        ログインして
        <br />
        はじめましょう
      </h1>
      <p className="text-base text-muted">
        Google アカウントでログインします。
      </p>

      <div className="flex-1" />

      {message && (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={handleLogin}
        disabled={pending}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {pending ? "ログインしています…" : "Google でログイン"}
      </button>
    </div>
  );
}
