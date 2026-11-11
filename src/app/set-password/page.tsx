import { AuthShell } from "../auth-shell";
import { SetPasswordForm } from "./form";

export const metadata = { title: "Set your password" };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Choose a password" lead="At least 10 characters. A short sentence you'll remember works well.">
      {token ? (
        <SetPasswordForm token={token} />
      ) : (
        <p className="bg-rose-soft text-rose rounded-lg px-3 py-2 text-sm">
          This link is incomplete. Open the link from your email again, or ask for a new one.
        </p>
      )}
    </AuthShell>
  );
}
