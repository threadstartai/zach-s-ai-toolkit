import { Outlet } from "react-router-dom";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

const DashboardShell = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardTopBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardShell;
