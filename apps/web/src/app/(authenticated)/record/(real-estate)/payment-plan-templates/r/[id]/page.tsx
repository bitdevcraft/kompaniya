import { type OrgPaymentPlanTemplate } from "@repo/database/schema";
import axios from "axios";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";

import { modelEndpoint } from "../../config";
import { RecordView } from "./record-view";

interface PaymentPlanTemplateRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({
  params,
}: PaymentPlanTemplateRecordPageProps) {
  const { id } = await params;
  const client = await api();
  let record: OrgPaymentPlanTemplate;

  try {
    const { data } = await client.get<OrgPaymentPlanTemplate>(
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

  return <RecordView record={record} />;
}
