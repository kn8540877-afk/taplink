import Link from "next/link";
import {
  ArrowRight,
  Wifi,
  QrCode,
  Contact,
  Share2,
  Smartphone,
  ShieldCheck,
  Zap,
  Check,
  CreditCard,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Contact,
    title: "Digital Profile",
    description: "Your personal or business identity in one beautiful digital profile.",
  },
  {
    icon: Wifi,
    title: "NFC Sharing",
    description: "Share your profile instantly with a simple tap of an NFC card.",
  },
  {
    icon: QrCode,
    title: "QR Code",
    description: "Let anyone scan your unique QR code to connect with you.",
  },
  {
    icon: Share2,
    title: "Social Links",
    description: "Bring all your social media and contact links together.",
  },
  {
    icon: Smartphone,
    title: "Save Contact",
    description: "Make it easy for people to save your contact information.",
  },
  {
    icon: ShieldCheck,
    title: "Your Identity",
    description: "Manage and update your digital identity whenever you need.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a45c]/50 bg-[#c9a45c]/10">
              <Wifi className="h-6 w-6 text-[#d8b56e]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-[0.18em]">TAPLINK</span>
              <p className="text-[9px] tracking-[0.32em] text-[#c9a45c]">
                SMART DIGITAL IDENTITY
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm text-gray-300 transition hover:text-[#e3c17c]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#d1ad68] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e6c985]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#b68b43]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#b68b43]/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/5 px-4 py-2 text-xs tracking-wider text-[#d8b56e]">
              <Zap className="h-3.5 w-3.5" />
              THE NEXT GENERATION OF DIGITAL IDENTITY
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              One Tap.
              <br />
              <span className="bg-gradient-to-r from-[#f3dfa9] via-[#c9a45c] to-[#987039] bg-clip-text text-transparent">
                Endless
              </span>
              <br />
              Connections.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
              Your identity, contact details and social links — all in one
              premium digital card. Share your world with a tap or scan.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-full bg-[#d1ad68] px-7 py-4 font-semibold text-black transition hover:bg-[#e6c985]"
              >
                Create Your Profile
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-white/15 px-7 py-4 font-medium text-white transition hover:border-[#c9a45c] hover:text-[#e3c17c]"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#c9a45c]" />
                Easy to create
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#c9a45c]" />
                NFC & QR ready
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 scale-90 rounded-[40px] bg-[#c9a45c]/10 blur-3xl" />
            <div className="relative rotate-2 rounded-[30px] border border-[#c9a45c]/30 bg-gradient-to-br from-[#202020] to-[#0d0d0d] p-6 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.25em] text-[#d8b56e]">
                  TAPLINK
                </span>
                <Wifi className="h-5 w-5 text-[#d8b56e]" />
              </div>

              <div className="mt-12 flex justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#c9a45c]/50 bg-[#c9a45c]/10">
                  <Contact className="h-14 w-14 text-[#d8b56e]" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xl font-semibold tracking-wide">Your Name</p>
                <p className="mt-2 text-sm text-[#c9a45c]">Personal Digital Card</p>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-gray-500">
                  Your introduction, your contacts, your connections.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {["Facebook", "Instagram", "Telegram"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center text-[10px] text-gray-400"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-[10px] tracking-[0.2em] text-gray-500">
                  CONNECT DIFFERENTLY
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d1ad68] text-black">
                  <QrCode className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-8 rounded-2xl border border-[#c9a45c]/30 bg-[#151515] p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a45c]/10">
                  <CreditCard className="h-5 w-5 text-[#d8b56e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">NFC Smart Card</p>
                  <p className="text-xs text-gray-500">Tap to connect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101010] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#c9a45c]">
              EVERYTHING IN ONE PLACE
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              More Than Just a Digital Card
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              A smarter way to introduce yourself, grow your network and share
              your business identity.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#151515] p-7 transition hover:-translate-y-1 hover:border-[#c9a45c]/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c9a45c]/30 bg-[#c9a45c]/10">
                  <Icon className="h-6 w-6 text-[#d8b56e]" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#c9a45c]">
                SIMPLE. SMART. INSTANT.
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Three Steps to
                <br />
                <span className="text-[#d8b56e]">Better Connections.</span>
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-gray-400">
                No complicated setup. Build your digital identity and start
                sharing it with people around you.
              </p>
            </div>

            <div className="space-y-5">
              {[
                ["01", "Create", "Sign up and build your personal or business profile."],
                ["02", "Connect", "Add your contact details, social links and information."],
                ["03", "Share", "Share your profile using NFC or your unique QR code."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex gap-5 rounded-2xl border border-white/10 bg-[#111111] p-6"
                >
                  <span className="text-2xl font-bold text-[#c9a45c]">{number}</span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[#c9a45c]/30 bg-gradient-to-br from-[#211b10] via-[#15130f] to-[#101010] px-7 py-16 text-center sm:px-12">
          <Globe className="mx-auto h-10 w-10 text-[#d8b56e]" />
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Your Identity Deserves Better.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
            Start building your digital presence with TAPLINK SMART DIGITAL IDENTITY.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#d1ad68] px-8 py-4 font-semibold text-black transition hover:bg-[#e6c985]"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:text-left lg:px-10">
          <div>
            <p className="font-bold tracking-[0.2em]">TAPLINK</p>
            <p className="mt-1 text-xs text-gray-600">SMART DIGITAL IDENTITY</p>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 TAPLINK. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

