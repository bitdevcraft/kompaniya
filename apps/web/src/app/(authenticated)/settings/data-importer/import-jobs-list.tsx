"use client";

import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";
import { AlertTriangle, CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { env } from "@/env/client";

import { type CsvImportJob, type CsvImportJobStatus } from "./use-job-sse";

type JobsResponse = {
  jobs: CsvImportJob[];
  total: number;
};

const statusConfig: Record<
  CsvImportJobStatus,
  {
    label: string;
    icon: typeof Clock;
    color: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  queued: { label: "Queued", icon: Clock, color: "secondary" },
  processing: { label: "Processing", icon: Clock, color: "default" },
  completed: { label: "Completed", icon: CheckCircle2, color: "default" },
  failed: { label: "Failed", icon: XCircle, color: "destructive" },
  partial_success: {
    label: "Partial Success",
    icon: AlertTriangle,
    color: "outline",
  },
};

interface ImportJobsListProps {
  onSelectJob: (jobId: string) => void;
}

export function ImportJobsList({ onSelectJob }: ImportJobsListProps) {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJobIds, setActiveJobIds] = useState<Set<string>>(new Set());

  // Fetch jobs list
  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/jobs`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const result = (await response.json()) as JobsResponse;
      setData(result);

      // Track active jobs for auto-refresh
      const active = new Set(
        result.jobs
          .filter((j) => ["processing", "queued"].includes(j.status))
          .map((j) => j.id),
      );
      setActiveJobIds(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Auto-refresh when there are active jobs
    const interval = setInterval(() => {
      if (activeJobIds.size > 0) {
        fetchJobs();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobIds.size]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View status and results of your CSV imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading jobs...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View status and results of your CSV imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View status and results of your CSV imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No import jobs found. Upload a CSV to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import History</CardTitle>
        <CardDescription>
          View status and results of your CSV imports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.jobs.map((job) => {
              const config = statusConfig[job.status];
              const StatusIcon = config.icon;
              const progress = job.totalRows
                ? Math.round((job.processedRows / job.totalRows) * 100)
                : 0;

              return (
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                >
                  <TableCell>
                    <Badge variant={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.fileName || "Unknown"}</TableCell>
                  <TableCell>{formatTableLabel(job.tableId)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">
                        {job.processedRows} / {job.totalRows || "?"}
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {job.failedRows > 0 && (
                        <div className="text-xs text-destructive">
                          {job.failedRows} failed
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(job.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => onSelectJob(job.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatTableLabel(tableId: string): string {
  return tableId
    .replace(/org([A-Z])/g, " $1")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
