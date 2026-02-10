'use client'

import { NotificationDropdown } from './NotificationDropdown'
import { switchBudget } from '@/actions/app'
import { signOut } from '@/actions/auth'
import { markAllNotificationsAsRead } from '@/actions/notifications'
import { Bell, ChevronDown, Plus, User, Check, Wallet, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface Budget {
    id: string
    name: string
    role?: string
}

interface Notification {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
}

interface Props {
    budgets: Budget[]
    currentBudgetId: string
    userAvatar?: string | null
    notifications?: Notification[]
}

export function BudgetHeader({ budgets, currentBudgetId, userAvatar, notifications: initialNotifications = [] }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)

    const unreadCount = notifications.filter(n => !n.read).length

    function formatTime(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h`
        const days = Math.floor(hours / 24)
        return `${days}d`
    }

    async function markAllAsRead() {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        await markAllNotificationsAsRead(currentBudgetId)
    }

    const currentBudget = budgets.find(b => b.id === currentBudgetId)

    return (
        <header className="px-5 py-3 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-slate-200/50 h-[60px] pt-[env(safe-area-inset-top)]">
            {/* Left: Budget Switcher */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-slate-800 hover:text-slate-600 transition-colors p-1.5 rounded-xl active:bg-slate-100/50"
                >
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-1.5 rounded-lg text-emerald-700 shadow-sm">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span className="font-exrabold text-sm max-w-[140px] truncate tracking-tight">{currentBudget?.name || 'Mi Presupuesto'}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                        <p className="text-[10px] font-extrabold text-slate-400 px-3 py-2 uppercase tracking-wider">Mis Presupuestos</p>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {budgets.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => {
                                        switchBudget(b.id)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex justify-between items-center transition-all ${b.id === currentBudgetId
                                        ? 'bg-emerald-50 text-emerald-700 shadow-inner'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="truncate">{b.name}</span>
                                    {b.id === currentBudgetId && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100 my-2 mx-1"></div>
                        <Link
                            href="/budgets/new"
                            className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-all group"
                        >
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-white transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                            </div>
                            Crear Nuevo Presupuesto
                        </Link>
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2.5 transition-colors relative rounded-full active:scale-95 flex items-center justify-center ${isNotificationsOpen
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                    >
                        <Bell className="w-5 h-5" />
                        {/* Notification Dot */}
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                            <NotificationDropdown
                                onClose={() => setIsNotificationsOpen(false)}
                                notifications={notifications.map(n => ({
                                    ...n,
                                    id: typeof n.id === 'string' ? parseInt(n.id.slice(0, 8), 16) : Number(n.id),
                                    time: formatTime(n.created_at)
                                }))}
                                onMarkAllAsRead={markAllAsRead}
                            />
                        </>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="relative w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-100 hover:border-emerald-200 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-emerald-100 shadow-sm"
                    >
                        {userAvatar ? (
                            <img src={userAvatar || ''} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {isProfileOpen && (
                        <>
                            {/* Backdrop */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>

                            <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors mb-1"
                                >
                                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                    Mi Perfil
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    Ajustes del Presupuesto
                                </Link>
                                <div className="h-px bg-slate-100 my-2 mx-1"></div>
                                <button
                                    onClick={() => {
                                        signOut()
                                        setIsProfileOpen(false)
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                >
                                    <div className="p-1.5 bg-rose-100 rounded-lg text-rose-500">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
