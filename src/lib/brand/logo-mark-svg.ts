/** SVG source for the TribeTip logo mark (matches `LogoMark` in `logo.tsx`). */
export const LOGO_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#25d366"/><path d="M12 26c2-5 6-8 8-8s6 3 8 8" fill="none" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="20" cy="17" rx="7" ry="5" fill="#e7f9ef" stroke="#1a1a1a" stroke-width="1.8"/><path d="M17 17h6" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export function logoMarkDataUri(): string {
  return `data:image/svg+xml,${encodeURIComponent(LOGO_MARK_SVG)}`;
}
