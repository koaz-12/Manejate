import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';

interface SummaryCardProps {
    available: number;
    spent: number;
    income: number;
    currency: string;
}

export function SummaryCard({ available, spent, income, currency }: SummaryCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="w-full p-6 rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-emerald-900 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative">
                <div>
                    <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-wider mb-1">Disponible</p>
                    <h2 className="text-5xl font-bold tracking-tight">{formatCurrency(available)}</h2>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    <Wallet className="w-6 h-6 text-emerald-50" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 rounded-full bg-emerald-500/20">
                            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                        <span className="text-xs font-medium text-emerald-100/80">Ingresos</span>
                    </div>
                    <p className="font-bold text-lg text-emerald-50">{formatCurrency(income)}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 rounded-full bg-rose-500/20">
                            <ArrowUpCircle className="w-3.5 h-3.5 text-rose-300" />
                        </div>
                        <span className="text-xs font-medium text-emerald-100/80">Gastos</span>
                    </div>
                    <p className="font-bold text-lg text-emerald-50">{formatCurrency(spent)}</p>
                </div>
            </div>
        </div>
    );
}
