'use client';

import { Home, CreditCard, PieChart, Settings, Target } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                <NavItem href="/" icon={<Home className="w-6 h-6" />} label="Inicio" active={isActive('/')} />
                <NavItem href="/transactions" icon={<CreditCard className="w-6 h-6" />} label="Transacciones" active={isActive('/transactions')} />
                <NavItem href="/goals" icon={<Target className="w-6 h-6" />} label="Metas" active={isActive('/goals')} />

                {/* Spacer for FAB */}
                <div className="w-12" />

                <NavItem href="/budget" icon={<PieChart className="w-6 h-6" />} label="Presupuesto" active={isActive('/budget')} />
                <NavItem href="/settings" icon={<Settings className="w-6 h-6" />} label="Ajustes" active={isActive('/settings')} />
            </div>

            {/* Floating Action Button (FAB) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link
                    href="/transactions/new"
                    className="bg-[var(--secondary)] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="text-3xl font-light mb-1">+</span>
                </Link>
            </div>
        </div>
    );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    const colorClass = active ? 'text-[var(--secondary)]' : 'text-slate-400';

    return (
        <Link href={href} className={`flex flex-col items-center gap-1 p-2 ${colorClass} transition-colors`}>
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
