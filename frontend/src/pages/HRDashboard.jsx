import { useEffect, useState } from "react";
import api from "../services/api";

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [exitRequests, setExitRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [clearances, setClearances] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingExitRequests, setLoadingExitRequests] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingClearances, setLoadingClearances] = useState(true);

  const [employeeError, setEmployeeError] = useState("");
  const [exitRequestError, setExitRequestError] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [clearanceError, setClearanceError] = useState("");

  const email = sessionStorage.getItem("userEmail");

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await api.get("/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployeeError("Unable to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  // Load exit requests
  useEffect(() => {
    const loadExitRequests = async () => {
      try {
        const response = await api.get("/exit-requests");
        setExitRequests(response.data);
      } catch (error) {
        console.error("Failed to load exit requests:", error);
        setExitRequestError("Unable to load exit requests.");
      } finally {
        setLoadingExitRequests(false);
      }
    };

    loadExitRequests();
  }, []);

  // Load approvals
  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const response = await api.get("/approvals");
        setApprovals(response.data);
      } catch (error) {
        console.error("Failed to load approvals:", error);
        setApprovalError("Unable to load approvals.");
      } finally {
        setLoadingApprovals(false);
      }
    };

    loadApprovals();
  }, []);

  // Load clearances
  useEffect(() => {
    const loadClearances = async () => {
      try {
        const response = await api.get("/clearances");
        setClearances(response.data);
      } catch (error) {
        console.error("Failed to load clearances:", error);
        setClearanceError("Unable to load clearances.");
      } finally {
        setLoadingClearances(false);
      }
    };

    loadClearances();
  }, []);

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="container py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">HR Dashboard</h1>

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

      {/* Login status */}
      <div className="alert alert-success">
        You are logged in as an HR administrator.
      </div>

      {/* Employees */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Employees</h2>
        </div>

        <div className="card-body">
          {loadingEmployees && (
            <p className="text-muted">
              Loading employees...
            </p>
          )}

          {employeeError && (
            <div className="alert alert-danger">
              {employeeError}
            </div>
          )}

          {!loadingEmployees &&
            !employeeError &&
            employees.length === 0 && (
              <p className="text-muted">
                No employees found.
              </p>
            )}

          {!loadingEmployees &&
            !employeeError &&
            employees.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee Code</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Department ID</th>
                      <th>Designation</th>
                      <th>Joining Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.employee_code}</td>
                        <td>
                          {employee.first_name}{" "}
                          {employee.last_name}
                        </td>
                        <td>{employee.phone || "-"}</td>
                        <td>{employee.department_id}</td>
                        <td>{employee.designation}</td>
                        <td>{employee.joining_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* Exit Requests */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Exit Requests</h2>
        </div>

        <div className="card-body">
          {loadingExitRequests && (
            <p className="text-muted">
              Loading exit requests...
            </p>
          )}

          {exitRequestError && (
            <div className="alert alert-danger">
              {exitRequestError}
            </div>
          )}

          {!loadingExitRequests &&
            !exitRequestError &&
            exitRequests.length === 0 && (
              <p className="text-muted">
                No exit requests found.
              </p>
            )}

          {!loadingExitRequests &&
            !exitRequestError &&
            exitRequests.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee ID</th>
                      <th>Reason</th>
                      <th>Last Working Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {exitRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.employee_id}</td>
                        <td>{request.reason}</td>
                        <td>
                          {request.proposed_last_working_date}
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark">
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

      {/* Approvals */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Approvals</h2>
        </div>

        <div className="card-body">
          {loadingApprovals && (
            <p className="text-muted">
              Loading approvals...
            </p>
          )}

          {approvalError && (
            <div className="alert alert-danger">
              {approvalError}
            </div>
          )}

          {!loadingApprovals &&
            !approvalError &&
            approvals.length === 0 && (
              <p className="text-muted">
                No approvals found.
              </p>
            )}

          {!loadingApprovals &&
            !approvalError &&
            approvals.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Exit Request ID</th>
                      <th>Approved By</th>
                      <th>Status</th>
                      <th>Comments</th>
                    </tr>
                  </thead>

                  <tbody>
                    {approvals.map((approval) => (
                      <tr key={approval.id}>
                        <td>{approval.id}</td>
                        <td>{approval.exit_request_id}</td>
                        <td>{approval.approved_by ?? "-"}</td>
                        <td>
                          <span
                            className={
                              approval.status === "approved"
                                ? "badge bg-success"
                                : "badge bg-warning text-dark"
                            }
                          >
                            {approval.status}
                          </span>
                        </td>
                        <td>{approval.comments || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* Clearances */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Clearances</h2>
        </div>

        <div className="card-body">
          {loadingClearances && (
            <p className="text-muted">
              Loading clearances...
            </p>
          )}

          {clearanceError && (
            <div className="alert alert-danger">
              {clearanceError}
            </div>
          )}

          {!loadingClearances &&
            !clearanceError &&
            clearances.length === 0 && (
              <p className="text-muted">
                No clearances found.
              </p>
            )}

          {!loadingClearances &&
            !clearanceError &&
            clearances.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Exit Request ID</th>
                      <th>Status</th>
                      <th>Comments</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clearances.map((clearance) => (
                      <tr key={clearance.id}>
                        <td>{clearance.id}</td>
                        <td>{clearance.exit_request_id}</td>
                        <td>
                          <span
                            className={
                              clearance.status === "approved"
                                ? "badge bg-success"
                                : "badge bg-warning text-dark"
                            }
                          >
                            {clearance.status}
                          </span>
                        </td>
                        <td>{clearance.comments || "-"}</td>
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

export default HRDashboard;