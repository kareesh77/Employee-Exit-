import { useState } from "react";
import api from "../services/api";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      const user = response.data;

      sessionStorage.setItem("userId", String(user.user_id));
      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.setItem("userRole", user.role);

      if (user.role === "admin" || user.role === "hr") {
        window.location.href = "/hr/dashboard";
      } else {
        window.location.href = "/employee/dashboard";
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Unable to login. Please check the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default LoginForm;