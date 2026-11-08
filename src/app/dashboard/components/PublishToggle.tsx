"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type PublishToggleProps = {
  profileId: string;
  isPublished: boolean;
};

export default function PublishToggle({
  profileId,
  isPublished,
}: PublishToggleProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function togglePublish() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Please sign in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_published: !isPublished })
      .eq("id", profileId)
      .eq("owner_id", user.id);

    if (error) {
      setMessage("Unable to update publishing status.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={togglePublish}
        disabled={loading}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isPublished
            ? "border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            : "bg-[#d6b46a] text-black hover:bg-[#e5c782]"
        }`}
      >
        {loading
          ? "Please wait..."
          : isPublished
            ? "Unpublish Profile"
            : "Publish Profile"}
      </button>

      {message && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
