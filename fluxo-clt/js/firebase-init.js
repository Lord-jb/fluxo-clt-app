// js/firebase-init.js
// Responsabilidade Única: Inicializar e exportar as instâncias do Firebase.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Sua web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZPZY8AJAJxPJ11xGj2tOWIGHdjh0_W3w",
    authDomain: "minhasfinancasclt.firebaseapp.com",
    projectId: "minhasfinancasclt",
    storageBucket: "minhasfinancasclt.firebasestorage.app",
    messagingSenderId: "551624927055",
    appId: "1:551624927055:web:c92968f4d02551df6ec73a",
    measurementId: "G-09Q73V2B1B"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as instâncias para serem usadas noutros ficheiros
export { auth, db };
