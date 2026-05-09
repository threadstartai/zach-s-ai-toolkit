import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DashboardTopBar = () => {
  const { user, signOut } = useAuth();
  const display = user?.user_metadata?.display_name || user?.email || "You";

  return (
    <header className="bg-background border-b border-[hsl(var(--border))]">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-foreground/70 hidden sm:inline">{display}</span>
          <button
            onClick={() => { void signOut(); window.location.assign("/"); }}
            className="text-[13px] text-navy/80 hover:text-navy hover:underline transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
