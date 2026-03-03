export default function Input({
  label,
  id,
  error,
  rightSlot,
  className = "",
  ...props
}) {
  return (
    <div className="field-wrap">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="input-shell">
        <input id={id} className={`field-input ${error ? "field-input-error" : ""} ${className}`} {...props} />
        {rightSlot ? <span className="input-right-slot">{rightSlot}</span> : null}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
