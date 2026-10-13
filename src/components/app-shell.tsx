"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Command } from "cmdk";
import * as Popover from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bell, LogOut, Menu, Search, UserRound, Repeat2, X } from "lucide-react";
import { ICONS } from "./icons";
import { Avatar, Button } from "./ui";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/app/actions/auth";
import { markAllRead } from "@/app/actions/notifications";
import { cn, timeAgo } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

type ShellNav = Omit<NavItem, "show">;
type ShellUser = { id: string; name: string; title: string; role: string; hue: number };
type ShellNotification = { id: string; title: string; href: string | null; read: boolean; createdAt: string };

const ROLE_LABEL: Record<string, string> = { admin: "Admin", hr: "HR", manager: "Manager", employee: "Employee", recruiter: "Recruiter" };

function isActive(pathname: string, href: string) {
  if (href === "/people") return pathname === "/people" || /^\/people\/(?!org)/.test(pathname);
  return pathname === href || pathname.startsWith(href + "/");
}

function NavList({ nav, approvals, onNavigate }: { nav: ShellNav[]; approvals: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = useMemo(() => {
    const m = new Map<string, ShellNav[]>();
    for (const n of nav) m.set(n.group, [...(m.get(n.group) ?? []), n]);
    return [...m.entries()];
  }, [nav]);

  return (
    <nav aria-label="Main" className="space-y-5">
      {groups.map(([group, items]) => (
        <div key={group}>
          <p className="px-3 pb-1.5 text-xs font-medium text-ink-3">{group}</p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = ICONS[item.icon]!;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn("relative flex items-center gap-3 rounded-[9px] px-3 py-2 text-[0.9rem] transition-colors", active ? "text-ink font-medium" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}
                  >
                    {active ? <motion.span layoutId="nav-active" className="absolute inset-0 rounded-[9px] border border-line bg-surface shadow-[0_1px_2px_rgb(24_32_58/0.06)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} /> : null}
                    <Icon className={cn("relative size-[18px]", active ? "text-ink" : "text-ink-3")} aria-hidden />
                    <span className="relative flex-1">{item.label}</span>
                    {item.badge === "approvals" && approvals > 0 ? (
                      <span className="relative rounded-full bg-marigold px-1.5 text-xs font-semibold text-[#2a1b00] tabular" aria-label={`${approvals} waiting`}>
                        {approvals}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CommandPalette({ open, setOpen, nav, people }: { open: boolean; setOpen: (o: boolean) => void; nav: ShellNav[]; people: { id: string; name: string; title: string }[] }) {
  const router = useRouter();
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const actions = [
    { label: "Clock in or out", href: "/attendance" },
    { label: "Apply for time off", href: "/time-off?new=1" },
    { label: "File an expense", href: "/expenses?new=1" },
    { label: "Raise a helpdesk ticket", href: "/helpdesk?new=1" },
    { label: "Ask the HR assistant", href: "/assistant" },
    { label: "Give kudos", href: "/feed?kudos=1" },
  ];
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0b1020]/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface shadow-[0_30px_80px_-24px_rgb(0_0_0/0.5)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]">
          <DialogPrimitive.Title className="sr-only">Search HR+</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Jump to a page, a person or an action</DialogPrimitive.Description>
          <Command label="Search HR+" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-3">
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="size-4 text-ink-3" aria-hidden />
              <Command.Input autoFocus placeholder="Search pages, people and actions" className="h-12 w-full bg-transparent text-[0.95rem] outline-none placeholder:text-ink-3" />
            </div>
            <Command.List className="max-h-[55vh] overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-sm text-ink-2">No matches. Try a person&apos;s name or a page like &ldquo;payroll&rdquo;.</Command.Empty>
              <Command.Group heading="Do something">
                {actions.map((a) => (
                  <Command.Item key={a.href} value={a.label} onSelect={() => go(a.href)} className="cursor-pointer rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface-2">
                    {a.label}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Go to">
                {nav.map((n) => {
                  const Icon = ICONS[n.icon]!;
                  return (
                    <Command.Item key={n.href} value={`page ${n.label}`} onSelect={() => go(n.href)} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface-2">
                      <Icon className="size-4 text-ink-3" aria-hidden /> {n.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading="People">
                {people.map((p) => (
                  <Command.Item key={p.id} value={`person ${p.name} ${p.title}`} onSelect={() => go(`/people/${p.id}`)} className="cursor-pointer rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface-2">
                    {p.name} <span className="text-ink-3">{p.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Notifications({ items }: { items: ShellNotification[] }) {
  const unread = items.filter((n) => !n.read).length;
  const [pending, start] = useTransition();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className="relative">
          <Bell />
          {unread ? <span className="absolute top-2 right-2 size-2 rounded-full bg-marigold ring-2 ring-paper" /> : null}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] rounded-[12px] border border-line bg-surface shadow-[var(--shadow)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="font-display font-semibold">Notifications</p>
            {unread ? (
              <button className="text-sm text-sky hover:underline disabled:opacity-50" disabled={pending} onClick={() => start(() => markAllRead())}>
                Mark all read
              </button>
            ) : null}
          </div>
          {items.length ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((n) => (
                <li key={n.id}>
                  <Link href={n.href ?? "/home"} className="flex gap-3 px-4 py-2.5 hover:bg-surface-2">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-marigold")} aria-hidden />
                    <span className="min-w-0">
                      <span className={cn("block text-sm", !n.read && "font-medium")}>{n.title}</span>
                      <span className="text-xs text-ink-3">{timeAgo(n.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-ink-2">You&apos;re all caught up.</p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <Popover.Root>
      <Popover.Trigger className="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 hover:bg-surface-2 sm:pr-3" aria-label="Account menu">
        <Avatar name={user.name} hue={user.hue} size={32} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block text-xs text-ink-3">{ROLE_LABEL[user.role]}</span>
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-50 w-60 rounded-[12px] border border-line bg-surface p-1.5 shadow-[var(--shadow)] data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-ink-3">{user.title}</p>
          </div>
          <Link href={`/people/${user.id}`} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-surface-2">
            <UserRound className="size-4 text-ink-3" aria-hidden /> My profile
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-surface-2">
            <Repeat2 className="size-4 text-ink-3" aria-hidden /> Switch person
          </Link>
          <form action={signOut}>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-rose hover:bg-rose-soft">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function AppShell({
  user,
  nav,
  approvals,
  notifications,
  people,
  children,
}: {
  user: ShellUser;
  nav: ShellNav[];
  approvals: number;
  notifications: ShellNotification[];
  people: { id: string; name: string; title: string }[];
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line px-3 py-4 lg:flex">
        <div className="px-2 pb-5">
          <Logo href="/home" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <NavList nav={nav} approvals={approvals} />
        </div>
        <p className="px-3 pt-4 text-xs text-ink-3">Northwind Labs, a demo company</p>
      </aside>

      <AnimatePresence>
        {drawer ? (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[#0b1020]/40" onClick={() => setDrawer(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 flex w-[272px] flex-col bg-paper px-3 py-4 shadow-xl"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between px-2 pb-4">
                <Logo href="/home" />
                <Button variant="ghost" size="icon" onClick={() => setDrawer(false)} aria-label="Close menu">
                  <X />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <NavList nav={nav} approvals={approvals} onNavigate={() => setDrawer(false)} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu />
            </Button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3 text-left text-sm text-ink-3 transition-colors hover:border-line-strong sm:max-w-md"
            >
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Search or jump to…</span>
              <kbd className="ml-auto hidden rounded border border-line px-1.5 font-sans text-[0.7rem] text-ink-3 sm:inline">Ctrl K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Notifications items={notifications} />
              <UserMenu user={user} />
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} nav={nav} people={people} />
    </div>
  );
}
