import { useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth'
import { useNavigate } from "react-router-dom";

export const ProtecterRouter = ({ children }) => {

    const navigate = useNavigate();

    useEffect(()=>{
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              navigate("/cotizador");
              const uid = user.uid;
              localStorage.setItem('uid',uid);
              console.log(uid);
            } else {
              // User is signed out
              navigate("/");
            }
          });

    },[])

  return children;
};
