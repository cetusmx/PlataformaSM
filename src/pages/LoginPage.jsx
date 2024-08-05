import React from "react";
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

import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import logo from "../assets/log3.jpg";
import { useFirebaseApp } from "reactfire";
import {getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {

  const [correo, setCorreo] = useState();
  const [pass, setPass] = useState();

  const navigate = useNavigate();

  const validarUsuario = () => {

    const auth = getAuth();

    signInWithEmailAndPassword(auth, correo,pass)
    .then((userCredential)=>{
      console.log(userCredential.user);
      navigate("/cotizador");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    })
    console.log(correo);
    console.log(pass);
    console.log("El botón fue oprimido");
  };

  return (
    <div className="row">
      <div className="col-2"></div>
      <div className="col-8">
        <MDBContainer className="my-5">
          <MDBCard>
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
                  <div className="d-flex flex-row mt-2">
                    <MDBIcon
                      fas
                      icon="cubes fa-3x me-3"
                      style={{ color: "#ff6219" }}
                    />
                    <span className="h1 fw-bold mb-0">
                      <MDBCardImage
                        //src="https://scontent.fdgo1-1.fna.fbcdn.net/v/t39.30808-6/301869389_548403897073267_7724377148803879278_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeE_xGdNQincKQ75ENvV9ALc5ew82G6WlN3l7DzYbpaU3eBj9G09qyS3CEAogb8wDP1bemQ2oJejHgyIZwH3SbIW&_nc_ohc=P_J1c_0mrHsQ7kNvgFl7rD9&_nc_ht=scontent.fdgo1-1.fna&oh=00_AYDckewRDSuWONGlddN8_GqLRYRyswP_VyYoQBTVwmvJ7g&oe=669D3365"
                        alt="login form"
                        className="rounded-start w-50"
                      />
                    </span>
                  </div>

                  <h5
                    className="fw-normal my-4 pb-3"
                    style={{ letterSpacing: "1px" }}
                  >
                    Ingrese con su cuenta
                  </h5>

                  <MDBInput
                  onChange={(event) => {
                    setCorreo(event.target.value);
                  }}
                    wrapperClass="mb-4"
                    label="Correo electrónico"
                    id="formControlEMail"
                    type="email"
                    size="lg"
                  />
                  <MDBInput
                  onChange={(event) => {
                    setPass(event.target.value);
                  }}
                    wrapperClass="mb-4"
                    label="Contraseña"
                    id="formControlPW"
                    type="password"
                    size="lg"
                  />

                  <MDBBtn
                    onClick={validarUsuario}
                    className="mb-4 px-5"
                    color="dark"
                    size="lg"
                  >
                    Ingresar
                  </MDBBtn>
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
  );
};
