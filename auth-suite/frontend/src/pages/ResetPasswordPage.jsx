import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import Input from "../components/Input";
import PasswordStrength from "../components/PasswordStrength";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const { resetPassword, getApiErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const strongEnough = useMemo(() => password.length >= 8, [password]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!token) return showToast("Reset token is required", "error");
    if (password.length < 8) return showToast("Password too short", "error");
    if (password !== confirmPassword) return showToast("Passwords do not match", "error");

    setLoading(true);
    try {
      const response = await resetPassword(token, password);
      showToast(response.data.message || "Password reset successful", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Reset failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FormCard title="Reset password" subtitle="Set a new secure password for your account.">
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <Input
            label="Token"
            id="reset-token"
            aria-label="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token from email"
          />
          <Input
            label="New password"
            id="reset-password"
            type="password"
            aria-label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
          <PasswordStrength password={password} />
          <Input
            label="Confirm password"
            id="reset-confirm-password"
            type="password"
            aria-label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
          />
          <Button type="submit" loading={loading} disabled={!strongEnough}>
            Reset password
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </FormCard>
    </div>
  );
}
