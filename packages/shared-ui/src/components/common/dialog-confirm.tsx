"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

type ConfirmDialogProps = {
  children?: React.ReactNode;
  description?: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
  onCancel?: () => void; // trigger element
  onConfirm: () => void | Promise<void>;
  setIsOpen: (open: boolean) => void;
  title: React.ReactNode;
};

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  children,
  loading = false,
  isOpen,
  setIsOpen,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    setIsOpen(false);
  };

  return (
    <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {loading ? "Working..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
