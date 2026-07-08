/**
 * MenuItem Model — stores all editable navigation menus
 *
 * Supports four menu types:
 *   'alert-bar'    → quick links in the top alert bar (About Us, TIA, Career, News)
 *   'alert-ticker' → scrolling ticker messages in the alert bar (security alerts, awards)
 *   'main-nav'     → main navigation links (Home, About Us, Services, Portfolio, Blog, etc.)
 *   'services-sub' → sub-menu items under the Services dropdown
 *
 * Each menu has a `type` discriminator, plus label, href, order, and active state.
 * For tickers: `label` holds the message text, `icon` holds the emoji, `href` is unused.
 */

import mongoose from 'mongoose'

const MenuItemSchema = new mongoose.Schema(
  {
    // Menu type: 'alert-bar' | 'alert-ticker' | 'main-nav' | 'services-sub'
    type: {
      type: String,
      required: true,
      enum: ['alert-bar', 'alert-ticker', 'main-nav', 'services-sub'],
      index: true,
    },

    // Display label (e.g. "About Us", "Press Release")
    label: {
      type: String,
      required: true,
      trim: true,
    },

    // URL (e.g. "/about-us", "/press-release/")
    href: {
      type: String,
      required: true,
      trim: true,
    },

    // Sort order (lower numbers appear first)
    order: {
      type: Number,
      default: 0,
    },

    // Whether this menu item is active/visible
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional icon name for services sub-menus
    icon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient queries by type + order
MenuItemSchema.index({ type: 1, order: 1 })

export default mongoose.models.MenuItem ||
  mongoose.model('MenuItem', MenuItemSchema)
