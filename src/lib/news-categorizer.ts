/**
 * Automatic news article categorizer.
 * Uses keyword matching on title + description to classify articles
 * into common categories: Technology, Business, Lifestyle, Science,
 * Sports, Entertainment, Health, Politics, World, India.
 *
 * The first matching category (in priority order) is returned.
 * If no keyword matches, "General" is returned.
 */

export type AutoCategory =
  | 'Technology'
  | 'Business'
  | 'Lifestyle'
  | 'Science'
  | 'Sports'
  | 'Entertainment'
  | 'Health'
  | 'Politics'
  | 'World'
  | 'India'
  | 'General'

interface CategoryDef {
  name: AutoCategory
  keywords: string[]
}

// Order matters: first matched category wins
const CATEGORY_DEFS: CategoryDef[] = [
  {
    name: 'Technology',
    keywords: [
      'tech', 'technology', 'ai', 'artificial intelligence', 'machine learning',
      'software', 'startup', 'app', 'google', 'apple', 'microsoft', 'meta',
      'facebook', 'twitter', 'x.com', 'openai', 'chatgpt', 'gpt', 'llm',
      'crypto', 'bitcoin', 'blockchain', 'cyber', 'hack', 'data', 'cloud',
      'aws', 'azure', 'iphone', 'android', 'samsung', 'gpu', 'chip',
      'semiconductor', 'developer', 'programming', 'code', 'github',
      'robot', 'automation', 'saas', 'iot', 'vr', 'ar', 'metaverse',
    ],
  },
  {
    name: 'Business',
    keywords: [
      'business', 'economy', 'market', 'stock', 'share', 'nasdaq', 'sensex',
      'nifty', 'rupee', 'dollar', 'inflation', 'gdp', 'revenue', 'profit',
      'earnings', 'ipo', 'merger', 'acquisition', 'company', 'corporate',
      'industry', 'trade', 'export', 'import', 'tariff', 'tax', 'gst',
      'finance', 'bank', 'rbi', 'loan', 'investor', 'fund', 'startup',
      'entrepreneur', 'small business', 'msme', 'billion', 'million deal',
      'quarterly', 'fy24', 'fy25', 'fy26', 'quarter results',
    ],
  },
  {
    name: 'Sports',
    keywords: [
      'cricket', 'ipl', 'bcci', 'virat', 'rohit', 'dhoni', 'sachin',
      'football', 'fifa', 'uefa', 'messi', 'ronaldo', 'mbappe',
      'tennis', 'wimbledon', 'olympics', 'medal', 'athlete', 'match',
      'tournament', 't20', 'odi', 'test match', 'bowler', 'batsman',
      'wicket', 'goal', 'champions league', 'premier league', 'la liga',
      'kabaddi', 'pkl', 'isl', 'hockey', 'badminton', 'sindhu',
      'formula 1', 'f1', 'race', 'grand prix', 'wwe', 'nba', 'nfl',
    ],
  },
  {
    name: 'Entertainment',
    keywords: [
      'movie', 'film', 'cinema', 'bollywood', 'tollywood', 'kollywood',
      'actor', 'actress', 'director', 'ott', 'netflix', 'prime video',
      'disney', 'hotstar', 'sony liv', 'zee5', 'jio cinema', 'youtube',
      'song', 'music', 'album', 'singer', 'concert', 'celebrity',
      'wedding', 'blockbuster', 'box office', 'trailer', 'release',
      'series', 'show', 'reality show', 'big boss', 'kbc', 'khatron',
      'award', 'filmfare', 'oscars', 'grammy', 'emmy',
    ],
  },
  {
    name: 'Health',
    keywords: [
      'health', 'doctor', 'hospital', 'medicine', 'medical', 'covid',
      'vaccine', 'vaccination', 'virus', 'disease', 'cancer', 'surgery',
      'patient', 'treatment', 'drug', 'pharma', 'ayush', 'yoga',
      'wellness', 'fitness', 'diet', 'nutrition', 'mental health',
      'depression', 'anxiety', 'pandemic', 'epidemic', 'outbreak',
      'who', 'icmr', 'fda', 'clinical trial', 'side effect',
    ],
  },
  {
    name: 'Science',
    keywords: [
      'science', 'research', 'study', 'discovery', 'nasa', 'isro',
      'space', 'mars', 'moon', 'satellite', 'rocket', 'launch',
      'astronaut', 'galaxy', 'planet', 'physics', 'chemistry', 'biology',
      'quantum', 'dna', 'gene', 'climate', 'environment', 'wildlife',
      'species', 'extinct', 'fossil', 'evolution', 'ocean', 'earthquake',
      'volcano', 'asteroid', 'eclipse', 'experiment', 'scientist',
    ],
  },
  {
    name: 'Lifestyle',
    keywords: [
      'lifestyle', 'fashion', 'style', 'travel', 'tourism', 'vacation',
      'holiday', 'food', 'recipe', 'restaurant', 'chef', 'cooking',
      'relationship', 'dating', 'marriage', 'parenting', 'baby',
      'beauty', 'makeup', 'skincare', 'hair', 'home decor', 'interior',
      'car', 'bike', 'review', 'shopping', 'sale', 'discount', 'fest',
      'celebration', 'festival', 'wedding', 'horoscope', 'astrology',
    ],
  },
  {
    name: 'Politics',
    keywords: [
      'politics', 'election', 'bjp', 'congress', 'aap', 'tmc', 'bsp',
      'sp ', 'rld', 'mla', 'mp ', 'minister', 'pm ', 'cm ', 'modi',
      'rahul gandhi', 'amit shah', 'yogi', 'kejriwal', 'mamata',
      'biden', 'trump', 'putin', 'zelensky', 'parliament', 'lok sabha',
      'rajya sabha', 'bill', 'law', 'judiciary', 'supreme court',
      'high court', 'verdict', 'ed ', 'cbi', 'cbi ', 'case', 'arrest',
      'policy', 'scheme', 'budget', 'cabinet',
    ],
  },
  {
    name: 'India',
    keywords: [
      'india', 'indian', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bengaluru',
      'bangalore', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow',
      'bhopal', 'patna', 'gujarat', 'maharashtra', 'tamil nadu', 'karnataka',
      'kerala', 'uttar pradesh', 'madhya pradesh', 'rajasthan', 'bihar',
      'west bengal', 'punjab', 'haryana', 'modi govt', 'parliament',
      'lok sabha', 'rajya sabha', 'bjp', 'congress party', 'aadhaar',
      'digital india', 'make in india', 'rbi', 'sebi', 'irctc',
    ],
  },
  {
    name: 'World',
    keywords: [
      'world', 'global', 'international', 'united nations', 'un ', 'eu ',
      'european union', 'nato', 'g7', 'g20', 'china', 'beijing', 'shanghai',
      'russia', 'moscow', 'ukraine', 'kyiv', 'usa', 'america', 'washington',
      'uk', 'britain', 'london', 'germany', 'berlin', 'france', 'paris',
      'japan', 'tokyo', 'israel', 'gaza', 'palestine', 'iran', 'iraq',
      'pakistan', 'islamabad', 'kabul', 'afghanistan', 'middle east',
      'asia', 'africa', 'latin america', 'sanction', 'treaty', 'summit',
    ],
  },
]

/**
 * Normalize text for keyword matching:
 * - lowercases
 * - strips most punctuation
 * - collapses whitespace
 */
function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Detect the best auto-category for a news article.
 * @param title Article title
 * @param description Article description / summary
 * @param source Source / publication name (used as tie-breaker)
 * @param fallbackCategory Optional category already attached to the article
 * @returns One of the AutoCategory strings
 */
export function detectCategory(
  title: string,
  description: string = '',
  source: string = '',
  fallbackCategory: string = ''
): AutoCategory {
  const text = normalize(`${title} ${description} ${source}`)
  if (!text) {
    return sanitizeFallback(fallbackCategory)
  }

  // Count hits per category
  const hits: Record<AutoCategory, number> = {
    'Technology': 0,
    'Business': 0,
    'Lifestyle': 0,
    'Science': 0,
    'Sports': 0,
    'Entertainment': 0,
    'Health': 0,
    'Politics': 0,
    'World': 0,
    'India': 0,
    'General': 0,
  }

  for (const def of CATEGORY_DEFS) {
    for (const kw of def.keywords) {
      const needle = normalize(kw)
      if (!needle) continue
      // Use word-boundary-like matching for short tokens
      const isShortToken = needle.length <= 5 && !needle.includes(' ')
      if (isShortToken) {
        // Wrap in spaces for whole-word match to avoid matching "ai" inside "said"
        const re = new RegExp(`(^|\\s)${escapeRegex(needle)}(\\s|$|\\.|,|!|\\?)`, 'i')
        if (re.test(text)) hits[def.name]++
      } else {
        if (text.includes(needle)) hits[def.name] += 2 // longer phrases weighted higher
      }
    }
  }

  // Find category with most hits
  let best: AutoCategory = sanitizeFallback(fallbackCategory)
  let bestCount = 0
  for (const cat of Object.keys(hits) as AutoCategory[]) {
    if (hits[cat] > bestCount) {
      bestCount = hits[cat]
      best = cat
    }
  }

  return bestCount > 0 ? best : sanitizeFallback(fallbackCategory)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const VALID: AutoCategory[] = [
  'Technology', 'Business', 'Lifestyle', 'Science', 'Sports',
  'Entertainment', 'Health', 'Politics', 'World', 'India', 'General',
]

function sanitizeFallback(raw: string): AutoCategory {
  if (!raw) return 'General'
  // Match if the fallback already matches one of our categories (case-insensitive)
  const lower = raw.trim().toLowerCase()
  for (const v of VALID) {
    if (v.toLowerCase() === lower) return v
  }
  // Common aliases
  if (lower === 'tech') return 'Technology'
  if (lower === 'sport') return 'Sports'
  if (lower === 'entertainment' || lower === 'bollywood' || lower === 'movies') return 'Entertainment'
  if (lower === 'national' || lower === 'india' || lower === 'in') return 'India'
  if (lower === 'international' || lower === 'global') return 'World'
  if (lower === 'general' || lower === 'misc' || lower === 'other') return 'General'
  return 'General'
}

/** Get all known auto categories (used to build filter chips). */
export function getAllAutoCategories(): AutoCategory[] {
  return [...VALID]
}

/** Human-friendly chip color for a category (used by FilterBar / NewsCard). */
export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Technology: '#2563eb',
    Business: '#059669',
    Lifestyle: '#db2777',
    Science: '#7c3aed',
    Sports: '#ea580c',
    Entertainment: '#e11d48',
    Health: '#0d9488',
    Politics: '#9333ea',
    World: '#0ea5e9',
    India: '#f59e0b',
    General: '#64748b',
  }
  return map[category] || '#64748b'
}
