import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import FormCard from "../components/FormCard";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordPage() {
  const { forgotPassword, getApiErrorMessage } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) {
      showToast("Enter a valid email", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      showToast(response.data.message || "Reset email sent", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to process request"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <FormCard title="Forgot password" subtitle="We will send a secure reset link to your inbox.">
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <Input
            label="Email"
            id="forgot-email"
            type="email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <Button type="submit" loading={loading}>
            Send reset link
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </FormCard>
    </div>
  );
}
