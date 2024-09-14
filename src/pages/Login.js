import React, { useState } from 'react';

import firebaseApp from '../firebase/credenciales';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {getFirestore, doc, setDoc} from "firebase/firestore";

import { Nav } from '../components/Nav';

const auth = getAuth(firebaseApp);


export const Login = () => {
    const [isRegistrando, setIsRegistrando] = useState(false);

    const firestore = getFirestore(firebaseApp);

    async function registrarUsuario(email, password, sucursal, rol) {
        const infoUsuario = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        ).then((usuarioFirebase) => {
            return usuarioFirebase;
        });

        const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
        setDoc(docuRef,{correo: email, rol: rol, sucursal: sucursal});
    }

    function submitHandler(e) {
        e.preventDefault();

        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const sucursal = e.target.elements.sucursal.value;
        const rol = e.target.elements.rol.value;

        console.log("submit", email, password, sucursal, rol);

        if (isRegistrando) {
            //registrar
            registrarUsuario(email, password, sucursal, rol);
        } else {
            signInWithEmailAndPassword(auth,email,password);
        }
    }
    
    return (
        <>
            <Nav />
            <h1>{isRegistrando ? "Regístrate" : "Inicia sesión"}</h1>
            <form onSubmit={submitHandler}>
                <label>
                    Correo electrónico:
                    <input type="email" id='email' />
                </label>
                <label>
                    Password:
                    <input type="password" id='password' />
                </label>
                <label>
                    Sucursal:
                    <select id='sucursal'>
                        <option value="Durango">Durango</option>
                        <option value="Fresnillo">Fresnillo</option>
                        <option value="Mazatlán">Mazatlán</option>
                        <option value="Zacatecas">Zacatecas</option>
                    </select>
                </label>
                <label>
                    Rol:
                    <select id='rol'>
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                        <option value="soporte1">Soporte1</option>
                    </select>
                </label>

                <input type='submit' value={isRegistrando ? "Registrar" : "Iniciar sesión"} />
            </form>
            <button onClick={() => setIsRegistrando(!isRegistrando)}>
                {isRegistrando ? "Ya tengo una cuenta" : "Quiero registrarme"}
            </button>

            <div>Login</div>
        </>
    )
}
