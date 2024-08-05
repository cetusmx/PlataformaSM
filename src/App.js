import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { FormularioCrud } from './pages/FormularioCrud';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { Cotizador } from './pages/Cotizador';
import { useFirebaseApp } from 'reactfire';
import { ProtecterRouter } from './config/ProtecterRouter';

function App() {

  const firebase = useFirebaseApp();
  console.log(firebase);

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


          <Route path="/cotizador" element={
            <ProtecterRouter>
              <Cotizador />
            </ProtecterRouter>
          }>
          </Route>


          <Route path="/home" element={<HomePage />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

