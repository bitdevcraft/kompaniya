import { Suspense } from "react";

import { EntitiesTable } from "./entities-table";

export default function EntityManagerPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Entity Manager</h1>
        <p className="text-sm text-muted-foreground">
          Manage custom attributes and record layouts for all entities
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <EntitiesTable />
      </Suspense>
    </div>
  );
}
