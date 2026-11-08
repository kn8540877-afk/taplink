"use client";

import { useState } from "react";
import Link from "next/link";

type ProfileActionsProps = {
  slug: string;
};

type NFCReaderLike = {
  write: (message: {
    records: Array<{
      recordType: "url";
      data: string;
    }>;
  }) => Promise<void>;
};

type NFCWindow = Window & {
  NDEFReader?: new () => NFCReaderLike;
};

export default function ProfileActions({ slug }: ProfileActionsProps) {
  const [copied, setCopied] = useState(false);
  const [nfcLoading, setNfcLoading] = useState(false);
  const [nfcMessage, setNfcMessage] = useState("");

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

  async function writeNFCTag() {
    setNfcMessage("");

    if (!window.isSecureContext) {
      setNfcMessage("NFC requires a secure HTTPS connection.");
      return;
    }

    const NFCReader = (window as NFCWindow).NDEFReader;

    if (!NFCReader) {
      setNfcMessage("Web NFC is not supported. Please use Chrome on Android.");
      return;
    }

    setNfcLoading(true);

    try {
      const profileUrl = `${window.location.origin}${profilePath}`;
      const nfc = new NFCReader();

      setNfcMessage("Hold your NFC card near your phone...");

      await nfc.write({
        records: [
          {
            recordType: "url",
            data: profileUrl,
          },
        ],
      });

      setNfcMessage("NFC Tag written successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to write NFC tag.";

      setNfcMessage(message);
    } finally {
      setNfcLoading(false);
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

      <button
        type="button"
        onClick={writeNFCTag}
        disabled={nfcLoading}
        className="rounded-lg border border-[#d6b46a]/40 px-4 py-2 text-sm font-semibold text-[#d6b46a] transition hover:bg-[#d6b46a]/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nfcLoading ? "Writing NFC..." : "Write NFC Tag"}
      </button>

      {nfcMessage && (
        <p
          role="status"
          aria-live="polite"
          className="w-full text-xs text-[#d6b46a]"
        >
          {nfcMessage}
        </p>
      )}
    </div>
  );
}
