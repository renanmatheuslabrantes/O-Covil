// Copie os valores do console do Firebase para este objeto.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);