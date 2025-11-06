import { type OrgLead } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordViewPage } from "./record-view-page";

interface LeadRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page(props: LeadRecordPageProps) {
  const params = await props.params;
  const client = await api();

  let record: OrgLead;

  try {
    const { data } = await client.get<OrgLead>(
      `${modelEndpoint}/r/${params.id}`,
      { withCredentials: true },
    );
    record = data;
  } catch (error) {
    console.log("RYAN");
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }

  return <RecordViewPage record={record} />;
}
