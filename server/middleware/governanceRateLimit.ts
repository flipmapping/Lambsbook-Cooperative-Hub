import rateLimit from "express-rate-limit";

export const governanceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // max 20 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many governance requests. Please try again later.",
  },
});
