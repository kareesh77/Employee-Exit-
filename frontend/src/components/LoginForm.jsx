import { useState } from "react";
import api from "../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const validationErrors = {};

    if (!email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    }

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerMessage("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data || {};
      const role = data.role || data.user?.role;
      const token = data.access_token || data.token;

      if (token) {
        sessionStorage.setItem("authToken", token);
      }

      if (role) {
        sessionStorage.setItem("userRole", role);
      }

      if (role === "HR_ADMIN") {
        window.location.href = "/hr/dashboard";
        return;
      }

      if (role === "EMPLOYEE") {
        window.location.href = "/employee/dashboard";
        return;
      }

      setServerMessage("Login succeeded but the user role was not recognized.");
    } catch (error) {
      if (error?.response) {
        if (error.response.status === 401 || error.response.status === 400) {
          setServerMessage("Invalid email or password. Please try again.");
        } else if (error.response.data?.detail) {
          setServerMessage(error.response.data.detail);
        } else {
          setServerMessage("An error occurred while logging in. Please try again.");
        }
      } else {
        setServerMessage(
          "Unable to reach the authentication server. Please check your network or backend configuration."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="h5 mb-3">Login</h2>
        {serverMessage && (
          <div className="alert alert-warning" role="alert" aria-live="polite">
            {serverMessage}
          </div>
        )}
        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="name@example.com"
              autoComplete="email"
              aria-describedby="emailHelp"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
