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