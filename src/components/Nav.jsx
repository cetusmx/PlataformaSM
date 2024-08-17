import "./Nav.css";
import "../index.css";
import { getAuth, signOut } from "firebase/auth";

export const Nav = () => {
  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };
  return (
    <div className="container mt-3">
      <header className="header">
        <a href="/" className="logo">
          Seal Market
        </a>

        <nav className="navbar">
          <a href="/">Home</a>
          <a href="/crud">Formulario</a>
          <a href="/cotizador">Cotizador</a>
          <a href="/editamar">Editar Márgenes</a>
          <a onClick={logout} href="##">
            Salir
          </a>
        </nav>
      </header>
    </div>
  );
};
