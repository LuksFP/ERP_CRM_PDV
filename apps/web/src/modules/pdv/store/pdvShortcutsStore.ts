import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PDVShortcuts {
  focusSearch: string   // default: F2
  clearCart: string     // default: F5
  finalize: string      // default: F10
  openAvulso: string    // default: F3
  openHistory: string   // default: F4
}

export const DEFAULT_SHORTCUTS: PDVShortcuts = {
  focusSearch:  'F2',
  clearCart:    'F5',
  finalize:     'F10',
  openAvulso:   'F3',
  openHistory:  'F4',
}

export const SHORTCUT_LABELS: Record<keyof PDVShortcuts, string> = {
  focusSearch:  'Focar busca',
  clearCart:    'Limpar carrinho',
  finalize:     'Finalizar venda',
  openAvulso:   'Item avulso',
  openHistory:  'Histórico do dia',
}

interface PDVShortcutsStore {
  shortcuts: PDVShortcuts
  setShortcut: (action: keyof PDVShortcuts, key: string) => void
  resetShortcuts: () => void
}

export const usePDVShortcutsStore = create<PDVShortcutsStore>()(
  persist(
    (set) => ({
      shortcuts: DEFAULT_SHORTCUTS,
      setShortcut: (action, key) =>
        set((s) => ({ shortcuts: { ...s.shortcuts, [action]: key } })),
      resetShortcuts: () => set({ shortcuts: DEFAULT_SHORTCUTS }),
    }),
    { name: 'pdv-shortcuts-v1' },
  ),
)
