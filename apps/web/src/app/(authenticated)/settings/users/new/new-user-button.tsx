"use client";

import { Button } from "@repo/shared-ui/components/common/button";
import { ResponsiveDialog } from "@repo/shared-ui/components/common/responsive-dialog";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { NewUserForm } from "./new-user-form";

export function NewUserButton() {
  const t = useTranslations("settings.user");

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
          <NewUserForm onFinish={() => setIsOpen(false)} />
        </div>
      </ResponsiveDialog>
    </>
  );
}
