import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { Cotizador } from './pages/Cotizador';
//import { useFirebaseApp } from 'reactfire';
import { ProtecterRouter } from './config/ProtecterRouter';
import { Editamars } from './pages/Editamars';

function App() {

  //const firebase = useFirebaseApp();
  //sconsole.log(firebase);

  return (
    <div className='container' id='appContainer'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />}>
          </Route>
          <Route path="/login" element={<LoginPage />}>
          </Route>
          {/* <Route path="/crud" element={<FormularioCrud />}>
          </Route> */}
          <Route path="/editamar" element={<Editamars />}>
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

