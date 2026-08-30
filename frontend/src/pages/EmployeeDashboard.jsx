import { useEffect, useState } from "react";
import api from "../services/api";

function EmployeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [exitRequests, setExitRequests] = useState([]);

  const [reason, setReason] = useState("");
  const [lastWorkingDate, setLastWorkingDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const userId = sessionStorage.getItem("userId");
  const email = sessionStorage.getItem("userEmail");

  useEffect(() => {
    const loadData = async () => {
      try {
        const employeeResponse = await api.get("/employees");
        const allEmployees = employeeResponse.data;

        const myEmployees = allEmployees.filter(
          (employee) => String(employee.user_id) === String(userId)
        );

        setEmployees(myEmployees);

        const exitResponse = await api.get("/exit-requests");

        const myRequests = exitResponse.data.filter((request) =>
          myEmployees.some(
            (employee) => employee.id === request.employee_id
          )
        );

        setExitRequests(myRequests);
      } catch (err) {
        console.error("Failed to load employee data:", err);
        setError("Unable to load employee data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const submitExitRequest = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (employees.length === 0) {
      setError("Employee record not found.");
      return;
    }

    if (!reason || !lastWorkingDate) {
      setError("Please enter all required fields.");
      return;
    }

    try {
      const employeeId = employees[0].id;

      const response = await api.post("/exit-requests", {
        employee_id: employeeId,
        reason: reason,
        proposed_last_working_date: lastWorkingDate,
      });

      setExitRequests((previous) => [
        ...previous,
        response.data,
      ]);

      setReason("");
      setLastWorkingDate("");

      setMessage("Exit request submitted successfully.");
    } catch (err) {
      console.error("Failed to submit exit request:", err);
      setError("Unable to submit exit request.");
    }
  };

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Employee Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome, {email}
          </p>
        </div>

        <button
          className="btn btn-outline-danger"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {loading && (
        <div className="alert alert-info">
          Loading employee information...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {!loading && employees.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h2 className="h5 mb-0">
              My Employee Details
            </h2>
          </div>

          <div className="card-body">
            <p>
              <strong>Employee Code:</strong>{" "}
              {employees[0].employee_code}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {employees[0].first_name}{" "}
              {employees[0].last_name}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {employees[0].phone || "-"}
            </p>

            <p>
              <strong>Designation:</strong>{" "}
              {employees[0].designation}
            </p>

            <p className="mb-0">
              <strong>Joining Date:</strong>{" "}
              {employees[0].joining_date}
            </p>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">
            Submit Exit Request
          </h2>
        </div>

        <div className="card-body">

          <form onSubmit={submitExitRequest}>

            <div className="mb-3">
              <label className="form-label">
                Reason for Leaving
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Enter reason for leaving"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Proposed Last Working Date
              </label>

              <input
                type="date"
                className="form-control"
                value={lastWorkingDate}
                onChange={(event) =>
                  setLastWorkingDate(event.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit Exit Request
            </button>

          </form>

        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <h2 className="h5 mb-0">
            My Exit Requests
          </h2>
        </div>

        <div className="card-body">

          {exitRequests.length === 0 ? (
            <p className="text-muted mb-0">
              No exit requests submitted yet.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-bordered table-hover">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reason</th>
                    <th>Last Working Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {exitRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.reason}</td>
                      <td>
                        {request.proposed_last_working_date}
                      </td>
                      <td>
                        <span
                          className={`badge ${request.status === "approved"
                              ? "bg-success"
                              : request.status === "rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default EmployeeDashboard;