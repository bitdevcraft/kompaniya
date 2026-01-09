import { notFound } from "next/navigation";

import { getEntityConfig } from "../config";
import { EntityDetail } from "./entity-detail";

interface PageProps {
  params: Promise<{ entity: string }>;
}

export default async function EntityDetailPage(props: PageProps) {
  const params = await props.params;
  const entity = getEntityConfig(params.entity);

  if (!entity) {
    notFound();
  }

  return <EntityDetail entity={entity} />;
}
