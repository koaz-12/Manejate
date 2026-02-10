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

            {/* Month Selector */}
            <div className="px-6 pt-4">
                <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>

            <main className="px-6 mt-6 space-y-6">
                {/* Title */}
                <div className="flex justify-between items-center">
                    <div className="h-7 w-48 bg-slate-200 rounded-lg" />
                    <div className="flex gap-2">
                        <div className="h-9 w-9 bg-slate-200 rounded-xl" />
                        <div className="h-9 w-9 bg-slate-200 rounded-xl" />
                    </div>
                </div>

                {/* Overall Status Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-slate-200 rounded" />
                            <div className="h-8 w-36 bg-slate-200 rounded-lg" />
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-5 w-24 bg-slate-200 rounded" />
                        </div>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full" />
                </div>

                {/* Category Cards */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-28 bg-slate-200 rounded" />
                                <div className="h-3 w-20 bg-slate-100 rounded" />
                            </div>
                            <div className="h-5 w-16 bg-slate-100 rounded" />
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full" />
                    </div>
                ))}
            </main>
        </div>
    )
}
