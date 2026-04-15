import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";

export default function PromoCodeField({
  code,
  onCodeChange,
  onApply,
  isApplying,
  feedback,
}) {
  return (
    <div className="promo-field">
      <label className="promo-field__label" htmlFor="promoCode">
        Kortingscode
      </label>
      <div className="promo-field__controls">
        <input
          id="promoCode"
          className="promo-field__input"
          type="text"
          value={code}
          placeholder="Vul uw code in"
          onChange={(event) => onCodeChange(event.target.value)}
        />
        <Button onClick={onApply} disabled={isApplying || !code.trim()}>
          <Icon name="check" size={16} />
          <span>{isApplying ? "Controleren..." : "Code toepassen"}</span>
        </Button>
      </div>
      {feedback ? (
        <p className={`promo-field__feedback tone-${feedback.tone}`}>{feedback.message}</p>
      ) : null}
    </div>
  );
}
