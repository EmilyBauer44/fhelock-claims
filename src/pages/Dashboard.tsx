import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header showNav />
      <Dashboard />
    </div>
  );
};

export default DashboardPage;