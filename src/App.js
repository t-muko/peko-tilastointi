import logo from './logo.svg';
import './App.css';

// Firebase stuff
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// signInWithPopup
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

// Material-ui
import * as React from 'react';
// import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';


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


// Initialize Firebase

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();
const auth = getAuth();

function autentikoi() {
  signInWithPopup(auth, provider)
  // signInWithRedirect(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.debug("User", user)
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
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button variant="contained" onClick={() => {
    autentikoi();
  }}
  >Hello World</Button>
      </header>
    </div>
  );
}

export default App;
