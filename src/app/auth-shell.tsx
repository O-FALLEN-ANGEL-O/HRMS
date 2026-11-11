import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/** Centered card layout for the password pages. */
export function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-[8vh] pb-16">
        <div className="panel w-full max-w-md p-6 sm:p-8">
          <h1 className="text-3xl">{title}</h1>
          <p className="text-ink-2 mt-2 mb-6 text-sm">{lead}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
