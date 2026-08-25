function HRDashboard() {
  const email = sessionStorage.getItem("userEmail");

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="mb-3">HR Dashboard</h1>

        <p className="text-muted">
          Welcome, {email}
        </p>

        <div className="alert alert-success">
          Login successful! You are logged in as an HR administrator.
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;