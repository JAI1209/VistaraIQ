import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import Input from "../components/Input";
import OAuthButtons from "../components/OAuthButtons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const { login, getApiErrorMessage } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function onSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!email.includes("@")) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await login({ email, password });
      showToast("Welcome back", "success");
      const redirect = location.state?.from || "/dashboard";
      navigate(redirect, { replace: true });
    } catch (error) {
      showToast(getApiErrorMessage(error, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FormCard title="VistaraIQ" subtitle="Expand Intelligence. Build Smarter.">
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <Input
            label="Email"
            id="login-email"
            type="email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            id="login-password"
            type={showPassword ? "text" : "password"}
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                className="text-action"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>

        <div className="divider"><span>or continue with</span></div>
        <OAuthButtons />
      </FormCard>
    </div>
  );
}
