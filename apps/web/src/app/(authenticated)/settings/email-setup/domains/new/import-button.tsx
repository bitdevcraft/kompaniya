"use client";

import { Button } from "@kompaniya/ui-common/components/button";

export function ImportButton() {
  return (
    <Button asChild size={"sm"} variant={"outline"}>
      <a href="/settings/data-importer">Import</a>
    </Button>
  );
}
