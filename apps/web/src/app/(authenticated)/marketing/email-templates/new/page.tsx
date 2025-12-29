import {
  Card,
  CardContent,
  CardHeader,
} from "@kompaniya/ui-common/components/card";

import { MjmlEditorSample } from "./mjml-editor-sample";
import { NewRecordForm } from "./new-form";

export default function Page() {
  return (
    <div className="p-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>New Template</CardHeader>
          <CardContent>
            <NewRecordForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>MJML Editor Preview</CardHeader>
          <CardContent>
            <MjmlEditorSample />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
