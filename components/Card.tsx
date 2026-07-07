import type { ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-gray-900 border border-gray-800 p-4 sm:p-6 shadow-lg">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
