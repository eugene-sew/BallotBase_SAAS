/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly VITE_SEND_OTP: string;
    readonly VITE_VERIFY_OTP: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}