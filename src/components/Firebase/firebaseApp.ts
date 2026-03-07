import firebase from 'firebase/compat/app';

/**
 * Shared Firebase configuration for compat-based initialization.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: "peko-tilastointi.firebaseapp.com",
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
    if (firebase.apps.length === 0) {
        return firebase.initializeApp(firebaseConfig);
    }
    return firebase.apps[0];
}

export { firebaseConfig };
