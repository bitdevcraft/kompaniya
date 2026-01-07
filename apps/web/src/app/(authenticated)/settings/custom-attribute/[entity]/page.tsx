import { notFound } from "next/navigation";

import { getCustomAttributeEntity } from "@/app/(authenticated)/settings/custom-attributes/entity-types";

import { CustomAttributeManager } from "./custom-attribute-manager";

interface CustomAttributePageProps {
  params: Promise<{ entity: string }>;
}

export default async function Page({ params }: CustomAttributePageProps) {
  const { entity } = await params;
  const selectedEntity = getCustomAttributeEntity(entity);

  if (!selectedEntity) {
    notFound();
  }

  return <CustomAttributeManager entity={selectedEntity} />;
}
