import { useId } from "react";
import { INK_BY_ID, normalizeColors } from "../constants/lorcana";

/** Dual-ink hexagon — one badge, split vertically like Lorcana profile icons. */
export default function InkDots({ colors, size = 20, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const [leftId, rightId] = normalizeColors(colors);
  const left = INK_BY_ID[leftId]?.hex ?? "#F5C542";
  const right = INK_BY_ID[rightId]?.hex ?? "#9B59B6";
  const title = `${INK_BY_ID[leftId]?.label ?? leftId} / ${INK_BY_ID[rightId]?.label ?? rightId}`;
  const clipId = `ink-hex-${uid}`;

  // Flat-top hexagon path in a 40×40 viewBox
  const hex = "20,2 36,11 36,29 20,38 4,29 4,11";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label={title}
      role="img"
      style={{ flexShrink: 0, display: "block" }}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={clipId}>
          <polygon points={hex} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="20" height="40" fill={left} />
        <rect x="20" y="0" width="20" height="40" fill={right} />
        {/* Dark divider so amber/yellow still reads clearly */}
        <rect x="19.2" y="0" width="1.6" height="40" fill="rgba(0,0,0,0.55)" />
      </g>

      {/* Outer black rim — avoids clash with Amber/yellow ink */}
      <polygon
        points={hex}
        fill="none"
        stroke="#111111"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <polygon
        points={hex}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
