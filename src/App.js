import React, { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
//import { Login } from "./pages/Login";
import { HomePage } from "./pages/HomePage";

import firebaseApp from "./firebase/credenciales";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {getFirestore, doc, getDoc} from "firebase/firestore";

const auth = getAuth(firebaseApp); //pasamos nuestras credenciales

function App(){
    const [user, setUser]=useState(null);
    const firestore = getFirestore(firebaseApp);

    async function getRol(uid) {
        const docuRef = doc(firestore, `usuarios/${uid}`);
        const docuCifrada = await getDoc(docuRef);
        return docuCifrada.data();
    }

function setUserWithFirebaseAndRol(usuarioFirebase){
    getRol(usuarioFirebase.uid).then((docSnap) => {
        const userData = {
            uid: usuarioFirebase.uid,
            email: usuarioFirebase.email,
            rol: docSnap.rol,
            sucursal: docSnap.sucursal
        };
        setUser(userData);
        console.log("userData final", userData);
    });
}

    onAuthStateChanged(auth, (usuarioFirebase)=>{

        if(usuarioFirebase){

            if(!user){
                setUserWithFirebaseAndRol(usuarioFirebase);
            }
            
        }else{
            setUser(null);
        }
    });

    return <>{user ? <HomePage user={user} /> : <LoginPage />}</>
}

export default App;