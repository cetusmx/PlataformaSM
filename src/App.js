import React, { useState, useContext } from "react";
import "./App.css";
import { DataContext } from "./contexts/dataContext";

import firebaseApp from "./firebase/credenciales";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AppAdmin from "./AppAdmin";
import LoginPage from "./pages/LoginPage";

const auth = getAuth(firebaseApp); //pasamos nuestras credenciales

function App() {
    const { valor, valor2 } = useContext(DataContext);
    const { contextData, setContextData } = valor;
    const {contextsideBarNav, setContextSidebarNav} = valor2;
    const [usuario, setUser] = useState(null);
    const firestore = getFirestore(firebaseApp);


    async function getRol(uid) {
        const docuRef = doc(firestore, `usuarios/${uid}`);
        const docuCifrada = await getDoc(docuRef);
        return docuCifrada.data();
    }


    function setUserWithFirebaseAndRol(usuarioFirebase) {
        getRol(usuarioFirebase.uid).then((docSnap) => {
            const userData = {
                uid: usuarioFirebase.uid,
                email: usuarioFirebase.email,
                rol: docSnap.rol,
                sucursal: docSnap.sucursal
            };
            setUser(userData);
            setContextData(userData);
            setContextSidebarNav("Inicio");
            //console.log("App => setContextData ", {contextData});
            //console.log("App => userData final ", userData);
        });
    }

    onAuthStateChanged(auth, (usuarioFirebase) => {

        if (usuarioFirebase) {

            if (!usuario) {
                setUserWithFirebaseAndRol(usuarioFirebase);
                //console.log(usuario);
            }

        } else {
            setUser(null);
        }
    });

    return (<>
    {/* console.log("App=> " + {contextData}) */}
        {
            (usuario)
                ? <AppAdmin usuari={usuario} />
                : <LoginPage />
        }

        
    </>)
}
export default App;
