'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
    onConfirm: () => Promise<void> | void
    trigger: React.ReactNode
}

export function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Eliminar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    onConfirm,
    trigger,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleConfirm = () => {
        startTransition(async () => {
            await onConfirm()
            setOpen(false)
        })
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isPending && setOpen(false)}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                <AlertTriangle className={`w-7 h-7 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                            <p className="text-sm text-slate-500">{message}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                            >
                                {isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    confirmLabel
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
