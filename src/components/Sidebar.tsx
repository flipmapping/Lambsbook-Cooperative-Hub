type Role =
  | "member"
  | "partner"
  | "tutor"
  | "finance"
  | "sbu_admin"
  | "platform_admin";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <div
      style={{
        width: "220px",
        background: "#1E293B",
        color: "white",
        padding: "16px",
      }}
    >
      <h3>Sidebar</h3>
      <p>Role: {role}</p>
    </div>
  );
}
