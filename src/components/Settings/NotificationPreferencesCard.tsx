'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

export function NotificationPreferencesCard() {
    // Mock state for now - ideally linked to user_settings table
    const [emailAlerts, setEmailAlerts] = useState(true)
    const [weeklyReport, setWeeklyReport] = useState(false)

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Notificaciones (Mock)
            </h3>

            <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                        <p className="font-medium text-slate-700">Alertas de Presupuesto</p>
                        <p className="text-xs text-slate-400">Recibe un correo cuando estés al 90% del límite.</p>
                    </div>
                    <button
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${emailAlerts ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-slate-700">Resumen Semanal</p>
                        <p className="text-xs text-slate-400">Un resumen de tus gastos cada lunes.</p>
                    </div>
                    <button
                        onClick={() => setWeeklyReport(!weeklyReport)}
                        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${weeklyReport ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${weeklyReport ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}
