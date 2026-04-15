import InlineExplain from "./InlineExplain.jsx";

export default function NumberField({
  id,
  label,
  hint,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
  explanation,
  explanationTitle,
}) {
  const numericStep = Number(step);
  const isWholeNumberInput =
    Number.isFinite(numericStep) && Math.floor(numericStep) === numericStep;
  const allowsNegative = Number.isFinite(Number(min)) && Number(min) < 0;
  const inputMode = allowsNegative ? "text" : isWholeNumberInput ? "numeric" : "decimal";

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint ? <span className="field__hint">{hint}</span> : null}
      <span className="field__input-wrap">
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode={inputMode}
          pattern={!allowsNegative && isWholeNumberInput ? "[0-9]*" : undefined}
          value={value}
          min={min}
          max={max}
          step={step}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => event.target.select()}
          onClick={(event) => event.target.select()}
        />
        {suffix ? <span className="field__suffix">{suffix}</span> : null}
      </span>
      {explanation ? (
        <InlineExplain title={explanationTitle || "Wat betekent dit?"}>
          <p>{explanation}</p>
        </InlineExplain>
      ) : null}
    </div>
  );
}
