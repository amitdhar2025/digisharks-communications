export type CartItem = {
  slug: string
  title: string
  price: number
  quantity: number
}

export type Cart = {
  cartId: string
  items: CartItem[]
  updatedAt: Date
}

