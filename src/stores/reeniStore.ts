import type { RootStore } from './index';
import FirestorterReeniRepository from './repositories/firestorterReeniRepository';
import type { ReeniData, ReeniRepository } from './repositories/reeniRepository';
import moment from 'moment';

/**
 * Firestorter wrapper for training entries collection and path switching.
 */
class ReeniFireStorter {
    rootStore: RootStore;
    repository: ReeniRepository;
    path!: string;
    reenit: any;

    constructor(rootStore: RootStore, repository: ReeniRepository = new FirestorterReeniRepository()) {
        this.rootStore = rootStore;
        this.repository = repository;
        this.path = 'reenit/anonyymi/reenit';
        this.reenit = this.repository.getCollection();
    }

    changePath(path: string) {
        this.path = path;
        this.repository.setPath(path);
        this.reenit = this.repository.getCollection();
    }

    addReeni(data: ReeniData) {
        return this.repository.add(data);
    }

    addDefaultReeni() {
        return this.addReeni({
            pvm: moment(new Date()).format('YYYY-MM-DD'),
            tunnit: 0,
            kommentti: '',
            kategoria: '',
            koira: 'Ei koiraa',
        });
    }
}

export default ReeniFireStorter;