export type BuilderNodeTag =
  | "mj-head"
  | "mj-attributes"
  | "mj-all"
  | "mj-class"
  | "mj-breakpoint"
  | "mj-font"
  | "mj-html-attributes"
  | "mj-selector"
  | "mj-html-attribute"
  | "mj-preview"
  | "mj-style"
  | "mj-title"
  | "mj-section"
  | "mj-column"
  | "mj-text"
  | "mj-image"
  | "mj-button"
  | "mj-divider"
  | "mj-spacer"
  | "mj-accordion"
  | "mj-accordion-element"
  | "mj-accordion-title"
  | "mj-accordion-text"
  | "mj-carousel"
  | "mj-carousel-image"
  | "mj-group"
  | "mj-hero"
  | "mj-navbar"
  | "mj-navbar-link"
  | "mj-raw"
  | "mj-social"
  | "mj-social-element"
  | "mj-table"
  | "tr"
  | "td"
  | "th"
  | "mj-wrapper";

export type BuilderParentTag = BuilderNodeTag | "mjml" | "mj-body";

type NodeDefinition = {
  tagName: BuilderNodeTag;
  label: string;
  isLeaf: boolean;
};

export const NODE_DEFINITIONS: NodeDefinition[] = [
  { tagName: "mj-section", label: "Section", isLeaf: false },
  { tagName: "mj-column", label: "Column", isLeaf: false },
  { tagName: "mj-text", label: "Text", isLeaf: true },
  { tagName: "mj-image", label: "Image", isLeaf: true },
  { tagName: "mj-button", label: "Button", isLeaf: true },
  { tagName: "mj-divider", label: "Divider", isLeaf: true },
  { tagName: "mj-spacer", label: "Spacer", isLeaf: true },
  { tagName: "mj-accordion", label: "Accordion", isLeaf: false },
  { tagName: "mj-accordion-element", label: "Accordion item", isLeaf: false },
  { tagName: "mj-accordion-title", label: "Accordion title", isLeaf: true },
  { tagName: "mj-accordion-text", label: "Accordion text", isLeaf: true },
  { tagName: "mj-carousel", label: "Carousel", isLeaf: false },
  { tagName: "mj-carousel-image", label: "Carousel image", isLeaf: true },
  { tagName: "mj-group", label: "Group", isLeaf: false },
  { tagName: "mj-hero", label: "Hero", isLeaf: false },
  { tagName: "mj-navbar", label: "Navbar", isLeaf: false },
  { tagName: "mj-navbar-link", label: "Navbar link", isLeaf: true },
  { tagName: "mj-raw", label: "Raw", isLeaf: true },
  { tagName: "mj-social", label: "Social", isLeaf: false },
  { tagName: "mj-social-element", label: "Social element", isLeaf: true },
  { tagName: "mj-table", label: "Table", isLeaf: false },
  { tagName: "tr", label: "Table row", isLeaf: false },
  { tagName: "td", label: "Table cell", isLeaf: true },
  { tagName: "th", label: "Header cell", isLeaf: true },
  { tagName: "mj-wrapper", label: "Wrapper", isLeaf: false },
  { tagName: "mj-head", label: "Head", isLeaf: false },
  { tagName: "mj-attributes", label: "Attributes", isLeaf: false },
  { tagName: "mj-all", label: "All attributes", isLeaf: true },
  { tagName: "mj-class", label: "Class", isLeaf: true },
  { tagName: "mj-breakpoint", label: "Breakpoint", isLeaf: true },
  { tagName: "mj-font", label: "Font", isLeaf: true },
  { tagName: "mj-html-attributes", label: "HTML attributes", isLeaf: false },
  { tagName: "mj-selector", label: "Selector", isLeaf: false },
  { tagName: "mj-html-attribute", label: "HTML attribute", isLeaf: true },
  { tagName: "mj-preview", label: "Preview", isLeaf: true },
  { tagName: "mj-style", label: "Style", isLeaf: true },
  { tagName: "mj-title", label: "Title", isLeaf: true },
];

export const ADD_OPTIONS = NODE_DEFINITIONS.map(({ tagName, label }) => ({
  tagName,
  label,
}));

export const LEAF_NODE_TAGS = new Set<BuilderNodeTag>(
  NODE_DEFINITIONS.filter((definition) => definition.isLeaf).map(
    (definition) => definition.tagName,
  ),
);

const MJ_ATTRIBUTES_COMPONENT_TAGS: BuilderNodeTag[] = [
  "mj-section",
  "mj-column",
  "mj-text",
  "mj-image",
  "mj-button",
  "mj-divider",
  "mj-spacer",
  "mj-accordion",
  "mj-accordion-element",
  "mj-accordion-title",
  "mj-accordion-text",
  "mj-carousel",
  "mj-carousel-image",
  "mj-group",
  "mj-hero",
  "mj-navbar",
  "mj-navbar-link",
  "mj-raw",
  "mj-social",
  "mj-social-element",
  "mj-table",
  "mj-wrapper",
];

const NODE_CHILD_RULES: Record<BuilderParentTag, BuilderNodeTag[]> = {
  mjml: ["mj-head", "mj-raw"],
  "mj-head": [
    "mj-attributes",
    "mj-breakpoint",
    "mj-font",
    "mj-html-attributes",
    "mj-preview",
    "mj-style",
    "mj-title",
  ],
  "mj-attributes": ["mj-all", "mj-class", ...MJ_ATTRIBUTES_COMPONENT_TAGS],
  "mj-html-attributes": ["mj-selector"],
  "mj-selector": ["mj-html-attribute"],
  "mj-body": ["mj-section", "mj-wrapper", "mj-hero", "mj-raw"],
  "mj-wrapper": ["mj-section"],
  "mj-section": ["mj-column", "mj-group"],
  "mj-group": ["mj-column"],
  "mj-column": [
    "mj-text",
    "mj-image",
    "mj-button",
    "mj-divider",
    "mj-spacer",
    "mj-accordion",
    "mj-carousel",
    "mj-navbar",
    "mj-social",
    "mj-table",
  ],
  "mj-hero": [
    "mj-text",
    "mj-image",
    "mj-button",
    "mj-divider",
    "mj-spacer",
    "mj-accordion",
    "mj-carousel",
    "mj-navbar",
    "mj-social",
    "mj-table",
  ],
  "mj-text": [],
  "mj-image": [],
  "mj-button": [],
  "mj-divider": [],
  "mj-spacer": [],
  "mj-accordion": ["mj-accordion-element"],
  "mj-accordion-element": ["mj-accordion-title", "mj-accordion-text"],
  "mj-accordion-title": [],
  "mj-accordion-text": [],
  "mj-carousel": ["mj-carousel-image"],
  "mj-carousel-image": [],
  "mj-navbar": ["mj-navbar-link"],
  "mj-navbar-link": [],
  "mj-raw": [],
  "mj-social": ["mj-social-element"],
  "mj-social-element": [],
  "mj-table": ["tr"],
  tr: ["td", "th"],
  td: [],
  th: [],
};

export const getAllowedChildTags = (parentTag: string): BuilderNodeTag[] => {
  if (parentTag in NODE_CHILD_RULES) {
    return NODE_CHILD_RULES[parentTag as BuilderParentTag];
  }
  return [];
};

export const canAcceptChildTag = (
  parentTag: string,
  childTag: string,
): childTag is BuilderNodeTag =>
  getAllowedChildTags(parentTag).includes(childTag as BuilderNodeTag);

export const getAllowedChildOptions = (parentTag: string) => {
  const allowed = new Set(getAllowedChildTags(parentTag));
  return ADD_OPTIONS.filter((option) => allowed.has(option.tagName));
};
