// ============================================
// BANCO DE DADOS DE PREÇOS MÉDIOS
// ============================================
const precosMedios = {
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
    'frango': 22.90,
    'carne': 45.90,
    'bovina': 45.90,
    'porco': 28.90,
    'peixe': 35.90,
    'ovo': 12.90,
    'ovos': 12.90,
    'banana': 5.90,
    'maçã': 8.90,
    'maca': 8.90,
    'laranja': 4.90,
    'alface': 3.50,
    'tomate': 6.90,
    'cebola': 5.90,
    'batata': 4.90,
    'cenoura': 3.90,
    'refrigerante': 8.90,
    'suco': 6.90,
    'água': 2.50,
    'agua': 2.50,
    'cerveja': 4.90,
    'detergente': 2.50,
    'sabão': 3.50,
    'sabao': 3.50,
    'amaciante': 12.90,
    'desinfetante': 6.90,
    'shampoo': 15.90,
    'condicionador': 15.90,
    'sabonete': 2.50,
    'creme dental': 4.90,
    'papel higiênico': 18.90,
    'papel higienico': 18.90,
    'fralda': 45.90,
    'absorvente': 12.90
};

// ============================================
// FUNÇÕES DE PREÇO
// ============================================
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
    
    return null;
}

function calcularValorTotal() {
    const total = listaDeCompras.reduce((soma, item) => {
        // Só soma preços de itens NÃO comprados que têm preço definido
        if (!item.comprado && item.preco && typeof item.preco === 'number' && !isNaN(item.preco)) {
            return soma + item.preco;
        }
        return soma;
    }, 0);
    return total;
}

// ============================================
// DADOS E PERSISTÊNCIA
// ============================================
let listaDeCompras = [];

function carregarDados() {
    const dadosSalvos = localStorage.getItem('listaCompras');
    if (dadosSalvos) {
        listaDeCompras = JSON.parse(dadosSalvos);
        // Garantir que todos os itens tenham a estrutura correta
        listaDeCompras = listaDeCompras.map(item => ({
            ...item,
            preco: item.preco !== undefined && item.preco !== null ? parseFloat(item.preco) : null,
            comprado: item.comprado || false
        }));
    } else {
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

function salvarDados() {
    localStorage.setItem('listaCompras', JSON.stringify(listaDeCompras));
}

// ============================================
// CRUD DE ITENS
// ============================================
function adicionarItem() {
    const input = document.getElementById('item');
    const inputPreco = document.getElementById('preco');
    const texto = input.value.trim();
    let preco = parseFloat(inputPreco.value);
    
    if (texto === '') {
        mostrarNotificacao('Por favor, digite um item!', 'erro');
        return;
    }
    
    // Se o preço não foi informado ou é inválido, tentar sugerir
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
    anunciarAcao(`Item ${texto} adicionado à lista`);
}

function toggleComprado(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (item) {
        item.comprado = !item.comprado;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        
        const status = item.comprado ? 'marcado como comprado' : 'marcado como pendente';
        mostrarNotificacao(`"${item.texto}" ${status}!`, 'info');
        anunciarAcao(`${item.texto} ${status}`);
    }
}

function editarItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoTexto = prompt('Editar nome do item:', item.texto);
    if (novoTexto && novoTexto.trim() !== '') {
        const textoAntigo = item.texto;
        item.texto = novoTexto.trim();
        
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
        mostrarNotificacao(`"${textoAntigo}" atualizado para "${item.texto}"`, 'sucesso');
        anunciarAcao(`Item atualizado para ${item.texto}`);
    }
}

function editarPreco(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoPreco = prompt(`Digite o preço médio de "${item.texto}":`, item.preco || '');
    if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) {
        const precoAntigo = item.preco;
        item.preco = parseFloat(novoPreco) || null;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        
        if (item.preco) {
            mostrarNotificacao(`Preço de "${item.texto}" atualizado para R$ ${item.preco.toFixed(2)}`, 'sucesso');
            anunciarAcao(`Preço de ${item.texto} atualizado para ${item.preco.toFixed(2)} reais`);
        } else {
            mostrarNotificacao(`Preço de "${item.texto}" removido`, 'info');
        }
    }
}

function removerItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (item && confirm(`Deseja remover "${item.texto}" da lista?`)) {
        listaDeCompras = listaDeCompras.filter(item => item.id !== id);
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`"${item.texto}" removido da lista!`, 'sucesso');
        anunciarAcao(`${item.texto} removido da lista`);
    }
}

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
        anunciarAcao('Todos os itens foram removidos da lista');
    }
}

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
        anunciarAcao(`${comprados.length} itens comprados foram removidos`);
    }
}

// ============================================
// ATUALIZAÇÃO DE ESTATÍSTICAS (CORRIGIDA)
// ============================================
function atualizarEstatisticas() {
    const total = listaDeCompras.length;
    const comprados = listaDeCompras.filter(item => item.comprado === true).length;
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
    
    // Debug (opcional - remover em produção)
    console.log('Estatísticas atualizadas:', { total, comprados, pendentes, valorTotal });
}

// ============================================
// RENDERIZAÇÃO DA LISTA
// ============================================
function renderizarLista() {
    const listaElement = document.getElementById('lista');
    
    if (!listaElement) return;
    
    if (listaDeCompras.length === 0) {
        listaElement.innerHTML = `
            <li class="empty-state" role="status">
                <i class="fas fa-clipboard-list" aria-hidden="true"></i>
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
        <li data-id="${item.id}" role="listitem">
            <div class="item-content">
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    ${item.comprado ? 'checked' : ''}
                    onchange="toggleComprado('${item.id}')"
                    aria-label="${item.comprado ? `Desmarcar ${escapeHtml(item.texto)} como comprado` : `Marcar ${escapeHtml(item.texto)} como comprado`}"
                >
                <div class="item-details">
                    <span class="item-text ${item.comprado ? 'comprado' : ''}">${escapeHtml(item.texto)}</span>
                    ${item.preco && typeof item.preco === 'number' && !isNaN(item.preco) ? `
                        <span class="item-preco" aria-label="Preço: ${item.preco.toFixed(2)} reais">
                            <i class="fas fa-tag" aria-hidden="true"></i>
                            R$ ${item.preco.toFixed(2)}
                        </span>
                    ` : `
                        <span class="item-preco sem-preco" onclick="editarPreco('${item.id}')" role="button" tabindex="0" aria-label="Adicionar preço para ${escapeHtml(item.texto)}">
                            <i class="fas fa-plus-circle" aria-hidden="true"></i>
                            Adicionar preço
                        </span>
                    `}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editarItem('${item.id}')" aria-label="Editar ${escapeHtml(item.texto)}">
                    <i class="fas fa-edit" aria-hidden="true"></i>
                </button>
                <button class="btn-delete" onclick="removerItem('${item.id}')" aria-label="Remover ${escapeHtml(item.texto)}">
                    <i class="fas fa-trash-alt" aria-hidden="true"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// NOTIFICAÇÕES E UI
// ============================================
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    const icones = {
        sucesso: 'fa-check-circle',
        erro: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    notificacao.innerHTML = `
        <i class="fas ${icones[tipo]}" aria-hidden="true"></i>
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

function logout() {
    if (confirm('Deseja realmente sair?')) {
        mostrarNotificacao('Saindo...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

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

// ============================================
// ACESSIBILIDADE
// ============================================
class AcessibilidadeManager {
    constructor() {
        this.fontSize = localStorage.getItem('fontSize') || 'normal';
        this.highContrast = localStorage.getItem('highContrast') === 'true';
        this.readerMode = localStorage.getItem('readerMode') === 'true';
        this.init();
    }
    
    init() {
        this.aplicarConfiguracoes();
        this.configurarBotoes();
        this.configurarTeclado();
    }
    
    aplicarConfiguracoes() {
        if (this.fontSize === 'large') {
            document.body.classList.add('font-large');
        } else if (this.fontSize === 'xlarge') {
            document.body.classList.add('font-xlarge');
        }
        
        if (this.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.readerMode) {
            document.body.classList.add('reader-mode');
        }
    }
    
    configurarBotoes() {
        const aumentarFonte = document.getElementById('aumentarFonte');
        const diminuirFonte = document.getElementById('diminuirFonte');
        const altoContraste = document.getElementById('altoContraste');
        const leitorTela = document.getElementById('leitorTela');
        const resetBtn = document.getElementById('resetAcessibilidade');
        const accessBtn = document.getElementById('accessibilityBtn');
        const accessPanel = document.getElementById('accessibilityPanel');
        
        if (aumentarFonte) {
            aumentarFonte.addEventListener('click', () => this.aumentarFonte());
        }
        
        if (diminuirFonte) {
            diminuirFonte.addEventListener('click', () => this.diminuirFonte());
        }
        
        if (altoContraste) {
            altoContraste.addEventListener('click', () => this.toggleHighContrast());
        }
        
        if (leitorTela) {
            leitorTela.addEventListener('click', () => this.toggleReaderMode());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetar());
        }
        
        if (accessBtn && accessPanel) {
            accessBtn.addEventListener('click', () => {
                const expanded = accessBtn.getAttribute('aria-expanded') === 'true';
                accessBtn.setAttribute('aria-expanded', !expanded);
                accessPanel.hidden = expanded;
            });
            
            document.addEventListener('click', (e) => {
                if (!accessBtn.contains(e.target) && !accessPanel.contains(e.target)) {
                    accessPanel.hidden = true;
                    accessBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
    
    configurarTeclado() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                adicionarItem();
            }
            
            if (e.key === 'Escape') {
                const accessPanel = document.getElementById('accessibilityPanel');
                const accessBtn = document.getElementById('accessibilityBtn');
                if (accessPanel && !accessPanel.hidden) {
                    accessPanel.hidden = true;
                    accessBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
    
    announce(message) {
        const liveRegion = document.getElementById('liveRegion');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 3000);
        }
    }
    
    aumentarFonte() {
        if (this.fontSize === 'normal') {
            this.fontSize = 'large';
            document.body.classList.add('font-large');
            this.announce('Tamanho da fonte aumentado para grande');
        } else if (this.fontSize === 'large') {
            this.fontSize = 'xlarge';
            document.body.classList.remove('font-large');
            document.body.classList.add('font-xlarge');
            this.announce('Tamanho da fonte aumentado para muito grande');
        } else {
            this.announce('Tamanho máximo da fonte atingido');
        }
        localStorage.setItem('fontSize', this.fontSize);
    }
    
    diminuirFonte() {
        if (this.fontSize === 'xlarge') {
            this.fontSize = 'large';
            document.body.classList.remove('font-xlarge');
            document.body.classList.add('font-large');
            this.announce('Tamanho da fonte reduzido para grande');
        } else if (this.fontSize === 'large') {
            this.fontSize = 'normal';
            document.body.classList.remove('font-large');
            this.announce('Tamanho da fonte reduzido para normal');
        } else {
            this.announce('Tamanho mínimo da fonte atingido');
        }
        localStorage.setItem('fontSize', this.fontSize);
    }
    
    toggleHighContrast() {
        this.highContrast = !this.highContrast;
        if (this.highContrast) {
            document.body.classList.add('high-contrast');
            this.announce('Modo de alto contraste ativado');
        } else {
            document.body.classList.remove('high-contrast');
            this.announce('Modo de alto contraste desativado');
        }
        localStorage.setItem('highContrast', this.highContrast);
    }
    
    toggleReaderMode() {
        this.readerMode = !this.readerMode;
        if (this.readerMode) {
            document.body.classList.add('reader-mode');
            this.announce('Modo leitor ativado');
        } else {
            document.body.classList.remove('reader-mode');
            this.announce('Modo leitor desativado');
        }
        localStorage.setItem('readerMode', this.readerMode);
    }
    
    resetar() {
        this.fontSize = 'normal';
        this.highContrast = false;
        this.readerMode = false;
        
        document.body.classList.remove('font-large', 'font-xlarge', 'high-contrast', 'reader-mode');
        
        localStorage.removeItem('fontSize');
        localStorage.removeItem('highContrast');
        localStorage.removeItem('readerMode');
        
        this.announce('Configurações de acessibilidade resetadas');
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

function anunciarAcao(mensagem) {
    if (accessibilityManager) {
        accessibilityManager.announce(mensagem);
    }
}

// ============================================
// EXPORTAÇÃO DAS FUNÇÕES GLOBAIS
// ============================================
window.adicionarItem = adicionarItem;
window.toggleComprado = toggleComprado;
window.editarItem = editarItem;
window.editarPreco = editarPreco;
window.removerItem = removerItem;
window.limparLista = limparLista;
window.limparComprados = limparComprados;
window.logout = logout;
window.mostrarNotificacao = mostrarNotificacao;

// ============================================
// INICIALIZAÇÃO
// ============================================
let accessibilityManager;

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    configurarEventoEnter();
    accessibilityManager = new AcessibilidadeManager();
});