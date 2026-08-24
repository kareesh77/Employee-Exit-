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
    } else if (!emailRegex.test(email.trim())) {
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
      // FastAPI endpoint: POST /login
      const response = await api.post("/login", {
        email: email.trim(),
        password: password,
      });

      const data = response.data;

      // FastAPI returns role directly
      const role = data.role;

      sessionStorage.setItem("userId", String(data.user_id));
      sessionStorage.setItem("userEmail", data.email);
      sessionStorage.setItem("userRole", role);

      if (role === "admin") {
        window.location.href = "/hr/dashboard";
        return;
      }

      if (role === "employee") {
        window.location.href = "/employee/dashboard";
        return;
      }

      setServerMessage(`Login successful. Role: ${role}`);
    } catch (error) {
      console.error("Login error:", error);

      if (error?.response) {
        if (error.response.status === 401) {
          setServerMessage("Invalid email or password.");
        } else if (error.response.status === 403) {
          setServerMessage("Your account is inactive.");
        } else if (error.response.data?.detail) {
          setServerMessage(error.response.data.detail);
        } else {
          setServerMessage(
            "An error occurred while logging in. Please try again."
          );
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
          <div className="alert alert-warning" role="alert">
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
              className={`form-control ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="name@example.com"
              autoComplete="email"
            />

            {errors.email && (
              <div className="invalid-feedback">
                {errors.email}
              </div>
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
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <div className="invalid-feedback d-block">
                {errors.password}
              </div>
            )}
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;