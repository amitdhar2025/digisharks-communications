/**
 * Derives a consistent hex color from any category string.
 * Uses a simple string hash so the same category always gets the same color.
 * No hardcoded category names — fully dynamic.
 */

const PALETTE = [
  '#4f8ef7', // blue
  '#f72585', // pink
  '#7209b7', // purple
  '#3a0ca3', // deep blue
  '#4361ee', // royal blue
  '#4cc9f0', // cyan
  '#f77f00', // orange
  '#fcbf49', // amber
  '#2ec4b6', // teal
  '#e71d36', // red
  '#011627', // dark navy
  '#ff9f1c', // bright orange
  '#9b5de5', // violet
  '#f15bb5', // magenta
  '#00bbf9', // sky blue
  '#00f5d4', // mint
  '#fee440', // yellow
  '#ff6b6b', // salmon
  '#6a0572', // plum
  '#1a936f', // emerald
  '#bc6c25', // brown
  '#606c38', // olive
  '#283618', // dark olive
  '#8e44ad', // amethyst
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

export function categoryColor(category: string): string {
  const index = hashString(category) % PALETTE.length
  return PALETTE[index]
}
