"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import type { Employee } from "@/lib/employees";
import { formatTime, type LunchData } from "@/lib/lunch-data";
import { seatPositions } from "@/lib/seating";
import type { LunchConfig } from "@/lib/time";

type Step = "apply" | "applied" | "result";

const primaryButton =
  "flex h-14 w-full items-center justify-center rounded-2xl border-2 border-ink bg-brand text-lg font-bold text-ink shadow-[0_4px_0_var(--color-ink)] transition-[transform,box-shadow] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted disabled:shadow-none";
const secondaryButton =
  "flex h-14 w-full items-center justify-center rounded-2xl border-2 border-ink bg-white text-base font-bold text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function ShuffleLunch({
  user,
  data,
  logoutButton,
}: {
  user: SessionUser;
  data: LunchData;
  logoutButton: ReactNode;
}) {
  // ログイン直後から申し込み画面を出す。名簿との対応づけができるまでは、Google アカウントの情報を使う。
  const [step, setStep] = useState<Step>("apply");

  const me: Employee = {
    id: user.uid,
    name: user.name ?? user.email,
    department: "",
  };

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-6 px-6 pb-8 pt-7">
      <Header userName={me.name} />
      <div className="-mt-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-muted">{user.email}</span>
        {logoutButton}
      </div>

      {step === "apply" && (
        <ApplyScreen config={data.config} onApply={() => setStep("applied")} />
      )}
      {step === "applied" && (
        <AppliedScreen
          config={data.config}
          onCancel={() => setStep("apply")}
          onPreviewResult={() => setStep("result")}
        />
      )}
      {step === "result" && (
        <ResultScreen
          me={me}
          data={data}
          onCancel={() => setStep("apply")}
        />
      )}
    </div>
  );
}

function Header({ userName }: { userName: string | null }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-ink">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f2b233"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 3h5v5" />
            <path d="M4 20 21 3" />
            <path d="M21 16v5h-5" />
            <path d="m15 15 6 6" />
            <path d="M4 4l5 5" />
          </svg>
        </div>
        <span className="font-display text-base">シャッフルランチ</span>
      </div>
      {userName && <span className="text-sm text-muted">{userName}</span>}
    </header>
  );
}

function ApplyScreen({
  config,
  onApply,
}: {
  config: LunchConfig;
  onApply: () => void;
}) {
  const rows: readonly [string, string][] = [
    ["ランチの時間", `本日 ${formatTime(config.lunchStart)}`],
    ["申し込みの締切", `本日 ${formatTime(config.deadline)}`],
    ["1グループの人数", "4人"],
    ["申し込み済み", "8人"],
  ];

  return (
    <>
      <h1 className="mt-2 font-display text-[26px] leading-snug">
        今週のランチに
        <br />
        参加しますか?
      </h1>

      <dl className="flex flex-col divide-y divide-line rounded-[20px] border-2 border-ink bg-white px-5 py-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between py-3.5">
            <dt className="text-[15px] text-muted">{label}</dt>
            <dd className="text-[15px] font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex-1" />

      <button type="button" onClick={onApply} className={primaryButton}>
        参加する
      </button>
    </>
  );
}

function AppliedScreen({
  config,
  onCancel,
  onPreviewResult,
}: {
  config: LunchConfig;
  onCancel: () => void;
  onPreviewResult: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 rounded-[14px] border-2 border-ink bg-brand-soft px-4 py-3.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-full bg-ink">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f2b233"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
        </span>
        <p className="text-base font-bold text-ink">申し込みました</p>
      </div>

      <div className="flex flex-col items-center gap-1.5 rounded-[24px] border-2 border-ink bg-white px-5 py-6">
        <p className="text-sm text-muted">グループ発表まで</p>
        <p className="font-display text-[48px] leading-tight">
          1<span className="mx-1.5 font-sans text-lg font-medium">時間</span>20
          <span className="ml-0.5 font-sans text-lg font-medium">分</span>
        </p>
        <p className="text-sm text-muted">
          {formatTime(config.deadline)} に決定
        </p>
      </div>

      <p className="rounded-full border-2 border-ink bg-white px-5 py-3 text-center text-[15px] font-medium">
        いま <span className="font-bold">9人</span> が参加予定
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          参加を取り消す
        </button>
        <button
          type="button"
          onClick={onPreviewResult}
          className="min-h-11 text-[13px] text-muted underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          (モック)グループ発表の画面を見る
        </button>
      </div>
    </>
  );
}

function ResultScreen({
  me,
  data,
  onCancel,
}: {
  me: Employee;
  data: LunchData;
  onCancel: () => void;
}) {
  // 表示用のサンプル。実際のグループ分けはまだ行わない。
  const members = [
    me,
    ...data.employees.filter((e) => e.id !== me.id).slice(0, 3),
  ];
  const seats = seatPositions(members.length);

  return (
    <>
      <section className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-muted">
          本日 {formatTime(data.config.deadline)} に決定
        </p>
        <h1 className="font-display text-[28px] leading-snug">
          グループが
          <br />
          決まりました
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          {formatTime(data.config.lunchStart)} にランチ。お店はグループで決めましょう。
        </p>
      </section>

      <section aria-label="あなたのグループ" className="flex flex-col gap-1">
        <p className="text-right text-[13px] text-muted">
          Bグループ · {members.length}人
        </p>
        <div className="relative mx-auto aspect-[340/300] w-full">
          <div
            aria-hidden="true"
            className="gingham absolute left-1/2 top-1/2 size-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink"
          />
          <ul>
            {members.map((m, i) => {
              const isMe = m.id === me.id;
              const seat = seats[i];
              const style = {
                left: `${seat.left}%`,
                top: `${seat.top}%`,
                "--i": i,
              } as CSSProperties;
              return (
                <li
                  key={m.id}
                  style={style}
                  className={`seat absolute flex min-h-11 max-w-[112px] flex-col items-center justify-center rounded-2xl border-2 border-ink px-3 py-1.5 text-center ${isMe ? "bg-brand" : "bg-white"}`}
                >
                  <span className="text-[15px] font-bold leading-tight">
                    {m.name}
                  </span>
                  {m.department && (
                    <span className="text-[11px] leading-tight text-muted">
                      {m.department}
                    </span>
                  )}
                  {isMe && <span className="text-[11px] font-bold">あなた</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold">お店の候補</h2>
        <ul className="flex flex-wrap gap-2">
          {data.shops.map((shop) => (
            <li
              key={shop.id}
              className="flex h-9 items-center rounded-full border-[1.5px] border-ink bg-white px-3.5 text-sm"
            >
              {shop.name}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] leading-relaxed text-muted">
          行けないときは、メンバーに連絡を。
        </p>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          参加を取り消す
        </button>
      </div>
    </>
  );
}
