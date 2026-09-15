import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

const baseStyles =
  "inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto";

const variantStyles: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border text-foreground hover:border-primary hover:text-primary",
};

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  const classes = className
    ? `${baseStyles} ${variantStyles[variant]} ${className}`
    : `${baseStyles} ${variantStyles[variant]}`;

  return <Link {...props} className={classes} />;
}
