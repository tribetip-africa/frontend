import { PLATFORM_FEE_PERCENT } from "@/lib/faq-content";
import { ENTITY_AUDIENCE, ENTITY_DEFINITION, ENTITY_PAYMENTS } from "@/lib/entity";

export const FOR_CREATORS_TITLE = "For creators";
export const FOR_CREATORS_DESCRIPTION =
  "How African creators accept tips with TribeTip — one link, mobile money and card payments, local currencies, and payouts to your bank or wallet.";

export const FOR_CREATORS_SECTIONS = [
  {
    id: "what-is-tribetip",
    title: "What is TribeTip for creators?",
    paragraphs: [
      ENTITY_DEFINITION,
      `Your public page lives at tribetip.africa/your-username. Share it in your bio, show notes, or group chat and let supporters tip in KES, NGN, GHS, ZAR, and more.`,
    ],
  },
  {
    id: "who-its-for",
    title: "Who TribeTip is for",
    paragraphs: [
      `${ENTITY_AUDIENCE} If people want to support your work, TribeTip gives them a fast way to pay without creating an account.`,
    ],
  },
  {
    id: "how-tipping-works",
    title: "How tipping works",
    paragraphs: [
      "Supporters open your link, choose a preset or custom amount, optionally leave a message, and pay with mobile money or card. Tips settle to your TribeTip balance after payment confirmation.",
      ENTITY_PAYMENTS,
    ],
  },
  {
    id: "payouts",
    title: "Payouts and withdrawals",
    paragraphs: [
      "Connect your bank account or mobile money wallet through secure Paystack onboarding. Withdraw manually from your dashboard when you are ready — you stay in control of cash-out timing.",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    paragraphs: [
      `Creating your page is free. TribeTip charges a ${PLATFORM_FEE_PERCENT}% platform fee on tips you receive. Paystack also charges processing fees that vary by country and payment method.`,
    ],
  },
  {
    id: "why-tribetip",
    title: "Why creators choose TribeTip",
    bullets: [
      "Mobile money native for African audiences",
      "Supporters can tip as guests — no fan accounts required",
      "We never email your supporters or sell their details",
      "One link you can share anywhere",
      "Earn when you earn — no monthly subscription",
    ],
  },
] as const;
