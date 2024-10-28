import { config } from './supabase/src/config.js'

// Create and export an async function to get the Supabase client
export async function getSupabaseClient() {
    if (!config.supabaseUrl || !config.supabaseKey) {
        throw new Error('Missing Supabase configuration. Please check config.js');
    }
    
    // Wait for Supabase to be available
    if (typeof window.supabase === 'undefined') {
        await new Promise(resolve => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    
    return window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
}

// Initialize the client
export const supabasePromise = getSupabaseClient();
