import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import PublishToggle from "./components/PublishToggle";
import ProfileActions from "./components/ProfileActions";
import DeleteProfileButton from "./components/DeleteProfileButton";
import AnalyticsSummary from "./components/AnalyticsSummary";
import AnalyticsChart from "./components/AnalyticsChart";

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await connection();
  const params = await searchParams;
  const period = ["today", "7d", "30d"].includes(params.period ?? "") ? params.period! : "30d";
  const now = new Date();
  const startDate = new Date(now);
  if (period === "today") startDate.setHours(0, 0, 0, 0);
  else startDate.setDate(startDate.getDate() - (period === "7d" ? 7 : 30));
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_taplink_admin");

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, slug, profile_type, is_published")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: analytics, error: analyticsError } = (profiles?.length ?? 0) > 0
    ? await supabase
        .from("profile_analytics")
        .select("event_type, created_at")
        .gte("created_at", startDate.toISOString())
        .in("profile_id", (profiles ?? []).map((profile) => profile.id))
    : { data: [], error: null };
  const chartMap = new Map<string, { date: string; profileViews: number; qrScans: number; contactClicks: number; socialClicks: number }>();
  for (const event of analytics ?? []) {
    const date = new Date(event.created_at).toLocaleDateString("en-CA");
    const row = chartMap.get(date) ?? { date, profileViews: 0, qrScans: 0, contactClicks: 0, socialClicks: 0 };
    if (event.event_type === "profile_view") row.profileViews++;
    if (event.event_type === "qr_scan") row.qrScans++;
    if (event.event_type === "contact_click") row.contactClicks++;
    if (event.event_type === "social_click") row.socialClicks++;
    chartMap.set(date, row);
  }
  const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const eventCounts = (analytics ?? []).reduce(
    (counts, event) => {
      counts[event.event_type] = (counts[event.event_type] ?? 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );
  const totalProfiles = profiles?.length ?? 0;
  const publishedProfiles =
    profiles?.filter((profile) => profile.is_published).length ?? 0;

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[0.2em] text-[#d6b46a]"
          >
            TAPLINK
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin === true && (
              <Link
                href="/admin"
                className="rounded-lg border border-[#d6b46a]/50 px-4 py-2 text-sm font-medium text-[#d6b46a] transition hover:bg-[#d6b46a] hover:text-black"
              >
                Admin Dashboard
              </Link>
            )}
            <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:border-[#d6b46a] hover:text-[#d6b46a]"
            >
              Sign Out
            </button>
            </form>
          </div>
        </header>

        <section className="py-10">
          <p className="text-sm tracking-widest text-[#d6b46a]">
            CONTROL CENTER
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 break-all text-sm text-gray-400">
            Signed in as {user.email}
          </p>
        </section>

        {analyticsError ? (
          <p role="alert" className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">Unable to load analytics. Please try again.</p>
        ) : (
        <AnalyticsSummary
          profileViews={eventCounts.profile_view ?? 0}
          qrScans={eventCounts.qr_scan ?? 0}
          contactClicks={eventCounts.contact_click ?? 0}
          socialClicks={eventCounts.social_click ?? 0}
          period={period}
        />
        )}

        {!analyticsError && <AnalyticsChart data={chartData} />}

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <p className="text-sm text-gray-400">Total Profiles</p>
            <p className="mt-3 text-4xl font-semibold text-[#d6b46a]">
              {totalProfiles}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <p className="text-sm text-gray-400">Published Profiles</p>
            <p className="mt-3 text-4xl font-semibold text-[#d6b46a]">
              {publishedProfiles}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">My Profiles</h2>
            <Link
              href="/dashboard/profiles/new"
              className="rounded-lg bg-[#d6b46a] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c782]"
            >
              + Create Profile
            </Link>
          </div>

          {profilesError ? (
            <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
              Unable to load profiles. Please try again.
            </p>
          ) : totalProfiles === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#111111] px-6 py-12 text-center">
              <h3 className="text-lg font-medium">No profiles yet</h3>
              <p className="mt-2 text-sm text-gray-400">
                Create your first digital identity to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {profiles?.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-xl border border-white/10 bg-[#111111] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{profile.name}</h3>
                      <p className="mt-1 text-xs capitalize text-gray-400">
                        {profile.profile_type}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        profile.is_published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {profile.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-4 break-all text-sm text-gray-400">
                    /{profile.slug}
                  </p>
                  <PublishToggle
                    profileId={profile.id}
                    isPublished={profile.is_published}
                  />
                  <ProfileActions slug={profile.slug} />
                  <Link
                    href={`/dashboard/profiles/${profile.id}/edit`}
                    className="mt-5 inline-block text-sm text-[#d6b46a] hover:underline"
                  >
                    Manage Profile →
                  </Link>
                  <DeleteProfileButton
                    profileId={profile.id}
                    profileName={profile.name}
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}













