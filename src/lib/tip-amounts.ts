import { formatMoney } from "@/lib/money";

export type TipPreset = {
  id: "standard" | "generous" | "custom";
  label: string;
  cents: number | null;
};

export function buildTipPresets(defaultCents: number, currency: string): TipPreset[] {
  const standard = Math.max(100, defaultCents);
  const generous = Math.max(standard + 100, standard * 2);

  return [
    {
      id: "standard",
      label: formatMoney(standard, currency),
      cents: standard,
    },
    {
      id: "generous",
      label: formatMoney(generous, currency),
      cents: generous,
    },
    {
      id: "custom",
      label: "Custom",
      cents: null,
    },
  ];
}
