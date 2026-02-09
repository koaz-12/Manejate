import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NewGoalForm } from '@/components/Goals/NewGoalForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditGoalPage(props: Props) {
    const params = await props.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get Goal Details
    const { data: goal } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!goal) redirect('/goals')

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/goals" className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Editar Meta</h1>
            </header>

            <main>
                <NewGoalForm initialData={goal} />
            </main>
        </div>
    )
}
