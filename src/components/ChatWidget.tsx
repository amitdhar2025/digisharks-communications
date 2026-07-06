'use client'
import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import ChatBotIcon from './ChatBotIcon'

interface ChatbotSettings {
  botName: string; welcomeMessage: string; fallbackMessage: string
  primaryColor: string; accentColor: string; closeButtonColor: string
  bubbleBgColor: string; bubbleBorderColor: string; bubbleShadowColor: string
  faceStrokeColor: string; faceFillColor: string; faceCheekColor: string; antennaColor: string
  pillLabel: string; pillBgColor: string; pillTextColor: string; pillBorderColor: string; pillShadowColor: string
  bubbleSize: number; pillFontSize: number; pillPaddingX: number; pillPaddingY: number
  isEnabled: boolean
}
interface ServiceItem { id: string; label: string; icon: string; path: string; pageUrl: string; keywords: string[] }
interface Message { role: 'user' | 'bot'; text: string; time: string }

const DEFAULT_SETTINGS: ChatbotSettings = {
  botName: 'DigiSharks ChatBot', welcomeMessage: 'Hi! How can I help you today?',
  fallbackMessage: "Sorry, I don't have an answer for that.",
  primaryColor: '#FF5B2E', accentColor: '#0F1628', closeButtonColor: '#ffffff',
  bubbleBgColor: '#20B486', bubbleBorderColor: '#ffffff', bubbleShadowColor: 'rgba(32, 180, 134, 0.45)',
  faceStrokeColor: '#ffffff', faceFillColor: '#ffffff', faceCheekColor: '#FF8FA3', antennaColor: '#FF5B2E',
  pillLabel: 'Talk to us', pillBgColor: '#1E2336', pillTextColor: '#ffffff', pillBorderColor: 'transparent', pillShadowColor: 'rgba(15, 22, 40, 0.35)',
  bubbleSize: 72, pillFontSize: 15, pillPaddingX: 22, pillPaddingY: 10, isEnabled: true,
}
const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'digital-pr', label: 'Digital PR & Media', icon: '📰', path: '/press-release/', pageUrl: '/press-release/', keywords: ['pr', 'press release', 'media coverage'] },
  { id: 'seo-ppc', label: 'SEO & PPC', icon: '📈', path: '/digital-marketing-agency/', pageUrl: '/digital-marketing-agency/', keywords: ['seo', 'ppc', 'google ads'] },
  { id: 'social-media', label: 'Social Media', icon: '📱', path: '/social-media/', pageUrl: '/social-media/', keywords: ['social media', 'instagram'] },
  { id: 'web-dev', label: 'Web Development', icon: '💻', path: '/web-development/', pageUrl: '/web-development/', keywords: ['web development', 'website'] },
]

async function safeJson<T>(input: RequestInfo, fallback: T): Promise<T> {
  try {
    const res = await fetch(input)
    const text = await res.text()
    if (!text) return fallback
    try { return JSON.parse(text) as T } catch { return fallback }
  } catch { return fallback }
}

/**
 * Renders message text with clickable links.
 * Supports markdown-style links [text](url) and bare URLs.
 */
function renderMessageText(text: string): ReactNode {
  if (!text) return text

  // First split by markdown links [text](url)
  const parts: ReactNode[] = []
  let lastIndex = 0
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null

  while ((match = mdLinkRegex.exec(text)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Push the clickable link
    parts.push(
      <a
        key={lastIndex}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#7dd3fc', textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  // Push remaining text after last markdown link
  const remaining = text.slice(lastIndex)
  if (remaining) {
    parts.push(remaining)
  }

  // Now process each text part for bare URLs
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  const processed = parts.map((part, idx) => {
    if (typeof part !== 'string') return part
    // Split this text segment by bare URLs
    const segments: ReactNode[] = []
    let urlLastIdx = 0
    let urlMatch: RegExpExecArray | null
    // Reset regex state
    urlRegex.lastIndex = 0
    while ((urlMatch = urlRegex.exec(part)) !== null) {
      if (urlMatch.index > urlLastIdx) {
        segments.push(part.slice(urlLastIdx, urlMatch.index))
      }
      segments.push(
        <a
          key={`${idx}-${urlLastIdx}`}
          href={urlMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7dd3fc', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          {urlMatch[1]}
        </a>
      )
      urlLastIdx = urlMatch.index + urlMatch[0].length
    }
    if (urlLastIdx < part.length) {
      segments.push(part.slice(urlLastIdx))
    }
    return segments.length > 0 ? segments : part
  })

  // Flatten nested arrays and wrap in fragment
  const flat = processed.flat()
  return flat.length === 1 ? flat[0] : <>{flat}</>
}

export default function ChatWidget() {
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS)
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingSettings, setFetchingSettings] = useState(true)
  const [showServices, setShowServices] = useState(false)
  const [contactCtaVisible, setContactCtaVisible] = useState(false)
  const [fallbackCtaVisible, setFallbackCtaVisible] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const endOfConvoTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const t = Date.now()
    Promise.all([
      safeJson<{ settings?: Partial<ChatbotSettings> }>(`/api/chatbot/settings?t=${t}`, { settings: {} }),
      safeJson<{ services?: ServiceItem[] }>(`/api/chatbot/services?t=${t}`, { services: [] }),
    ]).then(([s, sv]) => {
      if (s?.settings && Object.keys(s.settings).length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...s.settings })
      }
      if (sv?.services && sv.services.length > 0) setServices(sv.services)
    }).catch(() => {}).finally(() => setFetchingSettings(false))
  }, [])

  useEffect(() => {
    if (open && messages.length === 0 && services.length > 0 && !fetchingSettings) setShowServices(true)
  }, [open, messages.length, services.length, fetchingSettings])

  useEffect(() => {
    if (!open) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (endOfConvoTimerRef.current) clearTimeout(endOfConvoTimerRef.current)
      setContactCtaVisible(false)
      setFallbackCtaVisible(false)
      return
    }
    const hasConv = messages.filter((m) => m.role === 'user').length > 0 && messages.filter((m) => m.role === 'bot').length > 0
    if (!hasConv) {
      setContactCtaVisible(false)
      setFallbackCtaVisible(false)
      if (endOfConvoTimerRef.current) clearTimeout(endOfConvoTimerRef.current)
      return
    }
    // Reset the 10s "end of conversation" timer whenever a new message arrives.
    if (endOfConvoTimerRef.current) clearTimeout(endOfConvoTimerRef.current)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    endOfConvoTimerRef.current = setTimeout(() => {
      // Only auto-show the Contact CTA if we are NOT already showing the
      // fallback CTA inline (no point in showing two of them).
      if (!fallbackCtaVisible) setContactCtaVisible(true)
    }, 10000)
    return () => {
      if (endOfConvoTimerRef.current) clearTimeout(endOfConvoTimerRef.current)
    }
  }, [messages, open, fallbackCtaVisible])

  useEffect(() => {
    if (open && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, open])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  async function handleServiceClick(service: ServiceItem) {
    setShowServices(false); setFallbackCtaVisible(false); setContactCtaVisible(false)
    setMessages((prev) => [...prev, { role: 'user', text: `Tell me about ${service.label}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(true)
    try {
      const res = await fetch('/api/chatbot/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: service.path, origin }) })
      const data = await safeJson<{ summary?: string }>('', { summary: undefined })
      try { Object.assign(data, JSON.parse(await res.text())) } catch {}
      if (data.summary) setMessages((prev) => [...prev, { role: 'bot', text: `Great question! Here's what we do in **${service.label}**:\n\n${data.summary}\n\n👉 [Learn more](${service.pageUrl})`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch { /* ignore */ }
    setLoading(false)
  }

  // Single source of truth for contact info.
  const CONTACT_INFO = {
    phone: '+91 96273 32332',
    phoneTel: 'tel:+919627332332',
    email: 'marketing@digisharkscommunications.com',
    emailMailto: 'mailto:marketing@digisharkscommunications.com',
    address: ['B-2, C-87, C Block, Sector 63', 'Noida, Uttar Pradesh 201301'],
    hours: 'Mon\u2013Sat, 10:00 AM \u2013 7:00 PM IST',
    contactPage: '/contact-us',
  }    // Words/phrases that are conversational acknowledgments — not actual queries.
  // The bot should respond with a friendly follow-up rather than searching for content.
  const ACKNOWLEDGMENTS = new Set([
    'ok', 'okay', 'okie', 'k', 'kk', 'kay',
    'alright', 'alrighty', 'aight',
    'sure', 'sure thing', 'of course',
    'got it', 'gotcha', 'gottit', 'gotti',
    'thanks', 'thank you', 'thankyou', 'thx', 'ty', 'tysm', 'thank u',
    'cool', 'nice', 'great', 'awesome', 'perfect', 'good', 'fine',
    'understood', 'i see', 'i see', 'makes sense',
    'yes', 'yeah', 'yep', 'yup', 'ya', 'yea',
    'done', 'all good', 'no problem', 'np',
  ])

  function isAcknowledgment(text: string): boolean {
    const lower = text.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '')
    return ACKNOWLEDGMENTS.has(lower) || ACKNOWLEDGMENTS.has(lower.replace(/\s+/g, ' '))
  }

  // Words that strongly suggest the user is asking how to get in touch.
  const CONTACT_KEYWORDS = [
    'reach', 'contact', 'phone', 'mobile', 'call', 'whatsapp', 'email',
    'address', 'location', 'office', 'where', 'how can i', 'how can you',
    'how do i', 'how to contact', 'get in touch', 'talk to', 'speak to',
    'connect with', 'reach you', 'reach us', 'your number', 'your email',
    'office address', 'company address', 'find you',
  ]

  // Keywords that indicate the user is asking about DigiSharks business/services.
  // If the query matches these, Google search is skipped — the bot goes
  // directly to the Contact Us fallback when the Q&A database has no answer.
  const DIGISHARKS_KEYWORDS = [
    'digisharks', 'digi sharks', 'digishark',
    // Services
    'seo', 'ppc', 'google ads', 'search engine', 'organic', 'ranking', 'keyword',
    'pr', 'press release', 'media coverage', 'public relations', 'digital pr',
    'social media', 'smm', 'instagram', 'facebook', 'linkedin', 'twitter', 'content',
    'web development', 'website', 'web design', 'ecommerce', 'shopify', 'wordpress',
    'digital marketing', 'online marketing', 'internet marketing',
    'branding', 'brand promotion', 'brand awareness',
    'graphic design', 'graphics', 'logo', 'design',
    'content writing', 'copywriting', 'blog', 'article',
    'reputation', 'orm', 'reputation management', 'review',
    'influencer', 'influencer marketing',
    'political', 'political pr', 'political campaign',
    'event', 'event management', 'event promotion',
    'email marketing', 'email campaign',
    'sms marketing', 'sms campaign',
    'ai', 'aeo', 'geo', 'artificial intelligence',
    'seo audit', 'site audit', 'website audit',
    // Business
    'pricing', 'price', 'cost', 'rate', 'package', 'plan', 'charges', 'fee',
    'contact', 'phone', 'email', 'address', 'office', 'location',
    'noida', 'sector 63',
    'vansh', 'founder', 'ceo', 'team', 'employee', 'staff',
    'client', 'customer', 'portfolio', 'work', 'project', 'case study',
    'testimonial', 'review', 'rating',
    'career', 'job', 'internship', 'hire', 'vacancy', 'position',
    'partner', 'collaborate', 'affiliate',
    // Common chatty intents about DigiSharks
    'what do you do', 'what services', 'how can you help', 'tell me about',
    'i need', 'i want', 'i am looking', 'i\'m looking', 'looking for',
    'do you offer', 'do you provide', 'can you help', 'can you do',
    'your company', 'your agency', 'your firm',
    'about us', 'about digisharks', 'who are you',
    'how much', 'how many', 'how does', 'how to',
    'work with you', 'work together', 'get started',
  ]

  /** Returns true if the query appears to be about DigiSharks business/services. */
  function isDigisharksQuery(text: string): boolean {
    const lower = text.toLowerCase()
    return DIGISHARKS_KEYWORDS.some(k => lower.includes(k))
  }

  function looksLikeContactQuery(text: string) {
    const lower = text.toLowerCase()
    const matches = CONTACT_KEYWORDS.filter(k => lower.includes(k))
    // Require at least 2 keyword matches to avoid false positives
    // (e.g. "mobile" alone shouldn't intercept "mobile responsive design")
    return matches.length >= 2
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput(''); setShowServices(false); setFallbackCtaVisible(false); setContactCtaVisible(false)
    setMessages((prev) => [...prev, { role: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(true)

    const fallbackText = settings.fallbackMessage || "Sorry, I don't have an answer for that."

    // ──────────────────────────────────────────────────────────────────
    // Reply pipeline (in priority order):
    //   0a) Acknowledgment short-circuit — short affirmatives like "ok", "thanks"
    //   0b) Canonical contact-info short-circuit (bypasses seeded Q&A that
    //       may contain outdated/wrong contact answers)
    //   1) Q&A database (/api/chatbot/query) — seeded knowledge base
    //   2) Website content search (/api/chatbot/website-search)
    //   3) Google search (/api/chatbot/google-search)
    //   4) Final fallback → friendly "I don't have an answer" + Contact Us CTA
    // ──────────────────────────────────────────────────────────────────

    // 0a) Acknowledgment short-circuit — "ok", "thanks", "cool", etc.
    //     These should get a conversational follow-up, NOT routed to blog/Google search.
    if (isAcknowledgment(text)) {
      const acknowledgmentReplies = [
        'Great! Is there anything else I can help you with about our services?',
        'Happy to help! Let me know if you have any more questions.',
        'Awesome! Feel free to ask if anything else comes to mind.',
        'Got it! Would you like to know more about any of our services?',
        "You're welcome! Anything else you'd like to explore?",
      ]
      const reply = acknowledgmentReplies[Math.floor(Math.random() * acknowledgmentReplies.length)]
      setMessages((prev) => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      setLoading(false)
      return
    }

    // 0b) Canonical contact-info short-circuit
    if (looksLikeContactQuery(text)) {
      const reply = [
        'You can reach Digisharks Communications through any of these channels:',
        '',
        `📞 Phone: ${CONTACT_INFO.phone}`,
        `✉️ Email: ${CONTACT_INFO.email}`,
        `📍 Address: ${CONTACT_INFO.address[0]}, ${CONTACT_INFO.address[1]}`,
        `🕒 Hours: ${CONTACT_INFO.hours}`,
        '',
        `👉 Or fill out the form on our [Contact Us page](${CONTACT_INFO.contactPage}) and our team will respond within one business day.`,
      ].join('\n')
      setMessages((prev) => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      setFallbackCtaVisible(true)
      setLoading(false)
      return
    }

    // 1) Q&A database
    try {
      const r = await fetch('/api/chatbot/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const raw = await r.text()
      try {
        const d = raw ? JSON.parse(raw) : {}
        if (d && d.answer && typeof d.answer === 'string' && d.answer.trim() && d.answer.trim() !== fallbackText.trim()) {
          setMessages((prev) => [...prev, { role: 'bot', text: d.answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
          setLoading(false); return
        }
      } catch { /* not JSON, fall through */ }
    } catch { /* fall through */ }

    // 2) Website content search
    try {
      const r = await fetch('/api/chatbot/website-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const raw = await r.text()
      try {
        const d = raw ? JSON.parse(raw) : {}
        if (d && Array.isArray(d.results) && d.results.length > 0) {
          let reply = `I found a few articles on our site that might help:\n\n`
          d.results.slice(0, 4).forEach((it: any, i: number) => {
            reply += `${i + 1}. **${it.title || 'Result'}**\n${it.excerpt || it.shortPitch || it.snippet || ''}\n👉 [Read more](${it.url})\n\n`
          })
          reply += `Let me know if you'd like more details!`
          setMessages((prev) => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
          setLoading(false); return
        }
      } catch { /* not JSON, fall through */ }
    } catch { /* fall through */ }

    // 3) Google search (only for general/non-DigiSharks questions)
    if (!isDigisharksQuery(text)) {
      try {
        const r = await fetch('/api/chatbot/google-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
        const raw = await r.text()
        try {
          const d = raw ? JSON.parse(raw) : {}
          if (d && Array.isArray(d.results) && d.results.length > 0) {
            let reply = `I couldn't find a direct answer on our site, but here are some useful results from the web:\n\n`
            d.results.slice(0, 4).forEach((it: any, i: number) => {
              reply += `${i + 1}. **${it.title || 'Result'}**\n${it.snippet || ''}\n👉 [Read more](${it.url})\n\n`
            })
            if (d.googleSearchUrl) reply += `🌐 [See all results on Google](${d.googleSearchUrl})\n\n`
            setMessages((prev) => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
            setLoading(false); return
          }
        } catch { /* not JSON, fall through */ }
      } catch { /* fall through */ }
    }

    // 4) Final fallback — generic "I don't have an answer" + inline Contact Us CTA
    setMessages((prev) => [...prev, {
      role: 'bot',
      text: `Sorry, I don't have an answer for that. Let me connect you with our team who can help! 👇`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setFallbackCtaVisible(true)
    setLoading(false)
  }

  function dismissContactCta() {
    setContactCtaVisible(false)
    setFallbackCtaVisible(false)
    if (endOfConvoTimerRef.current) clearTimeout(endOfConvoTimerRef.current)
  }

  if (settings && settings.isEnabled === false) return null

  const primaryColor = settings.primaryColor || '#FF5B2E'
  const bubbleBg = settings.bubbleBgColor || '#20B486'
  const bubbleBorder = settings.bubbleBorderColor || '#ffffff'
  const bubbleShadow = settings.bubbleShadowColor || 'rgba(32, 180, 134, 0.45)'
  const faceStroke = settings.faceStrokeColor || '#ffffff'
  const faceFill = settings.faceFillColor || '#ffffff'
  const faceCheek = settings.faceCheekColor || '#FF8FA3'
  const antennaColor = settings.antennaColor || '#FF5B2E'
  const pillLabel = settings.pillLabel || 'Talk to us'
  const pillBg = settings.pillBgColor || '#1E2336'
  const pillText = settings.pillTextColor || '#ffffff'
  const pillBorder = settings.pillBorderColor || 'transparent'
  const pillShadow = settings.pillShadowColor || 'rgba(15, 22, 40, 0.35)'
  const bubbleSize = settings.bubbleSize || 72
  const pillFontSize = settings.pillFontSize || 15
  const pillPaddingX = settings.pillPaddingX ?? 22
  const pillPaddingY = settings.pillPaddingY ?? 10
  const showPillBorder = pillBorder && pillBorder !== 'transparent' && pillBorder !== 'rgba(0,0,0,0)'

  return (
      <div id="chat-widget-host">
        <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes chatBubbleBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes chatBubblePulse { 0% { box-shadow: 0 6px 18px ${bubbleShadow}, 0 0 0 0 ${bubbleBg}55; } 70% { box-shadow: 0 6px 18px ${bubbleShadow}, 0 0 0 18px ${bubbleBg}00; } 100% { box-shadow: 0 6px 18px ${bubbleShadow}, 0 0 0 0 ${bubbleBg}00; } }
        @keyframes pillFadeIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ctaSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {!open && !fetchingSettings && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'chatBubbleBob 3s ease-in-out infinite' }} aria-label="Open chat">
          <button onClick={() => setOpen(true)} style={{ width: bubbleSize, height: bubbleSize, padding: 0, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'chatBubblePulse 2.4s ease-out infinite', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }} aria-label="Open chat bubble">
            <ChatBotIcon bubbleBg={bubbleBg} bubbleBorder={bubbleBorder} bubbleShadow={bubbleShadow} faceStroke={faceStroke} faceFill={faceFill} faceCheek={faceCheek} antennaColor={antennaColor} size={bubbleSize} />
          </button>
          <button onClick={() => setOpen(true)} style={{ background: pillBg, color: pillText, border: showPillBorder ? `1.5px solid ${pillBorder}` : '1.5px solid transparent', borderRadius: 999, padding: `${pillPaddingY}px ${pillPaddingX}px`, fontSize: pillFontSize, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: `0 6px 18px ${pillShadow}`, animation: 'pillFadeIn 0.4s ease-out' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
            {pillLabel}
          </button>
        </div>
      )}

      {open && (
        <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, width: Math.max(44, bubbleSize - 12), height: Math.max(44, bubbleSize - 12), borderRadius: '50%', background: primaryColor, border: 'none', color: '#fff', fontSize: 24, fontWeight: 700, cursor: 'pointer', boxShadow: `0 6px 22px ${primaryColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
      )}

      <div style={{ position: 'fixed', bottom: 96, right: 20, width: 360, maxWidth: 'calc(100vw - 40px)', height: 520, maxHeight: 'calc(100vh - 140px)', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, display: open ? 'flex' : 'none', flexDirection: 'column', zIndex: 9998, boxShadow: '0 8px 40px rgba(0,0,0,0.4)', overflow: 'hidden', animation: open ? 'slideIn 0.25s ease-out' : undefined }}>
        <div style={{ background: primaryColor, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{settings.botName || 'DigiBot'}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '4px 8px', color: '#fff', cursor: 'pointer' }} aria-label="Close">✕</button>
        </div>
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {showServices && services.length > 0 && (
            <div>
              <div style={{ background: '#1e293b', borderRadius: '14px 14px 14px 4px', padding: '10px 14px 8px', marginBottom: 8, fontSize: 11, color: '#94a3b8' }}>Pick a service to learn more:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {services.map((svc) => (
                  <button key={svc.id} onClick={() => handleServiceClick(svc)} disabled={loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 20, border: `1px solid ${primaryColor}40`, background: `${primaryColor}15`, color: '#e2e8f0', fontSize: 12, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
                    <span>{svc.icon}</span><span>{svc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? settings.accentColor || '#0F1628' : '#1e293b', color: '#e2e8f0', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#94a3b8', fontSize: 12 }}>Typing...</div>}

          {(fallbackCtaVisible || contactCtaVisible) && (
            <div style={{ background: 'linear-gradient(135deg, rgba(255,91,46,0.12), rgba(99,102,241,0.12))', border: `1px solid ${primaryColor}40`, borderRadius: 14, padding: 14, textAlign: 'center', animation: 'ctaSlideUp 0.35s ease-out' }}>
              <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 10, lineHeight: 1.5 }}>
                {fallbackCtaVisible
                  ? "I couldn't find an answer for that. Want to chat with our team directly?"
                  : 'Still here? Tap below and our team will get back to you shortly.'}
              </div>
              <a href="/contact-us" onClick={dismissContactCta}
                style={{ display: 'inline-block', padding: '10px 20px', background: primaryColor, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                Contact Us
              </a>
              <button type="button" onClick={dismissContactCta}
                style={{ marginLeft: 8, padding: '10px 14px', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                Dismiss
              </button>
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid #1e293b', padding: '10px 12px', display: 'flex', gap: 8, flexShrink: 0, background: '#0b1220' }}>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }} placeholder="Type your question..." disabled={loading}
            style={{ flex: 1, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            style={{ background: primaryColor, border: 'none', borderRadius: 10, padding: '10px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.6 : 1 }}>Send</button>
        </div>
      </div>
      </div>
    )
  }
  
