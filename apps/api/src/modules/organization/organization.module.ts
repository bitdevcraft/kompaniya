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
import { RealEstateBookingModule } from './real-estate-booking/real-estate-booking.module';
import { RealEstatePaymentPlanModule } from './real-estate-payment-plan/real-estate-payment-plan.module';
import { RealEstateProjectModule } from './real-estate-project/real-estate-project.module';
import { RealEstatePropertyModule } from './real-estate-property/real-estate-property.module';
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
    RealEstateProjectModule,
    RealEstatePropertyModule,
    RealEstateBookingModule,
    RealEstatePaymentPlanModule,
  ],
})
export class OrganizationModule {}
