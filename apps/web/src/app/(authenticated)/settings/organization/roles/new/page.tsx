import { NewRoleForm } from "./new-role-form";

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Role</h1>
        <p className="text-muted-foreground">
          Create a custom role with specific permissions for your organization.
        </p>
      </div>
      <NewRoleForm />
    </div>
  );
}
