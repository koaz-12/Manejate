'use client'

import { createInviteLink } from '@/actions/collaboration'
import { useState } from 'react'
import { Link2, Check, Copy, Loader2 } from 'lucide-react'

export function InviteLink({ budgetId }: { budgetId: string }) {
    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [role, setRole] = useState<'editor' | 'viewer'>('editor')

    async function handleGenerate() {
        setLoading(true)
        const result = await createInviteLink(budgetId, role)
        setLoading(false)

        if (result?.url) {
            const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
            const fullUrl = `${origin}${result.url}`
            setLink(fullUrl)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        // WhatsApp Share Link Logic (Optional)
        // window.open(`https://wa.me/?text=Únete a mi presupuesto en Manejate: ${link}`)
    }

    if (link) {
        return (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">✨ Link ({role === 'editor' ? 'Editor' : 'Lector'}):</p>
                    <button onClick={() => setLink('')} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold underline">Crear otro</button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <code className="bg-white px-3 py-2 rounded-lg text-xs flex-1 truncate text-slate-700 font-mono select-all border border-slate-200">
                        {link}
                    </code>
                    <button
                        onClick={copyToClipboard}
                        className="bg-white text-slate-600 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <a
                    href={`https://wa.me/?text=Hola! Únete a este presupuesto (${role === 'editor' ? 'Editor' : 'Lector'}) en Manejate: ${link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-[#25D366] text-white font-bold py-3 rounded-xl text-sm hover:brightness-110 shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                    Enviar por WhatsApp
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex bg-slate-100 rounded-xl p-1 relative">
                <button
                    onClick={() => setRole('editor')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'editor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setRole('viewer')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'viewer' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Lector
                </button>
            </div>
            <p className="text-xs text-center text-slate-400 h-4">
                {role === 'editor' ? 'Puede editar, agregar gastos y metas.' : 'Solo puede ver la información, no tocar.'}
            </p>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Generar Link de Acceso
            </button>
        </div>
    )
}
