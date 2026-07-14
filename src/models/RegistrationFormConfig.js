/**
 * RegistrationFormConfig Model — stores form field configurations
 * for the public registration pages.
 *
 * Supports multiple independent forms, each identified by a unique
 * `key` and `slug`. Admins can customize which fields appear on
 * each form, their types, labels, placeholders, options, and order.
 *
 * The default form uses key='registration-form' and slug='register'.
 */

import mongoose from 'mongoose'

const FormFieldOptionSchema = new mongoose.Schema({
  value: { type: String, default: '' },
  label: { type: String, default: '' },
}, { _id: false })

const FormFieldSchema = new mongoose.Schema({
  // Unique field identifier (e.g., 'fullName', 'email', 'phone')
  key: {
    type: String,
    required: true,
    trim: true,
  },

  // Field type: text, textarea, email, tel, select, radio, checkbox,
  // checkbox-group, file, heading, label, url, number, date, password,
  // row, column, section, divider, separator, image, html
  type: {
    type: String,
    required: true,
    enum: [
      'text', 'textarea', 'email', 'tel', 'select', 'radio',
      'checkbox', 'checkbox-group', 'file', 'heading', 'label',
      'url', 'number', 'date', 'password',
      'row', 'section', 'divider', 'separator', 'image', 'html',
    ],
  },

  // Display label shown above the input
  label: {
    type: String,
    default: '',
  },

  // Placeholder text shown inside the input
  placeholder: {
    type: String,
    default: '',
  },

  // Section heading (used when type is 'heading', 'section', 'row')
  heading: {
    type: String,
    default: '',
  },

  // Whether the field is required
  required: {
    type: Boolean,
    default: false,
  },

  // Options for select, radio, and checkbox-group types
  options: {
    type: [FormFieldOptionSchema],
    default: [],
  },

  // Display order (lower = first)
  order: {
    type: Number,
    default: 0,
  },

  // Whether the field is active/enabled
  isActive: {
    type: Boolean,
    default: true,
  },

  // CSS class or width (e.g., 'half', 'full', 'third', 'quarter', 'auto')
  width: {
    type: String,
    default: 'full',
    enum: ['full', 'half', 'third', 'two-thirds', 'quarter', 'three-quarters', 'auto'],
  },

  // Custom width value (e.g., '200px', '33.3%') — overrides 'width' when set
  customWidth: {
    type: String,
    default: '',
  },

  // Help text shown below the field
  helpText: {
    type: String,
    default: '',
  },

  // Validation pattern (regex as string)
  pattern: {
    type: String,
    default: '',
  },

  // Error message when validation fails
  errorMessage: {
    type: String,
    default: '',
  },

  // ── Layout / Spacing Properties ──

  // Custom height: 'auto', 'sm' (40px), 'md' (80px), 'lg' (160px), or custom px
  height: {
    type: String,
    default: 'auto',
  },

  // Top margin: 'none', 'xs' (4px), 'sm' (8px), 'md' (16px), 'lg' (24px), 'xl' (32px), or custom px
  marginTop: {
    type: String,
    default: 'none',
  },

  // Bottom margin
  marginBottom: {
    type: String,
    default: 'none',
  },

  // Top padding
  paddingTop: {
    type: String,
    default: 'none',
  },

  // Bottom padding
  paddingBottom: {
    type: String,
    default: 'none',
  },

  // ── Style Properties ──

  // Background color (hex or rgb)
  backgroundColor: {
    type: String,
    default: '',
  },

  // Border color
  borderColor: {
    type: String,
    default: '',
  },

  // Border width: 'none', 'thin' (1px), 'medium' (2px), 'thick' (3px)
  borderWidth: {
    type: String,
    default: 'none',
  },

  // Border radius: 'none', 'sm' (4px), 'md' (8px), 'lg' (12px), 'xl' (16px), 'full' (9999px), or custom px
  borderRadius: {
    type: String,
    default: 'none',
  },

  // Text alignment: 'left', 'center', 'right'
  textAlign: {
    type: String,
    default: 'left',
    enum: ['left', 'center', 'right'],
  },

  // ── Divider Properties ──

  // Divider line style: 'solid', 'dashed', 'dotted', 'double'
  dividerStyle: {
    type: String,
    default: 'solid',
    enum: ['solid', 'dashed', 'dotted', 'double'],
  },

  // Divider line color
  dividerColor: {
    type: String,
    default: '#e2e8f0',
  },

  // Divider line thickness in px
  dividerThickness: {
    type: String,
    default: '1',
  },

  // ── Separator Properties ──

  // Separator height (vertical space)
  separatorHeight: {
    type: String,
    default: '24',
  },

  // ── Image Properties ──

  // Image source URL
  imageSrc: {
    type: String,
    default: '',
  },

  // Image alt text
  imageAlt: {
    type: String,
    default: '',
  },

  // Image display height (CSS value)
  imageHeight: {
    type: String,
    default: 'auto',
  },

  // Image border radius
  imageBorderRadius: {
    type: String,
    default: '8',
  },

  // ── HTML Properties ──

  // Custom HTML content
  htmlContent: {
    type: String,
    default: '',
  },

  // ── Row / Column Properties ──

  // Number of columns for row type: 2, 3, 4
  columns: {
    type: Number,
    default: 2,
    enum: [2, 3, 4],
  },

  // Column gap in px
  columnGap: {
    type: String,
    default: '16',
  },

  // Child field keys for row/section types (stores which fields belong to this container)
  childKeys: {
    type: [String],
    default: [],
  },

}, { _id: false })

const RegistrationFormConfigSchema = new mongoose.Schema(
  {
    // Unique key identifier (e.g. 'registration-form', 'career-registration')
    key: {
      type: String,
      required: true,
      trim: true,
    },

    // URL slug for the public page (e.g. 'register', 'career', 'partner-with-us')
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Display name for admin (e.g. 'Main Registration', 'Career Application')
    name: {
      type: String,
      default: '',
    },

    // Form title (shown at the top of the form)
    formTitle: {
      type: String,
      default: 'Register With Us',
    },

    // Form subtitle/description
    formSubtitle: {
      type: String,
      default: 'Fill in the form below to register. We\'ll get back to you shortly.',
    },

    // Success message shown after submission
    successMessage: {
      type: String,
      default: 'Thank you for registering with Digisharks Communications. Your submission has been received successfully.',
    },

    // CTA button text
    submitButtonText: {
      type: String,
      default: 'Submit Registration',
    },

    // Banner image URL (uploaded from form builder)
    formBannerUrl: {
      type: String,
      default: '',
    },

    // Whether the form is enabled/active
    isEnabled: {
      type: Boolean,
      default: true,
    },

    // Array of form field definitions
    fields: {
      type: [FormFieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.RegistrationFormConfig ||
  mongoose.model('RegistrationFormConfig', RegistrationFormConfigSchema)
