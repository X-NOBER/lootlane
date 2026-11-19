import type { Metadata } from "next";
import { DemoEconomyProvider } from "@/components/demo-economy-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lootlane | Discover your next favorite",
  description: "A playful demo of fictional elemental abilities and collectibles."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DemoEconomyProvider>
          <SiteHeader />
          <main>{children}</main>
        </DemoEconomyProvider>
      </body>
    </html>
  );
}
