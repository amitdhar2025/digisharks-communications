import './dp.css'

import CartProviderShell from '@/components/CartProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <CartProviderShell>{children}</CartProviderShell>
}
