const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="oauth-icon" fill="none" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.2 3-7.1Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-1 6.6-2.7l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.2H3.1V16c1.7 3.6 5.2 6 8.9 6Z" fill="#34A853" />
      <path d="M6.3 13.6c-.2-.6-.3-1.1-.3-1.6s.1-1.1.3-1.6V8H3.1C2.4 9.3 2 10.6 2 12s.4 2.7 1.1 4l3.2-2.4Z" fill="#FBBC05" />
      <path d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.3 14.7 2.2 12 2.2c-3.7 0-7.2 2.4-8.9 5.8l3.2 2.4C7.1 8 9.3 6.2 12 6.2Z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="oauth-icon fill-current" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.8 8.3 6.7 9.7.5.1.7-.2.7-.5v-1.8c-2.7.6-3.2-1.2-3.2-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.1-.2-4.3-1.1-4.3-4.8 0-1 .3-1.8.8-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.5.7.8 1.5.8 2.5 0 3.7-2.2 4.6-4.3 4.8.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 3.9-1.4 6.7-5.2 6.7-9.7C22 6.6 17.5 2 12 2Z" />
    </svg>
  );
}

export default function OAuthButtons() {
  return (
    <div className="oauth-grid">
      <a href={`${API_BASE_URL}/api/auth/google`} className="oauth-button" aria-label="Continue with Google">
        <GoogleIcon />
        Google
      </a>
      <a href={`${API_BASE_URL}/api/auth/github`} className="oauth-button" aria-label="Continue with GitHub">
        <GithubIcon />
        GitHub
      </a>
    </div>
  );
}
