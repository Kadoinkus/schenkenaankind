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
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.value)}
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
