import { Module } from '@nestjs/common';

import { AccountModule } from './api/account/account.module';
import { ActivityModule } from './api/activity/activity.module';
import { CategoryModule } from './api/category/category.module';
import { ContactModule } from './api/contact/contact.module';
import { DomainModule } from './api/domain/domain.module';
import { EmailCampaignModule } from './api/email-campaign/email-campaign.module';
import { EmailTemplateModule } from './api/email-template/email-template.module';
import { EmailTestReceiverModule } from './api/email-test-receiver/email-test-receiver.module';
import { LeadModule } from './api/lead/lead.module';
import { OpportunityModule } from './api/opportunity/opportunity.module';
import { RealEstateBookingModule } from './api/real-estate-booking/real-estate-booking.module';
import { RealEstatePaymentPlanModule } from './api/real-estate-payment-plan/real-estate-payment-plan.module';
import { RealEstateProjectModule } from './api/real-estate-project/real-estate-project.module';
import { RealEstatePropertyModule } from './api/real-estate-property/real-estate-property.module';
import { SystemAdminModule } from './api/system-admin/system-admin.module';

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
