import { BottomNav } from '@/components/Layout/BottomNav'
import { Bell, Check, Info, AlertTriangle, ArrowLeft, CheckCheck, AlertOctagon } from 'lucide-react'
import Link from 'next/link'
import { getActiveBudgetContext } from '@/lib/budget-helpers'
import { getNotifications, markAllNotificationsAsRead } from '@/actions/notifications'
import { redirect } from 'next/navigation'
import { MarkAllReadButton } from './MarkAllReadButton'

export default async function NotificationsPage() {
    const { budgets, budget } = await getActiveBudgetContext()
    if (!budget) redirect('/')

    const notifications = await getNotifications(budget.id, 50)

    function formatTime(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`
        const days = Math.floor(hours / 24)
        return `Hace ${days} día${days !== 1 ? 's' : ''}`
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="px-6 py-4 bg-white sticky top-0 z-40 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">Notificaciones</h1>
                </div>
                <MarkAllReadButton budgetId={budget.id} />
            </header>

            <main className="px-6 mt-6 space-y-4">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`p-4 rounded-3xl border transition-all ${n.read
                                ? 'bg-white border-slate-100'
                                : 'bg-indigo-50/50 border-indigo-100 shadow-sm'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        n.type === 'danger' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {n.type === 'success' && <Check className="w-6 h-6" />}
                                    {n.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                                    {n.type === 'danger' && <AlertOctagon className="w-6 h-6" />}
                                    {n.type === 'info' && <Info className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-base truncate pr-2 ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {n.title}
                                        </h3>
                                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{formatTime(n.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No tienes notificaciones.</p>
                        <p className="text-slate-300 text-sm mt-1">Las recibirás cuando tus gastos se acerquen al límite.</p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}
