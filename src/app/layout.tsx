import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAPLINK | Smart Digital Identity",
  description:
    "One tap. One identity. Connect with your world using TAPLINK Smart Card.",
  applicationName: "TAPLINK",
  keywords: ["TAPLINK", "NFC", "Smart Card", "Digital Business Card"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
