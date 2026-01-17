import type { CustomComponentDefinition } from "@repo/domain";
import type { ComponentType } from "react";

import type { RecordPageLayout } from "@/components/record-page/layout";

export interface CustomComponentProps {
  entityType: string;
  recordId: string;
  record: Record<string, unknown>;
  layout?: RecordPageLayout<Record<string, unknown>>;
  config?: Record<string, unknown>;
}

export interface RegisteredComponent {
  definition: CustomComponentDefinition;
  component: ComponentType<CustomComponentProps>;
}

export const COMPONENT_REGISTRY = new Map<string, RegisteredComponent>();

export function getAllComponentDefinitions(): CustomComponentDefinition[] {
  return Array.from(COMPONENT_REGISTRY.values()).map(
    (entry) => entry.definition,
  );
}

export function getComponent(id: string): RegisteredComponent | undefined {
  return COMPONENT_REGISTRY.get(id);
}

export function getComponentsForEntity(
  entityType: string,
): CustomComponentDefinition[] {
  return Array.from(COMPONENT_REGISTRY.values())
    .map((entry) => entry.definition)
    .filter(
      (definition) =>
        definition.entityTypes.length === 0 ||
        definition.entityTypes.includes(entityType),
    );
}

export function hasComponent(id: string): boolean {
  return COMPONENT_REGISTRY.has(id);
}

export function registerComponent(
  definition: CustomComponentDefinition,
  component: ComponentType<CustomComponentProps>,
) {
  COMPONENT_REGISTRY.set(definition.id, { definition, component });
}
