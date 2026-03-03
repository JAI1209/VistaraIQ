import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AuthSuccessPage() {
  const { fetchMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe()
      .then(() => {
        showToast("OAuth login successful", "success");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        showToast("OAuth session failed", "error");
        navigate("/login", { replace: true });
      });
  }, [fetchMe, navigate, showToast]);

  return <div className="page-loader">Finalizing OAuth session...</div>;
}
