import { RecordPermissionGuard } from "@/components/record-permission-guard";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecordPermissionGuard>{children}</RecordPermissionGuard>;
}
