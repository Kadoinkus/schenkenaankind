export default function AccordionItem({ title, children, defaultOpen = false, className = "" }) {
  return (
    <details className={`accordion-item ${className}`.trim()} open={defaultOpen}>
      <summary>{title}</summary>
      <div className="accordion-item__body">{children}</div>
    </details>
  );
}
