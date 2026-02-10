'use client'

import { removeMember } from '@/actions/collaboration'
import { Trash2, Shield, User, LogOut } from 'lucide-react'
import { useState } from 'react'

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
        // Confirmations moved to button onClick for specific messages

        setLoading(userId)
        await removeMember(budgetId, userId)
        setLoading(null)
        // Router refresh handled by server action revalidate? Client might need router.refresh() if revalidatePath not enough for client cache.
        // But usually revalidatePath works.
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

                    {/* Actions: Show Remove if Current User is Admin OR if it's themselves (Leave) */}
                    {/* Simplified: Show trash if NOT them, assuming Admin view. Logic handled in backend too. */}
                    {/* Actually, let's allow removing if I am admin, OR removing myself. */}

                    {/* Actions Logic:
                        1. If it's ME: Show "Leave" button.
                        2. If it's NOT ME and I am ADMIN: Show "Kick" button.
                        3. Else: Show nothing.
                     */}
                    {member.user_id === currentUserId ? (
                        <button
                            onClick={() => {
                                if (confirm('¿Quieres salir de este presupuesto? Perderás acceso a los gastos.')) {
                                    handleRemove(member.user_id)
                                }
                            }}
                            disabled={loading === member.user_id}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Salir del grupo"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    ) : currentUserRole === 'admin' ? (
                        <button
                            onClick={() => {
                                if (confirm('¿Eliminar a este usuario del presupuesto?')) {
                                    handleRemove(member.user_id)
                                }
                            }}
                            disabled={loading === member.user_id}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar miembro"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
