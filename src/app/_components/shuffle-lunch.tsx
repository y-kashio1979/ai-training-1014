"use client";

import { useState } from "react";
import { filterEmployees, type Employee } from "@/lib/employees";


// 表示している名前・時刻・お店はすべてサンプル。ログインは後から追加する想定。
const EMPLOYEES: readonly Employee[] = [
  { id: "aoki", name: "青木 さくら", department: "営業部" },
  { id: "ito", name: "伊藤 健太", department: "開発部" },
  { id: "tanaka", name: "田中 陽介", department: "総務部" },
  { id: "nakamura", name: "中村 あや", department: "経理部" },
  { id: "yamaguchi", name: "山口 拓也", department: "開発部" },
];

const SHOPS = ["洋食 みどり亭", "定食 はなまる", "カフェ ソラ"] as const;

type Step = "select" | "apply" | "applied" | "result";

const primaryButton =
  "flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-line disabled:text-muted";
const secondaryButton =
  "flex h-14 w-full items-center justify-center rounded-2xl border-[1.5px] border-[#aeb9b2] bg-white text-base font-bold text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function ShuffleLunch() {
  const [step, setStep] = useState<Step>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const me = EMPLOYEES.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-6 px-6 pb-8 pt-7">
      <Header userName={step === "select" ? null : me?.name ?? null} />

      {step === "select" && (
        <SelectScreen
          query={query}
          onQueryChange={setQuery}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNext={() => setStep("apply")}
        />
      )}
      {step === "apply" && <ApplyScreen onApply={() => setStep("applied")} />}
      {step === "applied" && (
        <AppliedScreen
          onCancel={() => setStep("apply")}
          onPreviewResult={() => setStep("result")}
        />
      )}
      {step === "result" && me && (
        <ResultScreen me={me} onCancel={() => setStep("apply")} />
      )}
    </div>
  );
}

function Header({ userName }: { userName: string | null }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-brand">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
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
        <span className="text-base font-bold">シャッフルランチ</span>
      </div>
      {userName && <span className="text-sm text-muted">{userName}</span>}
    </header>
  );
}

function SelectScreen({
  query,
  onQueryChange,
  selectedId,
  onSelect,
  onNext,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const list = filterEmployees(EMPLOYEES, query);

  return (
    <>
      <h1 className="mt-2 text-[26px] font-bold leading-snug">
        あなたの名前を
        <br />
        選んでください
      </h1>

      <label className="flex h-12 items-center gap-2.5 rounded-xl border border-[#cbd3cd] bg-white px-3.5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#55605a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="名前で絞り込む"
          aria-label="名前で絞り込む"
          className="min-w-0 flex-1 bg-transparent text-base outline-none"
        />
      </label>

      <ul className="flex flex-col gap-2">
        {list.map((e) => {
          const selected = e.id === selectedId;
          return (
            <li key={e.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(e.id)}
                className={`flex h-14 w-full items-center gap-3 rounded-[14px] px-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  selected
                    ? "border-2 border-brand bg-brand-soft"
                    : "border border-line bg-white hover:bg-canvas"
                }`}
              >
                <span
                  className={`flex-1 text-base ${selected ? "font-bold" : "font-medium"}`}
                >
                  {e.name}
                  <span
                    className={`ml-1.5 text-[13px] font-normal ${selected ? "text-brand-dark" : "text-muted"}`}
                  >
                    {e.department}
                  </span>
                </span>
                {selected ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  </span>
                ) : (
                  <span className="size-5 rounded-full border-2 border-[#aeb9b2]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex-1" />

      <button
        type="button"
        disabled={!selectedId}
        onClick={onNext}
        className={primaryButton}
      >
        この名前で進む
      </button>
    </>
  );
}

function ApplyScreen({ onApply }: { onApply: () => void }) {
  const rows: readonly [string, string][] = [
    ["ランチの時間", "本日 12:00"],
    ["申し込みの締切", "本日 9:30"],
    ["1グループの人数", "4人"],
    ["申し込み済み", "8人"],
  ];

  return (
    <>
      <h1 className="mt-2 text-[22px] font-bold leading-snug text-[#3c4640]">
        今週のランチに
        <br />
        参加しますか?
      </h1>

      <dl className="flex flex-col gap-3.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between">
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
  onCancel,
  onPreviewResult,
}: {
  onCancel: () => void;
  onPreviewResult: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 rounded-[14px] bg-brand-soft px-4 py-3.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-full bg-brand">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
        </span>
        <p className="text-base font-bold text-brand-dark">申し込みました</p>
      </div>

      <div className="flex flex-col items-center gap-1.5 rounded-[18px] border border-line bg-white px-5 py-6">
        <p className="text-sm text-muted">グループ発表まで</p>
        <p className="text-[44px] font-bold leading-tight">
          1<span className="mx-1.5 text-lg font-medium">時間</span>20
          <span className="ml-0.5 text-lg font-medium">分</span>
        </p>
        <p className="text-sm text-muted">9:30 に決定</p>
      </div>

      <p className="rounded-[18px] border border-line bg-white px-5 py-4 text-[15px] font-medium">
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
          className="min-h-11 text-[13px] text-muted underline"
        >
          (モック)グループ発表の画面を見る
        </button>
      </div>
    </>
  );
}

function ResultScreen({ me, onCancel }: { me: Employee; onCancel: () => void }) {
  const members = [me, ...EMPLOYEES.filter((e) => e.id !== me.id).slice(0, 3)];

  return (
    <>
      <section className="flex flex-col gap-1.5 rounded-[18px] bg-brand px-5 py-[18px] text-white">
        <p className="text-[13px] font-medium opacity-95">お知らせ · 本日 9:30</p>
        <p className="text-[22px] font-bold leading-snug">
          グループが決まりました
        </p>
        <p className="text-sm leading-relaxed">
          12:00 にランチ。お店はグループで決めましょう。
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-[18px] border border-line bg-white px-5 py-[18px]">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-bold">あなたのグループ</h1>
          <span className="text-[13px] text-muted">Bグループ · {members.length}人</span>
        </div>
        <ul className="flex flex-col gap-1">
          {members.map((m) => {
            const isMe = m.id === me.id;
            return (
              <li
                key={m.id}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-2.5 ${isMe ? "bg-brand-soft" : ""}`}
              >
                <span
                  className={`flex-1 text-[15px] ${isMe ? "font-bold" : "font-medium"}`}
                >
                  {m.name}
                  <span
                    className={`ml-1.5 text-[13px] font-normal ${isMe ? "text-brand-dark" : "text-muted"}`}
                  >
                    {m.department}
                  </span>
                </span>
                {isMe && (
                  <span className="text-xs font-bold text-brand-dark">あなた</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold">お店の候補</h2>
        <ul className="flex flex-wrap gap-2">
          {SHOPS.map((shop) => (
            <li
              key={shop}
              className="flex h-9 items-center rounded-full border border-[#cbd3cd] bg-white px-3.5 text-sm"
            >
              {shop}
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
