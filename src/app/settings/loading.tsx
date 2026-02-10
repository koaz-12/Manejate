export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24 animate-pulse">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 pt-[env(safe-area-inset-top)]">
                <div className="flex justify-between items-center py-4">
                    <div className="h-8 w-32 bg-slate-200 rounded-xl" />
                    <div className="h-10 w-10 bg-slate-200 rounded-full" />
                </div>
            </div>

            <main className="px-6 mt-6 space-y-8 max-w-2xl mx-auto">
                {/* Title */}
                <div className="space-y-2">
                    <div className="h-7 w-24 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-64 bg-slate-100 rounded" />
                </div>

                {/* Profile Card */}
                <div className="space-y-4">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                        <div className="h-14 w-14 bg-slate-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-32 bg-slate-200 rounded" />
                            <div className="h-4 w-48 bg-slate-100 rounded" />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200" />

                {/* Budget Settings */}
                <div className="space-y-4">
                    <div className="h-3 w-48 bg-slate-200 rounded" />
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="h-10 w-full bg-slate-100 rounded-xl" />
                        <div className="h-10 w-full bg-slate-100 rounded-xl" />
                    </div>
                </div>

                {/* Team Section */}
                <div className="space-y-4">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-[2rem] p-6 space-y-3">
                        <div className="h-5 w-40 bg-white/30 rounded" />
                        <div className="h-4 w-64 bg-white/20 rounded" />
                        <div className="h-10 w-full bg-white/20 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    )
}
