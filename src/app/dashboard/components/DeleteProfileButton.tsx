"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  profileId: string;
  profileName: string;
};

export default function DeleteProfileButton({ profileId, profileName }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function deleteProfile() {
    if (!window.confirm(`Are you sure you want to delete "${profileName}"? This action cannot be undone.`)) return;

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Please sign in again.");

      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("photo_url")
        .eq("id", profileId)
        .eq("owner_id", user.id)
        .single();

      if (fetchError || !profile) throw new Error("Unable to find this profile.");


      let filePath: string | null = null;

      if (profile.photo_url) {
        const photoUrl = new URL(profile.photo_url);
        const bucketPrefix = "/storage/v1/object/public/profile-photos/";
        const markerIndex = photoUrl.pathname.indexOf(bucketPrefix);

        if (markerIndex !== -1) {
          filePath = decodeURIComponent(
            photoUrl.pathname.slice(markerIndex + bucketPrefix.length)
          );
        }
      }


      if (filePath && filePath.startsWith(`${user.id}/`)) {
        const { data: removeData, error: storageError } = await supabase.storage
          .from("profile-photos")
          .remove([filePath]);


        if (storageError) {
          throw new Error(`Photo deletion failed: ${storageError.message}`);
        }

        const { data: remainingFiles, error: checkError } = await supabase.storage
          .from("profile-photos")
          .list(user.id, { search: filePath.split("/").pop() });


        if (checkError) throw checkError;

        if (remainingFiles?.some((file) => file.name === filePath!.split("/").pop())) {
          throw new Error("Profile photo still exists in Storage after deletion.");
        }
      } else if (profile.photo_url) {
        throw new Error("Photo URL does not match the expected profile-photos Storage path or user folder.");
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId)
        .eq("owner_id", user.id)
        .select("id");

      if (deleteError) throw deleteError;
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error("Profile was not deleted. Please check your permissions.");
      }

      router.refresh();
    } catch (err) {
      console.error("[Delete Profile] Failed:", err);
      setMessage(err instanceof Error ? err.message : "Unable to delete profile.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={deleteProfile}
        disabled={loading}
        className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Profile"}
      </button>
      {message && <p role="alert" className="mt-2 text-xs text-red-400">{message}</p>}
    </div>
  );
}
