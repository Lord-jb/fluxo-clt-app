// js/main.js
// Orquestrador principal da aplicação.

import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { auth, db } from './firebase-init.js'; // Importa as instâncias corretas
import { renderDashboardModule } from './ui.js';

// --- PONTO DE ENTRADA ---
onAuthStateChanged(auth, user => {
    if (user) {
        initializeIndexPage(user);
    } else {
        window.location.replace('login.html');
    }
});

async function initializeIndexPage(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        setupNavigation();
        document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => signOut(auth)));
        
        // Carrega o módulo inicial
        switchView(window.location.hash.substring(1) || 'dashboard', userData);
    } else {
        // Se o documento do utilizador não existir (pode acontecer em casos raros), redireciona para o onboarding.
        console.warn("Documento do utilizador não encontrado, redirecionando para o onboarding.");
        window.location.replace('onboarding.html');
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.hash.substring(1);
            window.location.hash = viewName;
            // É importante passar os dados do utilizador ao trocar de view
            const userData = { email: auth.currentUser.email }; // Exemplo, idealmente teríamos os dados completos
            switchView(viewName, userData);
        });
    });
}

function switchView(viewName, userData) {
    const appContent = document.getElementById('app-content');
    
    appContent.innerHTML = ''; // Limpa o conteúdo atual

    switch(viewName) {
        case 'dashboard':
            renderDashboardModule(appContent, userData);
            break;
        case 'perfil':
            appContent.innerHTML = '<div class="bg-carbon-light p-6 rounded-xl shadow-lg"><h1>Perfil CLT (Em construção)</h1></div>';
            break;
        case 'transacoes':
            appContent.innerHTML = '<div class="bg-carbon-light p-6 rounded-xl shadow-lg"><h1>Transações (Em construção)</h1></div>';
            break;
        default:
            renderDashboardModule(appContent, userData);
    }

    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.toggle('active', (link.hash.substring(1) || 'dashboard') === viewName);
    });
}
