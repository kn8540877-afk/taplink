"use client";

import Link from "next/link";

type AnalyticsSummaryProps = {
  profileViews: number;
  qrScans: number;
  contactClicks: number;
  socialClicks: number;
  period: string;
};

const metrics = [
  { key: "profileViews", label: "Profile Views" },
  { key: "qrScans", label: "QR Scans" },
  { key: "contactClicks", label: "Contact Clicks" },
  { key: "socialClicks", label: "Social Clicks" },
] as const;

const periods = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
] as const;

export default function AnalyticsSummary({
  profileViews,
  qrScans,
  contactClicks,
  socialClicks,
  period,
}: AnalyticsSummaryProps) {
  const values = { profileViews, qrScans, contactClicks, socialClicks };

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm tracking-widest text-[#d6b46a]">PERFORMANCE</p>
          <h2 className="mt-2 text-xl font-semibold">Profile Analytics</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/dashboard?period=${item.value}`}
              aria-current={period === item.value ? "page" : undefined}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                period === item.value
                  ? "border-[#d6b46a] bg-[#d6b46a] font-semibold text-black"
                  : "border-white/15 text-gray-300 hover:border-[#d6b46a] hover:text-[#d6b46a]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-5"
          >
            <p className="text-sm text-gray-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#d6b46a]">
              {values[metric.key].toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
