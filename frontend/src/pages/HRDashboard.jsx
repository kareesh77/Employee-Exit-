import { useEffect, useState } from "react";
import api from "../services/api";

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [exitRequests, setExitRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [exitInterviews, setExitInterviews] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingExitRequests, setLoadingExitRequests] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingClearances, setLoadingClearances] = useState(true);
  const [loadingExitInterviews, setLoadingExitInterviews] = useState(true);

  const [employeeError, setEmployeeError] = useState("");
  const [exitRequestError, setExitRequestError] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [auditLogError, setAuditLogError] = useState("");
  const [clearanceError, setClearanceError] = useState("");
  const [exitInterviewError, setExitInterviewError] = useState("");

  const [newEmployee, setNewEmployee] = useState({
    email: "",
    password: "",
    employee_code: "",
    first_name: "",
    last_name: "",
    phone: "",
    department_id: "",
    designation: "",
    joining_date: "",
  });

  const [showNewEmployeePassword, setShowNewEmployeePassword] =
    useState(false);

  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [createEmployeeError, setCreateEmployeeError] = useState("");
  const [createEmployeeSuccess, setCreateEmployeeSuccess] = useState("");

  const [selectedExitRequest, setSelectedExitRequest] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reasonForLeaving, setReasonForLeaving] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [creatingInterview, setCreatingInterview] = useState(false);

  const email = sessionStorage.getItem("userEmail");

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

  useEffect(() => {
    const loadExitInterviews = async () => {
      try {
        const response = await api.get("/exit-interviews");
        setExitInterviews(response.data);
      } catch (error) {
        console.error("Failed to load exit interviews:", error);
        setExitInterviewError("Unable to load exit interviews.");
      } finally {
        setLoadingExitInterviews(false);
      }
    };

    loadExitInterviews();
  }, []);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const response = await api.get("/audit-logs");
        setAuditLogs(response.data);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
        setAuditLogError("Unable to load audit logs.");
      }
    };

    loadAuditLogs();
  }, []);

  const createEmployee = async (event) => {
    event.preventDefault();

    setCreateEmployeeError("");
    setCreateEmployeeSuccess("");
    setCreatingEmployee(true);

    try {
      const response = await api.post(
        "/hr/employees",
        {
          email: newEmployee.email,
          password: newEmployee.password,
          employee_code: newEmployee.employee_code,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          phone: newEmployee.phone,
          department_id: Number(newEmployee.department_id),
          designation: newEmployee.designation,
          joining_date: newEmployee.joining_date,
        }
      );

      console.log("Employee created:", response.data);

      setCreateEmployeeSuccess(
        `Employee account created successfully for ${response.data.email}.`
      );

      setNewEmployee({
        email: "",
        password: "",
        employee_code: "",
        first_name: "",
        last_name: "",
        phone: "",
        department_id: "",
        designation: "",
        joining_date: "",
      });

      setShowNewEmployeePassword(false);

      const employeesResponse = await api.get("/employees");
      setEmployees(employeesResponse.data);

      const auditResponse = await api.get("/audit-logs");
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error("Failed to create employee:", error);
      console.error("Response:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        setCreateEmployeeError(detail);
      } else {
        setCreateEmployeeError(
          "Unable to create employee account."
        );
      }
    } finally {
      setCreatingEmployee(false);
    }
  };

  const handleNewEmployeeChange = (event) => {
    const { name, value } = event.target;

    setNewEmployee((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      setExitRequestError("");

      const token = sessionStorage.getItem("access_token");

      const response = await api.put(
        `/exit-requests/${requestId}/status`,
        null,
        {
          params: {
            status: status,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Exit request updated:", response.data);

      setExitRequests((previous) =>
        previous.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: status,
              }
            : request
        )
      );

      const approvalsResponse = await api.get("/approvals");
      setApprovals(approvalsResponse.data);

      const clearancesResponse = await api.get("/clearances");
      setClearances(clearancesResponse.data);

      const auditResponse = await api.get("/audit-logs");
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error("Failed to update exit request:", error);
      console.error("Response:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        setExitRequestError(detail);
      } else {
        setExitRequestError("Unable to update exit request.");
      }
    }
  };

  const updateClearanceStatus = async (clearanceId, status) => {
    try {
      setClearanceError("");

      const token = sessionStorage.getItem("access_token");

      const response = await api.put(
        `/clearances/${clearanceId}/status`,
        null,
        {
          params: {
            status: status,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Clearance updated:", response.data);

      setClearances((previous) =>
        previous.map((clearance) =>
          clearance.id === clearanceId
            ? {
                ...clearance,
                status: status,
                comments: `Clearance ${status} by HR`,
              }
            : clearance
        )
      );

      const auditResponse = await api.get("/audit-logs");
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error("Failed to update clearance:", error);
      console.error("Response:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        setClearanceError(detail);
      } else {
        setClearanceError("Unable to update clearance.");
      }
    }
  };

  const createExitInterview = async (event) => {
    event.preventDefault();

    if (!selectedExitRequest) {
      setExitInterviewError("Please select an exit request.");
      return;
    }

    try {
      setCreatingInterview(true);
      setExitInterviewError("");

      const token = sessionStorage.getItem("access_token");

      const response = await api.post(
        "/exit-interviews",
        {
          exit_request_id: Number(selectedExitRequest),
          feedback,
          reason_for_leaving: reasonForLeaving,
          suggestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Exit interview created:", response.data);

      setExitInterviews((previous) => [
        ...previous,
        response.data,
      ]);

      setSelectedExitRequest("");
      setFeedback("");
      setReasonForLeaving("");
      setSuggestions("");

      const auditResponse = await api.get("/audit-logs");
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error("Failed to create exit interview:", error);
      console.error("Response:", error.response?.data);

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        setExitInterviewError(detail);
      } else {
        setExitInterviewError(
          "Unable to create exit interview."
        );
      }
    } finally {
      setCreatingInterview(false);
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

      <div className="alert alert-success">
        You are logged in as an HR administrator.
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">
            Create New Employee
          </h2>
        </div>

        <div className="card-body">
          <p className="text-muted">
            HR can create an employee account here. The employee
            can later use this email and password on the normal
            login page.
          </p>

          {createEmployeeSuccess && (
            <div className="alert alert-success">
              {createEmployeeSuccess}
            </div>
          )}

          {createEmployeeError && (
            <div className="alert alert-danger">
              {createEmployeeError}
            </div>
          )}

          <form onSubmit={createEmployee}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label
                  htmlFor="employeeEmail"
                  className="form-label"
                >
                  Email
                </label>

                <input
                  id="employeeEmail"
                  name="email"
                  type="email"
                  className="form-control"
                  value={newEmployee.email}
                  onChange={handleNewEmployeeChange}
                  placeholder="employee@example.com"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="employeePassword"
                  className="form-label"
                >
                  Password
                </label>

                <div className="input-group">
                  <input
                    id="employeePassword"
                    name="password"
                    type={
                      showNewEmployeePassword
                        ? "text"
                        : "password"
                    }
                    className="form-control"
                    value={newEmployee.password}
                    onChange={handleNewEmployeeChange}
                    placeholder="Enter temporary password"
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setShowNewEmployeePassword(
                        (previous) => !previous
                      )
                    }
                  >
                    {showNewEmployeePassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="employeeCode"
                  className="form-label"
                >
                  Employee Code
                </label>

                <input
                  id="employeeCode"
                  name="employee_code"
                  type="text"
                  className="form-control"
                  value={newEmployee.employee_code}
                  onChange={handleNewEmployeeChange}
                  placeholder="EMP004"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="firstName"
                  className="form-label"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="first_name"
                  type="text"
                  className="form-control"
                  value={newEmployee.first_name}
                  onChange={handleNewEmployeeChange}
                  placeholder="First name"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="lastName"
                  className="form-label"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="last_name"
                  type="text"
                  className="form-control"
                  value={newEmployee.last_name}
                  onChange={handleNewEmployeeChange}
                  placeholder="Last name"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="phone"
                  className="form-label"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={newEmployee.phone}
                  onChange={handleNewEmployeeChange}
                  placeholder="9876543210"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="departmentId"
                  className="form-label"
                >
                  Department ID
                </label>

                <input
                  id="departmentId"
                  name="department_id"
                  type="number"
                  className="form-control"
                  value={newEmployee.department_id}
                  onChange={handleNewEmployeeChange}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="designation"
                  className="form-label"
                >
                  Designation
                </label>

                <input
                  id="designation"
                  name="designation"
                  type="text"
                  className="form-control"
                  value={newEmployee.designation}
                  onChange={handleNewEmployeeChange}
                  placeholder="Software Engineer"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label
                  htmlFor="joiningDate"
                  className="form-label"
                >
                  Joining Date
                </label>

                <input
                  id="joiningDate"
                  name="joining_date"
                  type="date"
                  className="form-control"
                  value={newEmployee.joining_date}
                  onChange={handleNewEmployeeChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingEmployee}
            >
              {creatingEmployee
                ? "Creating Employee..."
                : "Create Employee"}
            </button>
          </form>
        </div>
      </div>

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
                      <th>Action</th>
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
                          <span
                            className={`badge ${
                              request.status === "approved"
                                ? "bg-success"
                                : request.status === "rejected"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td>
                          {request.status === "pending" ? (
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  updateRequestStatus(
                                    request.id,
                                    "approved"
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  updateRequestStatus(
                                    request.id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

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
                        <td>
                          {approval.approved_by ?? "-"}
                        </td>

                        <td>
                          <span
                            className={
                              approval.status === "approved"
                                ? "badge bg-success"
                                : approval.status === "rejected"
                                  ? "badge bg-danger"
                                  : "badge bg-warning text-dark"
                            }
                          >
                            {approval.status}
                          </span>
                        </td>

                        <td>
                          {approval.comments || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

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
                      <th>Action</th>
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
                                : clearance.status === "rejected"
                                  ? "badge bg-danger"
                                  : "badge bg-warning text-dark"
                            }
                          >
                            {clearance.status}
                          </span>
                        </td>

                        <td>
                          {clearance.comments || "-"}
                        </td>

                        <td>
                          {clearance.status === "pending" ? (
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  updateClearanceStatus(
                                    clearance.id,
                                    "approved"
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  updateClearanceStatus(
                                    clearance.id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">
            Create Exit Interview
          </h2>
        </div>

        <div className="card-body">
          {exitInterviewError && (
            <div className="alert alert-danger">
              {exitInterviewError}
            </div>
          )}

          <form onSubmit={createExitInterview}>
            <div className="mb-3">
              <label
                htmlFor="exitRequest"
                className="form-label"
              >
                Exit Request
              </label>

              <select
                id="exitRequest"
                className="form-select"
                value={selectedExitRequest}
                onChange={(event) =>
                  setSelectedExitRequest(event.target.value)
                }
                required
              >
                <option value="">
                  Select an exit request
                </option>

                {exitRequests
                  .filter(
                    (request) =>
                      request.status === "approved"
                  )
                  .map((request) => (
                    <option
                      key={request.id}
                      value={request.id}
                    >
                      Request #{request.id} - Employee #
                      {request.employee_id} -{" "}
                      {request.reason}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label
                htmlFor="feedback"
                className="form-label"
              >
                Feedback
              </label>

              <textarea
                id="feedback"
                className="form-control"
                rows="3"
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                placeholder="Enter employee feedback"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="reasonForLeaving"
                className="form-label"
              >
                Reason for Leaving
              </label>

              <textarea
                id="reasonForLeaving"
                className="form-control"
                rows="3"
                value={reasonForLeaving}
                onChange={(event) =>
                  setReasonForLeaving(event.target.value)
                }
                placeholder="Enter reason for leaving"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="suggestions"
                className="form-label"
              >
                Suggestions
              </label>

              <textarea
                id="suggestions"
                className="form-control"
                rows="3"
                value={suggestions}
                onChange={(event) =>
                  setSuggestions(event.target.value)
                }
                placeholder="Enter employee suggestions"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingInterview}
            >
              {creatingInterview
                ? "Creating..."
                : "Create Exit Interview"}
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">
            Exit Interviews
          </h2>
        </div>

        <div className="card-body">
          {loadingExitInterviews && (
            <p className="text-muted">
              Loading exit interviews...
            </p>
          )}

          {exitInterviewError && (
            <div className="alert alert-danger">
              {exitInterviewError}
            </div>
          )}

          {!loadingExitInterviews &&
            !exitInterviewError &&
            exitInterviews.length === 0 && (
              <p className="text-muted">
                No exit interviews found.
              </p>
            )}

          {!loadingExitInterviews &&
            !exitInterviewError &&
            exitInterviews.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Exit Request ID</th>
                      <th>Feedback</th>
                      <th>Reason for Leaving</th>
                      <th>Suggestions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {exitInterviews.map((interview) => (
                      <tr key={interview.id}>
                        <td>{interview.id}</td>

                        <td>
                          {interview.exit_request_id}
                        </td>

                        <td>
                          {interview.feedback || "-"}
                        </td>

                        <td>
                          {interview.reason_for_leaving || "-"}
                        </td>

                        <td>
                          {interview.suggestions || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Audit Logs</h2>
        </div>

        <div className="card-body">
          {auditLogError && (
            <div className="alert alert-danger">
              {auditLogError}
            </div>
          )}

          {!auditLogError && auditLogs.length === 0 && (
            <p className="text-muted">
              No audit logs found.
            </p>
          )}

          {!auditLogError && auditLogs.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                  </tr>
                </thead>

                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.user_id ?? "-"}</td>
                      <td>{log.action}</td>
                      <td>{log.entity_type}</td>
                      <td>{log.entity_id ?? "-"}</td>
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