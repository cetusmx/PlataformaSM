import "./Nav.css";
import "../index.css";


export const Nav = () => {
  return (
    <header className="header">
      <a href="/" className="logo">Seal Market</a>

      <nav className="navbar">
        <a href="/">Home</a>
        <a href="/crud">Formulario</a>
        <a href="/cotizador">Cotizador</a>
        <a href="/login">Login</a>
      </nav>
    </header>
  );
};
