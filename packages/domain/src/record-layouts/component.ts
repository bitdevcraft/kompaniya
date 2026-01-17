export type ComponentCategory =
  | "activity"
  | "analytics"
  | "communication"
  | "custom"
  | "finance"
  | "organization"
  | "system";

export interface CustomComponentDefinition {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Description of the component */
  description?: string;
  /** Category for palette grouping */
  category: ComponentCategory;
  /** Optional lucide-react icon name */
  iconName?: string;
  /** Entity types this component applies to (empty = all) */
  entityTypes: string[];
  /** Static props passed to the component */
  props?: Record<string, unknown>;
}
