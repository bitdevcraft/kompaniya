import { mjAccordionAttributeGroups } from "./mj-accordion";
import { mjButtonAttributeGroups } from "./mj-button";
import { mjCarouselAttributeGroups } from "./mj-carousel";
import { mjColumnAttributeGroups } from "./mj-column";
import { mjDividerAttributeGroups } from "./mj-divider";
import { mjGroupAttributeGroups } from "./mj-group";
import {
  mjAllAttributeGroups,
  mjBreakpointAttributeGroups,
  mjClassAttributeGroups,
  mjFontAttributeGroups,
  mjHtmlAttributeAttributeGroups,
  mjSelectorAttributeGroups,
  mjStyleAttributeGroups,
} from "./mj-head";
import { mjHeroAttributeGroups } from "./mj-hero";
import { mjImageAttributeGroups } from "./mj-image";
import { mjNavbarAttributeGroups } from "./mj-navbar";
import { mjNavbarLinkAttributeGroups } from "./mj-navbar-link";
import { mjRawAttributeGroups } from "./mj-raw";
import { mjSectionAttributeGroups } from "./mj-section";
import { mjSocialAttributeGroups } from "./mj-social";
import { mjSocialElementAttributeGroups } from "./mj-social-element";
import { mjSpacerAttributeGroups } from "./mj-spacer";
import { mjTableAttributeGroups } from "./mj-table";
import { mjTextAttributeGroups } from "./mj-text";
import { mjWrapperAttributeGroups } from "./mj-wrapper";
import {
  tableCellAttributeGroups,
  tableRowAttributeGroups,
} from "./table-elements";
import { AttributeGroups } from "./types";

export const ATTRIBUTE_GROUPS: AttributeGroups = {
  "mj-all": mjAllAttributeGroups,
  "mj-accordion": mjAccordionAttributeGroups,
  "mj-accordion-title": mjTextAttributeGroups,
  "mj-accordion-text": mjTextAttributeGroups,
  "mj-breakpoint": mjBreakpointAttributeGroups,
  "mj-carousel-image": mjImageAttributeGroups,
  "mj-class": mjClassAttributeGroups,
  "mj-section": mjSectionAttributeGroups,
  "mj-text": mjTextAttributeGroups,
  "mj-column": mjColumnAttributeGroups,
  "mj-image": mjImageAttributeGroups,
  "mj-divider": mjDividerAttributeGroups,
  "mj-button": mjButtonAttributeGroups,
  "mj-carousel": mjCarouselAttributeGroups,
  "mj-font": mjFontAttributeGroups,
  "mj-group": mjGroupAttributeGroups,
  "mj-hero": mjHeroAttributeGroups,
  "mj-html-attribute": mjHtmlAttributeAttributeGroups,
  "mj-navbar": mjNavbarAttributeGroups,
  "mj-navbar-link": mjNavbarLinkAttributeGroups,
  "mj-raw": mjRawAttributeGroups,
  "mj-selector": mjSelectorAttributeGroups,
  "mj-social": mjSocialAttributeGroups,
  "mj-social-element": mjSocialElementAttributeGroups,
  "mj-spacer": mjSpacerAttributeGroups,
  "mj-style": mjStyleAttributeGroups,
  "mj-table": mjTableAttributeGroups,
  tr: tableRowAttributeGroups,
  td: tableCellAttributeGroups,
  th: tableCellAttributeGroups,
  "mj-wrapper": mjWrapperAttributeGroups,
};

export * from "./types";
