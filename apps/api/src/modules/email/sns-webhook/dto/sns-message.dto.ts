import { z } from 'zod';

// Base SNS Message schema
const snsMessageSchemaBase = z.object({
  Type: z.enum([
    'Notification',
    'SubscriptionConfirmation',
    'UnsubscribeConfirmation',
  ]),
  MessageId: z.string(),
  TopicArn: z.string(),
  Subject: z.string().optional(),
  Timestamp: z.string(),
  SignatureVersion: z.string(),
  Signature: z.string(),
  SigningCertURL: z.string().url(),
  UnsubscribeURL: z.string().url().optional(),
});

// SES Mail object schema
const sesMailSchema = z.object({
  messageId: z.string(),
  timestamp: z.string(),
  source: z.string().optional(),
  sourceArn: z.string().optional(),
  sendingAccountId: z.string().optional(),
  destination: z.array(z.string()).optional(),
  // AWS sends tags as {key: [values]} object, not array of objects
  tags: z.record(z.string(), z.array(z.string())).optional(),
});

// Bounce event schema
const sesBounceSchema = z.object({
  bounceType: z.enum(['Undetermined', 'Soft', 'Hard']),
  bounceSubType: z.string().optional(),
  bouncedRecipients: z
    .array(
      z.object({
        emailAddress: z.string(),
        status: z.string().optional(),
        diagnosticCode: z.string().optional(),
      }),
    )
    .optional(),
  feedbackId: z.string(),
  timestamp: z.string(),
  reportingMTA: z.string().optional(),
});

// Complaint event schema
const sesComplaintSchema = z.object({
  complainedRecipients: z
    .array(
      z.object({
        emailAddress: z.string(),
      }),
    )
    .optional(),
  timestamp: z.string(),
  feedbackId: z.string(),
  complaintFeedbackType: z.string().optional(),
  complaintFeedbackSubType: z.string().optional(),
  arrivalDate: z.string().optional(),
  userAgent: z.string().optional(),
});

// Delivery event schema
const sesDeliverySchema = z.object({
  recipients: z.array(z.string()).optional(),
  processingTimeMillis: z.number().optional(),
  timestamp: z.string(),
  reportingMTA: z.string().optional(),
  smtpResponse: z.string().optional(),
});

// Send event schema
// AWS may send an empty object {} for send events, so all fields are optional
const sesSendSchema = z.object({
  timestamp: z.string().optional(),
  sendingAccountId: z.string().optional(),
  recipientCount: z.number().optional(),
});

// Reject event schema
const sesRejectSchema = z.object({
  reason: z.string(),
  timestamp: z.string(),
});

// Open event schema
const sesOpenSchema = z.object({
  timestamp: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Click event schema
const sesClickSchema = z.object({
  link: z.string(),
  linkTags: z.array(z.string()).optional(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
});

// Rendering Failure event schema
const sesRenderingFailureSchema = z.object({
  errorMessage: z.string(),
  templateName: z.string().optional(),
  timestamp: z.string(),
});

// Delivery Delay event schema
const sesDeliveryDelaySchema = z.object({
  delayType: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  delaySeconds: z.number().optional(),
  timestamp: z.string(),
});

// SES Event common base
const sesEventCommon = z.object({
  eventType: z.string(),
  mail: sesMailSchema,
});

// Individual SES event schemas
const bounceEventSchema = sesEventCommon.extend({
  eventType: z.literal('Bounce'),
  bounce: sesBounceSchema,
});

const complaintEventSchema = sesEventCommon.extend({
  eventType: z.literal('Complaint'),
  complaint: sesComplaintSchema,
});

const deliveryEventSchema = sesEventCommon.extend({
  eventType: z.literal('Delivery'),
  delivery: sesDeliverySchema,
});

const sendEventSchema = sesEventCommon.extend({
  eventType: z.literal('Send'),
  send: sesSendSchema,
});

const rejectEventSchema = sesEventCommon.extend({
  eventType: z.literal('Reject'),
  reject: sesRejectSchema,
});

const openEventSchema = sesEventCommon.extend({
  eventType: z.literal('Open'),
  open: sesOpenSchema,
});

const clickEventSchema = sesEventCommon.extend({
  eventType: z.literal('Click'),
  click: sesClickSchema,
});

const renderingFailureEventSchema = sesEventCommon.extend({
  eventType: z.literal('Rendering Failure'),
  failure: sesRenderingFailureSchema,
});

const deliveryDelayEventSchema = sesEventCommon.extend({
  eventType: z.literal('Delivery Delay'),
  deliveryDelay: sesDeliveryDelaySchema,
});

// Union of all SES event types
const sesEventSchema = z.discriminatedUnion('eventType', [
  bounceEventSchema,
  complaintEventSchema,
  deliveryEventSchema,
  sendEventSchema,
  rejectEventSchema,
  openEventSchema,
  clickEventSchema,
  renderingFailureEventSchema,
  deliveryDelayEventSchema,
]);

// SNS Message with parsed SES event (Type must be 'Notification' to avoid duplicate discriminator)
const snsMessageWithSesEventSchema = snsMessageSchemaBase.extend({
  Type: z.literal('Notification'),
  Message: z
    .string()
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as z.output<typeof sesEventSchema>;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Message must be valid JSON',
        });
        return z.NEVER;
      }
    })
    .pipe(sesEventSchema),
});

// SNS Message for subscription confirmation (Message is not JSON)
const snsSubscriptionConfirmationSchema = snsMessageSchemaBase.extend({
  Type: z.literal('SubscriptionConfirmation'),
  SubscribeURL: z.string().url(),
  Message: z.string(),
});

// SNS Message for unsubscribe confirmation
const snsUnsubscribeConfirmationSchema = snsMessageSchemaBase.extend({
  Type: z.literal('UnsubscribeConfirmation'),
  Message: z.string(),
});

// Combined SNS message schema (handles all message types)
export const snsMessageSchema = z.discriminatedUnion('Type', [
  snsSubscriptionConfirmationSchema,
  snsUnsubscribeConfirmationSchema,
  snsMessageWithSesEventSchema,
]);

export type SesEventType = z.infer<typeof sesEventSchema>;
// Type exports
export type SnsMessageType = z.infer<typeof snsMessageSchema>;
export type SnsNotificationMessage = z.infer<
  typeof snsMessageWithSesEventSchema
>;
export type SnsSubscriptionConfirmationMessage = z.infer<
  typeof snsSubscriptionConfirmationSchema
>;

export type SnsUnsubscribeConfirmationMessage = z.infer<
  typeof snsUnsubscribeConfirmationSchema
>;
