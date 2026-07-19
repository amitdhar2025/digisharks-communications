/**
 * Page Field Definitions
 *
 * Defines which fields each page has, so the admin editor can render
 * the correct form inputs (text, textarea, image, array, etc.).
 *
 * Each field has:
 *   key       — the key in the content object
 *   label     — human-readable label shown in the admin form
 *   type      — 'text' | 'textarea' | 'richtext' | 'image' | 'link' | 'stat[]' | 'text[]'
 *   section   — section heading to group related fields
 *   default   — fallback value (used when no CMS content exists)
 *
 * Each page's fields are grouped into sections for the admin UI.
 */

/**
 * Field type reference:
 *   'text'       — single-line <input>
 *   'textarea'   — multi-line <textarea>
 *   'image'      — image URL with Cloudinary upload button
 *   'image[]'    — array of image URLs
 *   'link'       — { text, href } object
 *   'stat[]'     — array of { number, suffix, label, desc? }
 *   'text[]'     — array of strings
 *   'card[]'     — array of { icon, title, desc, stats? }
 *   'pricing[]'  — array of pricing cards
 *   'faq[]'      — array of { question, answer }
 *   'timeline[]' — array of { year, heading, description }
 *   'video'      — video URL with preview
 *   'gallery[]'  — sortable image gallery with isActive/order/caption/alt/link
 *   'award[]'    — sortable awards with image/title/subtitle/isActive/order
 */

const PAGE_FIELDS = {
  // ═══════════════════════════════════════════════════════════════════
  // HOME PAGE
  // ═══════════════════════════════════════════════════════════════════
  home: {
    pageName: 'Home',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Section Label (eyebrow)', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA Button', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA Button', type: 'link' },
          { key: 'heroStats', label: 'Stats Row', type: 'stat[]' },
          { key: 'heroVideo', label: 'Hero Background Video URL', type: 'video' },
          { key: 'heroMedia', label: 'Hero Banner Images/Videos (Auto Carousel)', type: 'gallery[]' },
        ],
      },
      {
        label: 'Brand Logos / Carousel Section',
        fields: [
          { key: 'brandLogosHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'brandLogosImages', label: 'Brand Logo Images (carousel)', type: 'gallery[]' },
        ],
      },
      {
        label: 'AI Growth Metrics Section',
        fields: [
          { key: 'metricsLabel', label: 'Section Label', type: 'text' },
          { key: 'metricsHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'metricsDescription', label: 'Section Description', type: 'richtext' },
          { key: 'metrics', label: 'Metric Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Awards Section',
        fields: [
          { key: 'awardsLabel', label: 'Section Label', type: 'text' },
          { key: 'awardsHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'awardsDescription', label: 'Section Description', type: 'richtext' },
          { key: 'awardsItems', label: 'Award Items (image, title, subtitle)', type: 'award[]' },
        ],
      },
      {
        label: 'Media Houses Section',
        fields: [
          { key: 'mediaHouseItems', label: 'Media House Logos (upload or enter URL + caption)', type: 'gallery[]' },
        ],
      },
      {
        label: 'Services Section',
        fields: [
          { key: 'servicesLabel', label: 'Section Label', type: 'text' },
          { key: 'servicesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'servicesSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'services', label: 'Service Items', type: 'card[]' },
        ],
      },
      {
        label: 'Why Choose Us Section',
        fields: [
          { key: 'whyChooseLabel', label: 'Section Label', type: 'text' },
          { key: 'whyChooseHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'whyChooseSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'whyChooseItems', label: 'Why Choose Items', type: 'text[]' },
          { key: 'whyChooseIcons', label: 'Icon Grid Items', type: 'card[]' },
        ],
      },
      {
        label: 'Testimonials',
        fields: [
          { key: 'testimonialsLabel', label: 'Section Label', type: 'text' },
          { key: 'testimonialsHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'testimonialsSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'CTA / Final Section',
        fields: [
          { key: 'ctaBadge', label: 'Badge Text', type: 'text' },
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaFeatures', label: 'Feature Tags', type: 'text[]' },
          { key: 'ctaButton', label: 'CTA Button', type: 'link' },
        ],
      },
      {
        label: 'Footer Info',
        fields: [
          { key: 'footerTagline', label: 'Footer Tagline', type: 'richtext' },
          { key: 'footerEmail', label: 'Email', type: 'text' },
          { key: 'footerPhone', label: 'Phone', type: 'text' },
          { key: 'footerAddress', label: 'Address', type: 'richtext' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ABOUT US PAGE
  // ═══════════════════════════════════════════════════════════════════
  'about-us': {
    pageName: 'About Us',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroStats', label: 'Stats Row', type: 'stat[]' },
          { key: 'heroBadges', label: 'Badge Text Items', type: 'text[]' },
          { key: 'heroVideo', label: 'Hero Background Video URL', type: 'video' },
        ],
      },
      {
        label: 'About Company',
        fields: [
          { key: 'aboutCompanyLabel', label: 'Section Label', type: 'text' },
          { key: 'aboutCompanyHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'aboutCompanyDescription', label: 'Description', type: 'richtext' },
          { key: 'aboutCompanyAchievements', label: 'Achievement Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Vision & Mission',
        fields: [
          { key: 'visionHeading', label: 'Vision Heading', type: 'text' },
          { key: 'visionDescription', label: 'Vision Description', type: 'richtext' },
          { key: 'missionHeading', label: 'Mission Heading', type: 'text' },
          { key: 'missionDescription', label: 'Mission Description', type: 'richtext' },
          { key: 'whatWeOfferItems', label: 'What We Offer (list)', type: 'text[]' },
        ],
      },
      {
        label: 'Core Values',
        fields: [
          { key: 'valuesLabel', label: 'Section Label', type: 'text' },
          { key: 'valuesHeading', label: 'Section Heading', type: 'text' },
          { key: 'valuesDescription', label: 'Section Description', type: 'richtext' },
          { key: 'values', label: 'Value Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Leadership',
        fields: [
          { key: 'leaderName', label: 'Leader Name', type: 'text' },
          { key: 'leaderRole', label: 'Leader Role', type: 'text' },
          { key: 'leaderBio', label: 'Leader Bio', type: 'richtext' },
          { key: 'leaderImage', label: 'Leader Image', type: 'image' },
          { key: 'leaderCredentials', label: 'Credential Tags', type: 'text[]' },
          { key: 'politicalExperience', label: 'Political Campaign Experience', type: 'richtext' },
          { key: 'mediaVentures', label: 'Media & Publishing Ventures', type: 'richtext' },
          { key: 'socialImpact', label: 'Social Impact & Philanthropy', type: 'richtext' },
        ],
      },
      {
        label: 'Timeline / Journey',
        fields: [
          { key: 'timelineLabel', label: 'Section Label', type: 'text' },
          { key: 'timelineHeading', label: 'Section Heading', type: 'text' },
          { key: 'timelineDescription', label: 'Section Description', type: 'richtext' },
          { key: 'timelineItems', label: 'Timeline Items', type: 'timeline[]' },
        ],
      },
      {
        label: 'Achievements By Numbers',
        fields: [
          { key: 'achievementsHeading', label: 'Section Heading', type: 'text' },
          { key: 'achievements', label: 'Achievement Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Booth Management Section',
        fields: [
          { key: 'boothHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'boothDescription', label: 'Description', type: 'richtext' },
          { key: 'boothFeatures', label: 'Feature Items', type: 'text[]' },
          { key: 'boothStats', label: 'Stats', type: 'stat[]' },
        ],
      },
      {
        label: 'FAQ Section',
        fields: [
          { key: 'faqLabel', label: 'Section Label', type: 'text' },
          { key: 'faqHeading', label: 'Section Heading', type: 'text' },
          { key: 'faqDescription', label: 'Section Description', type: 'richtext' },
          { key: 'faqItems', label: 'FAQ Items', type: 'faq[]' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaFeatures', label: 'Feature Items', type: 'text[]' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SERVICES & PRICING PAGE
  // ═══════════════════════════════════════════════════════════════════
  'services-top-pr-digital-marketing': {
    pageName: 'Services & Pricing',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'text' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'Pricing Section',
        fields: [
          { key: 'pricingLabel', label: 'Section Label', type: 'text' },
          { key: 'pricingHeading', label: 'Section Heading', type: 'text' },
          { key: 'pricingSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'AI Tools Section',
        fields: [
          { key: 'aiToolsLabel', label: 'Section Label', type: 'text' },
          { key: 'aiToolsHeading', label: 'Section Heading', type: 'text' },
          { key: 'aiToolsSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'aiTools', label: 'AI Tool Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Capabilities Grid',
        fields: [
          { key: 'capabilitiesHeading', label: 'Section Heading', type: 'text' },
          { key: 'capabilitiesSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'text' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BRAND PROMOTION PAGE
  // ═══════════════════════════════════════════════════════════════════
  'brand-promotion': {
    pageName: 'Brand Promotion',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'Approach Section',
        fields: [
          { key: 'approachLabel', label: 'Section Label', type: 'text' },
          { key: 'approachHeading', label: 'Section Heading', type: 'text' },
          { key: 'approachSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'approachCards', label: 'Approach Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Services Section',
        fields: [
          { key: 'servicesHeading', label: 'Section Heading', type: 'text' },
          { key: 'servicesSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Benefits / Why It Matters',
        fields: [
          { key: 'benefitsHeading', label: 'Section Heading', type: 'text' },
          { key: 'benefits', label: 'Benefit Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Process Section',
        fields: [
          { key: 'processHeading', label: 'Section Heading', type: 'text' },
          { key: 'processSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'processSteps', label: 'Process Steps', type: 'card[]' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CONTACT US PAGE
  // ═══════════════════════════════════════════════════════════════════
  'contact-us': {
    pageName: 'Contact Us',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'Contact Information',
        fields: [
          { key: 'contactHeading', label: 'Section Heading', type: 'text' },
          { key: 'contactAddress', label: 'Office Address', type: 'richtext' },
          { key: 'contactPhone', label: 'Phone Number', type: 'text' },
          { key: 'contactEmail', label: 'Email Address', type: 'text' },
          { key: 'contactHours', label: 'Business Hours', type: 'text' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DIGITAL MARKETING PAGE
  // ═══════════════════════════════════════════════════════════════════
  'digital-marketing-agency': {
    pageName: 'Digital Marketing Agency',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'Three Pillars Section',
        fields: [
          { key: 'pillarsLabel', label: 'Section Label', type: 'text' },
          { key: 'pillarsHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'pillarsSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Services Section',
        fields: [
          { key: 'servicesLabel', label: 'Section Label', type: 'text' },
          { key: 'servicesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'servicesSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Why Digisharks Section',
        fields: [
          { key: 'whyLabel', label: 'Section Label', type: 'text' },
          { key: 'whyHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'whyDescription', label: 'Description', type: 'richtext' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SOCIAL MEDIA PAGE
  // ═══════════════════════════════════════════════════════════════════
  'social-media': {
    pageName: 'Social Media Marketing',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'What We Do Section',
        fields: [
          { key: 'servicesLabel', label: 'Section Label', type: 'text' },
          { key: 'servicesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'servicesSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Solutions Section',
        fields: [
          { key: 'solutionsLabel', label: 'Section Label', type: 'text' },
          { key: 'solutionsHeading', label: 'Section Heading', type: 'richtext' },
        ],
      },
      {
        label: 'Social Advertising Section',
        fields: [
          { key: 'advertisingLabel', label: 'Section Label', type: 'text' },
          { key: 'advertisingHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'advertisingSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Global Insights Section',
        fields: [
          { key: 'globalLabel', label: 'Section Label', type: 'text' },
          { key: 'globalHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'globalSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Why Invest Section',
        fields: [
          { key: 'investLabel', label: 'Section Label', type: 'text' },
          { key: 'investHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'investSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Benefits Section',
        fields: [
          { key: 'benefitsLabel', label: 'Section Label', type: 'text' },
          { key: 'benefitsHeading', label: 'Section Heading', type: 'richtext' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // WEB DEVELOPMENT PAGE
  // ═══════════════════════════════════════════════════════════════════
  'web-development': {
    pageName: 'Web Development',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
      {
        label: 'Professional Web Development (Benefits)',
        fields: [
          { key: 'webDevLabel', label: 'Section Label', type: 'text' },
          { key: 'webDevHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'webDevDescription', label: 'Section Description', type: 'richtext' },
          { key: 'webDevBenefits', label: 'Benefit Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Services Section',
        fields: [
          { key: 'servicesLabel', label: 'Section Label', type: 'text' },
          { key: 'servicesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'servicesDescription', label: 'Section Description', type: 'richtext' },
        ],
      },
      {
        label: 'Why Choose Digisharks',
        fields: [
          { key: 'whyLabel', label: 'Section Label', type: 'text' },
          { key: 'whyHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'whyChooseBenefits', label: 'Benefit Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Benefits Section',
        fields: [
          { key: 'benefitsLabel', label: 'Section Label', type: 'text' },
          { key: 'benefitsHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'benefitsCards', label: 'Benefit Cards', type: 'card[]' },
        ],
      },
      {
        label: 'Industries Section',
        fields: [
          { key: 'industriesLabel', label: 'Section Label', type: 'text' },
          { key: 'industriesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'industriesDescription', label: 'Section Description', type: 'richtext' },
          { key: 'industriesFooter', label: 'Section Footer Text', type: 'richtext' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRESS RELEASE PAGE
  // ═══════════════════════════════════════════════════════════════════
  'press-release': {
    pageName: 'Press Release',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'Why Digital PR Section',
        fields: [
          { key: 'digitalPrLabel', label: 'Section Label', type: 'text' },
          { key: 'digitalPrHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'digitalPrSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Why Digisharks Section',
        fields: [
          { key: 'whyDigisharksLabel', label: 'Section Label', type: 'text' },
          { key: 'whyDigisharksHeading', label: 'Section Heading', type: 'richtext' },
        ],
      },
      {
        label: 'Media Network Section',
        fields: [
          { key: 'mediaNetworkLabel', label: 'Section Label', type: 'text' },
          { key: 'mediaNetworkHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'mediaNetworkSubtitle', label: 'Section Subtitle', type: 'richtext' },
        ],
      },
      {
        label: 'Reasons Section',
        fields: [
          { key: 'reasonsLabel', label: 'Section Label', type: 'text' },
          { key: 'reasonsHeading', label: 'Section Heading', type: 'richtext' },
        ],
      },
      {
        label: 'Benefits Section',
        fields: [
          { key: 'benefitsLabel', label: 'Section Label', type: 'text' },
          { key: 'benefitsHeading', label: 'Section Heading', type: 'richtext' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PORTFOLIO PAGE
  // ═══════════════════════════════════════════════════════════════════
  portfolio: {
    pageName: 'Portfolio',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'text' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
      {
        label: 'About Section',
        fields: [
          { key: 'aboutLabel', label: 'Section Label', type: 'text' },
          { key: 'aboutHeading', label: 'Section Heading', type: 'text' },
          { key: 'aboutDescription', label: 'Description', type: 'richtext' },
          { key: 'aboutCta', label: 'CTA Button', type: 'link' },
        ],
      },
      {
        label: 'Team Section',
        fields: [
          { key: 'teamLabel', label: 'Section Label', type: 'text' },
          { key: 'teamHeading', label: 'Section Heading', type: 'text' },
          { key: 'teamIntro', label: 'Team Intro Text', type: 'richtext' },
        ],
      },
      {
        label: 'Portfolio Section',
        fields: [
          { key: 'portfolioLabel', label: 'Section Label', type: 'text' },
          { key: 'portfolioHeading', label: 'Section Heading', type: 'text' },
          { key: 'portfolioDescription', label: 'Section Description', type: 'richtext' },
          { key: 'portfolioCta', label: 'CTA Button', type: 'link' },
          { key: 'portfolioImages', label: 'Portfolio Images Gallery', type: 'gallery[]' },
        ],
      },
      {
        label: 'Client Section',
        fields: [
          { key: 'clientsLabel', label: 'Section Label', type: 'text' },
          { key: 'clientsHeading', label: 'Section Heading', type: 'text' },
          { key: 'clients', label: 'Client Names', type: 'text[]' },
        ],
      },
      {
        label: 'Final CTA',
        fields: [
          { key: 'ctaEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'ctaSecondaryCta', label: 'Secondary CTA', type: 'link' },
        ],
      },
      {
        label: 'Map Section',
        fields: [
          { key: 'mapLabel', label: 'Section Label', type: 'text' },
          { key: 'mapAddress', label: 'Office Address', type: 'richtext' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DIGITAL PRODUCTS PAGE
  // ═══════════════════════════════════════════════════════════════════
  'digital-products': {
    pageName: 'Digital Products',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroEyebrow', label: 'Eyebrow Text', type: 'text' },
          { key: 'heroHeading', label: 'Hero Heading', type: 'richtext' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroPrimaryCta', label: 'Primary CTA', type: 'link' },
          { key: 'heroSecondaryCta', label: 'Secondary CTA', type: 'link' },
          { key: 'heroVideo', label: 'Hero Video URL', type: 'video' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRIVACY POLICY PAGE
  // ═══════════════════════════════════════════════════════════════════
  'privacy-policy': {
    pageName: 'Privacy Policy',
    sections: [
      {
        label: 'Page Header',
        fields: [
          { key: 'pageTitle', label: 'Page Title', type: 'text' },
          { key: 'pageSubtitle', label: 'Last Updated Text', type: 'text' },
          { key: 'intro', label: 'Intro Paragraph', type: 'richtext' },
        ],
      },
      {
        label: 'Policy Sections',
        fields: [
          { key: 'sections', label: 'Policy Content Sections', type: 'policy-section[]' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // TERMS AND CONDITIONS PAGE
  // ═══════════════════════════════════════════════════════════════════
  'terms-and-conditions': {
    pageName: 'Terms and Conditions',
    sections: [
      {
        label: 'Page Header',
        fields: [
          { key: 'pageTitle', label: 'Page Title', type: 'text' },
          { key: 'pageSubtitle', label: 'Last Updated Text', type: 'text' },
          { key: 'intro', label: 'Intro Paragraph', type: 'richtext' },
        ],
      },
      {
        label: 'Policy Sections',
        fields: [
          { key: 'sections', label: 'Policy Content Sections', type: 'policy-section[]' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // CAREER PAGE
  // ═══════════════════════════════════════════════════════════════════
  career: {
    pageName: 'Career',
    sections: [
      {
        label: 'Hero Section',
        fields: [
          { key: 'heroHeading', label: 'Hero Heading', type: 'text' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroImage', label: 'Hero Desktop Image', type: 'image' },
          { key: 'heroMobileImage', label: 'Hero Mobile Image', type: 'image' },
        ],
      },
      {
        label: 'Company Values Section',
        fields: [
          { key: 'valuesLabel', label: 'Section Label', type: 'text' },
          { key: 'valuesHeading', label: 'Section Heading', type: 'richtext' },
          { key: 'valuesSubtitle', label: 'Section Subtitle', type: 'richtext' },
          { key: 'values', label: 'Value Cards', type: 'card[]' },
        ],
      },
      {
        label: 'CTA / Final Section',
        fields: [
          { key: 'ctaHeading', label: 'CTA Heading', type: 'richtext' },
          { key: 'ctaDescription', label: 'CTA Description', type: 'richtext' },
          { key: 'ctaEmail', label: 'Contact Email', type: 'text' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BLOG PAGE
  // ═══════════════════════════════════════════════════════════════════
  blog: {
    pageName: 'Blog',
    sections: [
      {
        label: 'Hero Banner',
        fields: [
          { key: 'heroHeading', label: 'Hero Heading', type: 'text' },
          { key: 'heroDescription', label: 'Hero Description', type: 'richtext' },
          { key: 'heroImage', label: 'Hero Banner Image', type: 'image' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // REFUND POLICY PAGE
  // ═══════════════════════════════════════════════════════════════════
  'refund-policy': {
    pageName: 'Refund Policy',
    sections: [
      {
        label: 'Page Header',
        fields: [
          { key: 'pageTitle', label: 'Page Title', type: 'text' },
          { key: 'pageSubtitle', label: 'Last Updated Text', type: 'text' },
          { key: 'intro', label: 'Intro Paragraph', type: 'richtext' },
        ],
      },
      {
        label: 'Policy Sections',
        fields: [
          { key: 'sections', label: 'Policy Content Sections', type: 'policy-section[]' },
        ],
      },
    ],
  },
}

export default PAGE_FIELDS

/**
 * Get field definitions for a specific page slug.
 * Returns null if the slug is not defined.
 */
export function getPageFields(pageSlug) {
  return PAGE_FIELDS[pageSlug] || null
}

/**
 * Get all page slugs and their display names.
 * Used to populate the admin pages list.
 */
export function getAllPageMeta() {
  return Object.entries(PAGE_FIELDS).map(([slug, config]) => ({
    slug,
    pageName: config.pageName,
  }))
}
