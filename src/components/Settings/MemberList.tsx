'use client'

import { removeMember } from '@/actions/collaboration'
import { Trash2, Shield, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/Common/ConfirmDialog'

type Member = {
    user_id: string
    role: string
    profiles: {
        display_name: string | null
        email: string | null
        avatar_url: string | null
    }
}

export function MemberList({ members, currentUserId, budgetId, currentUserRole }: { members: Member[], currentUserId: string, budgetId: string, currentUserRole: string }) {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleRemove(userId: string) {
        setLoading(userId)
        await removeMember(budgetId, userId)
        setLoading(null)
    }

    return (
        <div className="space-y-4">
            {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                            {member.profiles?.avatar_url ? (
                                <img src={member.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">
                                {member.profiles?.display_name || 'Usuario'}
                                {member.user_id === currentUserId && <span className="text-slate-400 font-normal"> (Tú)</span>}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                {member.role === 'admin' && <Shield className="w-3 h-3 text-amber-500" />}
                                <span className="capitalize">{member.role === 'viewer' ? 'Lector' : member.role}</span>
                                <span className="text-slate-300">•</span>
                                <span className="truncate max-w-[120px]">{member.profiles?.email}</span>
                            </div>
                        </div>
                    </div>

                    {member.user_id === currentUserId ? (
                        <ConfirmDialog
                            title="¿Salir del presupuesto?"
                            message="Perderás acceso a todos los gastos y datos de este presupuesto."
                            confirmLabel="Salir"
                            variant="warning"
                            onConfirm={() => handleRemove(member.user_id)}
                            trigger={
                                <button
                                    disabled={loading === member.user_id}
                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Salir del grupo"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            }
                        />
                    ) : currentUserRole === 'admin' ? (
                        <ConfirmDialog
                            title="¿Eliminar miembro?"
                            message={`${member.profiles?.display_name || 'Este usuario'} será removido del presupuesto.`}
                            confirmLabel="Eliminar"
                            onConfirm={() => handleRemove(member.user_id)}
                            trigger={
                                <button
                                    disabled={loading === member.user_id}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Eliminar miembro"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            }
                        />
                    ) : null}
                </div>
            ))}
        </div>
    )
}
