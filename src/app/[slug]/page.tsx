import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Phone, Mail, MapPin,
  Contact, ShieldCheck, Wifi, ArrowUpRight, Zap, Globe,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, bio, photo_url, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) {
    return { title: "Profile Not Found | TAPLINK" };
  }

  const title = `${profile.name} | TAPLINK`;
  const description =
    profile.bio?.trim() ||
    `Connect with ${profile.name} using TAPLINK Smart Digital Identity.`;

  const url = `https://taplink-psi.vercel.app/${profile.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "TAPLINK",
      images: profile.photo_url
        ? [{ url: profile.photo_url, alt: profile.name }]
        : [],
    },
    twitter: {
      card: profile.photo_url ? "summary_large_image" : "summary",
      title,
      description,
      images: profile.photo_url ? [profile.photo_url] : [],
    },
  };
}
export default async function PublicProfilePage({ params }: Props) {
  await connection();

  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!profile) notFound();

  const { data: socials } = await supabase
    .from("profile_socials")
    .select("id, platform, url")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  const publicUrl = `https://taplink-psi.vercel.app/${profile.slug}`;
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function SocialIcon({ platform }: { platform: string }) {
  const size = 22;

  switch (platform.toLowerCase()) {
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#1877F2" />
          <path d="M13.6 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.6V3.7c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.2H7.5V13h2.8v8h3.3Z" fill="white" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="taplink-instagram-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFDC80" />
              <stop offset=".35" stopColor="#F77737" />
              <stop offset=".65" stopColor="#E1306C" />
              <stop offset="1" stopColor="#833AB4" />
            </linearGradient>
          </defs>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#taplink-instagram-gradient)" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="4.2" stroke="url(#taplink-instagram-gradient)" strokeWidth="2.3" />
          <circle cx="17.8" cy="6.5" r="1.3" fill="#F77737" />
        </svg>
      );
    case "telegram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#229ED9" />
          <path d="m5.2 11.5 12.7-4.9c.6-.2 1.1.2.9 1l-2.2 10.5c-.2.7-.6.9-1.2.5l-3.5-2.6-1.7 1.7c-.2.2-.4.4-.8.4l.3-3.6 6.5-5.9c.3-.3-.1-.4-.5-.2l-8 5-3.4-1.1c-.7-.2-.7-.7.9-1.3Z" fill="white" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 3h3c.2 2 1.3 3.4 3.5 3.8v3.1a8.3 8.3 0 0 1-3.5-1v6.2a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.2a3 3 0 1 0 1.9 2.8V3Z" fill="#25F4EE" transform="translate(-1 1)" />
          <path d="M15.5 3h3c.2 2 1.3 3.4 3.5 3.8v3.1a8.3 8.3 0 0 1-3.5-1v6.2a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.2a3 3 0 1 0 1.9 2.8V3Z" fill="#FE2C55" transform="translate(1 -0.5)" />
          <path d="M15.5 3h3c.2 2 1.3 3.4 3.5 3.8v3.1a8.3 8.3 0 0 1-3.5-1v6.2a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.2a3 3 0 1 0 1.9 2.8V3Z" fill="white" />
        </svg>
      );
    default:
      return <Globe size={size} />;
  }
}

  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    `TITLE:${profile.role || ""}`,
    `TEL;TYPE=CELL:${profile.phone || ""}`,
    `TEL;TYPE=WORK:${profile.alternate_phone || ""}`,
    `EMAIL:${profile.email || ""}`,
    `ADR;TYPE=WORK:;;${profile.location || ""}`,
    `URL:${profile.website || publicUrl}`,
    "END:VCARD",
  ].join("\r\n");

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-[#d6b46a] selection:text-black">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-[0.22em]">
              TAP<span className="text-[#d6b46a]">LINK</span>
            </h1>
            <p className="mt-1 text-[9px] tracking-[0.35em] text-zinc-500">
              SMART DIGITAL IDENTITY
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#d6b46a]/20 bg-[#d6b46a]/5 px-3 py-2">
            <Wifi size={13} className="text-[#d6b46a]" />
            <span className="text-[10px] tracking-wider text-[#d6b46a]">NFC READY</span>
          </div>
        </header>

        <section className="grid items-center gap-12 py-14 md:grid-cols-[1fr_0.85fr] md:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d6b46a]/20 px-4 py-2">
              <Zap size={13} className="text-[#d6b46a]" />
              <span className="text-[10px] tracking-[0.2em] text-[#d6b46a]">
                YOUR DIGITAL IDENTITY
              </span>
            </div>

            <div className="mb-8 flex items-center gap-5">
              {profile.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={profile.name}
                  className="h-24 w-24 shrink-0 rounded-full border border-[#d6b46a]/50 object-cover"
                width={96}
                  height={96}
                  unoptimized
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#d6b46a]/50 bg-gradient-to-br from-[#292319] to-black text-3xl text-[#d6b46a]">
                  {initials || "T"}
                </div>
              )}
              <div>
                <p className="mb-2 text-xs tracking-[0.25em] text-[#d6b46a]">
                  {profile.profile_type === "business" ? "BUSINESS PROFILE" : "PERSONAL PROFILE"}
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.name}
                </h2>
                {profile.role && <p className="mt-2 text-sm text-zinc-500">{profile.role}</p>}
              </div>
            </div>

            {profile.bio && (
              <p className="max-w-md whitespace-pre-line text-sm leading-7 text-zinc-400">
                {profile.bio}
              </p>
            )}

            <div className="mt-8 space-y-4">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                  <Phone className="text-[#d6b46a]" size={19} />
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500">PHONE NUMBER</p>
                    <p className="mt-1 text-sm">{profile.phone}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-500" />
                </a>
              )}

              {profile.alternate_phone && (
                <a href={`tel:${profile.alternate_phone}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                  <Phone className="text-[#d6b46a]" size={19} />
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500">ALTERNATE PHONE</p>
                    <p className="mt-1 text-sm">{profile.alternate_phone}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-500" />
                </a>
              )}

              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                  <Mail className="text-[#d6b46a]" size={19} />
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500">EMAIL ADDRESS</p>
                    <p className="mt-1 break-all text-sm">{profile.email}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-500" />
                </a>
              )}

              {profile.location && (
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <MapPin className="text-[#d6b46a]" size={19} />
                  <div>
                    <p className="text-[10px] text-zinc-500">LOCATION</p>
                    <p className="mt-1 text-sm">{profile.location}</p>
                  </div>
                </div>
              )}

              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                  <Globe className="text-[#d6b46a]" size={19} />
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500">WEBSITE</p>
                    <p className="mt-1 break-all text-sm">{profile.website}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-500" />
                </a>
              )}
            </div>

            {socials && socials.length > 0 && (
              <div className="mt-9">
                <p className="mb-4 text-[10px] tracking-[0.25em] text-zinc-500">
                  CONNECT WITH ME
                </p>
                <div className="flex flex-wrap gap-3">
                  {socials.map((social) => {
                    
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.platform}
                        title={social.platform}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-[#d6b46a]/50 hover:text-[#d6b46a]"
                      >
                        <SocialIcon platform={social.platform} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 rounded-full bg-[#d6b46a] px-6 py-3 text-xs font-bold text-black transition hover:bg-[#ebcd87]">
                  <Phone size={15} />
                  CONTACT ME
                </a>
              )}
              <a
                href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`}
                download={`${profile.name.replace(/\s+/g, "-")}.vcf`}
                className="flex items-center gap-2 rounded-full border border-[#d6b46a]/40 px-6 py-3 text-xs text-[#d6b46a] transition hover:bg-[#d6b46a]/10"
              >
                <Contact size={15} />
                SAVE CONTACT
              </a>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs transition hover:border-[#d6b46a]">
                  <Mail size={15} />
                  SEND EMAIL
                </a>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="relative overflow-hidden rounded-[30px] border border-[#d6b46a]/30 bg-gradient-to-br from-[#1b1915] via-[#111] to-[#090909] p-7 shadow-[0_25px_100px_rgba(214,180,106,0.08)] sm:p-9">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#d6b46a]/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-[0.2em]">
                    TAP<span className="text-[#d6b46a]">LINK</span>
                  </span>
                  <ShieldCheck size={22} className="text-[#d6b46a]" />
                </div>

                <div className="mt-10 text-center">
                  <p className="text-[10px] tracking-[0.3em] text-[#d6b46a]">
                    ONE TAP. EVERYTHING.
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{profile.name}</h3>
                  {profile.role && <p className="mt-2 text-xs text-zinc-500">{profile.role}</p>}
                </div>

                <div className="mx-auto mt-9 flex w-fit flex-col items-center rounded-2xl bg-white p-5">
                  <QRCodeSVG value={publicUrl} size={174} level="H" bgColor="#ffffff" fgColor="#111111" />
                  <p className="mt-3 text-[9px] font-bold tracking-[0.2em] text-black">
                    SCAN TO CONNECT
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-zinc-500">SMART CARD</p>
                    <p className="mt-1 text-xs text-[#d6b46a]">PREMIUM EDITION</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#d6b46a]">
                    <Wifi size={16} />
                    <span className="text-[9px] tracking-widest">NFC</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 break-all text-center text-[10px] leading-6 text-zinc-600">
              {publicUrl}
              <br />
              ONE CARD. ONE IDENTITY. INFINITE CONNECTIONS.
            </p>
          </div>
        </section>

        <footer className="border-t border-white/10 py-7 text-center">
          <p className="text-[10px] tracking-[0.2em] text-zinc-600">
            POWERED BY <span className="text-[#d6b46a]">TAPLINK</span> © 2026
          </p>
        </footer>
      </div>
    </main>
  );
}