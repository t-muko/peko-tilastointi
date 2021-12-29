// import * as firebase from 'firebase/app';
// import firebase from "firebase";
// v9 compat packages are API compatible with v8 code
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';
import { collection, doc, query, where, getDoc, getDocs, onSnapshot } from "firebase/firestore";
// import rootStore from '../../stores'


// Firebase stuff
// https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial/

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
// signInWithPopup
import { signInWithRedirect, signInWithPopup, signOut } from "firebase/auth";

import { getFirestore } from "firebase/firestore";


import { initFirestorter } from 'firestorter';
import { Collection, Document } from 'firestorter';

// import { reenit } from '../../stores/reeniStore';

// import { struct } from "superstruct";

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
// initFirestorter({ firebase });

class Firebase {
    constructor(rootStore) {
        // app.initializeApp(config);
        console.debug("Initialize Firebase")
        this.app = firebase.initializeApp(firebaseConfig);
        // const analytics = getAnalytics(app);
        this.provider = new GoogleAuthProvider();
        this.auth = getAuth(this.app);
        // this.db = getFirestore(this.app);

        // initFirestorter({ firebase });

        this.rootStore = rootStore;

        onAuthStateChanged(this.auth, user => { 
            this.rootStore.sessionStore.setAuthUser(user)
            console.debug("Auth change", user) 
            const uid = this.rootStore.sessionStore.authUser ? this.rootStore.sessionStore.authUser.uid : "anonyymi"
            console.debug("Store uid", uid)
            this.rootStore.reeniFirestore.reenit.path = "reenit/"+uid+"/reenit"
            this.rootStore.reeniFirestore.changePath("reenit/"+uid+"/reenit")
        });

        /*const q = query(collection(this.db, "yhdistykset"))
        const querySnapshot = getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });*/

    }


    autentikoi() {
        signInWithPopup(this.auth, this.provider)
            // signInWithRedirect(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.debug("User logged in:", user)
                this.db = getFirestore();

                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                console.error("User auth error", email)
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }

    logout() {
        signOut(this.auth)
    }

    async haeYhdistykset() {
        /*var db = getFirestore(this.app);
        getDoc(doc(db, 'yhdistykset/1w1mbDJ8xfmofOrzkvGH')).then(
            (yhtdoc) => {
                console.debug("Yhdistykset", yhtdoc.id, yhtdoc.data())
            }
        )*/
/*
        const todos = new Collection('todos');
        const user = new Document('todos/8273872***');

        const doc = await todos.add({
            finished: false,
            text: 'new task'
          });
          console.log(doc.id, user);*/
        
/*
        const q = query(collection(db, "yhdistykset"), where("lyhenne", "==", "PPK"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const cities = [];
            querySnapshot.forEach((doc) => {
                cities.push(doc.data().name);
            });
            console.log("Current cities in CA: ", cities.join(", "));
        });*/

        /*collection(db, 'yhdistykset')
            .where("lyhenne", "==", "PPK")
            .onSnapshot(function (snapshot) {
                // if (!snapshot.size) return renderer.empty(); // Display "There are no restaurants".
                if (!snapshot.size) {
                    console.debug("Tyhjä joukko")
                    return
                } else {
                    snapshot.docChanges().forEach(function (change) {
                        if (change.type === 'removed') {
                            console.debug("poisto", change.doc)
                        } else {
                            console.debug("muutos", change.doc)
                        }
                    })
                }
            });
            */

    }
}


export default Firebase;