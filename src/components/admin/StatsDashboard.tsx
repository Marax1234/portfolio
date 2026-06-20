/**
 * StatsDashboard — Statistik-Karten im Payload-Admin (Sprint 10).
 *
 * Wird über `admin.components.beforeDashboard` in payload.config.ts registriert
 * und erscheint oben im Admin-Dashboard vor den Collection-Karten.
 *
 * Ohne UMAMI_API_URL / UMAMI_ADMIN_USERNAME / UMAMI_ADMIN_PASSWORD / UMAMI_WEBSITE_ID:
 *   → Karten im Leerzustand mit Deployment-Hinweis.
 * Mit allen vier Variablen:
 *   → Live-Daten aus Umami (letzte 30 Tage, 1 h gecacht).
 *
 * RSC — kein `"use client"` nötig, da kein Browser-State.
 * Kein Hardcode (§0.2): Styling über Payload-Admin-CSS-Variablen,
 * keine Projekt-Hex-Werte oder px-Hardcodes in dieser Datei.
 *
 * Versionsstatus: Payload 3.85.1 / Umami 3.1.0 self-hosted (Context7, 2026-06-20).
 */

import { getUmamiDashboardData } from "@/lib/umami";

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "var(--theme-elevation-50)",
        border: "1px solid var(--theme-elevation-100)",
        borderRadius: "0.5rem",
        padding: "1rem 1.25rem",
        flex: "1 1 140px",
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--theme-text-500)",
          marginBottom: "0.375rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--theme-text)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ListCard({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
  emptyLabel: string;
}) {
  return (
    <div
      style={{
        background: "var(--theme-elevation-50)",
        border: "1px solid var(--theme-elevation-100)",
        borderRadius: "0.5rem",
        padding: "1rem 1.25rem",
        flex: "1 1 220px",
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--theme-text-500)",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </p>
      {rows.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--theme-text-500)" }}>
          {emptyLabel}
        </p>
      ) : (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map(({ label, count }) => (
            <li
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.25rem 0",
                fontSize: "0.875rem",
                borderBottom: "1px solid var(--theme-elevation-100)",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--theme-text)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--theme-text-500)",
                  flexShrink: 0,
                }}
              >
                {count.toLocaleString("de-DE")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default async function StatsDashboard() {
  const data = await getUmamiDashboardData();

  return (
    <div
      style={{
        borderBottom: "1px solid var(--theme-elevation-100)",
        paddingBottom: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--theme-text)",
            margin: 0,
          }}
        >
          Statistik
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--theme-text-500)" }}>
          {data.available ? "letzte 30 Tage · Umami" : "Deployment ausstehend"}
        </span>
      </div>

      {!data.available ? (
        /* Leerzustand: Umami-Env fehlt */
        <div
          style={{
            background: "var(--theme-elevation-50)",
            border: "1px solid var(--theme-elevation-100)",
            borderRadius: "0.5rem",
            padding: "1rem 1.25rem",
            fontSize: "0.875rem",
            color: "var(--theme-text-500)",
          }}
        >
          Statistik wird im Deployment scharf geschaltet (Umami).
          <br />
          <span style={{ fontSize: "0.75rem" }}>
            Benötigte Env-Vars:{" "}
            <code>UMAMI_API_URL</code>, <code>UMAMI_ADMIN_USERNAME</code>,{" "}
            <code>UMAMI_ADMIN_PASSWORD</code>, <code>UMAMI_WEBSITE_ID</code>
          </span>
        </div>
      ) : (
        /* Live-Daten */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Metric-Karten */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <MetricCard
              label="Aufrufe (30 T.)"
              value={data.stats.pageviews.toLocaleString("de-DE")}
            />
            <MetricCard
              label="Besucher"
              value={data.stats.visitors.toLocaleString("de-DE")}
            />
            <MetricCard
              label="Sitzungen"
              value={data.stats.visits.toLocaleString("de-DE")}
            />
          </div>

          {/* Listen-Karten */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <ListCard
              title="Top-Quellen"
              rows={data.sources.map((s) => ({ label: s.name, count: s.count }))}
              emptyLabel="Noch keine Daten."
            />
            <ListCard
              title="Top-Seiten"
              rows={data.topPages.map((p) => ({
                label: p.path,
                count: p.views,
              }))}
              emptyLabel="Noch keine Daten."
            />
          </div>
        </div>
      )}
    </div>
  );
}
