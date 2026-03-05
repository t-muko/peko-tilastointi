import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

import { initFirestorter, Collection, Document } from 'firestorter';

// import { define } from "superstruct";


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