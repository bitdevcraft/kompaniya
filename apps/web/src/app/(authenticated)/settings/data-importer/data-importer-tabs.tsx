"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@kompaniya/ui-common/components/dialog";
import { ScrollArea } from "@kompaniya/ui-common/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { useState } from "react";

import { ImportJobDetailWrapper } from "./import-job-detail";
import { ImportJobsList } from "./import-jobs-list";
import CsvImporter from "./importer";

type Tab = "import" | "history";

export function DataImporterTabs() {
  const [tab, setTab] = useState<Tab>("import");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleImportSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTab("history");
  };

  return (
    <>
      <Tabs onValueChange={(value) => setTab(value as Tab)} value={tab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="import">New Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="import">
          <CsvImporter
            key={`import-${refreshKey}`}
            onImportSuccess={handleImportSuccess}
          />
        </TabsContent>

        <TabsContent className="mt-4" value="history">
          <ImportJobsList
            key={`history-${refreshKey}`}
            onSelectJob={handleSelectJob}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        onOpenChange={(open) => !open && setSelectedJobId(null)}
        open={!!selectedJobId}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Import Job Details</DialogTitle>
            <DialogDescription>
              View the status and results of your CSV import
            </DialogDescription>
          </DialogHeader>
          {selectedJobId && (
            <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
              <ImportJobDetailWrapper jobId={selectedJobId} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
