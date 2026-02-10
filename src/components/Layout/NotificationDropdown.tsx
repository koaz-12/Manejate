'use client'

import { Bell, Check, Info, AlertTriangle, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export interface Notification {
    id: number
    type: string
    title: string
    message: string
    time: string
    read: boolean
}

interface Props {
    notifications: Notification[]
    onMarkAllAsRead: () => void
    onClose: () => void
}

export function NotificationDropdown({ notifications, onMarkAllAsRead, onClose }: Props) {

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="fixed inset-0 z-40 sm:hidden"
                onClick={onClose}
            />

            <div className="fixed left-4 right-4 top-[72px] z-50 sm:absolute sm:top-full sm:mt-3 sm:right-0 sm:left-auto sm:w-96 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Notificaciones</h3>
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-full transition-colors uppercase tracking-wider"
                    >
                        <CheckCheck className="w-3 h-3" />
                        Marcar leídas
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <button
                                key={n.id}
                                className={`w-full text-left p-3 rounded-2xl transition-all flex gap-3 ${n.read
                                    ? 'hover:bg-slate-50'
                                    : 'bg-indigo-50/30 hover:bg-indigo-50/60'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {n.type === 'success' && <Check className="w-5 h-5" />}
                                    {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                    {n.type === 'info' && <Info className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className={`font-bold text-sm truncate pr-2 ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                                        {n.message}
                                    </p>
                                </div>
                                {!n.read && (
                                    <div className="self-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-xs font-medium">Sin novedades</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                    <Link
                        href="/notifications"
                        onClick={onClose}
                        className="block w-full text-center py-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        Ver historial completo
                    </Link>
                </div>
            </div>
        </>
    )
}
