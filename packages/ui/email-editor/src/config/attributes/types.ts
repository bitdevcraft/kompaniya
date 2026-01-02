export type AttributeField = {
  key: string;
  label: string;
  type?: "text" | "select";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

export type AttributeGroup = {
  title: string;
  fields: AttributeField[];
};

export type AttributeGroups = Record<string, AttributeGroup[]>;
