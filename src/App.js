import React, { useState, useContext, useEffect } from "react";
import "./App.css";
import { DataContext } from "./contexts/dataContext";

import firebaseApp from "./firebase/credenciales";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AppAdmin from "./AppAdmin";
import LoginPage from "./pages/LoginPage";
import axios from "axios";
import Swal from "sweetalert2";

const auth = getAuth(firebaseApp); //pasamos nuestras credenciales

function App() {
    const { valor, valor2 } = useContext(DataContext);
    const { contextData, setContextData } = valor;
    const {contextsideBarNav, setContextSidebarNav} = valor2;
    const [usuario, setUser] = useState(null);
    const firestore = getFirestore(firebaseApp);

    useEffect(() => {
        const handleSessionExpired = () => {
            Swal.fire({
                title: "Sesión caducada",
                text: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
                icon: "warning",
                confirmButtonText: "Aceptar",
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    signOut(auth);
                }
            });
        };

        // Interceptor para Axios
        const axiosInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    handleSessionExpired();
                }
                return Promise.reject(error);
            }
        );

        // Interceptor para Fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (response.status === 401) {
                    handleSessionExpired();
                }
                return response;
            } catch (error) {
                return Promise.reject(error);
            }
        };

        return () => {
            axios.interceptors.response.eject(axiosInterceptor);
            window.fetch = originalFetch;
        };
    }, []);


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
