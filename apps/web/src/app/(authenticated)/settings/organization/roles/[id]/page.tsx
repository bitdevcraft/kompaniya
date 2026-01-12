import { EditRoleForm } from "./edit-role-form";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage(props: EditPageProps) {
  const params = await props.params;

  // Get active organization - this needs to be done differently for server components
  // For now, we'll pass the ID to the client component
  return <EditRoleForm roleId={params.id} />;
}
