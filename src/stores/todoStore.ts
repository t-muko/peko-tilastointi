import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { initFirestorter, Collection, Document } from 'firestorter';
import { getOrCreateFirebaseApp } from '@components/Firebase/firebaseApp';

// import { define } from "superstruct";


getOrCreateFirebaseApp();
initFirestorter({ firebase });

/*
class Todo extends Document {
	constructor(source, options) {
		console.debug("Todo construct", source, options)
		super(source, {
			...(options || {}),
			schema: define({
				text: "string",
				finished: "boolean?"
			})
		});
	}
}
*/
const todos = new Collection("todos", {
	// createDocument: (source, options) => new Todo(source, options)
	createDocument: (source, options) => new Document(source, options)
});

export { todos };