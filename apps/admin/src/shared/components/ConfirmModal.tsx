import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-yellow/10">
          <AlertTriangle className="h-5 w-5 text-yellow" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </Modal>
  )
}
