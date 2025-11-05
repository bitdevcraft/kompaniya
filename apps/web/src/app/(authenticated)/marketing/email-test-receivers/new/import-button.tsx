import { Button } from "@repo/shared-ui/components/common/button";

export function ImportButton() {
  return (
    <Button size={"sm"} variant={"outline"}>
      <a href="/settings/data-importer">Import</a>
    </Button>
  );
}
