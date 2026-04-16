// Importar Firebase (se estiver usando)
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
// import { getDatabase, ref, push, set, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Configuração do Firebase (SUBSTITUA PELOS SEUS DADOS)
// const firebaseConfig = {
//     apiKey: "SUA_API_KEY",
//     authDomain: "SEU_AUTH_DOMAIN",
//     databaseURL: "SUA_DATABASE_URL",
//     projectId: "SEU_PROJECT_ID",
//     storageBucket: "SEU_STORAGE_BUCKET",
//     messagingSenderId: "SEU_MESSAGING_SENDER_ID",
//     appId: "SEU_APP_ID"
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const listaRef = ref(database, 'compras');

// Versão demo com localStorage (para teste imediato)
// Substitua pelo Firebase quando estiver pronto

let listaDeCompras = [];

// Carregar dados do localStorage ao iniciar
function carregarDados() {
    const dadosSalvos = localStorage.getItem('listaCompras');
    if (dadosSalvos) {
        listaDeCompras = JSON.parse(dadosSalvos);
    } else {
        // Dados de exemplo para demonstração
        listaDeCompras = [
            { id: '1', texto: 'Arroz', comprado: false },
            { id: '2', texto: 'Feijão', comprado: false },
            { id: '3', texto: 'Leite', comprado: true }
        ];
    }
    renderizarLista();
    atualizarEstatisticas();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('listaCompras', JSON.stringify(listaDeCompras));
}

// Adicionar novo item
function adicionarItem() {
    const input = document.getElementById('item');
    const texto = input.value.trim();
    
    if (texto === '') {
        mostrarNotificacao('Por favor, digite um item!', 'erro');
        return;
    }
    
    const novoItem = {
        id: Date.now().toString(),
        texto: texto,
        comprado: false,
        criadoEm: new Date().toISOString()
    };
    
    listaDeCompras.push(novoItem);
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    
    input.value = '';
    input.focus();
    
    mostrarNotificacao(`"${texto}" adicionado à lista!`, 'sucesso');
}

// Alternar status comprado/não comprado
function toggleComprado(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (item) {
        item.comprado = !item.comprado;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        
        const status = item.comprado ? 'marcado como comprado' : 'marcado como pendente';
        mostrarNotificacao(`"${item.texto}" ${status}!`, 'info');
    }
}

// Editar item
function editarItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoTexto = prompt('Editar item:', item.texto);
    if (novoTexto && novoTexto.trim() !== '') {
        const textoAntigo = item.texto;
        item.texto = novoTexto.trim();
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`"${textoAntigo}" alterado para "${item.texto}"`, 'sucesso');
    }
}

// Remover item individual
function removerItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (item && confirm(`Deseja remover "${item.texto}" da lista?`)) {
        listaDeCompras = listaDeCompras.filter(item => item.id !== id);
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`"${item.texto}" removido da lista!`, 'sucesso');
    }
}

// Limpar todos os itens (FUNCIONANDO)
function limparLista() {
    const totalItens = listaDeCompras.length;
    
    if (totalItens === 0) {
        mostrarNotificacao('A lista já está vazia!', 'info');
        return;
    }
    
    if (confirm(`Tem certeza que deseja remover TODOS os ${totalItens} itens da lista?`)) {
        listaDeCompras = [];
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao('Lista limpa com sucesso!', 'sucesso');
    }
}

// Remover apenas itens comprados
function limparComprados() {
    const comprados = listaDeCompras.filter(item => item.comprado);
    
    if (comprados.length === 0) {
        mostrarNotificacao('Não há itens comprados para remover!', 'info');
        return;
    }
    
    if (confirm(`Remover ${comprados.length} item(ns) já comprado(s)?`)) {
        listaDeCompras = listaDeCompras.filter(item => !item.comprado);
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`${comprados.length} item(ns) comprados removido(s)!`, 'sucesso');
    }
}

// Atualizar estatísticas (total, comprados, pendentes)
function atualizarEstatisticas() {
    const total = listaDeCompras.length;
    const comprados = listaDeCompras.filter(item => item.comprado).length;
    const pendentes = total - comprados;
    
    const totalElement = document.getElementById('totalItens');
    const compradosElement = document.getElementById('itensComprados');
    const pendentesElement = document.getElementById('itensPendentes');
    
    if (totalElement) totalElement.textContent = total;
    if (compradosElement) compradosElement.textContent = comprados;
    if (pendentesElement) pendentesElement.textContent = pendentes;
}

// Renderizar lista no HTML
function renderizarLista() {
    const listaElement = document.getElementById('lista');
    
    if (!listaElement) return;
    
    if (listaDeCompras.length === 0) {
        listaElement.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Sua lista está vazia</p>
                <small>Adicione itens abaixo</small>
            </li>
        `;
        return;
    }
    
    // Ordenar: itens não comprados primeiro, depois comprados
    const itensOrdenados = [...listaDeCompras].sort((a, b) => {
        if (a.comprado === b.comprado) return 0;
        return a.comprado ? 1 : -1;
    });
    
    listaElement.innerHTML = itensOrdenados.map(item => `
        <li data-id="${item.id}">
            <div class="item-content">
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    ${item.comprado ? 'checked' : ''}
                    onchange="toggleComprado('${item.id}')"
                >
                <span class="item-text ${item.comprado ? 'comprado' : ''}">${escapeHtml(item.texto)}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editarItem('${item.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="removerItem('${item.id}')" title="Remover">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Função para escapar HTML (segurança)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar notificações temporárias
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    const icones = {
        sucesso: 'fa-check-circle',
        erro: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    notificacao.innerHTML = `
        <i class="fas ${icones[tipo]}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
        setTimeout(() => {
            notificacao.remove();
        }, 300);
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Deseja realmente sair?')) {
        // Limpar dados de sessão se necessário
        // window.location.href = 'login.html';
        mostrarNotificacao('Saindo...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// Configurar evento de tecla Enter no campo de input
function configurarEventoEnter() {
    const input = document.getElementById('item');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarItem();
            }
        });
    }
}

// Exportar funções para o escopo global (para onclick funcionar)
window.adicionarItem = adicionarItem;
window.toggleComprado = toggleComprado;
window.editarItem = editarItem;
window.removerItem = removerItem;
window.limparLista = limparLista;
window.limparComprados = limparComprados;
window.logout = logout;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    configurarEventoEnter();
    
    // Adicionar botão extra "Limpar Comprados" opcional
    const listHeader = document.querySelector('.list-header');
    if (listHeader && !document.getElementById('limparCompradosBtn')) {
        const btnLimparComprados = document.createElement('button');
        btnLimparComprados.id = 'limparCompradosBtn';
        btnLimparComprados.className = 'btn-clear';
        btnLimparComprados.innerHTML = '<i class="fas fa-check-double"></i> Limpar comprados';
        btnLimparComprados.onclick = limparComprados;
        listHeader.appendChild(btnLimparComprados);
    }
});