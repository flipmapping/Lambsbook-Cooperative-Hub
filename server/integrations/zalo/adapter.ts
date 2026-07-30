import {
  MessagingProvider,
  DeliveryResult,
} from "../../messaging/interface";

export class ZaloAdapter implements MessagingProvider {
  async sendTextMessage(
    recipientId: string,
    message: string,
  ): Promise<DeliveryResult> {
    console.log("[ZALO] sendTextMessage", {
      recipientId,
      message,
    });

    return {
      success: true,
    };
  }
}

export const zaloAdapter = new ZaloAdapter();
