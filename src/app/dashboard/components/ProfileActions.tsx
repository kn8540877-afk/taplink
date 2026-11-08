"use client";

import { useState } from "react";
import Link from "next/link";

type ProfileActionsProps = {
  slug: string;
};

export default function ProfileActions({ slug }: ProfileActionsProps) {
  const [copied, setCopied] = useState(false);
  const profilePath = `/${slug}`;

  async function copyProfileLink() {
    try {
      const profileUrl = `${window.location.origin}${profilePath}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link
        href={profilePath}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[#d6b46a] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e5c782]"
      >
        View Profile
      </Link>

      <button
        type="button"
        onClick={copyProfileLink}
        className="rounded-lg border border-[#d6b46a]/40 px-4 py-2 text-sm font-semibold text-[#d6b46a] transition hover:bg-[#d6b46a]/10"
      >
        {copied ? "Link Copied!" : "Copy Profile Link"}
      </button>
    </div>
  );
}
