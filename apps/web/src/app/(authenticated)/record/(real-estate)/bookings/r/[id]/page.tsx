import { type OrgRealEstateBooking } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordViewPage } from "./record-view-page";

interface BookingRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: BookingRecordPageProps) {
  const { id } = await params;
  const client = await api();
  let record: OrgRealEstateBooking;

  try {
    const { data } = await client.get<OrgRealEstateBooking>(
      `${modelEndpoint}/r/${id}`,
    );
    record = data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }

  return <RecordViewPage initialRecord={record} recordId={id} />;
}
