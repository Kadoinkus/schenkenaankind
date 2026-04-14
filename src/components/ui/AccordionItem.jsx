export default function AccordionItem({ title, children }) {
  return (
    <details className="accordion-item">
      <summary>{title}</summary>
      <div className="accordion-item__body">{children}</div>
    </details>
  );
}
