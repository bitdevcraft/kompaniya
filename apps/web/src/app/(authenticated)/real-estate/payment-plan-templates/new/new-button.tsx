"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { ResponsiveDialog } from "@kompaniya/ui-common/components/responsive-dialog";
import { ScrollArea } from "@kompaniya/ui-common/components/scroll-area";
import { Plus } from "lucide-react";
import React from "react";

export function NewButton() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        size={"sm"}
        variant={"outline"}
      >
        <Plus />
        New Template
      </Button>

      <ResponsiveDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Create New Payment Plan Template"
      >
        <ScrollArea className="max-h-[80vh]"></ScrollArea>
      </ResponsiveDialog>
    </>
  );
}
