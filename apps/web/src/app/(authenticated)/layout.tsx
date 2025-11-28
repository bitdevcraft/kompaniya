import { Separator } from "@kompaniya/ui-common/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@kompaniya/ui-common/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderBreadcrumb } from "@/components/header-breadcrumb";
import { ThemeModeToggle } from "@/components/theme/theme-mode-toggle";
import { getUser } from "@/server/get-session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUser();

  if (!session) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className="min-h-screen min-w-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                className="mr-2 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <HeaderBreadcrumb />
            </div>
            <div className="px-4">
              <ThemeModeToggle />
            </div>
          </header>
          <div className="px-6">
            <div className="flex flex-1 flex-col relative">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="relative z-10">{children}</div>
                <div>
                  <div className="pointer-events-none fixed inset-0">
                    <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
