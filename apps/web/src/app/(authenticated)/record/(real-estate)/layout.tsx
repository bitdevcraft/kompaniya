import { RecordPermissionGuard } from "@/components/record-permission-guard";

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecordPermissionGuard>{children}</RecordPermissionGuard>;
}
