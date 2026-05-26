import { useState } from "react";

type Role =
  | "member"
  | "partner"
  | "tutor"
  | "finance"
  | "sbu_admin"
  | "platform_admin";

interface TopBarProps {
  role: Role;
}

export default function TopBar({ role }: TopBarProps) {
  const [selectedSBU, setSelectedSBU] = useState("SBU-001");

  const sbuOptions = ["SBU-001", "SBU-002", "SBU-003"];

  return (
    <div
      style={{
        background: "#1E293B",
        padding: "16px",
        borderBottom: "1px solid #475569",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: "12px", color: "#94A3B8" }}>
          Governance Console
        </div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
          {role.toUpperCase()}
        </div>
      </div>

      <div>
        <label
          style={{ fontSize: "12px", color: "#CBD5E1", marginRight: "8px" }}
        >
          Active SBU
        </label>

        <select
          value={selectedSBU}
          onChange={(e) => setSelectedSBU(e.target.value)}
        >
          {sbuOptions.map((sbu) => (
            <option key={sbu} value={sbu}>
              {sbu}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
