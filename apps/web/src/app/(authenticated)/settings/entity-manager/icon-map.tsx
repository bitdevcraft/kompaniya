import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

type LucideIconComponent = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

/**
 * Maps icon names to Lucide icon components
 */
export function getIconComponent(iconName: string): LucideIconComponent {
  const iconKey = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as IconName;

  return (LucideIcons[iconKey] ?? LucideIcons.Circle) as LucideIconComponent;
}
