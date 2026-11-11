export type AdminTopProfile = {
  profile_id: string;
  profile_name: string;
  slug: string;
  profile_type: string;
  total_views: number;
  total_qr_scans: number;
  total_events: number;
};

export default function AdminTopProfiles({
  data,
}: {
  data: AdminTopProfile[];
}) {
  return (
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#101a2b] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-300">
          PROFILE PERFORMANCE
        </p>
        <h3 className="mt-2 text-lg font-bold text-white">
          Top Performing Profiles
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Profiles ranked by views and QR scans.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-500">
          No profile activity available for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-500">
                <th className="px-3 py-3 font-medium">Profile</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 text-right font-medium">Views</th>
                <th className="px-3 py-3 text-right font-medium">QR Scans</th>
                <th className="px-3 py-3 text-right font-medium">Events</th>
              </tr>
            </thead>
            <tbody>
              {data.map((profile, index) => (
                <tr
                  key={profile.profile_id}
                  className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-200">
                          {profile.profile_name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          /{profile.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-xs capitalize text-slate-400">
                    {profile.profile_type}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-blue-300">
                    {profile.total_views.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-violet-300">
                    {profile.total_qr_scans.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-slate-200">
                    {profile.total_events.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
