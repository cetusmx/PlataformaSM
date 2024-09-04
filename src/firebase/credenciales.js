import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyC9937cuGjDqaYQCpyyUox3F-yjRYdsvJA",
    authDomain: "authplataformasm.firebaseapp.com",
    projectId: "authplataformasm",
    storageBucket: "authplataformasm.appspot.com",
    messagingSenderId: "547263558766",
    appId: "1:547263558766:web:e816e360b56ba00585a27f"
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;