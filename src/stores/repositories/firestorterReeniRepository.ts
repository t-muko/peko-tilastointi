import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { Collection, Document, initFirestorter } from 'firestorter';
import { getOrCreateFirebaseApp } from '@components/Firebase/firebaseApp';
import type { ReeniData, ReeniRepository } from './reeniRepository';

class FirestorterReeniRepository implements ReeniRepository {
  private collectionPath: string;
  private collection!: Collection;

  constructor(initialPath = 'reenit/anonyymi/reenit') {
    this.collectionPath = initialPath;
    getOrCreateFirebaseApp();
    initFirestorter({ firebase });
    this.collection = this.createCollection(this.collectionPath);
  }

  setPath(path: string): void {
    this.collectionPath = path;
    this.collection = this.createCollection(path);
  }

  getCollection(): Collection {
    return this.collection;
  }

  add(data: ReeniData): Promise<unknown> {
    return this.collection.add(data);
  }

  private createCollection(path: string): Collection {
    const reenit = new Collection(path, {
      createDocument: (source: any, options: any) => new Document(source, options),
    });
    reenit.query = (ref: any) => ref.orderBy('pvm', 'desc');
    return reenit;
  }
}

export default FirestorterReeniRepository;
