import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Shared Firebase configuration.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    // Must match the domain the app is actually served from (peko-tilastointi.web.app).
    // A mismatched authDomain forces Firebase Auth's popup/redirect flows through a
    // cross-origin iframe+storage handshake that Chrome's storage partitioning breaks —
    // this was the real cause of login requiring repeated attempts / failing outright.
    authDomain: "peko-tilastointi.web.app",
    projectId: "peko-tilastointi",
    storageBucket: "peko-tilastointi.appspot.com",
    messagingSenderId: "1051905962064",
    appId: "1:1051905962064:web:e69f8452dc9e53d5e5a155",
    measurementId: "G-PL4VL06TTN"
};

/**
 * Returns the default Firebase app, creating it only once.
 */
export function getOrCreateFirebaseApp() {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

export { firebaseConfig };
