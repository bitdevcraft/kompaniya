import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/shared-ui/components/common/card";

import { NewRecordForm } from "./new-form";

export default function Page() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>New Template</CardHeader>
        <CardContent>
          <NewRecordForm />
        </CardContent>
      </Card>
    </div>
  );
}
