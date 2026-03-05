import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { initFirestorter, Collection, Document } from 'firestorter';
import type { RootStore } from './index';

class ReeniFireStorter {
    rootStore: RootStore;
    firebase: any;
    collectionPath: string;
    reenit!: Collection;
    path!: string;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.firebase = this.rootStore.firebase;
        this.collectionPath = "reenit/anonyymi/reenit";

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
        initFirestorter({ firebase });

        this.initCollection();
    }

    changePath(path: string) {
        this.collectionPath = path;
        this.initCollection();
    }

    initCollection() {
        this.reenit = new Collection(this.collectionPath, {
            createDocument: (source: any, options: any) => new Document(source, options)
        });
        this.reenit.query = (ref: any) => ref.orderBy('pvm', 'desc');
    }
}

export default ReeniFireStorter;