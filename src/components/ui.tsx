"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFormStatus } from "react-dom";
import { cn, initials } from "@/lib/utils";

/* ---------------- Button ---------------- */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background,color,border,transform,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-ink/90",
        accent: "bg-marigold text-[#2a1b00] hover:brightness-105 shadow-[0_1px_0_rgb(0_0_0/0.08)]",
        outline: "border border-line-strong bg-surface text-ink hover:bg-surface-2",
        ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
        approve: "bg-teal text-on-teal hover:brightness-110",
        danger: "border border-rose/40 text-rose hover:bg-rose-soft",
      },
      size: {
        sm: "h-8 rounded-[7px] px-3 text-[0.8125rem]",
        md: "h-9 rounded-[var(--radius-control)] px-4 text-sm",
        lg: "h-11 rounded-[10px] px-5 text-[0.95rem]",
        icon: "size-9 rounded-[var(--radius-control)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

/** Submit button that shows a spinner while its form's action is pending. */
export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({ name, hue, size = 36, className }: { name: string; hue: number; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("font-display inline-grid shrink-0 place-items-center rounded-full font-semibold select-none", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
        background: `oklch(0.9 0.06 ${hue})`,
        color: `oklch(0.32 0.09 ${hue})`,
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------- Status pill ---------------- */

const tone = {
  neutral: "bg-surface-2 text-ink-2",
  good: "bg-teal-soft text-teal",
  bad: "bg-rose-soft text-rose",
  warn: "bg-marigold-soft text-marigold-ink",
  info: "bg-sky-soft text-sky",
};
export type Tone = keyof typeof tone;

export function Pill({ children, t = "neutral", className }: { children: React.ReactNode; t?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tone[t], className)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  if (["approved", "reimbursed", "resolved", "hired", "finalized", "active", "available", "submitted", "open_job"].includes(status)) return "good";
  if (["rejected", "cancelled", "retired", "exited"].includes(status)) return "bad";
  if (["pending", "draft", "in_progress", "offer", "onboarding", "offboarding", "repair"].includes(status)) return "warn";
  if (["interview", "screening", "assigned"].includes(status)) return "info";
  return "neutral";
}

export const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusPill({ status }: { status: string }) {
  return <Pill t={statusTone(status)}>{statusLabel(status)}</Pill>;
}

/* ---------------- Layout helpers ---------------- */

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl">{title}</h1>
        {description ? <p className="text-ink-2 mt-1 max-w-[62ch]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      {title ? (
        <header className="border-line flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 className="font-display text-[1.02rem] font-semibold">{title}</h2>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {icon ? <div className="bg-surface-2 text-ink-3 mb-3 grid size-11 place-items-center rounded-full [&_svg]:size-5">{icon}</div> : null}
      <p className="font-display font-semibold">{title}</p>
      {children ? <p className="text-ink-2 mt-1 max-w-[42ch] text-sm">{children}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-ink-3 mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

export function Progress({ value, tone: t = "ink", label }: { value: number; tone?: "ink" | "teal" | "marigold" | "rose"; label?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  const color = { ink: "bg-ink", teal: "bg-teal", marigold: "bg-marigold", rose: "bg-rose" }[t];
  return (
    <div
      className="bg-surface-2 h-1.5 w-full overflow-hidden rounded-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-label={label}
    >
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct * 100}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}

/* ---------------- Dialog & Sheet ---------------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  title,
  description,
  children,
  side,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  side?: "right";
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-[#0b1020]/40 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          "bg-surface fixed z-50 flex flex-col shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)] focus:outline-none",
          side === "right"
            ? "border-line data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right inset-y-0 right-0 w-full max-w-xl border-l"
            : "border-line data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 top-1/2 left-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-panel)] border",
          className,
        )}
      >
        <div className="border-line flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <DialogPrimitive.Title className="font-display text-lg font-semibold">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-ink-2 mt-0.5 text-sm">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close className="text-ink-3 hover:bg-surface-2 hover:text-ink -mr-1 rounded-md p-1" aria-label="Close">
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/* ---------------- Tabs (link-free, local state) ---------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  const id = React.useId();
  return (
    <div role="tablist" aria-label={label} className="border-line bg-surface inline-flex rounded-[10px] border p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn("relative rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors", active ? "text-paper" : "text-ink-2 hover:text-ink")}
          >
            {active ? (
              <motion.span
                layoutId={`seg-${id}`}
                className="bg-ink absolute inset-0 rounded-[7px]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">
              {o.label}
              {o.count !== undefined ? <span className={cn("tabular ml-1.5", active ? "text-paper/70" : "text-ink-3")}>{o.count}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Animated list (rows leave smoothly when actioned) ---------------- */

export function AnimatedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={className}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  );
}

export function AnimatedItem({ children, className, ...rest }: { children: React.ReactNode; className?: string } & React.ComponentProps<typeof motion.li>) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.li>
  );
}

/* ---------------- Stat ---------------- */

export function Stat({ label, value, sub, href }: { label: string; value: React.ReactNode; sub?: React.ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-ink-2 text-sm">{label}</p>
      <p className="font-display tabular mt-1 text-3xl font-semibold">{value}</p>
      {sub ? <p className="text-ink-3 mt-0.5 text-xs">{sub}</p> : null}
    </>
  );
  return href ? (
    <a href={href} className="hover:bg-surface-2 block rounded-[10px] px-1 py-1 transition-colors">
      {body}
    </a>
  ) : (
    <div className="px-1 py-1">{body}</div>
  );
}
