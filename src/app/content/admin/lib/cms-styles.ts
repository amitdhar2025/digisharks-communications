/**
 * CMS Admin — Shared Tailwind Class Constants
 *
 * Centralizes repeated class strings used across CMS admin pages
 * (settings, page editor, menus, pages list) to reduce duplication.
 */

// ── Form Inputs ───────────────────────────────────────────────────────

/** Full-size input (px-3.5 py-2.5) — used for text inputs, textareas */
export const INPUT_CLASS =
  'w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 hover:border-slate-500'

/** Full-size input with additional resize/min-height for textareas */
export const TEXTAREA_CLASS =
  INPUT_CLASS + ' resize-y min-h-[80px]'

/** Compact input (px-3 py-2) — used in menus page form rows */
export const INPUT_COMPACT_CLASS =
  'w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 hover:border-slate-500 box-border'

/** Flex-1 variant of full input for use in flex rows */
export const INPUT_FLEX_CLASS =
  'flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 hover:border-slate-500'

// ── Labels ────────────────────────────────────────────────────────────

export const LABEL_CLASS =
  'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5'

// ── Buttons ──────────────────────────────────────────────────────────

/** Large primary button (used in settings, page editor) */
export const BTN_PRIMARY_LG =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20'

/** Small primary button (used in menus form, pages list rows) */
export const BTN_PRIMARY_SM =
  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all'

/** Extra-small primary button (used in pages list table) */
export const BTN_PRIMARY_XS =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 transition-all shadow-sm shadow-sky-500/20'

/** Ghost button (transparent with border) */
export const BTN_GHOST =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors'

/** View link (ghost with border) */
export const BTN_VIEW =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-slate-600 hover:text-slate-200 hover:border-slate-500 transition-colors'

// ── Cards & Sections ─────────────────────────────────────────────────

export const CARD_CLASS =
  'bg-slate-800/30 border border-slate-700 rounded-xl p-5'

export const CARD_COMPACT_CLASS =
  'bg-slate-800/30 border border-slate-700 rounded-xl p-4'

// ── Section Header Accent Bar ────────────────────────────────────────

export const ACCENT_BAR_CLASS =
  'w-1.5 h-5 rounded-full inline-block flex-shrink-0'

export const SECTION_HEADER_CLASS =
  'text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2'

// ── Accent Colors ────────────────────────────────────────────────────

export const ACCENT_COLORS = [
  'bg-sky-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
]

// ── Toast / Alert ────────────────────────────────────────────────────

export const TOAST_SUCCESS_CLASS =
  'mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 bg-emerald-600/15 border border-emerald-600/20 text-emerald-300'

export const TOAST_ERROR_CLASS =
  'mb-4 px-4 py-3 rounded-lg text-sm bg-red-600/15 border border-red-600/30 text-red-300'

// ── Status Pills ─────────────────────────────────────────────────────

export const PILL_SAVED_CLASS =
  'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400'

export const PILL_DRAFT_CLASS =
  'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400'

// ── Loading Spinner ──────────────────────────────────────────────────

export const SPINNER_CLASS =
  'w-5 h-5 border-2 border-slate-600 border-t-sky-500 rounded-full animate-spin'

export const LOADING_WRAPPER_CLASS =
  'flex flex-col items-center py-16 gap-3 text-slate-400'

// ── Back Link ────────────────────────────────────────────────────────

export const BACK_LINK_CLASS =
  'inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-400 transition-colors mb-1'

// ── Section Title Dot Colors (for cms-section-title .dot) ────────────

export const DOT_GREEN = '#22c55e'
export const DOT_BLUE = '#0ea5e9'
export const DOT_INDIGO = '#6366f1'
