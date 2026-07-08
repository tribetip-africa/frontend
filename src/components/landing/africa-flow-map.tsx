"use client";

import { useSyncExternalStore } from "react";

import { regionFlags } from "@/lib/region-flags";

/**
 * Animated "money in motion" map for the landing page.
 *
 * Africa rendered as a dense dot-matrix (via an orthographic globe projection,
 * so it keeps a subtle curved/zoomed feel) with pulses of value flowing between
 * the five Paystack-accessible regions. Inspired by payd.money's dotted globe,
 * re-themed for TribeTip and focused only on the continent.
 *
 * Pure SVG + SMIL + CSS — no animation dependencies. Animation is skipped when
 * the visitor prefers reduced motion.
 */

type LngLat = readonly [number, number];

type Region = {
  code: string;
  name: string;
  currency: string;
  flag: string;
  lng: number;
  lat: number;
};

const DEG = Math.PI / 180;
const R = 235; // globe radius driving the projection curvature
const CX = 280;
const CY = 280;

// View centred on Africa.
const LAMBDA0 = 18 * DEG;
const PHI0 = 3 * DEG;

const round = (n: number) => Math.round(n * 10) / 10;

function project(lng: number, lat: number): {
  x: number;
  y: number;
  front: boolean;
} {
  const l = lng * DEG;
  const p = lat * DEG;
  const cosc =
    Math.sin(PHI0) * Math.sin(p) +
    Math.cos(PHI0) * Math.cos(p) * Math.cos(l - LAMBDA0);
  const x = Math.cos(p) * Math.sin(l - LAMBDA0);
  const y =
    Math.cos(PHI0) * Math.sin(p) - Math.sin(PHI0) * Math.cos(p) * Math.cos(l - LAMBDA0);
  return { x: round(CX + R * x), y: round(CY - R * y), front: cosc >= -0.02 };
}

// Coarse outline of the African coastline (lng, lat) — only used to decide
// which grid points fall on the continent. Never drawn as a border.
const AFRICA_OUTLINE: LngLat[] = [
  [-5.5, 35.8],
  [-1, 35.5],
  [9, 37.3],
  [11, 33.5],
  [20, 32.5],
  [25, 32],
  [31, 31.5],
  [34, 31],
  [35.5, 28],
  [37, 22],
  [38.5, 18],
  [40, 15],
  [43, 11.5],
  [44, 10],
  [51, 11.8],
  [48, 5],
  [44, 1.5],
  [41, -2],
  [39.5, -7],
  [40.5, -11],
  [40, -16],
  [35, -21],
  [33, -26],
  [31.5, -29.5],
  [27, -33.5],
  [22, -34.8],
  [18, -34],
  [16, -28.5],
  [14.5, -22],
  [13, -17],
  [12, -10],
  [12.5, -6],
  [9, -1],
  [9.5, 4],
  [8.5, 4.5],
  [5, 5.5],
  [1, 6],
  [-1.5, 5],
  [-4.5, 5],
  [-7.5, 4.5],
  [-11, 6.5],
  [-13, 9.5],
  [-16, 13],
  [-17.5, 14.7],
  [-16.5, 19],
  [-16, 22],
  [-14, 26],
  [-12, 28],
  [-10, 30],
  [-9, 32.5],
  [-6, 34],
];

function pointInAfrica(lng: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = AFRICA_OUTLINE.length - 1; i < AFRICA_OUTLINE.length; j = i++) {
    const [xi, yi] = AFRICA_OUTLINE[i];
    const [xj, yj] = AFRICA_OUTLINE[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

type Dot = { x: number; y: number };

// Dense dot-matrix of Africa only — fine lat/lng grid, longitude density
// scaled by cos(lat), keeping just the points that fall on the continent.
const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  const LNG_COUNT = 180;
  for (let lat = -36; lat <= 38; lat += 1.8) {
    const ring = Math.max(1, Math.round(LNG_COUNT * Math.cos(lat * DEG)));
    for (let k = 0; k < ring; k += 1) {
      const lng = -180 + (360 * k) / ring;
      if (!pointInAfrica(lng, lat)) continue;
      const pr = project(lng, lat);
      if (!pr.front) continue;
      out.push({ x: pr.x, y: pr.y });
    }
  }
  return out;
})();

const REGIONS: Region[] = [
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬", lng: 8, lat: 9 },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭", lng: -1, lat: 7.5 },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", flag: "🇨🇮", lng: -5, lat: 7 },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪", lng: 37.9, lat: -0.5 },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦", lng: 25, lat: -29 },
];

const REGION_POS = Object.fromEntries(
  REGIONS.map((r) => [r.code, project(r.lng, r.lat)]),
) as Record<string, { x: number; y: number; front: boolean }>;

// Tight viewBox around the continent so it reads as a zoom onto Africa.
const PAD = 32;
const ALL_X = DOTS.map((d) => d.x);
const ALL_Y = DOTS.map((d) => d.y);
const MIN_X = Math.min(...ALL_X) - PAD;
const MIN_Y = Math.min(...ALL_Y) - PAD;
const VIEW_W = Math.max(...ALL_X) + PAD - MIN_X;
const VIEW_H = Math.max(...ALL_Y) + PAD - MIN_Y;

const FLOWS: Array<{ from: string; to: string; curve: number; dur: number; delay: number }> = [
  { from: "CI", to: "NG", curve: 0.35, dur: 2.6, delay: 0 },
  { from: "GH", to: "KE", curve: -0.3, dur: 4.2, delay: 0.6 },
  { from: "NG", to: "KE", curve: -0.26, dur: 3.8, delay: 1.1 },
  { from: "KE", to: "ZA", curve: 0.32, dur: 3.4, delay: 0.3 },
  { from: "NG", to: "ZA", curve: 0.4, dur: 4.6, delay: 1.6 },
];

function arcPath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  curve: number,
): string {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const off = dist * curve;
  return `M ${p1.x} ${p1.y} Q ${round(mx + nx * off)} ${round(my + ny * off)} ${p2.x} ${p2.y}`;
}

const FLOW_PATHS = FLOWS.map((flow, i) => ({
  id: `tt-flow-${i}`,
  d: arcPath(REGION_POS[flow.from], REGION_POS[flow.to], flow.curve),
  ...flow,
}));

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function AfricaFlowMap() {
  const reduced = usePrefersReducedMotion();
  const flags = regionFlags();
  const isActive = (code: string) => flags[code as keyof typeof flags] === true;

  return (
    <section className="section-alt py-16 sm:py-24" data-landing="stagger-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center" data-landing="reveal">
          <p className="text-sm font-bold text-brand-600">Across Africa</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Money moving where your audience lives
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
            Tips flow between creators and supporters across every region Paystack
            reaches — settling in the local currency, fast.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md" data-landing="map">
          <svg
            viewBox={`${round(MIN_X)} ${round(MIN_Y)} ${round(VIEW_W)} ${round(VIEW_H)}`}
            className="h-auto w-full"
            role="img"
            aria-label="Map of Africa showing tips flowing between Nigeria, Ghana, Côte d'Ivoire, Kenya and South Africa."
          >
            <defs>
              <linearGradient id="tt-flow-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(37,211,102,0)" />
                <stop offset="50%" stopColor="rgba(29,168,81,0.7)" />
                <stop offset="100%" stopColor="rgba(37,211,102,0)" />
              </linearGradient>
              <radialGradient id="tt-pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1da851" />
                <stop offset="45%" stopColor="#25d366" />
                <stop offset="100%" stopColor="rgba(37,211,102,0)" />
              </radialGradient>
              <filter id="tt-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>

            {/* dot-matrix Africa */}
            <g fill="var(--accent)">
              {DOTS.map((dot, i) => (
                <circle key={i} cx={dot.x} cy={dot.y} r={1} opacity={0.7} />
              ))}
            </g>

            {/* flow paths */}
            {FLOW_PATHS.map((flow) => (
              <path
                key={`${flow.id}-line`}
                id={flow.id}
                d={flow.d}
                fill="none"
                stroke="url(#tt-flow-line)"
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            ))}

            {/* travelling money pulses */}
            {!reduced &&
              FLOW_PATHS.map((flow) => (
                <circle key={`${flow.id}-pulse`} r={3.2} fill="url(#tt-pulse)">
                  <animateMotion
                    dur={`${flow.dur}s`}
                    begin={`${flow.delay}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath href={`#${flow.id}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    dur={`${flow.dur}s`}
                    begin={`${flow.delay}s`}
                    repeatCount="indefinite"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.9;1"
                  />
                </circle>
              ))}

            {/* region markers — only live regions are crisp; the rest are
                blurred/dimmed to signal "coming soon". */}
            {REGIONS.map((region) => {
              const pos = REGION_POS[region.code];
              if (!pos.front) return null;

              if (!isActive(region.code)) {
                return (
                  <circle
                    key={region.code}
                    cx={pos.x}
                    cy={pos.y}
                    r={3.4}
                    fill="#9ca3af"
                    opacity={0.4}
                    filter="url(#tt-blur)"
                  />
                );
              }

              return (
                <g key={region.code}>
                  {!reduced && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={4}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.4}
                    >
                      <animate
                        attributeName="r"
                        values="4;14"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.7;0"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill="var(--accent-deep)"
                    stroke="#ffffff"
                    strokeWidth={1.2}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* legend — live regions highlighted, others marked "Soon" */}
        <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {REGIONS.map((region) => {
            const active = isActive(region.code);
            return (
              <li
                key={region.code}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm ${
                  active
                    ? "border-brand-200 bg-white text-ink"
                    : "border-line bg-white text-muted opacity-60"
                }`}
              >
                <span aria-hidden className={active ? "" : "grayscale"}>
                  {region.flag}
                </span>
                {region.name}
                <span className={active ? "text-muted" : ""}>({region.currency})</span>
                {active ? (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-brand-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    Live
                  </span>
                ) : (
                  <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold text-muted">
                    Soon
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
