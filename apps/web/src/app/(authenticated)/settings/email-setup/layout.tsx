import { RecordPermissionGuard } from "@/components/record-permission-guard";

import { NavigationTabs } from "./_components/navigation-tabs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecordPermissionGuard>
      <div className="grid gap-2">
        <NavigationTabs />
        <div>{children}</div>
      </div>
    </RecordPermissionGuard>
  );
}
