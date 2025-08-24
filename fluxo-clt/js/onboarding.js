// js/onboarding.js
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, updateDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { auth, db } from './firebase-init.js';

// --- UTILITIES ---
const showToast = (message, type = 'success') => { /* ... (código do showToast) ... */ };
const parseCurrency = (value) => Number(String(value).replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;

const onboardingForm = document.getElementById('onboarding-form');
const contasFixasList = document.getElementById('contas-fixas-list');
const addContaBtn = document.getElementById('add-conta-btn');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.replace('login.html');
    }
});

addContaBtn.addEventListener('click', () => {
    const contaItem = document.createElement('div');
    contaItem.className = 'grid grid-cols-3 gap-2 items-center';
    contaItem.innerHTML = `
        <input type="text" class="form-input conta-nome" placeholder="Nome da Conta (Ex: Aluguel)">
        <input type="text" class="form-input currency-input conta-valor" placeholder="Valor (R$)">
        <input type="number" class="form-input conta-dia" placeholder="Dia do Vencimento" min="1" max="31">
    `;
    contasFixasList.appendChild(contaItem);
});

onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return showToast('Erro: utilizador não encontrado.', 'error');

    const profileData = {
        salarioBruto: parseCurrency(document.getElementById('salario-bruto').value),
        diaRecebimento: document.getElementById('dia-recebimento').value,
    };

    const userDocRef = doc(db, "users", currentUser.uid);
    
    // Salvar contas fixas
    const contasNodes = contasFixasList.querySelectorAll('.grid');
    const contasPromises = [];
    contasNodes.forEach(node => {
        const nome = node.querySelector('.conta-nome').value;
        const valor = parseCurrency(node.querySelector('.conta-valor').value);
        const dia = parseInt(node.querySelector('.conta-dia').value, 10);

        if (nome && valor > 0 && dia > 0) {
            contasPromises.push(addDoc(collection(db, `users/${currentUser.uid}/contasFixas`), { nome, valor, diaVencimento: dia }));
        }
    });

    try {
        await Promise.all(contasPromises);
        await updateDoc(userDocRef, {
            profile: profileData,
            onboardingComplete: true
        });
        window.location.replace('index.html');
    } catch (error) {
        console.error("Erro ao salvar onboarding:", error);
        showToast('Ocorreu um erro ao salvar os seus dados.', 'error');
    }
});
