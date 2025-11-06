import { type OrgLead } from "@repo/database/schema";
import {
  Avatar,
  AvatarFallback,
} from "@repo/shared-ui/components/common/avatar";
import { Badge } from "@repo/shared-ui/components/common/badge";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import { Separator } from "@repo/shared-ui/components/common/separator";
import { ArrowLeft, Award, Globe2, Mail, Phone, Tags } from "lucide-react";
import Link from "next/link";

import {
  buildDisplayName,
  formatDateTime,
  formatScore,
  getInitials,
  InfoChip,
  RecordField,
  renderLink,
  TagList,
} from "@/components/record-page";
interface RecordViewPageProps {
  record: OrgLead;
}

export function RecordViewPage({ record }: RecordViewPageProps) {
  const displayName = buildDisplayName(record, "Unnamed lead");
  const initials = getInitials(displayName);

  const createdAt = formatDateTime(record.createdAt);
  const updatedAt = formatDateTime(record.updatedAt);
  const lastActivityAt = formatDateTime(record.lastActivityAt);
  const nextActivityAt = formatDateTime(record.nextActivityAt);
  const score = formatScore(record.score);

  return (
    <div className="space-y-6 pb-10">
      <Button asChild className="w-fit px-0 text-sm" variant="ghost">
        <Link className="flex items-center gap-2" href="/crm/leads">
          <ArrowLeft className="size-4" />
          Back to leads
        </Link>
      </Button>

      <Card>
        <CardHeader className="gap-6 md:flex md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">
                {displayName}
              </CardTitle>
              <CardDescription>
                <div className="flex flex-col gap-2 text-sm text-foreground/90 md:flex-row md:flex-wrap md:items-center md:gap-4">
                  <InfoChip
                    icon={Mail}
                    label={record.email}
                    linkType="mailto"
                  />
                  <InfoChip
                    icon={Phone}
                    label={record.phone ?? record.phoneE164}
                    linkType="tel"
                  />
                  <InfoChip icon={Globe2} label={record.nationality} />
                </div>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-end">
            {createdAt && <span>Created {createdAt}</span>}
            {updatedAt && <span>Last updated {updatedAt}</span>}
            {score && (
              <Badge className="self-stretch md:self-end" variant="secondary">
                <Award className="size-3" /> Score {score}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-wrap gap-6">
            <TagList icon={Tags} label="Tags" values={record.tags} />
            <TagList
              icon={Tags}
              label="Categories"
              values={record.categories}
            />
          </div>
          {record.notes && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
              {record.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead details</CardTitle>
              <CardDescription>
                Fundamental information captured for this lead.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <RecordField label="Full name" value={displayName} />
              <RecordField label="Salutation" value={record.salutation} />
              <RecordField
                label="Email"
                value={renderLink(record.email, `mailto:${record.email}`)}
              />
              <RecordField
                label="Phone"
                value={renderLink(
                  record.phone ?? record.phoneE164,
                  `tel:${record.phone ?? record.phoneE164}`,
                )}
              />
              <RecordField label="Nationality" value={record.nationality} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement timeline</CardTitle>
              <CardDescription>
                Understand recent and upcoming activity with this lead.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <RecordField label="Last activity" value={lastActivityAt} />
              <RecordField label="Next activity" value={nextActivityAt} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record history</CardTitle>
              <CardDescription>
                Audit trail for how this lead has evolved.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <RecordField label="Score" value={score} />
              <RecordField label="Created at" value={createdAt} />
              <RecordField label="Last updated" value={updatedAt} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
