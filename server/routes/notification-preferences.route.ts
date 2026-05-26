import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ success: true, message: "Notification preferences endpoint live" });
});

export default router;
