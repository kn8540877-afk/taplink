"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type UserAccount = {
  user_id: string;
  email: string | null;
  created_at: string;
  profile_count: number;
};

type UserProfile = {
  profile_id: string;
  profile_name: string;
  profile_type: string;
  slug: string;
  is_published: boolean;
  created_at: string;
};

type Props = {
  users: UserAccount[];
  currentUserId: string;
};

const PAGE_SIZE = 10;

export default function AdminUserTable({
  users,
  currentUserId,
}: Props) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const requestIdRef = useRef(0);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter(
      (account) =>
        !query ||
        (account.email ?? "").toLowerCase().includes(query) ||
        account.user_id.toLowerCase().includes(query)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleViewProfiles(account: UserAccount) {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const requestId = ++requestIdRef.current;
    setSelectedUser(account);
    setUserProfiles([]);
    setProfilesError("");
    setProfilesLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "taplink_admin_user_profiles",
        { target_user_id: account.user_id }
      );

      if (requestId !== requestIdRef.current) return;

      if (error) {
        setProfilesError("Unable to load this user's profiles. Please try again.");
      } else {
        setUserProfiles(data ?? []);
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setProfilesError("Network error. Please check your connection and try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        setProfilesLoading(false);
      }
    }
  }

  function closeProfiles() {

    requestIdRef.current += 1;
    setSelectedUser(null);
    setUserProfiles([]);
    setProfilesError("");
  }

  useEffect(() => {
    if (!selectedUser) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    function getFocusableElements() {
      return Array.from(
        dialog!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);
    }

    (getFocusableElements()[0] ?? dialog).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestIdRef.current += 1;
        setSelectedUser(null);
        setUserProfiles([]);
        setProfilesError("");
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        dialog!.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [selectedUser]);
  return (
    <>
      <section id="users" className="mt-12 scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">User Management</h2>
            <p className="mt-1 text-xs text-slate-500">
              Registered accounts and their profile activity.
            </p>
          </div>
          <span className="rounded-lg border border-white/[0.08] bg-[#101a2b] px-3 py-2 text-xs text-slate-400">
            {users.length} Accounts
          </span>
        </div>

        <div className="mb-4 rounded-2xl border border-white/[0.07] bg-[#101a2b] p-4">
          <label className="block w-full sm:max-w-sm">
            <span className="sr-only">Search users</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search email or user ID..."
              className="w-full rounded-lg border border-white/10 bg-[#080d18] px-4 py-2.5 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101a2b]">
          {visibleUsers.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-semibold text-slate-300">
                No users found
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Try another email or user ID.
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="mt-4 text-xs font-semibold text-blue-300 hover:text-blue-200"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="space-y-3 p-3 md:hidden">
              {visibleUsers.map((account) => (
                <article key={account.user_id} className="rounded-xl border border-white/[0.07] bg-[#080d18] p-4">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-slate-100">{account.email ?? "No email"}</p>
                    {account.user_id === currentUserId && (
                      <span className="mt-2 inline-block rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-semibold text-blue-300">
                        Current Admin
                      </span>
                    )}
                    <p className="mt-3 break-all font-mono text-[10px] text-slate-500">{account.user_id}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
                    <div>
                      <p className="text-[10px] text-slate-500">Profiles</p>
                      <p className="mt-1 text-lg font-bold text-blue-300">{account.profile_count}</p>
                    </div>
                    <button type="button" onClick={() => handleViewProfiles(account)} className="rounded-lg border border-blue-400/20 bg-blue-400/[0.07] px-3 py-2 text-[11px] font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-400/15">
                      View Profiles
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-500">
                    Joined: {new Date(account.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-white/[0.07] bg-white/[0.025] text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">User ID</th>
                    <th className="px-5 py-4 font-semibold">Joined</th>
                    <th className="px-5 py-4 text-right font-semibold">Profiles</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleUsers.map((account) => (
                    <tr
                      key={account.user_id}
                      className="transition hover:bg-blue-400/[0.035]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-medium text-slate-100">
                          {account.email ?? "No email"}
                        </p>
                        {account.user_id === currentUserId && (
                          <span className="mt-1 inline-block rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-semibold text-blue-300">
                            Current Admin
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-5 font-mono text-[11px] text-slate-500">
                        {account.user_id}
                      </td>
                      <td className="px-5 py-5 text-xs text-slate-400">
                        {new Date(account.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </td>
                      <td className="px-5 py-5 text-right font-bold text-blue-300">
                        {account.profile_count}
                      </td>
                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewProfiles(account)}
                          className="rounded-lg border border-blue-400/20 bg-blue-400/[0.07] px-3 py-2 text-[11px] font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-400/15"
                        >
                          View Profiles
                        </button>
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
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-2 text-xs text-slate-400">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProfiles();
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-profiles-title"
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#101a2b] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  User Profile Details
                </p>
                <h2
                  id="user-profiles-title"
                  className="mt-2 break-all text-lg font-bold text-white"
                >
                  {selectedUser.email ?? "No email"}
                </h2>
                <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                  {selectedUser.user_id}
                </p>
              </div>
              <button
                type="button"
                onClick={closeProfiles}
                aria-label="Close profile details"
                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">
              {profilesLoading ? (
                <p role="status" aria-live="polite" className="py-12 text-center text-sm text-slate-400">
                  Loading profiles...
                </p>
              ) : profilesError ? (
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {profilesError}
                </p>
              ) : userProfiles.length === 0 ? (
                <p role="status" aria-live="polite" className="py-12 text-center text-sm text-slate-400">
                  This user has not created any profiles yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {userProfiles.map((profile) => (
                    <article
                      key={profile.profile_id}
                      className="rounded-xl border border-white/[0.07] bg-[#080d18] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-white">
                            {profile.profile_name}
                          </h3>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            /{profile.slug}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                              profile.is_published
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {profile.is_published ? "Published" : "Draft"}
                          </span>
                          {profile.is_published && (
                            <a
                              href={`/${encodeURIComponent(profile.slug)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md border border-blue-400/20 bg-blue-400/[0.07] px-2.5 py-1.5 text-[10px] font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-400/15"
                            >
                              Open Public Profile ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="capitalize">
                          Type: {profile.profile_type}
                        </span>
                        <span>
                          Created:{" "}
                          {new Date(profile.created_at).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
