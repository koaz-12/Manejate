'use client'

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SpendingTrendsProps {
    data: { month: string; spent: number; income: number }[]
    currency: string
}

export function SpendingTrends({ data, currency }: SpendingTrendsProps) {
    if (data.length < 2) return null

    // Trend calculation
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    const diff = current.spent - previous.spent
    const diffPercent = previous.spent > 0 ? Math.round((diff / previous.spent) * 100) : 0

    const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus
    const trendColor = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'
    const trendBg = diff > 0 ? 'bg-red-50' : diff < 0 ? 'bg-emerald-50' : 'bg-slate-50'
    const trendLabel = diff > 0 ? `+${diffPercent}% vs mes anterior` : diff < 0 ? `${diffPercent}% vs mes anterior` : 'Sin cambios'

    const formatAmount = (value: number) =>
        `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

    return (
        <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-800 font-bold text-lg">Tendencia</h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trendBg} ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    {trendLabel}
                </div>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#cbd5e1' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        />
                        <Tooltip
                            formatter={(value: any, name?: string) => [
                                formatAmount(value),
                                name === 'spent' ? 'Gastos' : 'Ingresos'
                            ]}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                            labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#incomeGradient)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="spent"
                            stroke="#f97316"
                            strokeWidth={2.5}
                            fill="url(#spentGradient)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    Gastos
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    Ingresos
                </div>
            </div>
        </div>
    )
}
