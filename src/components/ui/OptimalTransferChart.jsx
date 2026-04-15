import { useMemo, useState } from "react";
import { formatCurrency } from "../../lib/formatters.js";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 280;
const PADDING = { top: 20, right: 20, bottom: 50, left: 70 };
const INNER_W = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

function scaleX(value, min, max) {
  return PADDING.left + ((value - min) / (max - min)) * INNER_W;
}

function scaleY(value, min, max) {
  return PADDING.top + INNER_H - ((value - min) / (max - min)) * INNER_H;
}

function niceStep(range) {
  const rough = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm <= 1.5) return mag;
  if (norm <= 3.5) return 2 * mag;
  if (norm <= 7.5) return 5 * mag;
  return 10 * mag;
}

export default function OptimalTransferChart({ points, optimum, onSelect }) {
  const [hover, setHover] = useState(null);

  const { xMin, xMax, yMin, yMax, polyline, gridLinesY, gridLinesX } = useMemo(() => {
    if (!points || points.length < 2) return {};

    const xs = points.map((p) => p.amount);
    const ys = points.map((p) => p.totalBurden);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const rawYMin = Math.min(...ys);
    const rawYMax = Math.max(...ys);
    const yPad = (rawYMax - rawYMin) * 0.1 || 1000;
    const yMin = Math.max(0, rawYMin - yPad);
    const yMax = rawYMax + yPad;

    const polyline = points
      .map((p) => `${scaleX(p.amount, xMin, xMax)},${scaleY(p.totalBurden, yMin, yMax)}`)
      .join(" ");

    const yStep = niceStep(yMax - yMin);
    const gridLinesY = [];
    for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
      gridLinesY.push(v);
    }

    const xStep = niceStep(xMax - xMin);
    const gridLinesX = [];
    for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) {
      gridLinesX.push(v);
    }

    return { xMin, xMax, yMin, yMax, polyline, gridLinesY, gridLinesX };
  }, [points]);

  if (!points || points.length < 2) return null;

  const activePoint = hover || optimum;

  return (
    <div className="optimal-chart">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="optimal-chart__svg"
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid lines */}
        {gridLinesY.map((v) => (
          <g key={`gy-${v}`}>
            <line
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={scaleY(v, yMin, yMax)}
              y2={scaleY(v, yMin, yMax)}
              className="optimal-chart__grid"
            />
            <text
              x={PADDING.left - 8}
              y={scaleY(v, yMin, yMax) + 4}
              className="optimal-chart__axis-label"
              textAnchor="end"
            >
              {formatCurrency(v)}
            </text>
          </g>
        ))}
        {gridLinesX.map((v) => (
          <text
            key={`gx-${v}`}
            x={scaleX(v, xMin, xMax)}
            y={CHART_HEIGHT - 8}
            className="optimal-chart__axis-label"
            textAnchor="middle"
          >
            {formatCurrency(v)}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT - 2}
          className="optimal-chart__axis-title"
          textAnchor="middle"
        >
          Schenkbedrag
        </text>

        {/* Curve */}
        <polyline points={polyline} className="optimal-chart__line" />

        {/* Optimum marker */}
        {optimum ? (
          <circle
            cx={scaleX(optimum.amount, xMin, xMax)}
            cy={scaleY(optimum.totalBurden, yMin, yMax)}
            r={6}
            className="optimal-chart__optimum"
          />
        ) : null}

        {/* Hover marker */}
        {hover ? (
          <circle
            cx={scaleX(hover.amount, xMin, xMax)}
            cy={scaleY(hover.totalBurden, yMin, yMax)}
            r={4}
            className="optimal-chart__hover"
          />
        ) : null}

        {/* Invisible hit areas for hover */}
        {points.map((point, i) => (
          <rect
            key={i}
            x={scaleX(point.amount, xMin, xMax) - INNER_W / points.length / 2}
            y={PADDING.top}
            width={INNER_W / points.length}
            height={INNER_H}
            fill="transparent"
            onMouseEnter={() => setHover(point)}
            onClick={() => onSelect?.(point.amount)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      <div className="optimal-chart__tooltip">
        <span className="optimal-chart__tooltip-label">
          {hover ? "Geselecteerd" : "Optimaal schenkbedrag"}
        </span>
        <span className="optimal-chart__tooltip-value">
          {formatCurrency(activePoint.amount)}
        </span>
        <span className="optimal-chart__tooltip-detail">
          Totale last: {formatCurrency(activePoint.totalBurden)}
        </span>
      </div>

      {optimum && onSelect ? (
        <button
          type="button"
          className="optimal-chart__apply-btn"
          onClick={() => onSelect(optimum.amount)}
        >
          Gebruik {formatCurrency(optimum.amount)} als schenkbedrag
        </button>
      ) : null}
    </div>
  );
}
