"use client";

import Link from "next/link";

type AdminAnalyticsSummaryProps = {
  data: {
    total_views: number;
    total_qr_scans: number;
    total_contact_clicks: number;
    total_social_clicks: number;
    total_events: number;
  } | null;
  period: string;
};

const metrics = [
  { key: "total_views", label: "Profile Views", icon: "PV", color: "text-blue-400", glow: "bg-blue-500/10" },
  { key: "total_qr_scans", label: "QR Scans", icon: "QR", color: "text-violet-400", glow: "bg-violet-500/10" },
  { key: "total_contact_clicks", label: "Contact Clicks", icon: "CC", color: "text-emerald-400", glow: "bg-emerald-500/10" },
  { key: "total_social_clicks", label: "Social Clicks", icon: "SC", color: "text-amber-400", glow: "bg-amber-500/10" },
  { key: "total_events", label: "Total Events", icon: "EV", color: "text-cyan-400", glow: "bg-cyan-500/10" },
] as const;

const periods = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
] as const;

export default function AdminAnalyticsSummary({
  data,
  period,
}: AdminAnalyticsSummaryProps) {
  return (
    <section id="analytics" className="mt-12 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-blue-300">
            PLATFORM PERFORMANCE
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">
            Platform Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Engagement activity across all TAPLINK profiles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/admin?period=${item.value}#analytics`}
              aria-current={period === item.value ? "page" : undefined}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                period === item.value
                  ? "border-blue-400 bg-blue-500/15 text-blue-300"
                  : "border-white/10 text-slate-400 hover:border-blue-400/40 hover:text-blue-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {!data ? (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          Unable to load platform analytics. Please try again.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="rounded-2xl border border-white/[0.07] bg-[#101a2b] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-slate-400">
                  {metric.label}
                </p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black ${metric.glow} ${metric.color}`}>
                  {metric.icon}
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                {data[metric.key].toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
