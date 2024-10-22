import React, { useContext } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";

import { useState } from "react";
import logo from "../assets/log3.jpg";
import Logo from "../assets/Logo2.jpg";
import firebaseApp from "../firebase/credenciales";
import {
  getAuth,
  signInWithEmailAndPassword
} from "firebase/auth";

import "bootstrap/dist/css/bootstrap.min.css";
import { DataContext } from "../contexts/dataContext";
import "../styles/loginPage.css";

const auth = getAuth(firebaseApp);

const LoginPage = () => {
  const [correo, setCorreo] = useState();
  const [pass, setPass] = useState();

  const { valor, valor2 } = useContext(DataContext);
  const { contextData, setContextData } = valor;

  function submitHandler(e) {
    e.preventDefault();
    
      signInWithEmailAndPassword(auth, correo, pass)
        .then((userCredential) => {
          //console.log(userCredential.user);
          setContextData(userCredential);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
        });
  }

  return (
    <>
    <div className="row"  style={{marginTop: "-20px", height: "90vh"}}>
      <div className="col-2"></div>
      <div className="col-8" >
        <MDBContainer className="my-0">
          <MDBCard >
            <MDBRow className="g-0">
              <MDBCol md="6">
                <MDBCardImage
                  src={logo}
                  //src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                  alt="login form"
                  className="rounded-start w-100"
                />
              </MDBCol>

              <MDBCol md="6">
                <MDBCardBody className="d-flex flex-column">
                  <div className="d-flex flex-row mt-1">
                    <span className="h1 fw-bold mb-0">
                      <MDBCardImage
                      src={Logo}
                        alt="login form"
                        className="rounded-start w-50"
                      />
                    </span>
                  </div>

                  <h5
                    className="fw-normal my-4 pb-1"
                    style={{ letterSpacing: "1px" }}
                  >
                    Ingrese con su cuenta
                  </h5>

                  <MDBInput
                    onChange={(event) => {
                      setCorreo(event.target.value);
                    }}
                    wrapperClass="mb-3"
                    label="Correo electrónico"
                    id="email"
                    //id="formControlEMail"
                    type="email"
                    size="lg"
                  />
                  <MDBInput
                    onChange={(event) => {
                      setPass(event.target.value);
                    }}
                    wrapperClass="mb-3"
                    label="Contraseña"
                    id="password"
                    //id="formControlPW"
                    type="password"
                    size="lg"
                  />

                  <button
                  id="login-button"
                    onClick={submitHandler}
                    className="mb-3 px-3 boton-login-ingreso"
                    size="lg"
                  >
                    Ingresar
                  </button>
                  {/* <MDBBtn
                    onClick={submitHandler}
                    className="mb-3 px-3"
                    color="dark"
                    size="lg"
                  >
                    Ingresar
                  </MDBBtn> */}
                  <a className="small text-muted" href="#!">
                    ¿Olvidó su contraseña?
                  </a>
                  <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                    ¿No tiene cuenta?{" "}
                    <a href="#!" style={{ color: "#393f81" }}>
                      Regístrese aquí
                    </a>
                  </p>

                  <div className="d-flex flex-row justify-content-start"></div>
                </MDBCardBody>
              </MDBCol>
            </MDBRow>
          </MDBCard>
        </MDBContainer>
      </div>
      <div className="col-2"></div>
    </div>
    </>
  );
};

export default LoginPage;