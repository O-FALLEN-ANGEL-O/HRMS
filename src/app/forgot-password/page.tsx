import { AuthShell } from "../auth-shell";
import { ForgotForm } from "./form";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" lead="Enter your work email. If it belongs to someone here, we'll email a link that works for an hour.">
      <ForgotForm />
    </AuthShell>
  );
}
