"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/shared-ui/components/common/sidebar";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  SendHorizonal,
  Settings2,
  Users2,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import { NavCompanyHeader } from "./nav-company-header";
import { NavSettings } from "./nav-settings";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "CRM",
      url: "#",
      icon: Users2,
      isActive: true,
      items: [
        {
          title: "Leads",
          url: "#",
        },
        {
          title: "Accounts",
          url: "#",
        },
        {
          title: "Contacts",
          url: "#",
        },
        {
          title: "Opportunities",
          url: "#",
        },
        {
          title: "Activities",
          url: "#",
        },
      ],
    },

    {
      title: "Real Estate",
      url: "#",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Projects",
          url: "#",
        },
        {
          title: "Properties",
          url: "#",
        },
        {
          title: "Bookings",
          url: "#",
        },
        {
          title: "Payment Plans",
          url: "#",
        },
      ],
    },
    {
      title: "Marketing",
      url: "#",
      icon: SendHorizonal,
      isActive: true,
      items: [
        {
          title: "Email Campaign",
          url: "#",
        },
      ],
    },
  ],
  navSettings: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Security",
          url: "/settings/security/password",
        },
        {
          title: "Organization",
          url: "/settings/organization/users",
        },
        {
          title: "Email Setup",
          url: "/settings/email-setup/domains",
        },
        {
          title: "Import Data",
          url: "/settings/data-importer",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavCompanyHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSettings items={data.navSettings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
