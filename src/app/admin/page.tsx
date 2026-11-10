import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import AdminSidebar from "./components/AdminSidebar";
import AdminProfileTable from "./components/AdminProfileTable";
import AdminUserTable from "./components/AdminUserTable";
import AdminAnalyticsSummary from "./components/AdminAnalyticsSummary";

export const instant = false;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await connection();

  const params = await searchParams;
  const period = ["7d", "30d", "90d"].includes(params.period ?? "")
    ? params.period!
    : "30d";

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - Number.parseInt(period, 10));

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_taplink_admin"
  );

  if (adminError || isAdmin !== true) redirect("/dashboard");

  const [
    { data: overview, error: overviewError },
    { data: users, error: usersError },
    { data: profiles, error: profilesError },
    { data: analytics, error: analyticsError },
  ] = await Promise.all([
    supabase.rpc("taplink_admin_overview"),
    supabase.rpc("taplink_admin_users"),
    supabase.rpc("taplink_admin_profiles"),
    supabase.rpc("taplink_admin_analytics", { p_start_date: startDate.toISOString(), p_end_date: endDate.toISOString() }),
  ]);

  const stats = overview?.[0];

  const publishedPercent = stats?.total_profiles
    ? Math.round((stats.published_profiles / stats.total_profiles) * 100)
    : 0;

  const draftPercent = stats?.total_profiles
    ? Math.round((stats.draft_profiles / stats.total_profiles) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total_users,
      description: "Registered accounts",
      icon: "US",
      color: "text-blue-400",
      glow: "bg-blue-500/10",
    },
    {
      label: "Total Profiles",
      value: stats?.total_profiles,
      description: "All created profiles",
      icon: "PF",
      color: "text-violet-400",
      glow: "bg-violet-500/10",
    },
    {
      label: "Published Profiles",
      value: stats?.published_profiles,
      description: "Publicly available",
      icon: "PB",
      color: "text-emerald-400",
      glow: "bg-emerald-500/10",
    },
    {
      label: "Draft Profiles",
      value: stats?.draft_profiles,
      description: "Not yet published",
      icon: "DR",
      color: "text-amber-400",
      glow: "bg-amber-500/10",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen flex-col">
        <AdminSidebar />

        <div className="min-w-0 flex-1 lg:ml-72">
          <header className="sticky top-0 z-10 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-[#080d18]/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
            <div>
              <p className="text-xs font-medium text-slate-500">
                TAPLINK / Administration
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Platform Control Center
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-400/40 hover:text-blue-300"
              >
                User Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <section className="mb-9">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-bold tracking-[0.16em] text-blue-300">
                      ADMINISTRATOR ACCESS
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Dashboard Overview
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Monitor and manage your TAPLINK platform.
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-[#101a2b] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Signed in as
                  </p>
                  <p className="mt-1 max-w-[260px] break-all text-xs font-medium text-slate-200">
                    {user.email}
                  </p>
                </div>
              </div>
            </section>

            <section id="overview" className="scroll-mt-28">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">
                  Platform Overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Live statistics from your TAPLINK database.
                </p>
              </div>

              {overviewError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300"
                >
                  Unable to load platform statistics. Please try again.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <article
                      key={card.label}
                      className="group rounded-2xl border border-white/[0.07] bg-[#101a2b] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-400/25 hover:bg-[#121e32]"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium text-slate-400">
                          {card.label}
                        </p>
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black ${card.glow} ${card.color}`}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <p className="mt-5 text-4xl font-bold tracking-tight text-white">
                        {card.value ?? 0}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-500">
                        {card.description}
                      </p>
                      {(card.label === "Published Profiles" ||
                        card.label === "Draft Profiles") && (
                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Profile distribution</span>
                            <span className={card.color}>
                              {card.label === "Published Profiles"
                                ? publishedPercent
                                : draftPercent}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                            role="progressbar"
                            aria-label={card.label === "Published Profiles" ? "Published profiles percentage" : "Draft profiles percentage"}
                            aria-valuenow={
                              card.label === "Published Profiles"
                                ? publishedPercent
                                : draftPercent
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                card.label === "Published Profiles"
                                  ? "bg-emerald-400"
                                  : "bg-amber-400"
                              }`}
                              style={{
                                width: `${
                                  card.label === "Published Profiles"
                                    ? publishedPercent
                                    : draftPercent
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <AdminAnalyticsSummary data={analyticsError ? null : analytics?.[0] ?? null} period={period} />

            {usersError ? (
              <section id="users" className="mt-12 scroll-mt-28">
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
                  Unable to load user accounts. Please try again.
                </p>
              </section>
            ) : (
              <AdminUserTable users={users ?? []} currentUserId={user.id} />
            )}

            {profilesError ? (
              <section id="profiles" className="mt-12 scroll-mt-28">
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
                  Unable to load profiles. Please try again.
                </p>
              </section>
            ) : (
              <AdminProfileTable profiles={profiles ?? []} />
            )}

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] py-6 text-[11px] text-slate-500">
              <p>TAPLINK Admin Console</p>
              <p>Administrator access verified</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

