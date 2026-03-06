// Firebase compat API is used for firestorter compatibility
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { getAuth, onAuthStateChanged, GoogleAuthProvider, Auth, signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup, signOut, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import type { RootStore } from '@stores/index';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCd5Cg_EC7k2dEM2v2AYH72q5JQqq-6Oxw",
    authDomain: "peko-tilastointi.firebaseapp.com",
    projectId: "peko-tilastointi",
    storageBucket: "peko-tilastointi.appspot.com",
    messagingSenderId: "1051905962064",
    appId: "1:1051905962064:web:e69f8452dc9e53d5e5a155",
    measurementId: "G-PL4VL06TTN"
};
firebase.initializeApp(firebaseConfig);

class Firebase {
    app: any;
    provider: GoogleAuthProvider;
    auth: Auth;
    rootStore: RootStore;
    db?: Firestore;

    constructor(rootStore: RootStore) {
        this.app = firebase.initializeApp(firebaseConfig);
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
            if (user) {
                await user.getIdToken();
            }
            const uid = user ? user.uid : "anonyymi";
            this.rootStore.reeniFirestore.changePath("reenit/" + uid + "/reenit");
        });
    }

    autentikoi() {
        signInWithPopup(this.auth, this.provider)
            .then((result) => {
                const user = result.user;
                console.debug("User logged in:", user);
                this.db = getFirestore();
            }).catch((error) => {
                const errorMessage = error.message;
                const email = (error as any).email;
                console.error("User auth error", email, errorMessage);
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