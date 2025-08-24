// js/auth.js
// Lida com toda a lógica da página de login.

import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, getDoc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { auth, db } from './firebase-init.js'; // Importa as instâncias corretas

// --- UTILITIES ---
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 3000);
    }, 3000);
};
const translateAuthError = (error) => {
    switch (error.code) {
        case 'auth/user-not-found': return 'Nenhuma conta encontrada com este e-mail.';
        case 'auth/wrong-password': return 'Senha incorreta. Por favor, tente novamente.';
        case 'auth/email-already-in-use': return 'Este e-mail já está a ser utilizado por outra conta.';
        case 'auth/weak-password': return 'A sua senha é muito fraca. Use pelo menos 6 caracteres.';
        case 'auth/invalid-email': return 'O e-mail fornecido não é válido.';
        case 'auth/network-request-failed': return 'Erro de rede. Verifique a sua conexão com a internet.';
        default: return 'Ocorreu um erro inesperado. Por favor, tente mais tarde.';
    }
};

// --- LÓGICA DE AUTENTICAÇÃO ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleLink = document.getElementById('toggle-form-link');
const forgotPasswordLink = document.getElementById('forgot-password-link');

// Redirecionamento inteligente
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().onboardingComplete) {
            window.location.replace('index.html');
        } else {
            // Se o documento não existir ou o onboarding não estiver completo, vai para o onboarding.
            window.location.replace('onboarding.html');
        }
    }
});

toggleLink.addEventListener('click', e => {
    e.preventDefault();
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    toggleLink.textContent = registerForm.classList.contains('hidden')
        ? 'Não tem uma conta? Crie uma agora!'
        : 'Já tem uma conta? Faça login!';
});

registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
            email: cred.user.email,
            createdAt: Timestamp.now(),
            onboardingComplete: false,
            profile: {}
        });
        // O onAuthStateChanged irá tratar do redirecionamento
    } catch (error) {
        showToast(translateAuthError(error), 'error');
    }
});

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // O onAuthStateChanged irá tratar do redirecionamento
    } catch (error) {
        showToast(translateAuthError(error), 'error');
    }
});

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt("Por favor, insira o seu e-mail para receber o link de redefinição:");
    if (email) {
        sendPasswordResetEmail(auth, email)
            .then(() => showToast('Link de redefinição enviado! Verifique o seu e-mail.', 'success'))
            .catch((error) => showToast(translateAuthError(error), 'error'));
    }
});
