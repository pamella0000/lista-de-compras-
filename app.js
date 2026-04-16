// Banco de dados de preços médios por produto (simulando uma API)
const precosMedios = {
    // Alimentos básicos
    'arroz': 25.90,
    'feijão': 8.50,
    'feijao': 8.50,
    'macarrão': 5.90,
    'macarrao': 5.90,
    'açúcar': 4.50,
    'acucar': 4.50,
    'café': 12.90,
    'cafe': 12.90,
    'leite': 5.50,
    'óleo': 7.90,
    'oleo': 7.90,
    'farinha': 4.90,
    'sal': 2.50,
    
    // Proteínas
    'frango': 22.90,
    'carne': 45.90,
    'bovina': 45.90,
    'porco': 28.90,
    'peixe': 35.90,
    'ovo': 12.90,
    'ovos': 12.90,
    
    // Hortifrúti
    'banana': 5.90,
    'maçã': 8.90,
    'maca': 8.90,
    'laranja': 4.90,
    'alface': 3.50,
    'tomate': 6.90,
    'cebola': 5.90,
    'batata': 4.90,
    'cenoura': 3.90,
    
    // Bebidas
    'refrigerante': 8.90,
    'suco': 6.90,
    'água': 2.50,
    'agua': 2.50,
    'cerveja': 4.90,
    
    // Limpeza
    'detergente': 2.50,
    'sabão': 3.50,
    'sabao': 3.50,
    'amaciante': 12.90,
    'água sanitária': 4.90,
    'agua sanitaria': 4.90,
    'desinfetante': 6.90,
    
    // Higiene
    'shampoo': 15.90,
    'condicionador': 15.90,
    'sabonete': 2.50,
    'creme dental': 4.90,
    'papel higiênico': 18.90,
    'papel higienico': 18.90,
    'fralda': 45.90,
    'absorvente': 12.90
};

// Função para sugerir preço baseado no nome do produto
function sugerirPrecoPorProduto(nomeProduto) {
    const nomeLower = nomeProduto.toLowerCase().trim();
    
    // Verificar correspondência exata
    if (precosMedios[nomeLower]) {
        return precosMedios[nomeLower];
    }
    
    // Verificar palavras-chave
    for (const [palavra, preco] of Object.entries(precosMedios)) {
        if (nomeLower.includes(palavra)) {
            return preco;
        }
    }
    
    // Retornar null se não encontrar sugestão
    return null;
}

let listaDeCompras = [];

// Carregar dados do localStorage ao iniciar
function carregarDados() {
    const dadosSalvos = localStorage.getItem('listaCompras');
    if (dadosSalvos) {
        listaDeCompras = JSON.parse(dadosSalvos);
    } else {
        // Dados de exemplo para demonstração
        listaDeCompras = [
            { id: '1', texto: 'Arroz', preco: 25.90, comprado: false },
            { id: '2', texto: 'Feijão', preco: 8.50, comprado: false },
            { id: '3', texto: 'Leite', preco: 5.50, comprado: true },
            { id: '4', texto: 'Café', preco: 12.90, comprado: false }
        ];
    }
    renderizarLista();
    atualizarEstatisticas();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('listaCompras', JSON.stringify(listaDeCompras));
}

// Adicionar novo item com preço
function adicionarItem() {
    const input = document.getElementById('item');
    const inputPreco = document.getElementById('preco');
    const texto = input.value.trim();
    let preco = parseFloat(inputPreco.value);
    
    if (texto === '') {
        mostrarNotificacao('Por favor, digite um item!', 'erro');
        return;
    }
    
    // Se o preço não foi informado, tentar sugerir
    if (isNaN(preco) || preco <= 0) {
        const precoSugerido = sugerirPrecoPorProduto(texto);
        if (precoSugerido) {
            preco = precoSugerido;
            mostrarNotificacao(`Preço sugerido para "${texto}": R$ ${preco.toFixed(2)}`, 'info');
        } else {
            preco = null;
        }
    }
    
    const novoItem = {
        id: Date.now().toString(),
        texto: texto,
        preco: preco || null,
        comprado: false,
        criadoEm: new Date().toISOString()
    };
    
    listaDeCompras.push(novoItem);
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    
    input.value = '';
    inputPreco.value = '';
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

// Editar item (incluindo preço)
function editarItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoTexto = prompt('Editar nome do item:', item.texto);
    if (novoTexto && novoTexto.trim() !== '') {
        item.texto = novoTexto.trim();
        
        // Perguntar se quer editar o preço
        const editarPreco = confirm('Deseja editar o preço também?');
        if (editarPreco) {
            const novoPreco = prompt('Digite o novo preço (R$):', item.preco || '');
            if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) {
                item.preco = parseFloat(novoPreco) || null;
            }
        }
        
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`"${item.texto}" atualizado!`, 'sucesso');
    }
}

// Editar apenas o preço do item
function editarPreco(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoPreco = prompt(`Digite o preço médio de "${item.texto}":`, item.preco || '');
    if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) {
        item.preco = parseFloat(novoPreco) || null;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`Preço de "${item.texto}" atualizado para R$ ${(item.preco || 0).toFixed(2)}`, 'sucesso');
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

// Limpar todos os itens
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

// Calcular valor total da lista
function calcularValorTotal() {
    const total = listaDeCompras.reduce((soma, item) => {
        if (item.preco && !item.comprado) {
            return soma + item.preco;
        }
        return soma;
    }, 0);
    return total;
}

// Atualizar estatísticas (total, comprados, pendentes, valor total)
function atualizarEstatisticas() {
    const total = listaDeCompras.length;
    const comprados = listaDeCompras.filter(item => item.comprado).length;
    const pendentes = total - comprados;
    const valorTotal = calcularValorTotal();
    
    const totalElement = document.getElementById('totalItens');
    const compradosElement = document.getElementById('itensComprados');
    const pendentesElement = document.getElementById('itensPendentes');
    const valorTotalElement = document.getElementById('valorTotal');
    
    if (totalElement) totalElement.textContent = total;
    if (compradosElement) compradosElement.textContent = comprados;
    if (pendentesElement) pendentesElement.textContent = pendentes;
    if (valorTotalElement) valorTotalElement.textContent = `R$ ${valorTotal.toFixed(2)}`;
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
                <div class="item-details">
                    <span class="item-text ${item.comprado ? 'comprado' : ''}">${escapeHtml(item.texto)}</span>
                    ${item.preco ? `
                        <span class="item-preco">
                            <i class="fas fa-tag"></i>
                            R$ ${item.preco.toFixed(2)}
                        </span>
                    ` : `
                        <span class="item-preco sem-preco" onclick="editarPreco('${item.id}')">
                            <i class="fas fa-plus-circle"></i>
                            Adicionar preço
                        </span>
                    `}
                </div>
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
    
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 10);
    
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
        mostrarNotificacao('Saindo...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// Configurar evento de tecla Enter no campo de input
function configurarEventoEnter() {
    const input = document.getElementById('item');
    const inputPreco = document.getElementById('preco');
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarItem();
            }
        });
    }
    
    if (inputPreco) {
        inputPreco.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarItem();
            }
        });
    }
}

// Exportar funções para o escopo global
window.adicionarItem = adicionarItem;
window.toggleComprado = toggleComprado;
window.editarItem = editarItem;
window.editarPreco = editarPreco;
window.removerItem = removerItem;
window.limparLista = limparLista;
window.limparComprados = limparComprados;
window.logout = logout;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    configurarEventoEnter();
});