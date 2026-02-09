import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.error('Missing Supabase Environment Variables')
        // Return a dummy client or throw a clear error to avoid obscure crashes
        // For now, let's try to return a client but it will fail on requests, 
        // which generic error boundaries can catch better than a startup crash.
        // Actually, if we throw here, it might crash the module. 
        // Let's rely on the library throwing but log it.
    }

    return createBrowserClient(
        url || '',
        key || ''
    )
}
