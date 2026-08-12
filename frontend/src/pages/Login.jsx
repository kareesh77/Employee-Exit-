import LoginForm from "../components/LoginForm";

function Login() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h1 className="h3 fw-semibold">Employee Exit Management System</h1>
            <p className="text-muted">Secure login for employees and HR administrators</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
