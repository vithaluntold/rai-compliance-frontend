import type { Metadata } from "next";
import { Inter, Montserrat, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import "../styles/cross-browser-fixes.css";
import ClientLayout from "@/components/client-layout";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAi Compliance Engine - AI-Powered Financial Compliance",
  description:
    "Advanced AI-driven compliance analysis platform by RAi - Facilitating the best possible future through intelligent document analysis and regulatory compliance automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${montserrat.variable} ${ibmPlexSans.variable}`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
