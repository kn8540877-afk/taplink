"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePhotoUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image size must not exceed 2 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again before uploading.");
      }

      const extension = file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : "webp";

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d6b46a]/40 bg-black">
          {value ? (
            <Image
              src={value}
              alt="Profile preview"
              className="h-full w-full object-cover"
            width={96}
                  height={96}
                  unoptimized
                />
          ) : (
            <span className="text-xs text-gray-500">No Photo</span>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-[#d6b46a]/50 px-4 py-2 text-sm text-[#d6b46a] transition hover:bg-[#d6b46a]/10 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : value ? "Change Photo" : "Choose Photo"}
          </button>
          <p className="text-xs text-gray-500">
            JPEG, PNG or WebP · Maximum 2 MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
