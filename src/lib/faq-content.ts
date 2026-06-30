import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

export type FaqCategory = {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export const PLATFORM_FEE_PERCENT = 5;

export const SUPPORT_EMAIL = "support@tribetip.africa";

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "What TribeTip is and how to set up your page.",
    items: [
      {
        question: "What is TribeTip?",
        answer:
          "TribeTip is a tipping platform built for African creators. You get one shareable link where your audience can send you tips using mobile money (like M-Pesa), cards, or bank transfers. Your earnings settle to your balance and you withdraw to your bank or wallet whenever you're ready.",
      },
      {
        question: "Who can use TribeTip?",
        answer:
          "Anyone with an audience — YouTubers, podcasters, musicians, artists, writers, educators, streamers, and community organisers. If people want to support your work, you can give them an easy way to do it.",
      },
      {
        question: "How much does it cost to start?",
        answer:
          "Nothing. Creating your page is free and there's no monthly subscription. We only earn when you do — see the Payments & fees section below.",
      },
      {
        question: "Which countries is TribeTip available in?",
        answer:
          "We're live in Kenya (KES) and rolling out across Africa, including Nigeria, Ghana, South Africa, and Côte d'Ivoire. Available markets are shown on our home page. If your country isn't live yet, you can still sign up to be notified.",
      },
      {
        question: "How do I create my page?",
        answer:
          "Pick a username, sign up with your email, and confirm your account. Your page goes live at tribetip.africa/your-username. Add a photo, a short bio, and your payout details so supporters can start tipping right away.",
      },
    ],
  },
  {
    id: "receiving-tips",
    title: "Receiving tips",
    description: "How supporters pay you and how tips reach your balance.",
    items: [
      {
        question: "How do supporters send me a tip?",
        answer:
          "They open your page, choose a preset or custom amount, optionally leave a message, and pay with mobile money, card, or bank transfer. They don't need to create an account — tipping takes just a couple of taps.",
      },
      {
        question: "Do my supporters need an account?",
        answer:
          "No. Supporters can tip as guests. They can choose to stay anonymous, and we never email your fans or sell their details.",
      },
      {
        question: "What payment methods are supported?",
        answer:
          "Mobile money (such as M-Pesa and MTN MoMo), debit and credit cards, and bank transfers, depending on your country. Payments are processed securely through Paystack.",
      },
      {
        question: "Is there a minimum or maximum tip amount?",
        answer:
          "Tips have a small minimum so that processing fees don't eat the whole amount, and a sensible upper limit to keep accounts safe. The exact amounts depend on your local currency and are shown on your tip page.",
      },
      {
        question: "Can I see who tipped me?",
        answer:
          "Yes. Your dashboard lists every tip with the amount, date, and any message. Supporters who choose to remain anonymous will appear without a name, but the tip is still recorded.",
      },
    ],
  },
  {
    id: "payments-fees",
    title: "Payments & fees",
    description: "What we charge and what lands in your balance.",
    items: [
      {
        question: "How much does TribeTip charge?",
        answer: `TribeTip takes a ${PLATFORM_FEE_PERCENT}% platform fee on tips you receive. There's no signup fee and no monthly subscription — we only earn when you receive a tip.`,
      },
      {
        question: "Are there payment processing fees too?",
        answer:
          "Yes. Our payment partner, Paystack, charges its own processing fee that varies by country and payment method. This is separate from the TribeTip platform fee. Both are deducted before the net amount reaches your balance, and each tip's breakdown is shown in your dashboard.",
      },
      {
        question: "When do tips reach my balance?",
        answer:
          "Once a payment is confirmed, the net amount is added to your available balance. Settlement timing depends on the payment method and Paystack's settlement schedule for your country.",
      },
      {
        question: "What currency will I be paid in?",
        answer:
          "You receive tips and withdraw in your local currency — KES, NGN, GHS, ZAR, and more — so there are no surprise conversions.",
      },
    ],
  },
  {
    id: "payouts",
    title: "Payouts & withdrawals",
    description: "Getting your money out to your bank or wallet.",
    items: [
      {
        question: "How do I withdraw my earnings?",
        answer:
          "From your dashboard, open Payouts and request a withdrawal to your linked bank account or mobile money wallet. Withdrawals are manual, so you stay in control of when you get paid.",
      },
      {
        question: "What do I need to set up payouts?",
        answer:
          "You'll connect your payout details — your bank account or mobile money number — through our secure onboarding. This verifies your account with Paystack so funds can be routed to you.",
      },
      {
        question: "How long do withdrawals take?",
        answer:
          "Withdrawal speed depends on your bank or mobile money provider and Paystack's processing times in your country. Most payouts arrive within a few business days; mobile money is often faster.",
      },
      {
        question: "Is there a minimum withdrawal amount?",
        answer:
          "Yes, there's a small minimum so that transfer fees remain reasonable. Your dashboard shows the minimum for your currency and your current available balance.",
      },
      {
        question: "Why was my withdrawal delayed or failed?",
        answer:
          "The most common reasons are incorrect payout details, an unverified account, or a temporary issue at the bank or mobile provider. Your dashboard shows the status of each withdrawal. If something looks stuck, contact support and we'll investigate.",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & security",
    description: "Keeping your account and supporters' data safe.",
    items: [
      {
        question: "How is my data protected?",
        answer:
          "We use industry-standard encryption in transit and never store full card details — payments are handled by Paystack, a PCI-DSS compliant processor. You own your supporter list and can export it any time.",
      },
      {
        question: "Can I change my username?",
        answer:
          "Your username is part of your public link, so changes are limited to protect existing shares. If you need to change it, reach out to support and we'll help where we can.",
      },
      {
        question: "What happens if I forget my password?",
        answer:
          "Use the reset link on the sign-in page. We'll email you a secure link to set a new password. For your safety, links expire after a short time.",
      },
      {
        question: "How do I delete my account?",
        answer: `You can request account deletion by contacting ${SUPPORT_EMAIL}. We'll close your account and remove your personal data, subject to any records we're legally required to keep (for example, transaction records for tax and compliance).`,
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    description: "Getting help when you need it.",
    items: [
      {
        question: "How do I contact support?",
        answer: `Email us at ${SUPPORT_EMAIL}. We aim to respond within one to two business days. Include your username and as much detail as possible so we can help quickly.`,
      },
      {
        question: "I think there's a problem with a tip or payout. What do I do?",
        answer:
          "Check the status in your dashboard first — it shows the most up-to-date state of every tip and withdrawal. If something still looks wrong, contact support with the date and amount and we'll look into it.",
      },
      {
        question: "Do you offer help getting started?",
        answer:
          "Yes. If you get stuck during setup or onboarding, reach out and we'll walk you through it. We want your first tip to land smoothly.",
      },
    ],
  },
];
