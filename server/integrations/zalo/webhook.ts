import type { Request, Response } from "express";

export async function zaloWebhookHandler(
  req: Request,
  res: Response,
): Promise<void> {
  console.log("[ZALO] webhook received", {
    headers: req.headers,
    body: req.body,
  });

  res.status(200).json({
    success: true,
  });
}
