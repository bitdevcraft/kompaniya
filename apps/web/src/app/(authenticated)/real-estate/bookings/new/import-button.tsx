import { Button } from "@repo/shared-ui/components/common/button";
import { useRouter } from "next/navigation";

export function ImportButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/settings/data-importer")}
      size={"sm"}
      variant={"outline"}
    >
      Import
    </Button>
  );
}
