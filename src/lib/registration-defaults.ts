/**
 * Registration Form Default Config
 *
 * Shared defaults used by both the admin API (builder) and public API
 * so defaults only need to be updated in one place.
 */

export interface FieldOption {
  value: string
  label: string
}

export interface FormField {
  key: string
  type: string
  label: string
  placeholder: string
  heading?: string
  required: boolean
  options: FieldOption[]
  order: number
  isActive: boolean
  width: string
  helpText: string
  pattern: string
  errorMessage: string
  // Layout properties
  customWidth?: string
  height?: string
  marginTop?: string
  marginBottom?: string
  paddingTop?: string
  paddingBottom?: string
  // Style properties
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  textAlign?: string
  // Divider properties
  dividerStyle?: string
  dividerColor?: string
  dividerThickness?: string
  // Separator properties
  separatorHeight?: string
  // Image properties
  imageSrc?: string
  imageAlt?: string
  imageHeight?: string
  imageBorderRadius?: string
  // HTML properties
  htmlContent?: string
  // Row / Column properties
  columns?: number
  columnGap?: string
  childKeys?: string[]
}

export interface FormConfig {
  key: string
  slug: string
  name: string
  formTitle: string
  formSubtitle: string
  successMessage: string
  submitButtonText: string
  isEnabled: boolean
  formBannerUrl?: string
  fields: FormField[]
}

export const DEFAULT_FIELDS: FormField[] = [
  { key: 'personal-info-heading', type: 'heading', heading: 'Personal Information', label: '', placeholder: '', required: false, options: [], order: 0, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'fullName', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true, options: [], order: 1, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: 'Please enter your full name' },
  { key: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, options: [], order: 2, isActive: true, width: 'half', helpText: '', pattern: '', errorMessage: 'Please enter a valid email address' },
  { key: 'phone', type: 'tel', label: 'Phone Number', placeholder: '+91 98765 43210', required: false, options: [], order: 3, isActive: true, width: 'half', helpText: '', pattern: '', errorMessage: '' },
  { key: 'company', type: 'text', label: 'Company / Organization', placeholder: 'Your company name', required: false, options: [], order: 4, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'service-pref-heading', type: 'heading', heading: 'Service Preferences', label: '', placeholder: '', required: false, options: [], order: 5, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'service', type: 'select', label: 'Service Interested In', placeholder: '— Select a service —', required: false, options: [
    { value: 'digital-pr', label: 'Digital PR & Media' },
    { value: 'seo-ppc', label: 'SEO & PPC' },
    { value: 'social-media', label: 'Social Media Marketing' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'brand-promotion', label: 'Brand Promotion' },
    { value: 'other', label: 'Other' },
  ], order: 6, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'preferredContact', type: 'radio', label: 'Preferred Contact Method', placeholder: '', required: false, options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ], order: 7, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'budget', type: 'select', label: 'Budget Range', placeholder: '— Select budget range —', required: false, options: [
    { value: 'below-50k', label: 'Below ₹50,000' },
    { value: '50k-1lac', label: '₹50,000 - ₹1,00,000' },
    { value: '1lac-5lac', label: '₹1,00,000 - ₹5,00,000' },
    { value: 'above-5lac', label: 'Above ₹5,00,000' },
    { value: 'not-sure', label: 'Not sure yet' },
  ], order: 8, isActive: true, width: 'half', helpText: '', pattern: '', errorMessage: '' },
  { key: 'hearAbout', type: 'select', label: 'How Did You Hear About Us?', placeholder: '— Select an option —', required: false, options: [
    { value: 'google', label: 'Google Search' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'friend', label: 'Friend / Referral' },
    { value: 'blog', label: 'Blog / Article' },
    { value: 'other', label: 'Other' },
  ], order: 9, isActive: true, width: 'half', helpText: '', pattern: '', errorMessage: '' },
  { key: 'message-section-heading', type: 'heading', heading: 'Your Message', label: '', placeholder: '', required: false, options: [], order: 10, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'message', type: 'textarea', label: 'Message / Comments', placeholder: 'Tell us about your project...', required: false, options: [], order: 11, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'fileUpload', type: 'file', label: 'Upload File / Document', placeholder: '', required: false, options: [], order: 12, isActive: true, width: 'full', helpText: 'Accepted: PDF, DOC, XLS, Images (max 10MB)', pattern: '', errorMessage: '' },
  { key: 'consent-heading', type: 'heading', heading: 'Consent & Agreement', label: '', placeholder: '', required: false, options: [], order: 13, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
  { key: 'agreeToTerms', type: 'checkbox', label: 'I agree to the Terms & Conditions and Privacy Policy', placeholder: '', required: true, options: [], order: 14, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: 'You must agree to the terms to proceed' },
  { key: 'updatesConsent', type: 'checkbox', label: 'I would like to receive updates, news, and offers via email', placeholder: '', required: false, options: [], order: 15, isActive: true, width: 'full', helpText: '', pattern: '', errorMessage: '' },
]

export const DEFAULT_CONFIG: FormConfig = {
  key: 'registration-form',
  slug: 'register',
  name: 'Main Registration',
  formTitle: 'Register With Us',
  formSubtitle: "Fill in the form below to register. We'll get back to you shortly.",
  successMessage: 'Thank you for registering with Digisharks Communications. Your submission has been received successfully.',
  submitButtonText: 'Submit Registration',
  isEnabled: true,
  formBannerUrl: '',
  fields: DEFAULT_FIELDS,
}
