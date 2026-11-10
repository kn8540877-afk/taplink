"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AnalyticsChartData = {
  date: string;
  profileViews: number;
  qrScans: number;
  contactClicks: number;
  socialClicks: number;
};

type AnalyticsChartProps = {
  data: AnalyticsChartData[];
};

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <section className="mt-8 rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-sm tracking-widest text-[#d6b46a]">
          ANALYTICS OVERVIEW
        </p>
        <h2 className="mt-2 text-xl font-semibold">Engagement Trends</h2>
        <p className="mt-1 text-sm text-gray-400">
          Daily profile activity and interactions
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-400">
          No analytics data available for this period.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid stroke="#292929" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#444444" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111111",
                  border: "1px solid #d6b46a",
                  borderRadius: 10,
                  color: "#ffffff",
                }}
              />
              <Legend wrapperStyle={{ color: "#d1d5db", fontSize: 12 }} />
              <Line type="monotone" dataKey="profileViews" name="Profile Views" stroke="#d6b46a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="qrScans" name="QR Scans" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="contactClicks" name="Contact Clicks" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="socialClicks" name="Social Clicks" stroke="#c084fc" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
