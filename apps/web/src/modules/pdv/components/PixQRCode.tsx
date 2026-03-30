/**
 * PIX QR Code display component.
 * Renders a QR code image using the qrserver.com public API
 * pointing to a mock PIX copia-e-cola payload for the given amount.
 */

interface PixQRCodeProps {
  total: number
  size?: number
}

function formatPixPayload(amount: number): string {
  // Mock PIX payload string (EMV format simplified)
  const amountStr = amount.toFixed(2)
  return `00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540${amountStr.length.toString().padStart(2, '0')}${amountStr}5802BR5913Loja ERP PDV6009SAO PAULO62140510${Date.now().toString().slice(-10)}6304ABCD`
}

export function PixQRCode({ total, size = 180 }: PixQRCodeProps) {
  const payload = encodeURIComponent(formatPixPayload(total))
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${payload}&size=${size}x${size}&bgcolor=ffffff&color=000000&margin=8&format=svg`

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl overflow-hidden border-4 border-white shadow-sm bg-white">
        <img
          src={qrUrl}
          alt="QR Code PIX"
          width={size}
          height={size}
          style={{ display: 'block' }}
        />
      </div>
      <p className="text-[10px] font-mono text-center opacity-50 max-w-[180px] break-all">
        PIX Copia e Cola disponível
      </p>
    </div>
  )
}
