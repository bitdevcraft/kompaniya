import { type OrgContact } from "@repo/database/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/shared-ui/components/common/avatar";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import { Separator } from "@repo/shared-ui/components/common/separator";
import {
  ArrowLeft,
  BadgeCheck,
  Globe2,
  Mail,
  Phone,
  Tags,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";

import {
  BooleanField,
  buildDisplayName,
  formatDateTime,
  formatScore,
  getInitials,
  InfoChip,
  isPresent,
  RecordField,
  renderLink,
  StructuredList,
  TagList,
} from "@/components/record-page";
interface RecordViewPageProps {
  record: OrgContact;
}

export function RecordViewPage({ record }: RecordViewPageProps) {
  const displayName = buildDisplayName(record, "Unnamed contact");
  const initials = getInitials(displayName);

  const createdAt = formatDateTime(record.createdAt);
  const updatedAt = formatDateTime(record.updatedAt);
  const lastActivityAt = formatDateTime(record.lastActivityAt);
  const nextActivityAt = formatDateTime(record.nextActivityAt);
  const emailConfirmedAt = formatDateTime(record.emailConfirmedAt);
  const consentCapturedAt = formatDateTime(record.consentCapturedAt);
  const birthday = formatDateTime(record.birthday, { dateStyle: "long" });

  return (
    <div className="space-y-6 pb-10">
      <Button asChild className="w-fit px-0 text-sm" variant="ghost">
        <Link className="flex items-center gap-2" href="/crm/contacts">
          <ArrowLeft className="size-4" />
          Back to contacts
        </Link>
      </Button>

      <Card>
        <CardHeader className="gap-6 md:flex md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            <Avatar className="size-16">
              <AvatarImage
                alt={displayName}
                src={record.avatarUrl ?? undefined}
              />
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
                  <InfoChip icon={Globe2} label={record.websiteUrl} />
                  <InfoChip icon={UserCircle2} label={record.companyName} />
                </div>
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-end">
            {createdAt && <span>Created {createdAt}</span>}
            {updatedAt && <span>Last updated {updatedAt}</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-wrap gap-6">
            <TagList icon={Tags} label="Tags" values={record.tags} />
            <TagList
              icon={BadgeCheck}
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
              <CardTitle>Contact details</CardTitle>
              <CardDescription>
                Core information that helps your team understand the contact at
                a glance.
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
              <RecordField
                label="Language preference"
                value={record.languagePref}
              />
              <RecordField label="Company" value={record.companyName} />
              <RecordField
                label="Website"
                value={renderLink(record.websiteUrl)}
              />
              <RecordField
                label="LinkedIn"
                value={renderLink(record.linkedinUrl)}
              />
              <RecordField
                label="Twitter"
                value={renderLink(
                  record.twitterHandle
                    ? `@${record.twitterHandle.replace(/^@/, "")}`
                    : null,
                  record.twitterHandle
                    ? `https://twitter.com/${record.twitterHandle.replace(/^@/, "")}`
                    : undefined,
                )}
              />
              <RecordField label="Birthday" value={birthday} />
              <RecordField label="Score" value={formatScore(record.score)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement timeline</CardTitle>
              <CardDescription>
                Track the most recent interactions and upcoming touchpoints for
                this contact.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <RecordField label="Last activity" value={lastActivityAt} />
              <RecordField label="Next activity" value={nextActivityAt} />
              <RecordField label="Email confirmed" value={emailConfirmedAt} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                Shipping and billing details used for fulfillment and invoicing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <RecordField
                fallback="No shipping address on file"
                label="Shipping address"
                value={renderAddress({
                  line1: record.shippingAddressLine1,
                  line2: record.shippingAddressLine2,
                  city: record.shippingCity,
                  region: record.shippingRegion,
                  postalCode: record.shippingPostalCode,
                  country: record.shippingCountryCode,
                  latitude: record.shippingLatitude,
                  longitude: record.shippingLongitude,
                })}
              />
              <RecordField
                fallback="No billing address on file"
                label="Billing address"
                value={renderAddress({
                  line1: record.billingAddressLine1,
                  line2: record.billingAddressLine2,
                  city: record.billingCity,
                  region: record.billingRegion,
                  postalCode: record.billingPostalCode,
                  country: record.billingCountryCode,
                  latitude: record.billingLatitude,
                  longitude: record.billingLongitude,
                })}
              />
            </CardContent>
          </Card>

          {record.customFields && (
            <Card>
              <CardHeader>
                <CardTitle>Custom fields</CardTitle>
                <CardDescription>
                  Additional data captured for this contact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StructuredList
                  data={record.customFields}
                  emptyLabel="No custom fields configured"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication preferences</CardTitle>
              <CardDescription>
                Respect consent settings before reaching out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BooleanField label="Email opt-in" value={record.emailOptIn} />
              <BooleanField label="SMS opt-in" value={record.smsOptIn} />
              <BooleanField label="Phone opt-in" value={record.phoneOptIn} />
              <BooleanField
                label="Do not contact"
                tone="alert"
                value={record.doNotContact}
              />
              <BooleanField
                label="Do not sell"
                tone="alert"
                value={record.doNotSell}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent & compliance</CardTitle>
              <CardDescription>
                Keep track of when and how consent was collected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RecordField label="Consent captured" value={consentCapturedAt} />
              <RecordField
                label="Consent source"
                value={record.consentSource}
              />
              <RecordField
                label="Consent IP"
                value={record.consentIp ?? undefined}
              />
              <RecordField label="GDPR scope" value={record.gdprConsentScope} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System metadata</CardTitle>
              <CardDescription>
                Internal identifiers used to keep this record in sync.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RecordField label="Dedupe key" value={record.dedupeKey} />
              <RecordField
                fallback="No connected external systems"
                label="External IDs"
                value={
                  record.externalIds &&
                  Object.keys(record.externalIds).length > 0 ? (
                    <StructuredList data={record.externalIds} />
                  ) : null
                }
              />
              <RecordField
                fallback="No metadata stored"
                label="Metadata"
                value={
                  record.metadata &&
                  Object.keys(record.metadata as Record<string, unknown>)
                    .length > 0 ? (
                    <pre className="bg-muted/40 max-h-64 overflow-auto rounded-xl border px-3 py-2 text-xs leading-6">
                      {JSON.stringify(record.metadata, null, 2)}
                    </pre>
                  ) : null
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatCoordinate(value: unknown) {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toFixed(4);
}

function renderAddress(address: {
  city?: string | null;
  country?: string | null;
  latitude?: unknown;
  line1?: string | null;
  line2?: string | null;
  longitude?: unknown;
  postalCode?: string | null;
  region?: string | null;
}) {
  const lines = [address.line1, address.line2].filter(isPresent);
  const cityRegion = [address.city, address.region]
    .filter(isPresent)
    .join(", ");
  const postalCountry = [address.postalCode, address.country]
    .filter(isPresent)
    .join(" ");

  if (cityRegion) lines.push(cityRegion);
  if (postalCountry) lines.push(postalCountry);

  const latitude = formatCoordinate(address.latitude);
  const longitude = formatCoordinate(address.longitude);

  if (latitude && longitude) {
    lines.push(`Lat: ${latitude}, Lng: ${longitude}`);
  } else if (latitude) {
    lines.push(`Lat: ${latitude}`);
  } else if (longitude) {
    lines.push(`Lng: ${longitude}`);
  }

  if (lines.length === 0) return null;

  return (
    <div className="space-y-2 text-sm">
      <div className="whitespace-pre-line leading-6 text-foreground">
        {lines.join("\n")}
      </div>
    </div>
  );
}
