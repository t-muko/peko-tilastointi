import {
  getFirestore, deleteField,
  collection, doc, getDocs, where, query, addDoc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
  orderBy,
} from 'firebase/firestore';

import { Collection, Document, initFirestorter } from 'firestorter';
import { getOrCreateFirebaseApp } from '@components/Firebase/firebaseApp';
import { isValidAkm } from '../../utils/akmStats';
import type { ReeniData, ReeniRepository } from './reeniRepository';

// firestorter/web ships a hand-compiled CJS `require("firebase/firestore")` internally,
// which creates a second, incompatible module instance next to our ESM import above
// (breaks `instanceof` checks inside firestore's `collection()`/`doc()`). Building the
// IContext here instead keeps everything on the single ESM-imported firestore module.
class FirestorterReeniRepository implements ReeniRepository {
  private collectionPath: string;
  private collection!: Collection;

  constructor(initialPath = 'reenit/anonyymi/reenit') {
    this.collectionPath = initialPath;
    const app = getOrCreateFirebaseApp();
    const firestore = getFirestore(app);
    initFirestorter({
      collection: (path: string) => collection(firestore, path),
      doc: (path: string) => doc(firestore, path),
      getDocs, where, query, addDoc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, deleteField, serverTimestamp,
    });
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

  async updateAkm(item: any, rawValue: string): Promise<void> {
    const normalized = String(rawValue ?? '').trim();

    if (normalized === '') {
      await item.update({ akm: deleteField() });
      return;
    }

    const numericValue = Math.round(Number(normalized) * 10) / 10;
    if (!isValidAkm(numericValue)) {
      await item.update({ akm: deleteField() });
      return;
    }

    await item.update({ akm: numericValue });
  }

  private createCollection(path: string): Collection {
    const reenit = new Collection(path, {
      createDocument: (source: any, options: any) => new Document(source, options),
    });
    reenit.query = (ref: any) => query(ref, orderBy('pvm', 'desc'));
    return reenit;
  }
}

export default FirestorterReeniRepository;
