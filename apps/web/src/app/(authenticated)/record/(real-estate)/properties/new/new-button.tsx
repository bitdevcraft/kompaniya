"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { ResponsiveDialog } from "@kompaniya/ui-common/components/responsive-dialog";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { dictTranslation } from "../config";
import { NewRecordForm } from "./new-form";

export function NewButton() {
  const t = useTranslations(dictTranslation);

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
        New
      </Button>

      <ResponsiveDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={t("form.new.title")}
      >
        <div>
          <NewRecordForm onFinish={() => setIsOpen(false)} />
        </div>
      </ResponsiveDialog>
    </>
  );
}
