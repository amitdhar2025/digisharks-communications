export type ProductFaq = { q: string; a: string }

export type Product = {
  slug: string
  title: string
  price: number
  originalPrice: number
  category: string
  shortDescription: string
  description: string
  features: string[]
  whatsIncluded: string[]
  faqs: ProductFaq[]
  rating: number
}

