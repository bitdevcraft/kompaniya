import { type OrgContact } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordViewPage } from "./record-view-page";

interface ContactRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: ContactRecordPageProps) {
  const { id } = await params;
  const client = await api();
  let record: OrgContact;

  try {
    const { data } = await client.get<OrgContact>(`${modelEndpoint}/r/${id}`, {
      withCredentials: true,
    });
    record = data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }

  return <RecordViewPage initialRecord={record} recordId={id} />;
}
