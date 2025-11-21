import { RecordViewPage } from "./record-view-page";

interface LeadRecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: LeadRecordPageProps) {
  const { id } = await params;

  return <RecordViewPage recordId={id} />;
}
