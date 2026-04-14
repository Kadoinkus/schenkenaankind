import Button from "./Button.jsx";
import InlineExplain from "./InlineExplain.jsx";

export default function SegmentedControl({
  label,
  value,
  options,
  onChange,
  explanation,
  explanationTitle,
}) {
  return (
    <div className="segmented-control">
      <span className="segmented-control__label">{label}</span>
      <div className="segmented-control__group" role="group" aria-label={label}>
        {options.map((option) => (
          <Button
            key={option.value}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {explanation ? (
        <InlineExplain title={explanationTitle || "Wat betekent dit?"}>
          <p>{explanation}</p>
        </InlineExplain>
      ) : null}
    </div>
  );
}
