import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const presetEmail = location.state?.email || "";

  const { verifyEmail, resendVerification, getApiErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [email, setEmail] = useState(presetEmail);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (!queryToken) return;

    setVerifying(true);
    verifyEmail(queryToken)
      .then((response) => {
        setStatus("verified");
        showToast(response.data.message || "Email verified", "success");
      })
      .catch((error) => {
        setStatus("failed");
        showToast(getApiErrorMessage(error, "Verification failed"), "error");
      })
      .finally(() => setVerifying(false));
  }, [searchParams, verifyEmail, showToast, getApiErrorMessage]);

  async function handleManualVerify(e) {
    e.preventDefault();
    if (!token) return showToast("Token is required", "error");

    setVerifying(true);
    try {
      const response = await verifyEmail(token);
      setStatus("verified");
      showToast(response.data.message || "Email verified", "success");
    } catch (error) {
      setStatus("failed");
      showToast(getApiErrorMessage(error, "Verification failed"), "error");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!email.includes("@")) return showToast("Enter a valid email", "error");
    setResending(true);
    try {
      const response = await resendVerification(email);
      showToast(response.data.message || "Verification email sent", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to resend email"), "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <FormCard title="Verify your email" subtitle="Enter the token from your inbox or use auto-verification link.">
        <p className={`status-pill status-${status}`}>Status: {verifying ? "verifying" : status}</p>

        <form className="auth-form" onSubmit={handleManualVerify} noValidate>
          <Input
            label="Verification token"
            id="verify-token"
            aria-label="Verification token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token"
          />
          <Button type="submit" loading={verifying}>
            Verify email
          </Button>
        </form>

        <div className="divider"><span>need a new email?</span></div>

        <Input
          label="Email"
          id="verify-email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Button type="button" variant="secondary" loading={resending} onClick={handleResend}>
          Resend verification link
        </Button>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </FormCard>
    </div>
  );
}
