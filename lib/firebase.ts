import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Este arquivo é o ponto de entrada para os serviços do Firebase na aplicação.
// A autenticação é gerenciada exclusivamente pelo Firebase.

// As variáveis import.meta.env são preenchidas pelo Vite durante o build
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o Firebase com segurança
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exporta a instância do Firebase Auth, que será usada em toda a aplicação.
const auth = getAuth(app);

export { auth };
