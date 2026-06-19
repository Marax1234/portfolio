/**
 * Button — primärer UI-Baustein (Sprint 2)
 *
 * Varianten (design.md §Components „Buttons & Inputs"):
 *   primary  — solid bg-primary / text-on-primary / rounded-md
 *   secondary — Ghost, 1px border-mist-blue / text-on-surface / rounded-md
 *
 * Mit href → rendert next/link (RSC-kompatibel, kein extra Client-Wrapper).
 * Ohne href → rendert <button>.
 *
 * Kein Hardcode (§0.2).
 */

import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container border border-primary hover:border-primary-container",
  secondary:
    "bg-transparent text-on-surface border border-mist-blue hover:bg-surface-container",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 type-label-caps rounded-md px-6 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Button-Klassen ohne die Komponente — für die wenigen Stellen, die einen
 * echten `<a download>`/externen Link brauchen (next/link kann das nicht),
 * den Button-Look aber teilen sollen. Verhindert Hardcode-Duplikate.
 */
export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return [baseClasses, variantClasses[variant], className].filter(Boolean).join(" ");
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = buttonClasses(variant, className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { onClick, type = "button", disabled } = props as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[classes, disabled ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
    >
      {children}
    </button>
  );
}
