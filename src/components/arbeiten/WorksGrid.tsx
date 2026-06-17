"use client";

/**
 * WorksGrid — Filter-Tabs + Grid für /arbeiten (Sprint 5, Konzept §4.2)
 *
 * Die einzelnen Karten (`ProjectCard`, eine async Server-Komponente wegen
 * <Media>) werden server-seitig vorgerendert und als bereits aufgelöste
 * `node`s übergeben — diese Client-Komponente filtert nur per CSS/State,
 * ohne selbst Server-Komponenten zu instanziieren (RSC-Grenze, §0.5).
 *
 * "Alle" zeigt alles; ein Klick wechselt die Kategorie ohne Reload.
 * Max. eine Klicktiefe zur Detailseite bleibt unberührt (ProjectCard-Link).
 *
 * Kein Hardcode (§0.2).
 */
import { useState } from "react";
import type { ReactNode } from "react";

export interface WorksGridItem {
  id: string;
  category: string;
  node: ReactNode;
}

export interface WorksGridCategory {
  value: string;
  label: string;
}

interface WorksGridProps {
  items: WorksGridItem[];
  categories: WorksGridCategory[];
}

const ALL = "alle";

export default function WorksGrid({ items, categories }: WorksGridProps) {
  const [active, setActive] = useState<string>(ALL);
  const visible = active === ALL ? items : items.filter((item) => item.category === active);

  return (
    <div>
      <div role="tablist" aria-label="Nach Kategorie filtern" className="flex flex-wrap gap-3 mb-8">
        {[{ value: ALL, label: "Alle" }, ...categories].map(({ value, label }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(value)}
              className={[
                "type-label-caps rounded-md px-4 py-2 border transition-colors",
                isActive
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-transparent text-on-surface-variant border-outline-variant hover:border-outline",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="type-body-md text-on-surface-variant py-12">
          Noch keine Projekte in dieser Kategorie.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((item) => (
            <div key={item.id}>{item.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
