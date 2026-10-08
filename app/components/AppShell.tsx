// app/components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./Appsidebar";
import Navbar from "./Navbar";

// Routes that render full-screen, WITHOUT the sidebar and navbar.
const STANDALONE_ROUTES = ["/pictures"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (standalone) {
    // No sidebar, no navbar, no padding: the page owns the whole viewport.
    // (The <Toaster richColors /> in the root layout still covers toasts here.)
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="p-4 lg:p-6">
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
