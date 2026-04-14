export default function Button({
  children,
  active = false,
  tone = "secondary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${tone} ${active ? "is-active" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
