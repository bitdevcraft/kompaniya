"use client";

import { Button } from "@repo/shared-ui/components/common/button";
import { ResponsiveDialog } from "@repo/shared-ui/components/common/responsive-dialog";
import { Plus } from "lucide-react";
import React from "react";

import { NewRecordForm } from "./new-form";

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
        <div>
          <NewRecordForm onFinish={() => setIsOpen(false)} />
        </div>
      </ResponsiveDialog>
    </>
  );
}
