import { Link, useLocation } from "react-router-dom";

export default function RegisterSuccessPage() {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">Account created</h1>
        <p className="auth-subtitle">We sent a verification link to <strong>{email}</strong>. Verify your email to unlock all features.</p>
        <div className="auth-links" style={{ justifyContent: "flex-start" }}>
          <Link to="/verify-email" state={{ email }}>Verify now</Link>
          <Link to="/login">Go to login</Link>
        </div>
      </section>
    </div>
  );
}
