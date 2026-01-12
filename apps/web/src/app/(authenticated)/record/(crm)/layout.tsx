import { RecordPermissionGuard } from "@/components/record-permission-guard";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <RecordPermissionGuard>{children}</RecordPermissionGuard>;
}
