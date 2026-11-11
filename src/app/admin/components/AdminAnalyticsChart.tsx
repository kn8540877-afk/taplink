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

export type AdminDailyTrend = {
  trend_date: string;
  total_views: number;
  total_qr_scans: number;
  total_contact_clicks: number;
  total_social_clicks: number;
};

export default function AdminAnalyticsChart({
  data,
}: {
  data: AdminDailyTrend[];
}) {
  const chartData = data.map((item) => ({
    date: item.trend_date,
    profileViews: item.total_views,
    qrScans: item.total_qr_scans,
    contactClicks: item.total_contact_clicks,
    socialClicks: item.total_social_clicks,
  }));

  return (
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#101a2b] p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-300">
          DAILY PERFORMANCE
        </p>
        <h3 className="mt-2 text-lg font-bold text-white">
          Engagement Trends
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Daily activity across all TAPLINK profiles.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No analytics data available for this period.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid stroke="#263449" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#101a2b",
                  border: "1px solid #475569",
                  borderRadius: 10,
                  color: "#ffffff",
                }}
              />
              <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="profileViews"
                name="Profile Views"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="qrScans"
                name="QR Scans"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="contactClicks"
                name="Contact Clicks"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="socialClicks"
                name="Social Clicks"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
