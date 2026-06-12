export type OrderStatus = 'pending'

export type OrderItem = {
  slug: string
  title: string
  price: number
  quantity: number
}

export type Order = {
  orderId: string
  cartId: string
  name: string
  email: string
  phone: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Date
}

