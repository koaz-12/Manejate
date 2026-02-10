export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-slate-100 px-6 pt-[env(safe-area-inset-top)]">
                <div className="flex justify-between items-center py-4">
                    <div className="h-8 w-32 bg-slate-200 rounded-xl" />
                    <div className="flex gap-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-full" />
                        <div className="h-10 w-10 bg-slate-200 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Month Selector Skeleton */}
            <div className="px-6 pt-4">
                <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>

            {/* Summary Card Skeleton */}
            <main className="px-6 space-y-8 mt-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-10 w-48 bg-slate-200 rounded-lg" />
                    <div className="flex gap-4">
                        <div className="h-16 flex-1 bg-slate-100 rounded-xl" />
                        <div className="h-16 flex-1 bg-slate-100 rounded-xl" />
                    </div>
                </div>

                {/* Chart Skeleton */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="h-48 bg-slate-100 rounded-xl" />
                </div>

                {/* Transactions Skeleton */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="h-5 w-40 bg-slate-200 rounded" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-slate-100 rounded" />
                                <div className="h-3 w-20 bg-slate-100 rounded" />
                            </div>
                            <div className="h-5 w-16 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
