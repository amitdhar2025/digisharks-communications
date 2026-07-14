/**
 * Registration Model — stores public registration/submission data
 *
 * Each document represents one registration entry submitted through
 * the public registration form. The `formData` field stores flexible
 * key-value pairs from the form builder fields.
 *
 * Admin users can view all entries from the CMS admin panel.
 */

import mongoose from 'mongoose'

const RegistrationSchema = new mongoose.Schema(
  {
    // Auto-generated unique reference number
    reference: {
      type: String,
      unique: true,
      default: function() {
        const prefix = 'REG'
        const timestamp = Date.now().toString(36).toUpperCase()
        const random = Math.random().toString(36).substring(2, 6).toUpperCase()
        return `${prefix}-${timestamp}-${random}`
      },
    },

    // Flexible form data — keys match the form builder field names
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Contact info extracted from formData for quick lookup
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },

    // Which form/page was used
    formSlug: {
      type: String,
      default: 'registration',
      trim: true,
    },

    // Email sent status
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    emailError: String,
  },
  {
    timestamps: true,
  }
)



export default mongoose.models.Registration ||
  mongoose.model('Registration', RegistrationSchema)
