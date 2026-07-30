export interface DeliveryResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface MessagingProvider {
  sendTextMessage(
    recipientId: string,
    message: string,
  ): Promise<DeliveryResult>;
}
