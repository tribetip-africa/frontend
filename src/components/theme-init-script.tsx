import { THEME_STORAGE_KEY } from "@/lib/theme";

const themeInitScript = `
(function () {
  try {
    var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    var preference = localStorage.getItem(storageKey) || "system";
    var dark =
      preference === "dark" ||
      (preference === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = preference;
  } catch (e) {}
})();
`;

type ThemeInitScriptProps = {
  nonce?: string;
};

export function ThemeInitScript({ nonce }: ThemeInitScriptProps) {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
