const governanceWindowMs = 60 * 1000; // 1 minute
const maxGovernanceActions = 3;

const governanceTracker = new Map<string, number[]>();

export function governanceRateLimit(req: any, res: any, next: any) {
  const user = req.user;

  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = Date.now();
  const windowStart = now - governanceWindowMs;

  const timestamps = governanceTracker.get(user.id) || [];

  const recent = timestamps.filter(ts => ts > windowStart);

  if (recent.length >= maxGovernanceActions) {
    return res.status(429).json({
      error: "Too many governance actions. Please wait before retrying."
    });
  }

  recent.push(now);
  governanceTracker.set(user.id, recent);

  next();
}
