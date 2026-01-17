export type { CustomComponentProps, RegisteredComponent } from "./registry";

export {
  COMPONENT_REGISTRY,
  getAllComponentDefinitions,
  getComponent,
  getComponentsForEntity,
  hasComponent,
  registerComponent,
} from "./registry";
export type {
  ComponentCategory,
  CustomComponentDefinition,
} from "@repo/domain";
