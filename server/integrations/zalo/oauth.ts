import type { Request, Response } from "express";

export async function zaloOAuthCallbackHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, state } = req.query;

  console.log("[ZALO] oauth callback", {
    code,
    state,
  });

  res.status(200).json({
    success: true,
    code,
    state,
  });
}
