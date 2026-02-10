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

            <main className="px-6 mt-6 space-y-6">
                {/* Title + Button */}
                <div className="flex justify-between items-center">
                    <div className="h-7 w-40 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                </div>

                {/* Total Saved Card */}
                <div className="bg-gradient-to-br from-slate-200 to-slate-300 p-8 rounded-[2rem] space-y-3">
                    <div className="h-4 w-28 bg-white/30 rounded" />
                    <div className="h-12 w-48 bg-white/30 rounded-lg" />
                    <div className="h-6 w-40 bg-white/20 rounded-full" />
                </div>

                {/* Goal Cards */}
                {[1, 2].map(i => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-slate-100 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full" />
                        <div className="flex justify-between">
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </main>
        </div>
    )
}
