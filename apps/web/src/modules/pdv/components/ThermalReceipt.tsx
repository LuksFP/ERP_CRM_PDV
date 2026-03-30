import { createPortal } from 'react-dom'
import { formatCurrency } from '@/shared/utils/formatters'
import type { CartItem } from '../store/pdvCartStore'
import type { PaymentMethod } from '@/shared/types'

interface ThermalReceiptProps {
  items: CartItem[]
  subtotal: number
  globalDiscount: number
  total: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  change?: number
  pdvId: string
  isTraining?: boolean
  storeName?: string
  timestamp?: string
  onClose: () => void
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash:        'Dinheiro',
  card_debit:  'Débito',
  card_credit: 'Crédito',
  pix:         'Pix',
  voucher:     'Voucher',
}

export function ThermalReceipt({
  items,
  subtotal,
  globalDiscount,
  total,
  paymentMethod,
  cashReceived,
  change,
  pdvId,
  isTraining,
  storeName = 'Minha Loja',
  timestamp,
  onClose,
}: ThermalReceiptProps) {
  const ts = timestamp ? new Date(timestamp) : new Date()
  const dateStr = ts.toLocaleDateString('pt-BR')
  const timeStr = ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <>
      {/* Screen overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
            <span className="text-sm font-semibold text-gray-700">Cupom Fiscal (80mm)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Imprimir
              </button>
              <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">
                Fechar
              </button>
            </div>
          </div>

          {/* Receipt preview */}
          <div className="overflow-y-auto">
            <ReceiptContent
              items={items}
              subtotal={subtotal}
              globalDiscount={globalDiscount}
              total={total}
              paymentMethod={paymentMethod}
              cashReceived={cashReceived}
              change={change}
              pdvId={pdvId}
              isTraining={isTraining}
              storeName={storeName}
              dateStr={dateStr}
              timeStr={timeStr}
            />
          </div>
        </div>
      </div>

      {/* Print-only receipt */}
      <div className="hidden print:block">
        <ReceiptContent
          items={items}
          subtotal={subtotal}
          globalDiscount={globalDiscount}
          total={total}
          paymentMethod={paymentMethod}
          cashReceived={cashReceived}
          change={change}
          pdvId={pdvId}
          isTraining={isTraining}
          storeName={storeName}
          dateStr={dateStr}
          timeStr={timeStr}
        />
      </div>
    </>,
    document.body,
  )
}

// ─── RECEIPT LAYOUT ──────────────────────────────────────────────
function ReceiptContent({
  items, subtotal, globalDiscount, total,
  paymentMethod, cashReceived, change,
  pdvId, isTraining, storeName, dateStr, timeStr,
}: Omit<ThermalReceiptProps, 'onClose' | 'timestamp'> & { dateStr: string; timeStr: string }) {
  const line = '─'.repeat(32)

  return (
    <div
      className="font-mono text-[11px] text-black leading-tight"
      style={{ width: 302, padding: '16px 12px', background: '#fff', boxSizing: 'border-box' }}
    >
      {isTraining && (
        <p className="text-center font-bold text-[10px] mb-2 border border-black px-1">
          *** CUPOM DE TREINAMENTO ***
        </p>
      )}

      {/* Header */}
      <p className="text-center font-bold text-[13px] mb-0.5">{storeName}</p>
      <p className="text-center text-[10px] text-gray-500">CNPJ: 00.000.000/0001-00</p>
      <p className="text-center text-[10px] text-gray-500">Rua Exemplo, 123 — São Paulo/SP</p>
      <p className="text-center text-[10px] mt-1">{pdvId}</p>

      <p className="my-2 text-center text-[9px]">{line}</p>
      <p className="text-center font-bold text-[11px]">CUPOM NÃO FISCAL</p>
      <p className="text-center text-[10px] text-gray-500">{dateStr} às {timeStr}</p>
      <p className="my-2 text-center text-[9px]">{line}</p>

      {/* Items */}
      <div className="space-y-1 mb-2">
        {items.map((item, i) => {
          const lineTotal = item.product.price * item.quantity * (1 - item.discount / 100)
          return (
            <div key={i}>
              <div className="flex justify-between">
                <span className="flex-1 truncate">{item.product.name}</span>
                <span>{formatCurrency(lineTotal)}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                {item.quantity}x {formatCurrency(item.product.price)}
                {item.discount > 0 && ` (-${item.discount}%)`}
              </div>
            </div>
          )
        })}
      </div>

      <p className="my-1 text-center text-[9px]">{line}</p>

      {/* Totals */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {globalDiscount > 0 && (
          <div className="flex justify-between">
            <span>Desconto ({globalDiscount}%)</span>
            <span>-{formatCurrency(subtotal * globalDiscount / 100)}</span>
          </div>
        )}
      </div>

      <p className="my-1 text-center text-[9px]">{line}</p>

      <div className="flex justify-between font-bold text-[13px]">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div className="mt-2 space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Forma de Pagamento</span>
          <span>{METHOD_LABELS[paymentMethod]}</span>
        </div>
        {cashReceived !== undefined && (
          <div className="flex justify-between">
            <span>Valor Recebido</span>
            <span>{formatCurrency(cashReceived)}</span>
          </div>
        )}
        {change !== undefined && change >= 0 && (
          <div className="flex justify-between font-bold">
            <span>Troco</span>
            <span>{formatCurrency(change)}</span>
          </div>
        )}
      </div>

      <p className="my-2 text-center text-[9px]">{line}</p>

      <p className="text-center text-[10px]">Obrigado pela preferência!</p>
      <p className="text-center text-[9px] text-gray-400 mt-1">
        Nº {Date.now().toString().slice(-8)}
      </p>
    </div>
  )
}
