import type { FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, Auth, signInWithEmailAndPassword } from "firebase/auth";
import { signInWithRedirect, getRedirectResult, signOut, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import type { RootStore } from '@stores/index';
import { getOrCreateFirebaseApp } from './firebaseApp';

/**
 * Firebase service for auth operations and auth-state wiring to stores.
 */
class Firebase {
    app: FirebaseApp;
    provider: GoogleAuthProvider;
    auth: Auth;
    rootStore: RootStore;
    db?: Firestore;

    constructor(rootStore: RootStore) {
        this.app = getOrCreateFirebaseApp();
        this.provider = new GoogleAuthProvider();
        this.auth = getAuth(this.app);
        this.auth.languageCode = 'fi';
        this.rootStore = rootStore;

        if (import.meta.env.VITE_USE_EMULATOR === 'true') {
            connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
            const db = getFirestore(this.app);
            connectFirestoreEmulator(db, 'localhost', 8080);
        }

        // Switch the Firestorter collection path when auth state changes.
        // getIdToken() ensures the auth token is propagated to Firestore before
        // firestorter starts listening, preventing a transient permissions error.
        onAuthStateChanged(this.auth, async user => {
            this.rootStore.sessionStore.setAuthUser(user);
            this.rootStore.sessionStore.setAuthResolved(true);
            this.rootStore.sessionStore.setAuthTokenReady(false);
            if (user) {
                try {
                    await user.getIdToken();
                }
                catch (error) {
                    console.warn('Unable to refresh auth token before path switch', error);
                }
            }
            this.rootStore.sessionStore.setAuthTokenReady(true);
            const uid = user ? user.uid : "anonyymi";
            this.rootStore.reeniFirestore.changePath("reenit/" + uid + "/reenit");
        });

        // Resolve the redirect sign-in result (if the page just loaded back from one).
        // onAuthStateChanged above already updates sessionStore on success; this only
        // surfaces sign-in errors that a popup's .catch() used to report synchronously.
        getRedirectResult(this.auth)
            .then((result) => {
                if (result) {
                    this.db = getFirestore();
                }
            }).catch((error) => {
                const errorMessage = error.message;
                const email = (error as any).email;
                console.error("User auth error", email, errorMessage);
            });
    }

    autentikoi() {
        signInWithRedirect(this.auth, this.provider).catch((error) => {
            console.error("User auth error", error.message);
        });
    }

    logout() {
        signOut(this.auth);
        this.rootStore.reeniFirestore.changePath("reenit/anonyymi/reenit");
    }

    async haeYhdistykset() {
        // Not currently implemented
    }

    async autentikoiTestissa(email: string, password: string) {
        if (import.meta.env.VITE_USE_EMULATOR !== 'true') {
            throw new Error('autentikoiTestissa() on käytettävissä vain emulaattori-tilassa');
        }
        return signInWithEmailAndPassword(this.auth, email, password);
    }
}

export default Firebase;