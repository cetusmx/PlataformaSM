import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import firebaseConfig from './firebase-config';
import { FirebaseAppProvider } from 'reactfire'
//import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import { DataContextProvider } from './contexts/dataContext';
import { BrowserRouter } from "react-router-dom";
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Suspense fallback={'Conectando app...'}>
        <DataContextProvider>
          <App />
        </DataContextProvider>
      </Suspense>
    </FirebaseAppProvider>
    </BrowserRouter>
);

