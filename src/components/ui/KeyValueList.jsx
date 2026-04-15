import ExplainedLabel from "./ExplainedLabel.jsx";

export default function KeyValueList({ rows }) {
  return (
    <dl className="key-value-list">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`key-value-list__row ${row.emphasis ? "is-emphasis" : ""}`.trim()}
        >
          <dt>
            <ExplainedLabel
              label={row.label}
              explanation={row.explanation}
              explanationTitle={row.explanationTitle}
            />
          </dt>
          <dd className={row.tone ? `tone-${row.tone}` : ""}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
