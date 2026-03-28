import { useState } from 'react'
import { Plus, Search, Package, AlertTriangle } from 'lucide-react'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useCustomFields } from '@/shared/hooks/useCustomFields'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/mock/configs'
import { formatCurrency } from '@/shared/utils/formatters'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { Modal } from '@/shared/components/Modal'
import { EmptyState } from '@/shared/components/EmptyState'
import { DynamicFieldRenderer } from '@/shared/components/DynamicFieldRenderer'
import { cn } from '@/shared/utils/cn'
import type { Product } from '@/shared/types'

type SortKey = 'name' | 'stock' | 'price'

export default function InventoryPage() {
  const { hasRole } = usePermissions()
  const customFields = useCustomFields('product')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('name')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({})

  const filtered = MOCK_PRODUCTS
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || p.categoryId === category
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sort === 'stock') return a.stock - b.stock
      if (sort === 'price') return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  const lowStock = MOCK_PRODUCTS.filter((p) => p.stock <= p.minStock)

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Estoque</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {MOCK_PRODUCTS.length} produtos · {lowStock.length} com estoque baixo
          </p>
        </div>
        {hasRole('manager') && (
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Novo Produto
          </Button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg text-sm">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span className="text-ink-muted">
            <strong className="text-ink">{lowStock.length} produtos</strong> com estoque abaixo do mínimo:{' '}
            {lowStock.map((p) => p.name).slice(0, 3).join(', ')}
            {lowStock.length > 3 && ` +${lowStock.length - 3}`}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconLeft={<Search size={14} />}
          className="w-64"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 text-sm bg-surface-1 border border-border rounded text-ink focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
        >
          <option value="all">Todas as categorias</option>
          {MOCK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-ink-subtle">Ordenar:</span>
          {(['name', 'stock', 'price'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                'px-2.5 py-1 text-xs rounded transition-colors',
                sort === s
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2'
              )}
            >
              {s === 'name' ? 'Nome' : s === 'stock' ? 'Estoque' : 'Preço'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="Nenhum produto encontrado"
          description="Tente ajustar os filtros ou cadastre um novo produto."
          action={hasRole('manager') ? { label: 'Novo Produto', onClick: () => setShowModal(true) } : undefined}
        />
      ) : (
        <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-1">
                  {['SKU', 'PRODUTO', 'CATEGORIA', 'PREÇO', 'CUSTO', 'ESTOQUE', 'MÍN.', 'STATUS'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => {
                  const isLow = product.stock <= product.minStock
                  const isCritical = product.stock === 0
                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        'border-b border-border/50 hover:bg-surface-1 transition-colors cursor-pointer',
                        i % 2 === 0 ? 'bg-surface-0' : 'bg-surface-0/50'
                      )}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{product.sku}</td>
                      <td className="px-4 py-3 font-medium text-ink max-w-[200px] truncate">{product.name}</td>
                      <td className="px-4 py-3 text-ink-muted">{product.category}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[var(--accent)]">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 font-mono text-ink-muted">{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-ink">{product.stock}</td>
                      <td className="px-4 py-3 font-mono text-ink-subtle">{product.minStock}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isCritical ? 'danger' : isLow ? 'warning' : 'success'}>
                          {isCritical ? 'Zerado' : isLow ? 'Baixo' : 'OK'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border text-xs text-ink-subtle font-mono">
            {filtered.length} de {MOCK_PRODUCTS.length} produtos
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <Modal
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          description={`SKU: ${selectedProduct.sku}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Categoria', selectedProduct.category],
                ['Preço de Venda', formatCurrency(selectedProduct.price)],
                ['Preço de Custo', formatCurrency(selectedProduct.costPrice)],
                ['Estoque Atual', `${selectedProduct.stock} ${selectedProduct.unit}`],
                ['Estoque Mínimo', `${selectedProduct.minStock} ${selectedProduct.unit}`],
                ['Margem', `${(((selectedProduct.price - selectedProduct.costPrice) / selectedProduct.price) * 100).toFixed(1)}%`],
                ['Código de Barras', selectedProduct.barcode ?? '—'],
                ['Pesável', selectedProduct.isWeighable ? 'Sim' : 'Não'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">{label}</p>
                  <p className="font-semibold text-ink mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Segment-specific fields */}
            {selectedProduct.batch && (
              <div className="p-3 bg-surface-1 rounded-lg border border-border text-sm space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle mb-2">Campos do Segmento</p>
                {selectedProduct.batch && <p><span className="text-ink-muted">Lote:</span> <strong>{selectedProduct.batch}</strong></p>}
                {selectedProduct.expiryDate && <p><span className="text-ink-muted">Validade:</span> <strong>{selectedProduct.expiryDate}</strong></p>}
                {selectedProduct.anvisaReg && <p><span className="text-ink-muted">ANVISA:</span> <strong>{selectedProduct.anvisaReg}</strong></p>}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New product modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Produto"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button size="sm">Salvar Produto</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome *" placeholder="Nome do produto" />
            <Input label="SKU *" placeholder="SKU-001" />
            <Input label="Preço de Venda *" type="number" placeholder="0,00" />
            <Input label="Preço de Custo" type="number" placeholder="0,00" />
            <Input label="Estoque Inicial" type="number" placeholder="0" />
            <Input label="Estoque Mínimo" type="number" placeholder="0" />
          </div>

          {customFields.length > 0 && (
            <DynamicFieldRenderer
              fields={customFields}
              values={customValues}
              onChange={(key, val) => setCustomValues((v) => ({ ...v, [key]: val }))}
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
