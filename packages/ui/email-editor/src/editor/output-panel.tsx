import { Accordion } from "@kompaniya/ui-common/components/accordion";

import { OutputAccordionItem } from "./output-accordion-item";

export function OutputPanel({
  jsonOutput,
  mjmlOutput,
  htmlOutput,
}: {
  jsonOutput: string;
  mjmlOutput: string;
  htmlOutput: string;
}) {
  return (
    <Accordion defaultValue={["json"]} type="multiple">
      <OutputAccordionItem
        content={jsonOutput}
        title="JSON Output"
        value="json"
      />
      <OutputAccordionItem
        content={mjmlOutput}
        title="MJML Output"
        value="mjml"
      />
      <OutputAccordionItem
        content={htmlOutput}
        title="HTML Output"
        value="html"
      />
    </Accordion>
  );
}
