/**
 * Legal Pages (Terms, Privacy, Refund) — Default Content
 *
 * Centralised content defaults for the three legal/policy pages.
 * All three share an identical data structure.
 */

// ── Types ─────────────────────────────────────────────────────────────

export interface PolicySection {
  title: string
  content: string
}

export interface LegalPolicyContent {
  pageTitle: string
  pageSubtitle: string
  intro: string
  sections: PolicySection[]
}

// ── Terms & Conditions ────────────────────────────────────────────────
export const termsContent: LegalPolicyContent = {
  pageTitle: 'Terms and Conditions',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'These Terms and Conditions ("Terms") govern your use of the Digisharks Communications website and services. By accessing or using our website and services, you agree to be bound by these Terms.',
  sections: [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you should not use our website or services.'
    },
    {
      title: '2. Services Description',
      content: 'Digisharks Communications provides digital PR, marketing, web development, and related services. The specific scope, deliverables, timelines, and fees for each engagement will be outlined in a separate agreement or proposal between the parties.'
    },
    {
      title: '3. Intellectual Property',
      content: 'All content, materials, logos, trademarks, and intellectual property displayed on our website are owned by or licensed to Digisharks Communications unless otherwise stated. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.\n\nUpon full payment for services, we grant you a license to use the deliverables produced for you under the terms specified in your service agreement.'
    },
    {
      title: '4. User Obligations',
      content: 'You agree to:\n• Provide accurate and complete information when using our services\n• Use our website and services in compliance with all applicable laws\n• Not engage in any activity that could harm, disable, or impair our systems\n• Not attempt to gain unauthorized access to any part of our website\n• Maintain the confidentiality of any account credentials provided to you'
    },
    {
      title: '5. Payment Terms',
      content: 'Fees for services are as outlined in your service agreement or proposal. Payments are due according to the schedule specified in your agreement. Late payments may result in suspension of services or additional charges. All fees are non-refundable unless otherwise stated in your agreement.'
    },
    {
      title: '6. Limitation of Liability',
      content: 'To the maximum extent permitted by law, Digisharks Communications shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our website or services. Our total liability for any claim shall not exceed the amount paid by you for the specific service giving rise to the claim.'
    },
    {
      title: '7. Indemnification',
      content: 'You agree to indemnify and hold Digisharks Communications harmless from any claims, damages, losses, liabilities, and expenses arising out of your use of our services, your violation of these Terms, or your infringement of any third-party rights.'
    },
    {
      title: '8. Termination',
      content: 'We reserve the right to suspend or terminate your access to our services at any time if you violate these Terms or for any other reason, with or without notice. Upon termination, your right to use our services will immediately cease.'
    },
    {
      title: '9. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our website or services after any changes constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.'
    },
    {
      title: '11. Contact Us',
      content: 'If you have any questions about these Terms, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}

// ── Privacy Policy ────────────────────────────────────────────────────
export const privacyContent: LegalPolicyContent = {
  pageTitle: 'Privacy Policy',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'This Privacy Policy describes how Digisharks Communications ("we", "our", or "us") collects, uses, and shares your personal information when you visit our website or use our services.',
  sections: [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, such as when you fill out a contact form, sign up for our services, apply for a job, or communicate with us. This may include your name, email address, phone number, company name, and any other information you choose to provide.\n\nWe also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages visited. We use cookies and similar tracking technologies to collect this data.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to:\n• Provide, maintain, and improve our services\n• Respond to your inquiries and send you relevant information\n• Send marketing communications (with your consent)\n• Analyze website usage and improve user experience\n• Comply with legal obligations and protect our rights'
    },
    {
      title: '3. Sharing of Information',
      content: 'We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and business, provided they agree to keep your information confidential. We may also disclose information if required by law or to protect our rights.'
    },
    {
      title: '4. Data Security',
      content: 'We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      title: '5. Your Rights',
      content: 'Depending on your location, you may have the right to:\n• Access the personal information we hold about you\n• Request correction of inaccurate information\n• Request deletion of your information\n• Object to or restrict processing of your information\n• Data portability\n• Withdraw consent at any time\n\nTo exercise any of these rights, please contact us at marketing@digisharkscommunications.com.'
    },
    {
      title: '6. Cookies',
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors come from. You can control cookies through your browser settings. Disabling cookies may affect certain features of our website.'
    },
    {
      title: '7. Third-Party Links',
      content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. We encourage you to review the privacy policies of any third-party sites you visit.'
    },
    {
      title: '8. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our website after changes constitutes acceptance of the updated policy.'
    },
    {
      title: '9. Contact Us',
      content: 'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}

// ── Refund Policy ─────────────────────────────────────────────────────
export const refundContent: LegalPolicyContent = {
  pageTitle: 'Refund Policy',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'This Refund Policy ("Policy") outlines the terms under which Digisharks Communications ("we", "our", or "us") provides refunds for our services and digital products. Please read this Policy carefully before making a purchase.',
  sections: [
    {
      title: '1. General Policy',
      content: 'All fees for services rendered by Digisharks Communications are non-refundable unless otherwise expressly stated in your signed service agreement or proposal. By engaging our services, you acknowledge that you have read and agree to this Policy.'
    },
    {
      title: '2. Service Cancellation & Refunds',
      content: '• If you cancel a service before work has commenced, a full refund minus any administrative fees will be issued.\n• If work has commenced but deliverables have not yet been provided, refunds are assessed on a case-by-case basis depending on the work completed to date.\n• Once deliverables have been provided or the project is substantially complete, no refund will be issued.\n• Monthly retainer services may be cancelled with 30 days written notice. Fees already paid for the current billing period are non-refundable.\n• Campaign-based services (PR campaigns, election campaigns, etc.) are non-refundable once the campaign strategy has been finalized and execution has begun.'
    },
    {
      title: '3. Digital Products (Databases, Templates, etc.)',
      content: 'Due to the nature of digital products, all sales of digital products (including but not limited to business databases, templates, reports, and downloadable content) are FINAL and non-refundable once the product has been downloaded or accessed.\n\nIf you experience technical issues accessing or downloading a digital product, please contact us within 7 days of purchase and we will work with you to resolve the issue. If we are unable to provide access to the product after reasonable efforts, a full refund will be issued.'
    },
    {
      title: '4. Refund Request Process',
      content: 'To request a refund, please contact us at marketing@digisharkscommunications.com with the following information:\n• Your full name and company name\n• Invoice or order number\n• Date of purchase\n• Detailed reason for the refund request\n\nWe will review your request and respond within 7-10 business days. Approved refunds will be processed within 14 business days and credited to the original payment method.'
    },
    {
      title: '5. Dispute Resolution',
      content: 'If you are unsatisfied with our resolution of your refund request, you may escalate the matter to our management team at the same email address. We are committed to resolving all disputes fairly and promptly.'
    },
    {
      title: '6. Contact Us',
      content: 'For any questions regarding this Refund Policy, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}
