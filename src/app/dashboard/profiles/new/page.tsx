"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

export default function NewProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    profile_type: "personal",
    name: "",
    slug: "",
    role: "",
    bio: "",
    photo_url: "",
    phone: "",
    alternate_phone: "",
    email: "",
    location: "",
    website: "",
    facebook: "",
    instagram: "",
    telegram: "",
    tiktok: "",
  });

  function updateField(field: string, value: string) {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "name" && !current.slug) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      if (field === "slug") {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }

      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        owner_id: user.id,
        profile_type: form.profile_type,
        name: form.name.trim(),
        slug: form.slug,
        role: form.role.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        phone: form.phone.trim() || null,
        alternate_phone: form.alternate_phone.trim() || null,
        email: form.email.trim() || null,
        location: form.location.trim() || null,
        website: form.website.trim() || null,
        is_published: false,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      setLoading(false);
      setError(
        profileError?.code === "23505"
          ? "This username is already taken. Please choose another."
          : profileError?.message || "Unable to create profile."
      );
      return;
    }

    const socialLinks = [
      { platform: "Facebook", url: form.facebook },
      { platform: "Instagram", url: form.instagram },
      { platform: "Telegram", url: form.telegram },
      { platform: "TikTok", url: form.tiktok },
    ]
      .filter((item) => item.url.trim())
      .map((item, index) => ({
        profile_id: profile.id,
        platform: item.platform,
        url: item.url.trim(),
        sort_order: index,
      }));

    if (socialLinks.length > 0) {
      const { error: socialError } = await supabase
        .from("profile_socials")
        .insert(socialLinks);

      if (socialError) {
        await supabase.from("profiles").delete().eq("id", profile.id);
        setLoading(false);
        setError("Profile could not save social links. Please try again.");
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#d6b46a]";

  const labelClass = "mb-2 block text-sm text-gray-300";

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="text-2xl font-bold tracking-[0.2em] text-[#d6b46a]">
            TAPLINK
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#d6b46a]">
            Back to Dashboard
          </Link>
        </header>

        <div className="mb-8">
          <p className="text-sm tracking-widest text-[#d6b46a]">NEW DIGITAL IDENTITY</p>
          <h1 className="mt-3 text-3xl font-semibold">Create Profile</h1>
          <p className="mt-2 text-sm text-gray-400">
            Add your information to create your TAPLINK profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <h2 className="mb-5 text-lg font-semibold">Profile Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {["personal", "business"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("profile_type", type)}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium capitalize transition ${
                    form.profile_type === type
                      ? "border-[#d6b46a] bg-[#d6b46a]/10 text-[#d6b46a]"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <h2 className="mb-5 text-lg font-semibold">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Profile Name *</label>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name or business name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Username / Profile URL *</label>
                <div className="flex items-center rounded-lg border border-white/10 bg-black px-4 focus-within:border-[#d6b46a]">
                  <span className="text-sm text-gray-500">taplink-psi.vercel.app/</span>
                  <input
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[-a-z0-9]+"
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="your-name"
                    className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Use lowercase letters, numbers and hyphens.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  {form.profile_type === "business" ? "Business Type" : "Job Title"}
                </label>
                <input
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  placeholder={form.profile_type === "business" ? "e.g. Design Studio" : "e.g. Designer"}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Bio / Description</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell people about yourself or your business..."
                  className={inputClass}
                />
              </div>

              <div>
  <label className={labelClass}>Profile Photo</label>
  <ProfilePhotoUpload value={form.photo_url} onChange={(url) => updateField("photo_url", url)} />
</div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <h2 className="mb-5 text-lg font-semibold">Contact Information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+95..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Alternate Phone</label>
                <input
                  type="tel"
                  value={form.alternate_phone}
                  onChange={(e) => updateField("alternate_phone", e.target.value)}
                  placeholder="+95..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, Country"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6b46a]/20 bg-[#111111] p-6">
            <h2 className="mb-5 text-lg font-semibold">Social Links</h2>
            <div className="space-y-4">
              {(["facebook", "instagram", "telegram", "tiktok"] as const).map((platform) => (
                <div key={platform}>
                  <label className={labelClass}>{platform}</label>
                  <input
                    type="url"
                    value={form[platform]}
                    onChange={(e) => updateField(platform, e.target.value)}
                    placeholder={`https://${platform}.com/username`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/15 px-6 py-3 text-sm text-gray-300 hover:border-white/30"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#d6b46a] px-7 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c782] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

