export default function Spinner({ size = "md" }) {
  return <span className={`spinner spinner-${size}`} aria-hidden="true" />;
}
