import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "Comfort analysis",
  description: "ENVⅢとeCO2を組み合わせ、室内の快適度を可視化します。",
  icons: [{ rel: "icon", url: "/sun.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${GeistSans.variable}`}>
      <body>
      <main>{children}</main>
      <Toaster />
      </body>
    </html>
  );
}
