import { type OrgAccount } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordViewPage } from "./record-view-page";

interface AccountRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: AccountRecordPageProps) {
  const { id } = await params;
  const client = await api();
  let record: OrgAccount;

  try {
    const { data } = await client.get<OrgAccount>(`${modelEndpoint}/r/${id}`, {
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
