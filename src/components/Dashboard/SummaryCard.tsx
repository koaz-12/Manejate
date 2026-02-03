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
        <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-emerald-100 text-sm font-medium">Disponible</p>
                    <h2 className="text-4xl font-bold tracking-tight mt-1">{formatCurrency(available)}</h2>
                </div>
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownCircle className="w-4 h-4 text-emerald-200" />
                        <span className="text-xs text-emerald-100">Ingresos</span>
                    </div>
                    <p className="font-semibold text-lg">{formatCurrency(income)}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpCircle className="w-4 h-4 text-red-200" />
                        <span className="text-xs text-emerald-100">Gastos</span>
                    </div>
                    <p className="font-semibold text-lg">{formatCurrency(spent)}</p>
                </div>
            </div>
        </div>
    );
}
