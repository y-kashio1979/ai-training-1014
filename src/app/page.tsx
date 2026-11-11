import { Suspense } from "react";
import { SessionGate } from "./_components/session-gate";

export default function Home() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-muted" role="status">
          読み込み中…
        </p>
      }
    >
      <SessionGate />
    </Suspense>
  );
}
