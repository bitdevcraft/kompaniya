import { NavigationTabs } from "./_components/navigation-tabs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 ">
      <NavigationTabs />
      <div>{children}</div>
    </div>
  );
}
