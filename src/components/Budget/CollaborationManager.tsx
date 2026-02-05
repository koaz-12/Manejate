'use client'

import { useState } from 'react'
import { Users, X, UserPlus, Settings2 } from 'lucide-react'
import { MemberList } from '@/components/Settings/MemberList'
import { InviteLink } from '@/components/Settings/InviteLink'

type Member = {
    user_id: string
    role: string
    profiles: {
        display_name: string | null
        email: string | null
        avatar_url: string | null
    }
}

interface Props {
    members: Member[]
    invitations: any[]
    budgetId: string
    currentUserId: string
}

export function CollaborationManager({ members, invitations, budgetId, currentUserId }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'members' | 'invite'>('members')

    // Derived state
    const displayMembers = members.slice(0, 4)
    const remainingCount = Math.max(0, members.length - 4)

    return (
        <>
            {/* Summary Card (Trigger) */}
            <section
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative cursor-pointer active:scale-95 transition-transform"
            >
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-bold">Colaboradores</h2>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            Gestiona tu equipo y accesos.
                        </p>

                        {/* Avatar Pile */}
                        <div className="flex items-center -space-x-3">
                            {displayMembers.map((m) => (
                                <div key={m.user_id} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                                    {m.profiles?.avatar_url ? (
                                        <img src={m.profiles.avatar_url} alt={m.profiles.display_name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-xs font-bold">
                                            {m.profiles?.display_name?.[0] || '?'}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {remainingCount > 0 && (
                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                    +{remainingCount}
                                </div>
                            )}
                            <div className="ml-4 bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                                <Settings2 className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            </section>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Content */}
                    <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 h-[85vh] sm:h-auto overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">Gestionar Equipo</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-6 flex-shrink-0">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'members'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Miembros ({members.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('invite')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'invite'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                Invitar
                            </button>
                        </div>

                        {/* Expandable Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'members' ? (
                                <MemberList
                                    members={members}
                                    currentUserId={currentUserId}
                                    budgetId={budgetId}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-4">
                                        <h3 className="font-bold text-indigo-900 mb-1">Invitar Colaboradores</h3>
                                        <p className="text-sm text-indigo-700/80">
                                            Comparte el enlace con las personas que quieres que se unan a este presupuesto.
                                        </p>
                                    </div>
                                    <InviteLink budgetId={budgetId} />

                                    {/* Active Invitations List could go here if prop passed */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
