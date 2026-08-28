import Login from "./pages/Login";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  const path = window.location.pathname;

  if (path === "/hr/dashboard") {
    return <HRDashboard />;
  }

  if (path === "/employee/dashboard") {
    return <EmployeeDashboard />;
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-4">
      <Login />
    </div>
  );
}

export default App;