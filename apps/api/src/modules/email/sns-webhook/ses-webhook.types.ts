export const SES_WEBHOOK_QUEUE_NAME = 'ses-webhook';
export const SES_EVENT_JOB_NAME = 'process-ses-event';
export const SES_SUBSCRIPTION_CONFIRMATION_JOB_NAME =
  'confirm-sns-subscription';

export const sesEventTypeEnum = [
  'Send',
  'Reject',
  'Bounce',
  'Complaint',
  'Delivery',
  'Rendering Failure',
  'Delivery Delay',
  'Open',
  'Click',
] as const;

export interface SesBounce {
  bounceType: 'Undetermined' | 'Soft' | 'Hard';
  bounceSubType?: string;
  bouncedRecipients?: Array<{
    emailAddress: string;
    status?: string;
    diagnosticCode?: string;
  }>;
  feedbackId: string;
  timestamp: string;
  reportingMTA?: string;
}

export interface SesBounceEvent {
  eventType: 'Bounce';
  mail: SesMailObject;
  bounce: SesBounce;
}

export interface SesClick {
  link: string;
  linkTags?: string[];
  timestamp: string;
  userAgent?: string;
}

export interface SesClickEvent {
  eventType: 'Click';
  mail: SesMailObject;
  click: SesClick;
}

export interface SesComplaint {
  complainedRecipients: Array<{ emailAddress: string }>;
  timestamp: string;
  feedbackId: string;
  complaintFeedbackType?: string;
  complaintFeedbackSubType?: string;
  arrivalDate?: string;
  userAgent?: string;
}

export interface SesComplaintEvent {
  eventType: 'Complaint';
  mail: SesMailObject;
  complaint: SesComplaint;
}

export interface SesDelivery {
  recipients?: string[];
  processingTimeMillis?: number;
  timestamp: string;
  reportingMTA?: string;
  smtpResponse?: string;
}

export interface SesDeliveryDelay {
  delayType?: string;
  recipients?: string[];
  delaySeconds?: number;
  timestamp: string;
}

export interface SesDeliveryDelayEvent {
  eventType: 'Delivery Delay';
  mail: SesMailObject;
  deliveryDelay: SesDeliveryDelay;
}

export interface SesDeliveryEvent {
  eventType: 'Delivery';
  mail: SesMailObject;
  delivery: SesDelivery;
}

export type SesEvent =
  | SesBounceEvent
  | SesComplaintEvent
  | SesDeliveryEvent
  | SesSendEvent
  | SesRejectEvent
  | SesOpenEvent
  | SesClickEvent
  | SesRenderingFailureEvent
  | SesDeliveryDelayEvent;

export interface SesEventJobData {
  eventType: SesEventType;
  sesEvent: Record<string, unknown>;
  orgEmailId: string | null;
  messageId: string;
  timestamp: string;
}

export type SesEventType = (typeof sesEventTypeEnum)[number];

// SES Event Types based on AWS documentation
export interface SesMailObject {
  messageId: string;
  timestamp: string;
  source?: string;
  sourceArn?: string;
  sendingAccountId?: string;
  destination?: string[];
  tags?: { name: string; value: string }[];
}

export interface SesOpen {
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SesOpenEvent {
  eventType: 'Open';
  mail: SesMailObject;
  open: SesOpen;
}

export interface SesReject {
  reason: string;
  timestamp: string;
}

export interface SesRejectEvent {
  eventType: 'Reject';
  mail: SesMailObject;
  reject: SesReject;
}

export interface SesRenderingFailure {
  errorMessage: string;
  templateName?: string;
  timestamp: string;
}

export interface SesRenderingFailureEvent {
  eventType: 'Rendering Failure';
  mail: SesMailObject;
  failure: SesRenderingFailure;
}

export interface SesSend {
  timestamp: string;
  sendingAccountId?: string;
  recipientCount?: number;
}

export interface SesSendEvent {
  eventType: 'Send';
  mail: SesMailObject;
  send: SesSend;
}

export interface SubscriptionConfirmationJobData {
  subscribeUrl: string;
}
