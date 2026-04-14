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
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
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
    </label>
  );
}
