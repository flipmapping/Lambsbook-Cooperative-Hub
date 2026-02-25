import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type Role =
  | "member"
  | "partner"
  | "tutor"
  | "finance"
  | "sbu_admin"
  | "platform_admin";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Temporary mock role
  const mockRole: Role = "sbu_admin";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Top Navigation */}
      <TopBar role={mockRole} />

      {/* Main Section */}
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar role={mockRole} />

        <main style={{ flex: 1, padding: "16px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}