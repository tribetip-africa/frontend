import { PLATFORM_FEE_PERCENT, SUPPORT_EMAIL } from "@/lib/faq-content";

export type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type TermsSection = {
  id: string;
  title: string;
  blocks: TermsBlock[];
};

export const TERMS_LAST_UPDATED = "June 29, 2026";

export { PLATFORM_FEE_PERCENT, SUPPORT_EMAIL };

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "agreement",
    title: "Agreement to terms",
    blocks: [
      {
        type: "paragraph",
        text: "These Terms of Service (\u201cTerms\u201d) govern your access to and use of TribeTip (the \u201cService\u201d), a platform that lets creators receive tips from their supporters and withdraw their earnings. By creating an account, accessing your page, or sending a tip, you agree to these Terms.",
      },
      {
        type: "paragraph",
        text: "If you are using TribeTip on behalf of an organisation, you confirm that you have authority to bind that organisation to these Terms. If you do not agree, please do not use the Service.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    blocks: [
      {
        type: "paragraph",
        text: "To use TribeTip you must:",
      },
      {
        type: "list",
        items: [
          "Be at least 18 years old, or the age of majority in your country.",
          "Be able to form a legally binding contract.",
          "Reside in or operate from a country where TribeTip is available.",
          "Provide accurate, current information when you sign up and keep it up to date.",
        ],
      },
    ],
  },
  {
    id: "accounts",
    title: "Your account",
    blocks: [
      {
        type: "paragraph",
        text: "You are responsible for your account, including your username, login credentials, and all activity that happens under it. Keep your password secure and notify us immediately if you suspect unauthorised access.",
      },
      {
        type: "paragraph",
        text: "Your username forms part of your public link (for example, tribetip.africa/your-username). You may not choose a username that impersonates another person or brand, infringes someone's rights, or is misleading.",
      },
    ],
  },
  {
    id: "creator-responsibilities",
    title: "Creator responsibilities",
    blocks: [
      {
        type: "paragraph",
        text: "As a creator receiving tips, you agree to:",
      },
      {
        type: "list",
        items: [
          "Use TribeTip only for genuine support of your own creative work or community.",
          "Provide accurate payout and identity details for verification and compliance.",
          "Be responsible for any taxes due on the income you receive through the Service.",
          "Honour any promises you make to supporters in exchange for their tips.",
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    blocks: [
      {
        type: "paragraph",
        text: "You may not use TribeTip to do, promote, or facilitate any of the following:",
      },
      {
        type: "list",
        items: [
          "Illegal activity, fraud, money laundering, or financing of prohibited activities.",
          "Sale of regulated, dangerous, or prohibited goods and services.",
          "Hateful, harassing, violent, or sexually exploitative content, especially anything involving minors.",
          "Infringing the intellectual property or privacy rights of others.",
          "Attempting to disrupt, reverse engineer, or gain unauthorised access to the Service.",
          "Collecting tips on behalf of someone else without authorisation, or using the Service primarily to move money rather than to receive genuine support.",
        ],
      },
    ],
  },
  {
    id: "tips-payments",
    title: "Tips and payments",
    blocks: [
      {
        type: "paragraph",
        text: "Supporters can send tips to creators using the payment methods available in their country, including mobile money, cards, and bank transfers. Payments are processed by our third-party payment partner, Paystack.",
      },
      {
        type: "paragraph",
        text: "A tip is a voluntary payment to support a creator. Unless a creator has clearly promised something specific in return, tips do not entitle the supporter to goods, services, or any other deliverable.",
      },
      {
        type: "paragraph",
        text: "We may apply minimum and maximum tip amounts and other limits to keep accounts safe and comply with our payment partners' rules.",
      },
    ],
  },
  {
    id: "fees",
    title: "Fees",
    blocks: [
      {
        type: "paragraph",
        text: `Creating a page and maintaining your account is free. TribeTip charges a platform fee of ${PLATFORM_FEE_PERCENT}% on tips you receive. In addition, our payment partner charges its own processing fees, which vary by country and payment method.`,
      },
      {
        type: "paragraph",
        text: "Applicable fees are deducted before the net amount is credited to your balance. Each transaction's breakdown is visible in your dashboard. We may change our fees from time to time; material changes will be communicated in advance.",
      },
    ],
  },
  {
    id: "payouts",
    title: "Payouts and withdrawals",
    blocks: [
      {
        type: "paragraph",
        text: "Tips you receive accumulate in your TribeTip balance. You can request withdrawals to your verified bank account or mobile money wallet from your dashboard. Withdrawals are subject to minimum amounts, verification, and the processing times of our payment partner and your financial institution.",
      },
      {
        type: "paragraph",
        text: "We may delay, hold, or decline a payout where required for verification, fraud prevention, legal compliance, or where there is a dispute or a reasonable suspicion of prohibited activity.",
      },
    ],
  },
  {
    id: "refunds-chargebacks",
    title: "Refunds and chargebacks",
    blocks: [
      {
        type: "paragraph",
        text: "Because tips are voluntary payments, they are generally non-refundable. If a supporter believes a tip was made in error or fraudulently, they should contact us promptly.",
      },
      {
        type: "paragraph",
        text: "If a payment is reversed, disputed, or charged back, we may deduct the corresponding amount (and any related fees) from your balance or future earnings. You agree to cooperate with us in resolving any such disputes.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services",
    blocks: [
      {
        type: "paragraph",
        text: "TribeTip relies on third-party providers, including Paystack for payment processing. Your use of those services may be subject to their own terms and privacy policies. We are not responsible for the acts or omissions of third-party providers, but we will work with them in good faith to resolve issues that affect you.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    blocks: [
      {
        type: "paragraph",
        text: "You retain ownership of the content you upload to your page, such as your name, bio, and images. By posting content, you grant TribeTip a limited licence to display and distribute it for the purpose of operating and promoting the Service.",
      },
      {
        type: "paragraph",
        text: "The TribeTip name, logo, and platform are owned by us and may not be copied or used without permission.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and data",
    blocks: [
      {
        type: "paragraph",
        text: "We respect your privacy and that of your supporters. We do not email your supporters for marketing or sell their personal data. We collect and process personal information only as needed to operate the Service, comply with the law, and prevent fraud.",
      },
      {
        type: "paragraph",
        text: "As a creator, you own your supporter list and can export it at any time. You are responsible for handling any supporter data you export in line with applicable data-protection laws.",
      },
    ],
  },
  {
    id: "suspension-termination",
    title: "Suspension and termination",
    blocks: [
      {
        type: "paragraph",
        text: "You may stop using TribeTip and request account deletion at any time. We may suspend or terminate your access if you breach these Terms, if required by law or our payment partners, or to protect the Service, creators, or supporters from harm.",
      },
      {
        type: "paragraph",
        text: "Where reasonable, we will give you notice and an opportunity to resolve the issue. On termination, we will release any balance properly owed to you, subject to verification and any amounts we are entitled to withhold.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    blocks: [
      {
        type: "paragraph",
        text: "The Service is provided \u201cas is\u201d and \u201cas available\u201d. While we work hard to keep TribeTip reliable and secure, we do not guarantee that it will be uninterrupted, error-free, or that it will meet every expectation. To the extent permitted by law, we disclaim all warranties not expressly stated in these Terms.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      {
        type: "paragraph",
        text: "To the maximum extent permitted by law, TribeTip will not be liable for indirect, incidental, or consequential damages, or for lost profits or revenue. Our total liability for any claim relating to the Service will not exceed the platform fees you paid to us in the three months before the event giving rise to the claim.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      {
        type: "paragraph",
        text: "We may update these Terms from time to time. When we make material changes, we will update the date at the top of this page and, where appropriate, notify you. Your continued use of the Service after changes take effect means you accept the updated Terms.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    blocks: [
      {
        type: "paragraph",
        text: "These Terms are governed by the laws of the Republic of Kenya, without regard to its conflict-of-laws rules. The courts of Kenya will have jurisdiction over any dispute, unless mandatory local consumer-protection laws in your country require otherwise.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      {
        type: "paragraph",
        text: `If you have questions about these Terms, contact us at ${SUPPORT_EMAIL}. We're here to help.`,
      },
    ],
  },
];
