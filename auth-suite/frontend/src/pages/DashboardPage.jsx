import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  async function onLogout() {
    await logout();
    showToast("Logged out", "info");
    window.location.href = "/login";
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <h1>Welcome to VistaraIQ</h1>
        <p>Protected dashboard route</p>
        <dl className="user-grid">
          <div>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>
          <div>
            <dt>Verified</dt>
            <dd>{String(user?.isVerified)}</dd>
          </div>
        </dl>
        <Button type="button" onClick={onLogout}>
          Logout
        </Button>
      </section>
    </main>
  );
}
