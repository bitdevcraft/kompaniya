import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'node:util';
import MessageValidator from 'sns-validator';

interface SnsMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  SubscribeURL?: string;
  UnsubscribeURL?: string;
  Message: string;
}

type ValidateFunction = (
  message: unknown,
  callback: (err: Error | null, message: SnsMessage) => void,
) => void;

@Injectable()
export class SnsSignatureVerifierService {
  private readonly logger = new Logger(SnsSignatureVerifierService.name);

  // The validator instance - promisify the callback-based API
  private readonly validate = promisify(
    new MessageValidator().validate.bind(
      new MessageValidator(),
    ) as ValidateFunction,
  );

  /**
   * Verify SNS message signature using AWS sns-validator package
   * @param rawBody - The raw JSON string from the request body
   * @returns Promise<boolean> - true if signature is valid, false otherwise
   */
  async verifySignature(rawBody: string): Promise<boolean> {
    try {
      // Parse the raw body to get the message object
      const message = JSON.parse(rawBody) as SnsMessage;

      this.logger.debug(
        `Verifying SNS signature for message: ${message.MessageId}, Type: ${message.Type}`,
      );

      // Use sns-validator to verify the signature
      // The validator checks SigningCertURL, SignatureVersion, and Signature
      await this.validate(message);

      this.logger.debug(
        `SNS signature verified successfully for message: ${message.MessageId}`,
      );

      return true;
    } catch (error) {
      this.logger.warn('SNS signature verification failed', {
        error: (error as Error).message,
      });
      return false;
    }
  }
}
