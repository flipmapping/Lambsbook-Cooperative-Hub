"use client";

import { useEffect, useState } from "react";

const HUB_API_BASE = process.env.NEXT_PUBLIC_HUB_API_BASE_URL ?? "";

export default function DashboardPage() {
  const [state, setState] = useState<"loading" | "member" | "none">("loading");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sb-access-token") ?? ""
        : "";

    fetch(`${HUB_API_BASE}/api/member/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 200) {
          setState("member");
          return null;
        }

        if (res.status === 404) {
          return fetch(`${HUB_API_BASE}/api/member/pending-invitation`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json());
        }

        setState("none");
        return null;
      })
      .then((body) => {
        if (!body) return;

        if (body?.invitation?.id) {
          window.location.href = `/dashboard/invitations/${body.invitation.id}`;
        } else {
          setState("none");
        }
      })
      .catch(() => setState("none"));
  }, []);

  if (state === "loading") {
    return <p>Loading…</p>;
  }

  if (state === "member") {
    return <p>Dashboard (member)</p>;
  }

  return <p>You are not yet a member.</p>;
}