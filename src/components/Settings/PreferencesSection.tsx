'use client'

import { updateUserSetting } from '@/actions/user_settings'
import { useState } from 'react'

interface Props {
    initialDepositDefault: boolean
}

export function PreferencesSection({ initialDepositDefault }: Props) {
    const [enabled, setEnabled] = useState(initialDepositDefault)

    async function handleToggle() {
        const newValue = !enabled
        setEnabled(newValue)
        // Optimistic update
        await updateUserSetting('goals.default_initial_deposit', newValue)
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Preferencias
            </h3>

            <div className="flex items-center justify-between py-2">
                <div>
                    <p className="font-medium text-slate-700">Aporte Inicial Automático</p>
                    <p className="text-xs text-slate-400 max-w-[250px]">
                        Marcar la casilla "Realizar este aporte ahora" por defecto al crear nuevas metas.
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                    <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                </button>
            </div>
        </div>
    )
}
