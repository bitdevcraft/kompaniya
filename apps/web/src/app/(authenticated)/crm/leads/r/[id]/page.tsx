import { RecordViewPage } from "./record-view-page";

interface LeadRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page(props: LeadRecordPageProps) {
  const params = await props.params;

  return <RecordViewPage recordId={params.id} />;
}
