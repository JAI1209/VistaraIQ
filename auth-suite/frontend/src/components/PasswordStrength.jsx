const levels = [
  { score: 0, label: "Weak", color: "#ef4444" },
  { score: 1, label: "Fair", color: "#f59e0b" },
  { score: 2, label: "Good", color: "#22c55e" },
  { score: 3, label: "Strong", color: "#3b82f6" },
];

function getScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 3);
}

export default function PasswordStrength({ password }) {
  const score = getScore(password);
  const current = levels[score];

  return (
    <div className="strength-wrap" aria-live="polite">
      <div className="strength-bar">
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className="strength-shard"
            style={{
              background: idx <= score ? current.color : "#1f2937",
              opacity: idx <= score ? 1 : 0.35,
            }}
          />
        ))}
      </div>
      <small style={{ color: current.color }}>{current.label}</small>
    </div>
  );
}
