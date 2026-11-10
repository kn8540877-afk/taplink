"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProfilePublishControl from "./ProfilePublishControl";

type Profile = {
  profile_id: string;
  owner_email: string | null;
  profile_name: string;
  profile_type: string;
  slug: string;
  is_published: boolean;
  created_at: string;
};

type Props = {
  profiles: Profile[];
};

type Filter = "all" | "published" | "draft";
const PAGE_SIZE = 10;

export default function AdminProfileTable({ profiles }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && profile.is_published) ||
        (filter === "draft" && !profile.is_published);

      const matchesSearch =
        !query ||
        [
          profile.profile_name,
          profile.owner_email ?? "",
          profile.slug,
          profile.profile_type,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [profiles, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProfiles = filteredProfiles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: profiles.length },
    {
      value: "published",
      label: "Published",
      count: profiles.filter((profile) => profile.is_published).length,
    },
    {
      value: "draft",
      label: "Draft",
      count: profiles.filter((profile) => !profile.is_published).length,
    },
  ];

  return (
    <section id="profiles" className="mt-12 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Profile Management</h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage all personal and business profiles across TAPLINK.
          </p>
        </div>
        <span className="rounded-lg border border-white/[0.08] bg-[#101a2b] px-3 py-2 text-xs text-slate-400">
          {profiles.length} Profiles
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#101a2b] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => { setFilter(item.value); setPage(1); }}
              aria-pressed={filter === item.value}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                filter === item.value
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                  : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {item.label}
              <span className="ml-2 opacity-70">{item.count}</span>
            </button>
          ))}
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search profiles</span>
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search name, email, slug or type..."
            className="w-full rounded-lg border border-white/10 bg-[#080d18] px-4 py-2.5 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101a2b]">
        {filteredProfiles.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-300">
              No profiles found
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Try another search term or status filter.
            </p>
            {(search || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setPage(1);
                }}
                className="mt-4 text-xs font-semibold text-blue-300 hover:text-blue-200"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <>
          <div className="space-y-3 p-3 md:hidden">
            {visibleProfiles.map((profile) => (
              <article key={profile.profile_id} className="rounded-xl border border-white/[0.07] bg-[#080d18] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-white">{profile.profile_name}</h3>
                    <p className="mt-1 break-all text-[11px] text-slate-500">{profile.owner_email ?? "Unknown"}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] capitalize text-slate-400">{profile.profile_type}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <ProfilePublishControl profileId={profile.profile_id} isPublished={profile.is_published} />
                  <span className="text-[10px] text-slate-500">
                    {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC", month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="mt-3 border-t border-white/[0.06] pt-3">
                  <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-300 hover:text-blue-200 hover:underline">
                    Open Public Profile ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-white/[0.07] bg-white/[0.025] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Profile</th>
                  <th className="px-5 py-4 font-semibold">Owner</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Public URL</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {visibleProfiles.map((profile) => (
                  <tr
                    key={profile.profile_id}
                    className="transition hover:bg-blue-400/[0.035]"
                  >
                    <td className="px-5 py-5 font-semibold text-white">
                      {profile.profile_name}
                    </td>
                    <td className="px-5 py-5 text-xs text-slate-400">
                      {profile.owner_email ?? "Unknown"}
                    </td>
                    <td className="px-5 py-5 text-xs capitalize text-slate-400">
                      {profile.profile_type}
                    </td>
                    <td className="px-5 py-5">
                      <Link
                        href={`/${profile.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-300 transition hover:text-blue-200 hover:underline"
                      >
                        /{profile.slug}
                      </Link>
                    </td>
                    <td className="px-5 py-5">
                      <ProfilePublishControl
                        profileId={profile.profile_id}
                        isPublished={profile.is_published}
                      />
                    </td>
                    <td className="px-5 py-5 text-xs text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric", timeZone: "UTC",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
          <p className="text-[11px] text-slate-500">
            Showing {filteredProfiles.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProfiles.length)} of {filteredProfiles.length} profiles
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-30">Previous</button>
            <span className="px-2 text-xs text-slate-400">{currentPage} / {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </section>
  );
}
