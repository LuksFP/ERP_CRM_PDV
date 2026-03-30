import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, PaymentMethod } from '@/shared/types'

export interface CartItem {
  product: Product
  quantity: number
  discount: number
}

interface PDVCartStore {
  cart: CartItem[]
  globalDiscount: number
  paymentMethod: PaymentMethod
  cashReceived: string
  processingPayment: boolean
  pdvId: string     // e.g. "PDV-01"
  addToCart: (product: Product) => void
  addCustomItem: (name: string, price: number, qty: number) => void
  updateQty: (productId: string, delta: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setGlobalDiscount: (v: number) => void
  setPaymentMethod: (v: PaymentMethod) => void
  setCashReceived: (v: string) => void
  setProcessingPayment: (v: boolean) => void
}

export const usePDVCartStore = create<PDVCartStore>()(
  persist(
    (set) => ({
      cart: [],
      globalDiscount: 0,
      paymentMethod: 'pix' as PaymentMethod,
      cashReceived: '',
      processingPayment: false,
      pdvId: 'PDV-01',

      addToCart: (product) =>
        set((s) => {
          const existing = s.cart.find((i) => i.product.id === product.id)
          return {
            cart: existing
              ? s.cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
              : [...s.cart, { product, quantity: 1, discount: 0 }],
          }
        }),

      addCustomItem: (name, price, qty) =>
        set((s) => ({
          cart: [...s.cart, {
            product: {
              id: `custom_${Date.now()}`,
              name,
              price,
              costPrice: 0,
              sku: 'AVULSO',
              barcode: null,
              category: 'Avulso',
              categoryId: '',
              unit: 'un',
              stock: 999,
              minStock: 0,
              isActive: true,
              isWeighable: false,
              customFields: {},
            } satisfies Product,
            quantity: qty,
            discount: 0,
          }],
        })),

      updateItemDiscount: (productId, discount) =>
        set((s) => ({
          cart: s.cart.map((i) =>
            i.product.id === productId ? { ...i, discount: Math.min(99, Math.max(0, discount)) } : i
          ),
        })),

      updateQty: (productId, delta) =>
        set((s) => ({
          cart: s.cart
            .map((i) => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
            .filter((i) => i.quantity > 0),
        })),

      removeItem: (productId) =>
        set((s) => ({ cart: s.cart.filter((i) => i.product.id !== productId) })),

      clearCart: () => set({ cart: [], globalDiscount: 0, cashReceived: '' }),

      setGlobalDiscount: (v) => set({ globalDiscount: v }),
      setPaymentMethod: (v) => set({ paymentMethod: v }),
      setCashReceived: (v) => set({ cashReceived: v }),
      setProcessingPayment: (v) => set({ processingPayment: v }),
    }),
    { name: 'pdv-cart-v1' },
  ),
)
