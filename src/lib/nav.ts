import type { Role } from "@/db/schema";

export type NavItem = { href: string; label: string; icon: string; group: string; show?: (u: NavUser) => boolean; badge?: "approvals" };
export type NavUser = { role: Role; reportCount: number };

const people = (u: NavUser) => u.role === "admin" || u.role === "hr";

export const NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "home", group: "Workday" },
  { href: "/approvals", label: "Approvals", icon: "inbox", group: "Workday", show: (u) => people(u) || u.reportCount > 0, badge: "approvals" },
  { href: "/attendance", label: "Attendance", icon: "clock", group: "Workday" },
  { href: "/time-off", label: "Time off", icon: "palm", group: "Workday" },
  { href: "/expenses", label: "Expenses", icon: "receipt", group: "Workday" },

  { href: "/people", label: "People", icon: "users", group: "Company" },
  { href: "/people/org", label: "Org chart", icon: "network", group: "Company" },
  { href: "/feed", label: "Feed", icon: "megaphone", group: "Company" },
  { href: "/lifecycle", label: "Joiners & leavers", icon: "door", group: "Company", show: (u) => people(u) || u.role === "manager" },

  { href: "/recruitment", label: "Recruitment", icon: "briefcase", group: "Talent", show: (u) => people(u) || u.role === "recruiter" || u.role === "manager" },
  { href: "/performance", label: "Goals & reviews", icon: "target", group: "Talent" },

  { href: "/payroll", label: "Payroll", icon: "wallet", group: "Money & things" },
  { href: "/assets", label: "Assets", icon: "laptop", group: "Money & things" },

  { href: "/helpdesk", label: "Helpdesk", icon: "lifebuoy", group: "Help" },
  { href: "/assistant", label: "HR assistant", icon: "sparkles", group: "Help" },
  { href: "/surveys", label: "Surveys", icon: "pulse", group: "Help" },

  { href: "/analytics", label: "Analytics", icon: "chart", group: "Insights", show: (u) => people(u) || u.role === "manager" },
  { href: "/settings", label: "Settings", icon: "settings", group: "Insights", show: people },
];

export function navFor(u: NavUser) {
  return NAV.filter((i) => !i.show || i.show(u));
}
