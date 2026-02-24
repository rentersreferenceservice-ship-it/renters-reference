"use client";

import React from "react";

type StarRatingProps = {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: number;
  ariaLabel?: string;
};

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M12 17.27l-5.18 3.05 1.64-5.81L3 9.24l6.01-.52L12 3l2.99 5.72 6.01.52-4.46 5.21 1.64 5.81z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function StarRating({
  value,
  onChange,
  max = 5,
  size = 18,
  ariaLabel = "Rating",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
    >
      {Array.from({ length: max }, (_, i) => {
        const v = i + 1;
        const filled = v <= displayValue;

        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={`${v} star${v === 1 ? "" : "s"}`}
            onMouseEnter={() => setHoverValue(v)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onChange(v)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: filled ? "#f59e0b" : "#a1a1aa",
            }}
          >
            <Star filled={filled} size={size} />
          </button>
        );
      })}
      <span style={{ fontSize: 12, color: "#71717a", marginLeft: 6 }}>
        {value ? `${value}/${max}` : "No rating"}
      </span>
    </div>
  );
}
