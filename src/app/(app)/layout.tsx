import { requireUser } from "@/lib/auth";
import { approvalsCount, directory, unreadNotifications } from "@/lib/queries";
import { navFor } from "@/lib/nav";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [approvals, notifications, people] = await Promise.all([approvalsCount(user), unreadNotifications(user.id), directory()]);
  return (
    <AppShell
      user={{ id: user.id, name: user.name, title: user.title, role: user.role, hue: user.hue }}
      nav={navFor(user).map(({ show, ...rest }) => rest)}
      approvals={approvals}
      notifications={notifications.map((n) => ({ id: n.id, title: n.title, href: n.href, read: !!n.readAt, createdAt: n.createdAt }))}
      people={people.map((p) => ({ id: p.id, name: p.name, title: p.title }))}
    >
      {children}
    </AppShell>
  );
}
