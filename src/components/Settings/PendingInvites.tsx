'use client'

import { Trash2, Link2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

type Invite = {
    id: string
    token: string
    role: string
    expires_at: string
}

export function PendingInvites({ invites }: { invites: Invite[] }) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const copyLink = (token: string, id: string) => {
        const url = `${window.location.origin}/join/${token}`
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // TODO: Implement deleteInvite server action if needed

    if (invites.length === 0) return null

    return (
        <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Invitaciones Pendientes</h3>
            <div className="space-y-2">
                {invites.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                <Link2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">
                                    Enlace de {invite.role === 'viewer' ? 'Lector' : 'Editor'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Expira: {new Date(invite.expires_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyLink(invite.token, invite.id)}
                            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                        >
                            {copiedId === invite.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
