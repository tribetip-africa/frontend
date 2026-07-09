import {
  isThemePreference,
  resolveTheme,
  themePreferenceLabel,
} from "@/lib/theme";

describe("theme", () => {
  it("validates stored preferences", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
  });

  it("resolves explicit preferences", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("labels preferences for the switcher", () => {
    expect(themePreferenceLabel("light", "light")).toBe("Light");
    expect(themePreferenceLabel("system", "dark")).toBe("System (dark)");
  });
});
