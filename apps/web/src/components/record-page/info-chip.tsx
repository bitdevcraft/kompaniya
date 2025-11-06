import type { ComponentType } from "react";

export interface InfoChipProps {
  icon: ComponentType<{ className?: string }>;
  label?: string | null;
  linkType?: "mailto" | "tel";
}

export function InfoChip({ icon: Icon, label, linkType }: InfoChipProps) {
  if (!label) return null;

  const href = linkType
    ? `${linkType}:${label}`
    : label.startsWith("http")
      ? label
      : undefined;
  const content = (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </span>
  );

  if (href) {
    return (
      <a
        className="text-foreground transition hover:text-primary"
        href={href}
        rel="noreferrer"
        target={href.startsWith("http") ? "_blank" : undefined}
      >
        {content}
      </a>
    );
  }

  return content;
}
