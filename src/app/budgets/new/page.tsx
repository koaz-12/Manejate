import { CreateBudgetForm } from '@/components/Onboarding/CreateBudgetForm';
import { BottomNav } from '@/components/Layout/BottomNav';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBudgetPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-40 shadow-sm flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Nuevo Espacio</h1>
            </header>

            <main className="px-6 py-6">
                <CreateBudgetForm />
            </main>
        </div>
    );
}
