"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  profileId: string;
  isPublished: boolean;
};

export default function ProfilePublishControl({
  profileId,
  isPublished,
}: Props) {
  const router = useRouter();
  const [statusOverride, setStatusOverride] = useState<{
    base: boolean;
    value: boolean;
  } | null>(null);
  const published =
    statusOverride?.base === isPublished
      ? statusOverride.value
      : isPublished;
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();


  function handleToggle() {
    const nextStatus = !published;

    if (!window.confirm(
      `Are you sure you want to ${nextStatus ? "publish" : "unpublish"} this profile?`
    )) {
      return;
    }

    startTransition(async () => {
      setMessage("");

      try {
        const response = await fetch("/admin/profiles/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            publishStatus: nextStatus,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          setMessage(result?.error || "Unable to update profile status.");
          return;
        }

        setStatusOverride({ base: isPublished, value: nextStatus });
        setMessage("Status updated successfully.");
        router.refresh();
      } catch {
        setMessage("Network error. Please check your connection and try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs ${
          published
            ? "bg-green-500/10 text-green-400"
            : "bg-yellow-500/10 text-yellow-400"
        }`}
      >
        {published ? "Published" : "Draft"}
      </span>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="rounded-lg border border-[#d6b46a]/30 px-3 py-1.5 text-xs text-[#d6b46a] transition hover:bg-[#d6b46a]/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Updating..."
          : published
            ? "Unpublish"
            : "Publish"}
      </button>

      {message && (
        <p
          role="status"
          className={`text-xs ${
            message.includes("successfully")
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
