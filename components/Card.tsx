import type { ReactNode } from "react";

export function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-gray-900 border border-gray-800 p-4 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
