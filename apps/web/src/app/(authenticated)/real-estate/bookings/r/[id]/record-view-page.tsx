"use client";

import type { OrgRealEstateBooking } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";

import type { BookingRecordFormValues } from "./booking-record-schema";

import { modelEndpoint } from "../../config";
import { bookingRecordLayout } from "./booking-record-layout";
import {
  bookingRecordSchema,
  createBookingFormDefaults,
  createBookingUpdatePayload,
} from "./booking-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgRealEstateBooking;

  recordId: string;
}

const bookingRecordQueryKey = (recordId: string) =>
  ["booking-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => bookingRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchBookingRecord(recordId),
    initialData: initialRecord,
    retry: false,
  });

  useEffect(() => {
    const isNotFoundError =
      !isLoading &&
      axios.isAxiosError(error) &&
      error?.response?.status === 404;

    if (isNotFoundError) {
      router.replace("/404");
    }
  }, [error, isLoading, router]);

  const formDefaults = useMemo(
    () =>
      record
        ? createBookingFormDefaults(record, bookingRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<BookingRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(bookingRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createBookingFormDefaults(record, bookingRecordLayout));
    }
  }, [form, record]);

  const updateBooking = useMutation({
    mutationFn: (payload: Partial<OrgRealEstateBooking>) =>
      updateBookingRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createBookingFormDefaults(updated, bookingRecordLayout));
      setIsEditing(false);
      toast.success("Booking updated");
    },
    onError: () => {
      toast.error("We couldn't save your changes. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!record) return;

    const parsed = bookingRecordSchema.parse(values);
    const payload = createBookingUpdatePayload(
      record,
      parsed,
      bookingRecordLayout,
    );

    try {
      await updateBooking.mutateAsync(payload);
    } catch (_error) {
      // handled by mutation onError
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-destructive">
        Unable to load this booking record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateBooking.isPending}
            onClick={() => {
              form.reset(
                createBookingFormDefaults(record, bookingRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateBooking.isPending} type="submit">
            {updateBooking.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </>
      ) : (
        <Button onClick={() => setIsEditing(true)} type="button">
          Edit record
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link
            className="inline-flex items-center gap-2"
            href="/real-estate/bookings"
          >
            <ArrowLeft className="size-4" />
            Back to bookings
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={bookingRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchBookingRecord(recordId: string) {
  const { data } = await axios.get<OrgRealEstateBooking>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateBookingRecord(
  recordId: string,
  payload: Partial<OrgRealEstateBooking>,
) {
  const { data } = await axios.patch<OrgRealEstateBooking>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
