// "use client";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import {
//   BookOpen,
//   ListChecks,
//   Shuffle,
//   Settings,
//   BookAIcon,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useUser } from "@clerk/nextjs";

// const NAV_ITEMS = [
//   { href: "/free-talking", label: "Full Lesson", icon: BookOpen },
//   { href: "/quick-questions", label: "40 Questions", icon: ListChecks },
//   { href: "/life-situations", label: "Life Situations", icon: Shuffle },
//   { href: "/grammar", label: "Grammar", icon: BookAIcon },
//   { href: "/settings", label: "Settings", icon: Settings },
// ];

// export function AppSidebar() {
//   const { user } = useUser();
//   const pathname = usePathname();

//   return (
//     <Sidebar
//       collapsible="icon"
//       className="border-slate-200 bg-white text-slate-900 dark:border-cyan-400/10 dark:bg-[#04070a] dark:text-cyan-50"
//     >
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               size="lg"
//               asChild
//               className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//             >
//               <Link href="/">
//                 {/* Always-visible icon */}
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-cyan-500/20 text-lg">
//                   🗣️
//                 </div>
//                 {/* Text only when expanded */}
//                 <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
//                   <span className="truncate font-black">
//                     <span className="text-cyan-600 dark:text-cyan-300">
//                       FREE
//                     </span>{" "}
//                     <span className="text-cyan-700 dark:text-cyan-500">
//                       TALKING
//                     </span>
//                   </span>
//                   <span className="truncate text-[10px] text-slate-500 dark:text-cyan-200/40">
//                     AI English practice
//                   </span>
//                 </div>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-slate-400 dark:text-cyan-200/50 group-data-[collapsible=icon]:hidden">
//             Navigation
//           </SidebarGroupLabel>
//           <SidebarMenu>
//             {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
//               <SidebarMenuItem key={href}>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === href}
//                   tooltip={label} // shows label on hover when collapsed
//                   className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 dark:text-cyan-100/80 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-50 dark:data-[active=true]:bg-cyan-400/15 dark:data-[active=true]:text-cyan-50"
//                 >
//                   <Link href={href}>
//                     <Icon size={16} />
//                     <span>{label}</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             ))}
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter>
//         {user && (
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton
//                 size="lg"
//                 className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//               >
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
//                   🗣️
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
//                   <span className="truncate text-xs font-semibold">
//                     {user.fullName ?? user.username}
//                   </span>
//                   <span className="truncate text-[10px] text-slate-500 dark:text-cyan-200/40">
//                     {user.primaryEmailAddress?.emailAddress}
//                   </span>
//                 </div>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         )}
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  ListChecks,
  Shuffle,
  Settings,
  BookAIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/free-talking", label: "Full Lesson", icon: BookOpen },
  { href: "/quick-questions", label: "40 Questions", icon: ListChecks },
  { href: "/life-situations", label: "Life Situations", icon: Shuffle },
  { href: "/grammar", label: "Grammar", icon: BookAIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

const GRID_BG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg stroke='%2322d3ee' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M24 18v12M18 24h12'/%3E%3C/g%3E%3C/svg%3E";

const flicker = {
  opacity: [0.55, 0.9, 0.5, 1, 0.6, 0.85, 0.55],
  scale: [0.95, 1.05, 0.92, 1.1, 0.97, 1.04, 0.95],
};

/** Mini orbiting cyan core — scaled-down version of the modal / navbar brand */
function SidebarBrandMark() {
  const reduceMotion = useReducedMotion();
  const spin = (reverse = false) =>
    reduceMotion ? undefined : { rotate: reverse ? -360 : 360 };
  const spinTransition = (duration: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <div className="relative flex size-8 shrink-0 items-center justify-center">
      {/* dashed outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-cyan-400/40"
        animate={spin()}
        transition={spinTransition(10)}
      />
      {/* inner ring */}
      <motion.div
        className="absolute inset-1 rounded-full border border-cyan-600/40"
        animate={spin(true)}
        transition={spinTransition(6.5)}
      />
      {/* pulse halo */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-300/30"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }
        }
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      {/* glow */}
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-cyan-300 blur-md"
        animate={reduceMotion ? undefined : flicker}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* core */}
      <div className="relative flex size-5 items-center justify-center rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-700 to-cyan-500 shadow-[0_0_12px_-2px_rgba(34,211,238,0.9)] text-[11px]">
        🗣️
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <Sidebar
      collapsible="icon"
      className="relative overflow-hidden border-slate-200 bg-white text-slate-900 dark:border-cyan-400/20 dark:bg-[#04070a] dark:text-cyan-50 dark:shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)]"
    >
      {/* ===== HUD background layers (dark mode) ===== */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        {/* grid texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("${GRID_BG}")`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a1219_0%,_#04070a_75%)]" />

        {/* soft cyan edge glow */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />

        {/* corner brackets */}
        {[
          "-left-px -top-px border-l-2 border-t-2",
          "-right-px -top-px border-r-2 border-t-2",
          "-left-px -bottom-px border-l-2 border-b-2",
          "-right-px -bottom-px border-r-2 border-b-2",
        ].map((cls) => (
          <div
            key={cls}
            className={`absolute ${cls} h-4 w-4 border-cyan-400/50`}
          />
        ))}

        {/* slow scanline */}
        {!reduceMotion && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* ===== content (sits above the HUD layers) ===== */}
      <div className="relative z-10 flex h-full flex-col">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-cyan-400/10"
              >
                <Link href="/">
                  <SidebarBrandMark />
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-black tracking-tight">
                      <span className="text-cyan-600 dark:text-cyan-300">
                        FREE
                      </span>{" "}
                      <span className="text-cyan-700 dark:text-cyan-500">
                        TALKING
                      </span>
                    </span>
                    <span className="truncate text-[10px] text-slate-500 dark:text-cyan-200/40">
                      AI English practice
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400 dark:text-cyan-200/50 group-data-[collapsible=icon]:hidden">
              Navigation
            </SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={`
                        text-slate-600 hover:bg-slate-100 hover:text-slate-900
                        dark:text-cyan-100/80 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-50
                        data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900
                        dark:data-[active=true]:bg-cyan-400/15 dark:data-[active=true]:text-cyan-50
                        dark:data-[active=true]:shadow-[0_0_12px_-2px_rgba(34,211,238,0.5)]
                      `}
                    >
                      <Link href={href}>
                        <Icon
                          size={16}
                          className={
                            isActive
                              ? "text-cyan-600 dark:text-cyan-300"
                              : undefined
                          }
                        />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {user && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="dark:hover:bg-cyan-400/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="relative flex aspect-square size-8 items-center justify-center">
                    <div className="flex size-7 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 text-sm shadow-[0_0_10px_-2px_rgba(34,211,238,0.5)]">
                      🗣️
                    </div>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-cyan-50">
                      {user.fullName ?? user.username}
                    </span>
                    <span className="truncate text-[10px] text-slate-500 dark:text-cyan-200/40">
                      {user.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
