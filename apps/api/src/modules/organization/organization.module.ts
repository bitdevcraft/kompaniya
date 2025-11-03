import { Module } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { ActivityModule } from './activity/activity.module';
import { CategoryModule } from './category/category.module';
import { ContactModule } from './contact/contact.module';
import { DomainModule } from './domain/domain.module';
import { EmailCampaignModule } from './email-campaign/email-campaign.module';
import { EmailTemplateModule } from './email-template/email-template.module';
import { EmailTestReceiverModule } from './email-test-receiver/email-test-receiver.module';
import { LeadModule } from './lead/lead.module';
import { OpportunityModule } from './opportunity/opportunity.module';
import { SystemAdminModule } from './system-admin/system-admin.module';

@Module({
  imports: [
    SystemAdminModule,
    DomainModule,
    AccountModule,
    ActivityModule,
    CategoryModule,
    ContactModule,
    EmailCampaignModule,
    EmailTemplateModule,
    EmailTestReceiverModule,
    LeadModule,
    OpportunityModule,
  ],
})
export class OrganizationModule {}
