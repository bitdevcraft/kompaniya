// Re-export the EmailCampaignSendService from the email module
// This file acts as a bridge between the organization API and the email module

export { EmailCampaignSendService } from '../../../email/email-campaign-send/email-campaign-send.service';
export type {
  ContactMatchOptions,
  SendCampaignOptions,
} from '../../../email/email-campaign-send/email-campaign-send.service';
