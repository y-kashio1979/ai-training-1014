export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-8 py-32 text-center">
        <p className="text-sm font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
          SELF INTRODUCTION
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
          柏尾 幸裕
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          はじめまして、柏尾幸裕です。
          <br />
          私のページをご覧いただきありがとうございます。
        </p>
      </main>
    </div>
  );
}
