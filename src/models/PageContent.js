/**
 * PageContent Model — stores editable content for each static page
 *
 * Each document represents one page of the website. The `content` field
 * holds a flexible JSON object where keys match page sections and values
 * are the text/numbers/images that appear on that page.
 *
 * Fallback: if a page has no CMS entry, the public page still works
 * using its hardcoded default content.
 */

import mongoose from 'mongoose'

const PageContentSchema = new mongoose.Schema(
  {
    // Unique identifier matching the page route
    // e.g. 'home', 'about-us', 'services-top-pr-digital-marketing'
    pageSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Human-readable page name for the admin UI
    pageName: {
      type: String,
      required: true,
      trim: true,
    },

    // The editable content — a flexible JSON object
    // Each page has different keys; the admin editor shows form fields
    // based on a field definition file (see lib/page-fields.js)
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

  },
  {
    // Automatically manages createdAt and updatedAt
    timestamps: true,
  }
)

export default mongoose.models.PageContent ||
  mongoose.model('PageContent', PageContentSchema)
