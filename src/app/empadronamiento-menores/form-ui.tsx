import { cn } from "@/lib/utils";

export function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]",
        className
      )}
    >
      <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--feg-green)]">
      {children}
      {required ? <span className="text-red-600"> *</span> : null}
    </label>
  );
}

export const inputClassName =
  "w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

export const selectClassName = inputClassName;
