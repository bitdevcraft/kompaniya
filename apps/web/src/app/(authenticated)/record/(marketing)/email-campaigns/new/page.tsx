import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";

import { NewRecordForm } from "./new-form";

export default function Page() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <NewRecordForm />
        </CardContent>
      </Card>
    </div>
  );
}
