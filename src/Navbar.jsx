import React from "react";
import Container from "react-bootstrap/Container";
import Navbarin from "react-bootstrap/Navbar";
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

export const Navbar = () => {
  return (
    <Navbarin expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbarin.Brand href={`https://google.com`}>React-Bootstrap</Navbarin.Brand>
        <Navbarin.Toggle aria-controls="basic-navbar-nav" />
        <Navbarin.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbarin.Collapse>
      </Container>
    </Navbarin>
  );
};
