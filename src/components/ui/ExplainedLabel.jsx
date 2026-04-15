import InlineExplain from "./InlineExplain.jsx";

export default function ExplainedLabel({
  label,
  explanation,
  explanationTitle,
  align = "left",
}) {
  return (
    <div className="explained-label">
      <span className="explained-label__text">{label}</span>
      {explanation ? (
        <InlineExplain title={explanationTitle || label} align={align}>
          <p>{explanation}</p>
        </InlineExplain>
      ) : null}
    </div>
  );
}
