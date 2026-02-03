'use client';

import { Home, CreditCard, PieChart, Settings, Target, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-between items-end max-w-md mx-auto h-full">
                <NavItem href="/" icon={<Home className="w-6 h-6" />} label="Inicio" active={isActive('/')} />
                <NavItem href="/transactions" icon={<CreditCard className="w-6 h-6" />} label="Movimientos" active={isActive('/transactions')} />

                {/* Centered Add Button */}
                <div className="relative -top-8">
                    <Link
                        href="/transactions/new"
                        className="bg-[var(--primary)] text-white w-16 h-16 rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-[4px] border-slate-50"
                    >
                        <Plus className="w-8 h-8" />
                    </Link>
                </div>

                <NavItem href="/budget" icon={<PieChart className="w-6 h-6" />} label="Presupuesto" active={isActive('/budget')} />
                <NavItem href="/settings" icon={<Settings className="w-6 h-6" />} label="Ajustes" active={isActive('/settings')} />
            </div>
        </div>
    );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    const colorClass = active ? 'text-[var(--secondary)]' : 'text-slate-400';

    return (
        <Link href={href} className={`flex flex-col items-center gap-1 p-2 ${colorClass} transition-colors`}>
            {icon}
            <span className="text-[9px] font-bold tracking-wide mt-0.5">{label}</span>
        </Link>
    );
}
