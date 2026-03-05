import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { initFirestorter, Collection, Document } from 'firestorter';
import type { RootStore } from './index';

class TilastoFireStorter {
    rootStore: RootStore;
    collectionPath: string;
    tilastot!: Collection;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.collectionPath = "tilastot"

        /*const firebaseConfig = {
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
*/
        //    initFirestorter({ firebase: this.firebase })

        this.initCollection()
    }


    initCollection() {
        this.tilastot = new Collection("tilastot")
        /*, {
            createDocument: (source, options) => {
                const docWithCustomId = new Document('tilastot/myOwnId');
                docWithCustomId.set({
                    totalH: 0,
                });
            }
        });*/
    }
}

// reenit.query = (ref) => ref.orderBy('pvm', 'desc');


// export { tilastot };
export default TilastoFireStorter