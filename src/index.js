import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import firebaseConfig from './firebase-config';
import { FirebaseAppProvider } from 'reactfire'
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Suspense fallback={'Conectando app...'}>
        <App />
      </Suspense>
    </FirebaseAppProvider>
  </React.StrictMode>
);

