"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@kompaniya/ui-common/components/sidebar";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Mail,
  Map,
  PieChart,
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
    avatar: "",
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
          url: "/record/leads",
        },
        {
          title: "Accounts",
          url: "/record/accounts",
        },
        {
          title: "Contacts",
          url: "/record/contacts",
        },
        {
          title: "Opportunities",
          url: "/record/opportunities",
        },
        {
          title: "Activities",
          url: "/record/activities",
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
          url: "/record/projects",
        },
        {
          title: "Properties",
          url: "/record/properties",
        },
        {
          title: "Bookings",
          url: "/record/bookings",
        },
        {
          title: "Payment Plans",
          url: "/record/payment-plans",
        },
        {
          title: "Payment Plan Templates",
          url: "/record/payment-plan-templates",
        },
      ],
    },
    {
      title: "Email Marketing",
      url: "#",
      icon: Mail,
      isActive: true,
      items: [
        {
          title: "Campaign",
          url: "/record/email-campaigns",
        },
        {
          title: "Template",
          url: "/record/email-templates",
        },
        {
          title: "Test Receivers",
          url: "/record/email-test-receivers",
        },
      ],
    },
  ],
  navSettings: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: false,
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
          title: "Entity Manager",
          url: "/settings/entity-manager",
        },
        {
          title: "Tags",
          url: "/settings/tags",
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
    <Sidebar collapsible="icon" {...props} className="border-none">
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
