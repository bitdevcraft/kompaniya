import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { buildAccordionStyles } from "./mj-accordion";
import { buildAccordionElementStyles } from "./mj-accordion-element";
import { MjAccordionTextNode } from "./mj-accordion-text";
import { MjAccordionTitleNode } from "./mj-accordion-title";
import { buildButtonStyles, MjButtonNode } from "./mj-button";
import { buildCarouselStyles } from "./mj-carousel";
import { buildColumnStyles } from "./mj-column";
import { buildDividerStyles, MjDividerNode } from "./mj-divider";
import { buildGroupStyles } from "./mj-group";
import { buildHeroStyles } from "./mj-hero";
import { buildImageStyles, MjImageNode } from "./mj-image";
import { buildNavbarStyles } from "./mj-navbar";
import { MjNavbarLinkNode } from "./mj-navbar-link";
import { buildRawStyles, MjRawNode } from "./mj-raw";
import { buildSectionStyles } from "./mj-section";
import { buildSocialStyles } from "./mj-social";
import {
  buildSocialElementStyles,
  MjSocialElementNode,
} from "./mj-social-element";
import { buildSpacerStyles, MjSpacerNode } from "./mj-spacer";
import { buildTableStyles } from "./mj-table";
import { buildTextStyles, MjTextNode } from "./mj-text";
import { buildWrapperStyles } from "./mj-wrapper";
import { applyPaddingStyles, NodeStyles } from "./node-styles";
import { MjTableCellNode, MjTableHeaderCellNode } from "./table-cell";
import {
  buildTableCellStyles,
  buildTableHeaderCellStyles,
  buildTableRowStyles,
} from "./table-elements";

export type LeafNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  attributes: Record<string, string>;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
  insertSiblingAfter: (
    id: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
};

const DEFAULT_FONT_FAMILY = "Ubuntu, Helvetica, Arial, sans-serif";

const buildMjmlStyles = (attributes: Record<string, string>): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }

  containerStyles.fontFamily = attributes["font-family"] ?? DEFAULT_FONT_FAMILY;

  return { containerStyles };
};

const buildBodyStyles = (attributes: Record<string, string>): NodeStyles => {
  const containerStyles: React.CSSProperties = { width: "100%" };
  const innerStyles: React.CSSProperties = {
    width: "100%",
    maxWidth: attributes["width"] ?? "600px",
    margin: "0 auto",
  };

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }

  if (attributes["font-family"]) {
    containerStyles.fontFamily = attributes["font-family"];
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, innerStyles };
};

const NODE_STYLE_BUILDERS: Record<
  string,
  (attributes: Record<string, string>) => NodeStyles
> = {
  mjml: buildMjmlStyles,
  "mj-body": buildBodyStyles,
  "mj-accordion": buildAccordionStyles,
  "mj-accordion-element": buildAccordionElementStyles,
  "mj-accordion-title": buildTextStyles,
  "mj-accordion-text": buildTextStyles,
  "mj-carousel": buildCarouselStyles,
  "mj-carousel-image": buildImageStyles,
  "mj-section": buildSectionStyles,
  "mj-column": buildColumnStyles,
  "mj-group": buildGroupStyles,
  "mj-hero": buildHeroStyles,
  "mj-text": buildTextStyles,
  "mj-image": buildImageStyles,
  "mj-divider": buildDividerStyles,
  "mj-button": buildButtonStyles,
  "mj-navbar": buildNavbarStyles,
  "mj-navbar-link": buildTextStyles,
  "mj-raw": buildRawStyles,
  "mj-social": buildSocialStyles,
  "mj-social-element": buildSocialElementStyles,
  "mj-spacer": buildSpacerStyles,
  "mj-table": buildTableStyles,
  tr: buildTableRowStyles,
  td: buildTableCellStyles,
  th: buildTableHeaderCellStyles,
  "mj-wrapper": buildWrapperStyles,
};

const LEAF_NODE_COMPONENTS: Record<
  string,
  (props: LeafNodeProps) => React.ReactElement
> = {
  "mj-text": (props) => <MjTextNode {...props} />,
  "mj-accordion-title": (props) => <MjAccordionTitleNode {...props} />,
  "mj-accordion-text": (props) => <MjAccordionTextNode {...props} />,
  "mj-carousel-image": (props) => <MjImageNode {...props} />,
  "mj-image": (props) => <MjImageNode {...props} />,
  "mj-divider": (props) => <MjDividerNode {...props} />,
  "mj-button": (props) => <MjButtonNode {...props} />,
  "mj-navbar-link": (props) => <MjNavbarLinkNode {...props} />,
  "mj-raw": (props) => <MjRawNode {...props} />,
  "mj-social-element": (props) => <MjSocialElementNode {...props} />,
  "mj-spacer": (props) => <MjSpacerNode {...props} />,
  td: (props) => <MjTableCellNode {...props} />,
  th: (props) => <MjTableHeaderCellNode {...props} />,
};

export const getNodeStyles = (
  tagName: string,
  attributes: Record<string, string>,
): NodeStyles => {
  const builder = NODE_STYLE_BUILDERS[tagName];
  return builder ? builder(attributes) : {};
};

export const renderLeafNode = (
  tagName: string,
  props: LeafNodeProps,
): React.ReactNode => {
  const Renderer = LEAF_NODE_COMPONENTS[tagName];
  return Renderer ? Renderer(props) : null;
};
