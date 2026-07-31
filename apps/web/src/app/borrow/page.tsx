import { Suspense } from "react";
import { BorrowClient } from "@/components/BorrowClient";

export default function BorrowPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl text-sm text-auron-mist">Loading borrow flow…</div>
      }
    >
      <BorrowClient />
    </Suspense>
  );
}
