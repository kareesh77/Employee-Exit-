import Login from "./pages/Login";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  const path = window.location.pathname;

  const token = sessionStorage.getItem("access_token");
  const role = sessionStorage.getItem("userRole");

  if (path === "/hr/dashboard") {
    if (!token) {
      window.location.href = "/";
      return null;
    }

    if (role !== "admin" && role !== "hr") {
      window.location.href = "/employee/dashboard";
      return null;
    }

    return <HRDashboard />;
  }

  if (path === "/employee/dashboard") {
    if (!token) {
      window.location.href = "/";
      return null;
    }

    if (role === "admin" || role === "hr") {
      window.location.href = "/hr/dashboard";
      return null;
    }

    return <EmployeeDashboard />;
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-4">
      <Login />
    </div>
  );
}

export default App;