import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Navbar from "./components/Navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import Provider from "./provider";
import { AppSidebar } from "./components/Appsidebar";
import { ColorThemeProvider } from "./context/ColorThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Topic AI Generator",
  description:
    "English Topic AI Generator for Online English teachers to help with FT topics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConvexClientProvider>
              <Provider>
                <ColorThemeProvider>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <Navbar />
                      <main className="p-4 lg:p-6">
                        {children}
                        <Toaster
                          theme="dark"
                          position="bottom-right"
                          richColors
                        />
                      </main>
                    </SidebarInset>
                  </SidebarProvider>
                </ColorThemeProvider>

                <Toaster richColors />
              </Provider>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
