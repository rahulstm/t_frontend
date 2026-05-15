import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  confirmLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirmLoading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, confirmLoading])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      aria-hidden={false}
      onClick={confirmLoading ? undefined : onCancel}
    >
      <div
        className="modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="modal-title">
          {title}
        </h3>
        <p id="confirm-dialog-desc" className="modal-message">
          {message}
        </p>
        <div className="modal-actions">
          <button type="button" className="button secondary" disabled={confirmLoading} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'button danger' : 'button'}
            disabled={confirmLoading}
            onClick={onConfirm}
          >
            {confirmLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
