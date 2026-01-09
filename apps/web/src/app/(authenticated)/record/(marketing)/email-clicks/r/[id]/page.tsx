import { type OrgEmailClick } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordViewPage } from "./record-view-page";

interface EmailClickRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: EmailClickRecordPageProps) {
  const { id } = await params;
  const client = await api();
  let record: OrgEmailClick;

  try {
    const { data } = await client.get<OrgEmailClick>(
      `${modelEndpoint}/r/${id}`,
      {
        withCredentials: true,
      },
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
