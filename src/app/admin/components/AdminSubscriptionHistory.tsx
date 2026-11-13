"use client";

import { useMemo, useState } from "react";

type HistoryRecord = {
  id: string;
  user_id: string | null;
  old_plan_id: string | null;
  new_plan_id: string;
  changed_by: string | null;
  old_status: string | null;
  new_status: string;
  old_expires_at: string | null;
  new_expires_at: string | null;
  created_at: string;
};

type UserAccount = {
  user_id: string;
  email: string | null;
};

type SubscriptionPlan = {
  id: string;
  name: string;
};

type Props = {
  history: HistoryRecord[];
  users: UserAccount[];
  subscriptionPlans: SubscriptionPlan[];
};

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSubscriptionHistory({
  history,
  users,
  subscriptionPlans,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const userEmails = useMemo(
    () => new Map(users.map((user) => [user.user_id, user.email ?? "No email"])),
    [users]
  );

  const planNames = useMemo(
    () => new Map(subscriptionPlans.map((plan) => [plan.id, plan.name])),
    [subscriptionPlans]
  );

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((record) => {
      if (!query) return true;

      const searchable = [
        record.user_id ? userEmails.get(record.user_id) : "Deleted account",
        record.changed_by ? userEmails.get(record.changed_by) : "Unknown admin",
        record.old_plan_id ? planNames.get(record.old_plan_id) : "No previous plan",
        planNames.get(record.new_plan_id),
        record.old_status,
        record.new_status,
      ];

      return searchable.some((value) => value?.toLowerCase().includes(query));
    });
  }, [history, search, userEmails, planNames]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function getUserEmail(userId: string | null) {
    return userId ? userEmails.get(userId) ?? "Unknown user" : "Deleted account";
  }

  function getPlanName(planId: string | null) {
    return planId ? planNames.get(planId) ?? "Unknown plan" : "—";
  }

  function renderPlanChange(record: HistoryRecord) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">{getPlanName(record.old_plan_id)}</span>
        <span className="text-blue-400">→</span>
        <span className="text-xs font-semibold text-blue-300">
          {getPlanName(record.new_plan_id)}
        </span>
      </div>
    );
  }

  function renderStatusChange(record: HistoryRecord) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <span className="text-slate-500">{record.old_status ?? "New"}</span>
        <span className="text-slate-600">→</span>
        <span className="font-semibold text-emerald-300">{record.new_status}</span>
      </div>
    );
  }

  return (
    <section id="subscription-history" className="mt-12 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Subscription History</h2>
          <p className="mt-1 text-xs text-slate-500">
            Audit trail of administrator-managed subscription plan changes.
          </p>
        </div>
        <span className="rounded-lg border border-white/[0.08] bg-[#101a2b] px-3 py-2 text-xs text-slate-400">
          {history.length} Records
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-white/[0.07] bg-[#101a2b] p-4">
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">Search subscription history</span>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search user, admin, plan or status..."
            className="w-full rounded-lg border border-white/10 bg-[#080d18] px-4 py-2.5 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101a2b]">
        {visibleHistory.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-300">
              {search ? "No matching history found" : "No subscription history yet"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {search
                ? "Try another search term."
                : "Administrator-managed plan changes will appear here."}
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
              {visibleHistory.map((record) => (
                <article
                  key={record.id}
                  className="rounded-xl border border-white/[0.07] bg-[#080d18] p-4"
                >
                  <p className="break-all text-sm font-semibold text-slate-100">
                    {getUserEmail(record.user_id)}
                  </p>
                  <div className="mt-3 border-t border-white/[0.06] pt-3">
                    <p className="mb-2 text-[10px] text-slate-500">Plan Change</p>
                    {renderPlanChange(record)}
                    <div className="mt-3">
                      <p className="mb-2 text-[10px] text-slate-500">Status</p>
                      {renderStatusChange(record)}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 text-[10px]">
                    <p className="break-all text-slate-400">
                      Changed by: {getUserEmail(record.changed_by)}
                    </p>
                    <p className="text-slate-500">{formatDate(record.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/[0.07] bg-white/[0.025] text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Plan Change</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Changed By</th>
                    <th className="px-5 py-4 font-semibold">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleHistory.map((record) => (
                    <tr key={record.id} className="transition hover:bg-blue-400/[0.035]">
                      <td className="px-5 py-5">
                        <p className="break-all text-xs font-medium text-slate-100">
                          {getUserEmail(record.user_id)}
                        </p>
                      </td>
                      <td className="px-5 py-5">{renderPlanChange(record)}</td>
                      <td className="px-5 py-5">{renderStatusChange(record)}</td>
                      <td className="px-5 py-5">
                        <p className="break-all text-xs text-slate-400">
                          {getUserEmail(record.changed_by)}
                        </p>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(record.created_at)}
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
            Showing {filteredHistory.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filteredHistory.length)} of{" "}
            {filteredHistory.length} records
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
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
