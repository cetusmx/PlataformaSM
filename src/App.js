import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { FormularioCrud } from './pages/FormularioCrud';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { Cotizador } from './pages/Cotizador';
import { useState } from 'react';


function App() {


  return (
    <div className='container' id='appContainer'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />}>
          </Route>
          <Route path="/login" element={<LoginPage />}>
          </Route>
          <Route path="/crud" element={<FormularioCrud />}>
          </Route>
          <Route path="/cotizador" element={<Cotizador />}>
          </Route>
          <Route path="/home" element={<HomePage />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

