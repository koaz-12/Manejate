'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function MonthSelector({ cutoffDay }: { cutoffDay: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get date from URL or default to today
    const urlDate = searchParams.get('date')
    const [currentDate, setCurrentDate] = useState(() => urlDate ? new Date(urlDate) : new Date())

    // Format label: "15 Feb - 14 Mar" or "Marzo 2024" depending on cutoff
    // If cutoff is 1, it's just the month.
    // If cutoff > 1, it's cross-month.

    function getLabel(date: Date) {
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        if (cutoffDay === 1) {
            return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        }

        // If cutoff > 1, cycle is [cutoff Month] to [cutoff-1 NextMonth]
        // We consider the "Main Month" to be the one where the cycle *ends* usually for budgeting?
        // Or just show range: "15 Feb - 14 Mar"

        const startMonth = date.getMonth();

        // Calculate End Date of cycle
        const endCycle = new Date(date);
        endCycle.setMonth(endCycle.getMonth() + 1);
        endCycle.setDate(cutoffDay - 1);

        return `${cutoffDay} ${monthNames[startMonth]} - ${cutoffDay - 1} ${monthNames[endCycle.getMonth()]}`;
    }

    function changeMonth(delta: number) {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + delta)
        setCurrentDate(newDate)

        // Update URL
        const params = new URLSearchParams(searchParams)
        params.set('date', newDate.toISOString().split('T')[0])
        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-6 mx-6">
            <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-slate-800 font-bold min-w-[140px] justify-center">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-sm capitalize">{getLabel(currentDate)}</span>
            </div>

            <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
