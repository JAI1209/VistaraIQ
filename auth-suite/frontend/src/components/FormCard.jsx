export default function FormCard({ title, subtitle, children, footer }) {
  return (
    <section className="auth-card" aria-label={title}>
      <h1 className="auth-title">{title}</h1>
      {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
      {children}
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </section>
  );
}
