import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import Input from "../components/Input";
import OAuthButtons from "../components/OAuthButtons";
import PasswordStrength from "../components/PasswordStrength";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const { register, getApiErrorMessage } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isStrongEnough = useMemo(() => form.password.length >= 8, [form.password]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Name should be at least 2 characters";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email";
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password, role: "USER" });
      showToast("Account created successfully", "success");
      navigate("/register-success", { state: { email: form.email } });
    } catch (error) {
      showToast(getApiErrorMessage(error, "Registration failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FormCard title="Create VistaraIQ account" subtitle="Your startup intelligence workspace starts here.">
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <Input
            label="Name"
            id="register-name"
            aria-label="Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Jane Doe"
            error={errors.name}
          />
          <Input
            label="Email"
            id="register-email"
            type="email"
            aria-label="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@company.com"
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            id="register-password"
            type={showPassword ? "text" : "password"}
            aria-label="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Create a strong password"
            error={errors.password}
            autoComplete="new-password"
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
          <PasswordStrength password={form.password} />
          <Input
            label="Confirm password"
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            aria-label="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="Repeat password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} disabled={!isStrongEnough}>
            Register
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>

        <div className="divider"><span>or continue with</span></div>
        <OAuthButtons />
      </FormCard>
    </div>
  );
}
