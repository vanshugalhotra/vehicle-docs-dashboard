import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AppToaster from "@/components/ui/AppToaster/AppToaster";
import { AppLayout } from "@/components/layout/applayout";
import { Providers } from "@/lib/providers/ReactQueryProvider";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yash Group",
  description: "Yash Group Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <Providers>
          <AppLayout title="Yash Group Dashboard">
            {children}
          </AppLayout>
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}