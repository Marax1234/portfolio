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
 * Sprint 10 — A11y: `role="tablist"` vervollständigt mit Roving-Tabindex +
 * Arrow-Key-Navigation (← → Home End), wie vom ARIA-Tab-Pattern erwartet.
 *
 * Kein Hardcode (§0.2).
 */
import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const allCategories = [{ value: ALL, label: "Alle" }, ...categories];
  const visible = active === ALL ? items : items.filter((item) => item.category === active);

  /**
   * Roving-Tabindex + Arrow-Key-Navigation für das Tablist-Muster (ARIA).
   * Der Tab, der mit der Tastatur fokussiert wird, aktiviert die Kategorie
   * sofort (Selection follows focus — Standard für Tabs ohne Lazy-Loading).
   */
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const len = allCategories.length;
    let next = index;

    if (e.key === "ArrowRight") {
      next = (index + 1) % len;
    } else if (e.key === "ArrowLeft") {
      next = (index - 1 + len) % len;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = len - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActive(allCategories[next].value);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Nach Kategorie filtern" className="flex flex-wrap gap-3 mb-8">
        {allCategories.map(({ value, label }, index) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              ref={(el) => { tabRefs.current[index] = el; }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                "type-label-caps rounded-md px-4 py-2 border transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
