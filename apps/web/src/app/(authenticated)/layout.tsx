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
    <div className="min-h-screen min-w-full relative">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="w-full bg-sidebar rounded-md pb-4">
          <SidebarInset className="bg-background">
            <header className="w-full sticky top-0 bg-sidebar z-40 border-b">
              <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between bg-background mt-4">
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
              </div>
            </header>

            <div className="pt-6 md:p-4">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
