/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_USE_EMULATOR?: string;
    readonly VITE_FIREBASE_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __BUILD_HASH__: string;
declare const __BUILD_DATE__: string;
