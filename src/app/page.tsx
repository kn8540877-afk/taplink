import { QRCodeSVG } from "qrcode.react";
import { profile, socials } from "@/data/profile";
import {
  Camera,
  Users,
  Send,
  Music2,
  Phone,
  Mail,
  MapPin,
  Contact,

  ShieldCheck,
  Wifi,
  ArrowUpRight,
  Zap,
} from "lucide-react";


export default function Home() {
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
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#d6b46a]/50 bg-gradient-to-br from-[#292319] to-black text-3xl text-[#d6b46a]">
                Y
              </div>
              <div>
                <p className="mb-2 text-xs tracking-[0.25em] text-[#d6b46a]">
                  PERSONAL PROFILE
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.name}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">{profile.role}</p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-zinc-400">
              {profile.bio}
            </p>

            <div className="mt-8 space-y-4">
              <a href={`tel:${profile.phone}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                <Phone className="text-[#d6b46a]" size={19} />
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500">PHONE NUMBER</p>
                  <p className="mt-1 text-sm">{profile.phone}</p>
                </div>
                <ArrowUpRight size={16} className="text-zinc-500" />
              </a>

              <a href={`tel:${profile.alternatePhone}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                <Phone className="text-[#d6b46a]" size={19} />
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500">ALTERNATE PHONE</p>
                  <p className="mt-1 text-sm">{profile.alternatePhone}</p>
                </div>
                <ArrowUpRight size={16} className="text-zinc-500" />
              </a>

              <a href={`mailto:${profile.email}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d6b46a]/50">
                <Mail className="text-[#d6b46a]" size={19} />
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500">EMAIL ADDRESS</p>
                  <p className="mt-1 text-sm">{profile.email}</p>
                </div>
                <ArrowUpRight size={16} className="text-zinc-500" />
              </a>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <MapPin className="text-[#d6b46a]" size={19} />
                <div>
                  <p className="text-[10px] text-zinc-500">LOCATION</p>
                  <p className="mt-1 text-sm">{profile.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-9">
              <p className="mb-4 text-[10px] tracking-[0.25em] text-zinc-500">
                CONNECT WITH ME
              </p>
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => {
                  const Icon = social.name === "Facebook" ? Users : social.name === "Instagram" ? Camera : social.name === "Telegram" ? Send : Music2;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-[#d6b46a]/50 ${social.color}`}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href={`tel:${profile.phone}`} className="flex items-center gap-2 rounded-full bg-[#d6b46a] px-6 py-3 text-xs font-bold text-black transition hover:bg-[#ebcd87]">
                <Phone size={15} />
                CONTACT ME
              </a>
              <a
                href={`data:text/vcard;charset=utf-8,${encodeURIComponent(["BEGIN:VCARD","VERSION:3.0",`FN:${profile.name}`,`TITLE:${profile.role}`,`TEL;TYPE=CELL:${profile.phone}`,`TEL;TYPE=WORK:${profile.alternatePhone}`,`EMAIL:${profile.email}`,`ADR;TYPE=WORK:;;${profile.location}`, "END:VCARD"].join("\r\n"))}`}
                download={`${profile.name.replace(/\s+/g, "-")}.vcf`}
                className="flex items-center gap-2 rounded-full border border-[#d6b46a]/40 px-6 py-3 text-xs text-[#d6b46a] transition hover:bg-[#d6b46a]/10"
              >
                <Contact size={15} />
                SAVE CONTACT
              </a>
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs transition hover:border-[#d6b46a]">
                <Contact size={15} />
                SEND EMAIL
              </a>
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
                  <p className="mt-2 text-xs text-zinc-500">{profile.role}</p>
                </div>

                <div className="mx-auto mt-9 flex w-fit flex-col items-center rounded-2xl bg-white p-5">
                  <QRCodeSVG
                    value="https://taplink-psi.vercel.app"
                    size={174}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#111111"
                  />
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

            <p className="mt-5 text-center text-[10px] leading-6 text-zinc-600">
              THIS IS YOUR DIGITAL BUSINESS CARD.
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






