import { useEffect, useMemo, useState } from "react";
import InlineExplain from "./InlineExplain.jsx";

function formatInputValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function parseDraftValue(rawValue, { allowsNegative, isWholeNumberInput }) {
  const compactValue = String(rawValue ?? "").trim().replace(/\s+/g, "");

  if (!compactValue) {
    return { status: "empty" };
  }

  if (!allowsNegative && compactValue.startsWith("-")) {
    return { status: "invalid", message: "Gebruik een positief getal." };
  }

  const groupedThousandsPattern = /^-?\d{1,3}([.,]\d{3})+$/;
  const normalizedValue = groupedThousandsPattern.test(compactValue)
    ? compactValue.replace(/[.,]/g, "")
    : compactValue.replace(",", ".");

  if (
    normalizedValue === "-" ||
    normalizedValue === "." ||
    normalizedValue === "-." ||
    normalizedValue.endsWith(".")
  ) {
    return { status: "intermediate" };
  }

  const parsedValue = Number(normalizedValue);
  if (!Number.isFinite(parsedValue)) {
    return { status: "invalid", message: "Vul een geldig getal in." };
  }

  if (isWholeNumberInput && !Number.isInteger(parsedValue)) {
    return { status: "invalid", message: "Gebruik hele getallen." };
  }

  return { status: "valid", value: parsedValue };
}

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
  const [draftValue, setDraftValue] = useState(() => formatInputValue(value));

  useEffect(() => {
    setDraftValue(formatInputValue(value));
  }, [value]);

  const validation = useMemo(() => {
    const parsedDraft = parseDraftValue(draftValue, {
      allowsNegative,
      isWholeNumberInput,
    });

    if (parsedDraft.status !== "valid") {
      return parsedDraft;
    }

    const minimum = Number(min);
    const maximum = Number(max);

    if (Number.isFinite(minimum) && parsedDraft.value < minimum) {
      return {
        status: "range",
        message: `Vul minimaal ${minimum} in.`,
      };
    }

    if (Number.isFinite(maximum) && parsedDraft.value > maximum) {
      return {
        status: "range",
        message: `Vul maximaal ${maximum} in.`,
      };
    }

    return parsedDraft;
  }, [allowsNegative, draftValue, isWholeNumberInput, max, min]);

  const hasError = validation.status === "invalid" || validation.status === "range";

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint ? <span className="field__hint">{hint}</span> : null}
      <span className={`field__input-wrap ${hasError ? "is-invalid" : ""}`.trim()}>
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode={inputMode}
          pattern={!allowsNegative && isWholeNumberInput ? "[0-9]*" : undefined}
          value={draftValue}
          min={min}
          max={max}
          step={step}
          autoComplete="off"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          onChange={(event) => {
            const nextDraftValue = event.target.value;
            setDraftValue(nextDraftValue);

            const nextValidation = parseDraftValue(nextDraftValue, {
              allowsNegative,
              isWholeNumberInput,
            });

            if (nextValidation.status !== "valid") {
              return;
            }

            const minimum = Number(min);
            const maximum = Number(max);

            if (
              (Number.isFinite(minimum) && nextValidation.value < minimum) ||
              (Number.isFinite(maximum) && nextValidation.value > maximum)
            ) {
              return;
            }

            onChange(nextValidation.value);
          }}
          onFocus={(event) => event.target.select()}
          onBlur={() => {
            if (validation.status === "valid") {
              setDraftValue(formatInputValue(validation.value));
            }
          }}
        />
        {suffix ? <span className="field__suffix">{suffix}</span> : null}
      </span>
      {hasError ? (
        <span className="field__error" id={`${id}-error`}>
          {validation.message}
        </span>
      ) : null}
      {explanation ? (
        <InlineExplain title={explanationTitle || "Wat betekent dit?"}>
          <p>{explanation}</p>
        </InlineExplain>
      ) : null}
    </div>
  );
}
