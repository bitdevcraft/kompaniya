export type EmailDomainDnsRecord = {
  type: EmailDomainDnsRecordType;
  name: string;
  value: string;
  priority?: number;
};

export type EmailDomainDnsRecordType = 'CNAME' | 'MX' | 'TXT';

export type EmailDomainMetadata = {
  dnsRecords?: EmailDomainDnsRecord[];
  dkimTokens?: string[];
  mailFromDomain?: string;
};
