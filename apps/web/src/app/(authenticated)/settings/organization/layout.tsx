import { NavigationTabs } from "./_components/navigation-tabs";

export default async function OrganizationSettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-8">
      <NavigationTabs />
      {children}
    </div>
  );
}
