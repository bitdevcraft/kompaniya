"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kompaniya/ui-common/components/alert-dialog";
import { Button } from "@kompaniya/ui-common/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React from "react";

const useDeleteRecord = () => {
  return useMutation({
    mutationFn: async ({ endpoint }: { endpoint: string }) => {
      const res = await axios.delete(endpoint, { withCredentials: true });

      return res.data;
    },
  });
};

interface ConfirmDeleteDialogProps {
  title?: string;
  description?: string;
  endpoint: string;
  confirmText?: string;
  cancelText?: string;
  open: boolean;
  setIsOpen: (value: boolean) => void;
  queryKey?: string[];
}

export function ConfirmDeleteDialog({
  title = "Delete Record",
  description = "Are you sure to delete this?",
  endpoint,
  confirmText = "Proceed",
  cancelText = "Go Back",
  open,
  setIsOpen,
  queryKey,
}: ConfirmDeleteDialogProps) {
  const queryClient = useQueryClient();
  const deleteRecord = useDeleteRecord();
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const onSubmit = () => {
    deleteRecord.mutate(
      { endpoint },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            setErrorMessage(error.response?.data?.message || error.message);
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey });
        },
      },
    );
  };

  return (
    <>
      <AlertDialog onOpenChange={setIsOpen} open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              <div>{description}</div>
              <div>{errorMessage}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecord.isPending}>
              {cancelText}
            </AlertDialogCancel>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteRecord.isPending}
              onClick={(e) => {
                e.stopPropagation();
                onSubmit();
              }}
            >
              {deleteRecord.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {confirmText}
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
