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
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 animate-in fade-in">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-indigo-200 font-medium">✨ Link ({role === 'editor' ? 'Editor' : 'Lector'}):</p>
                    <button onClick={() => setLink('')} className="text-xs text-indigo-200 hover:text-white underline">Crear otro</button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <code className="bg-black/20 px-3 py-2 rounded-lg text-xs flex-1 truncate text-indigo-100 font-mono select-all">
                        {link}
                    </code>
                    <button
                        onClick={copyToClipboard}
                        className="bg-white text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <a
                    href={`https://wa.me/?text=Hola! Únete a este presupuesto (${role === 'editor' ? 'Editor' : 'Lector'}) en Manejate: ${link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-[#25D366] text-white font-bold py-3 rounded-lg text-sm hover:brightness-110 shadow-sm transition-all"
                >
                    Enviar por WhatsApp
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex bg-black/20 rounded-xl p-1 relative">
                <button
                    onClick={() => setRole('editor')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setRole('viewer')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'viewer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                >
                    Lector
                </button>
            </div>
            <p className="text-xs text-center text-indigo-200 h-4">
                {role === 'editor' ? 'Puede editar, agregar gastos y metas.' : 'Solo puede ver la información, no tocar.'}
            </p>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Generar Link de Acceso
            </button>
        </div>
    )
}
