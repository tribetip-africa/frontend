import { SUPPORT_EMAIL } from "@/lib/faq-content";
import type { TermsSection } from "@/lib/terms-content";

export type PrivacySection = TermsSection;

export const PRIVACY_LAST_UPDATED = "June 29, 2026";

export { SUPPORT_EMAIL };

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "overview",
    title: "Overview",
    blocks: [
      {
        type: "paragraph",
        text: "This Privacy Policy explains what personal information TribeTip (\u201cwe\u201d, \u201cus\u201d) collects, how we use it, and the choices you have. It applies to creators, supporters, and anyone who visits TribeTip.",
      },
      {
        type: "paragraph",
        text: "Our guiding principle is simple: we collect only what we need to run the Service, we never email or sell your supporters, and you stay in control of your data.",
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      {
        type: "paragraph",
        text: "Depending on how you use TribeTip, we may collect:",
      },
      {
        type: "list",
        items: [
          "Account details you provide, such as your username, email address, display name, bio, and profile image.",
          "Payout and verification details needed to send you your earnings, such as your bank or mobile money information, handled through our payment partner.",
          "Transaction data, such as tip amounts, dates, messages, and settlement records.",
          "Limited supporter information, such as a name or message a supporter chooses to share when tipping. Supporters may tip anonymously.",
          "Technical data, such as your device, browser, and IP address, collected automatically to keep the Service secure and working.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    blocks: [
      {
        type: "paragraph",
        text: "We use personal information to:",
      },
      {
        type: "list",
        items: [
          "Operate your page, process tips, and pay out your earnings.",
          "Verify identities and prevent fraud, money laundering, and abuse.",
          "Provide support and respond to your requests.",
          "Comply with legal, tax, and regulatory obligations.",
          "Improve and secure the Service.",
        ],
      },
      {
        type: "paragraph",
        text: "We do not sell your personal data, and we do not email your supporters for marketing.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments and third parties",
    blocks: [
      {
        type: "paragraph",
        text: "Payments are processed by our payment partner, Paystack. We do not store full card numbers; that information is handled by the processor under PCI-DSS standards. Paystack processes your data under its own privacy policy, which we encourage you to review.",
      },
      {
        type: "paragraph",
        text: "We may also use trusted service providers for hosting, analytics, and communications. These providers may only process your data on our instructions and for the purposes we set.",
      },
    ],
  },
  {
    id: "sharing",
    title: "When we share information",
    blocks: [
      {
        type: "paragraph",
        text: "We share personal information only when needed:",
      },
      {
        type: "list",
        items: [
          "With payment and service providers that help us run the Service.",
          "When required by law, regulation, or a valid legal request.",
          "To prevent fraud, protect users, or enforce our Terms.",
          "In connection with a merger, acquisition, or sale of assets, with appropriate protections.",
        ],
      },
    ],
  },
  {
    id: "supporter-data",
    title: "Supporter data and your responsibilities",
    blocks: [
      {
        type: "paragraph",
        text: "As a creator, you own your supporter list and can export it at any time. When you export or use that data, you act as the controller of it and must handle it in line with applicable data-protection laws — including respecting supporters' privacy and any requests they make.",
      },
    ],
  },
  {
    id: "retention",
    title: "Data retention",
    blocks: [
      {
        type: "paragraph",
        text: "We keep personal information for as long as your account is active and as needed to provide the Service. We may retain certain records longer where required for legal, tax, accounting, or fraud-prevention purposes, after which we delete or anonymise the data.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      {
        type: "paragraph",
        text: "We use industry-standard safeguards, including encryption in transit, to protect your information. No system is perfectly secure, but we work continuously to protect your data and will notify you of significant incidents where required by law.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    blocks: [
      {
        type: "paragraph",
        text: "Depending on where you live, you may have rights to:",
      },
      {
        type: "list",
        items: [
          "Access the personal data we hold about you.",
          "Correct inaccurate or incomplete data.",
          "Request deletion of your data, subject to records we must keep.",
          "Object to or restrict certain processing.",
          "Export a copy of your data in a portable format.",
        ],
      },
      {
        type: "paragraph",
        text: `To exercise any of these rights, contact us at ${SUPPORT_EMAIL}. We will respond within a reasonable time and in line with applicable law.`,
      },
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      {
        type: "paragraph",
        text: "TribeTip is not intended for anyone under 18, or under the age of majority in their country. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will remove it.",
      },
    ],
  },
  {
    id: "international",
    title: "International data transfers",
    blocks: [
      {
        type: "paragraph",
        text: "Your information may be processed in countries other than your own, including where our service providers operate. Where we transfer data internationally, we take steps to ensure it remains protected in accordance with applicable law.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        type: "paragraph",
        text: "We may update this Privacy Policy from time to time. When we make material changes, we will update the date at the top of this page and, where appropriate, notify you. Continued use of the Service means you accept the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      {
        type: "paragraph",
        text: `If you have questions about this Privacy Policy or how we handle your data, contact us at ${SUPPORT_EMAIL}.`,
      },
    ],
  },
];
