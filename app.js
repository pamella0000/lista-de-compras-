// ============================================
// BANCO DE DADOS DE PREÇOS MÉDIOS
// ============================================
const precosMedios = {
    'arroz': 25.90, 'feijão': 8.50, 'feijao': 8.50, 'macarrão': 5.90, 'macarrao': 5.90,
    'açúcar': 4.50, 'acucar': 4.50, 'café': 12.90, 'cafe': 12.90, 'leite': 5.50,
    'óleo': 7.90, 'oleo': 7.90, 'farinha': 4.90, 'sal': 2.50, 'frango': 22.90,
    'carne': 45.90, 'bovina': 45.90, 'porco': 28.90, 'peixe': 35.90, 'ovo': 12.90,
    'ovos': 12.90, 'banana': 5.90, 'maçã': 8.90, 'maca': 8.90, 'laranja': 4.90,
    'alface': 3.50, 'tomate': 6.90, 'cebola': 5.90, 'batata': 4.90, 'cenoura': 3.90,
    'refrigerante': 8.90, 'suco': 6.90, 'água': 2.50, 'agua': 2.50, 'cerveja': 4.90,
    'detergente': 2.50, 'sabão': 3.50, 'sabao': 3.50, 'amaciante': 12.90, 'desinfetante': 6.90,
    'shampoo': 15.90, 'condicionador': 15.90, 'sabonete': 2.50, 'creme dental': 4.90,
    'papel higiênico': 18.90, 'papel higienico': 18.90, 'fralda': 45.90, 'absorvente': 12.90
};

let listaDeCompras = [];
let ultimaAcao = null; // Para desfazer
let modoSelecaoMultipla = false;
let itensSelecionados = new Set();
let modoMercadoAtivo = false;

// ============================================
// FUNÇÕES DE PREÇO E SUGESTÃO
// ============================================
function sugerirPrecoPorProduto(nomeProduto) {
    const nomeLower = nomeProduto.toLowerCase().trim();
    if (precosMedios[nomeLower]) return precosMedios[nomeLower];
    for (const [palavra, preco] of Object.entries(precosMedios)) {
        if (nomeLower.includes(palavra)) return preco;
    }
    return null;
}

function sugerirProdutos(texto) {
    if (!texto || texto.length < 2) return [];
    const textoLower = texto.toLowerCase();
    const resultados = [];
    for (const [produto, preco] of Object.entries(precosMedios)) {
        if (produto.includes(textoLower)) {
            resultados.push({ nome: produto, preco: preco });
        }
        if (resultados.length >= 5) break;
    }
    return resultados;
}

function calcularValorTotal() {
    return listaDeCompras.reduce((soma, item) => {
        if (!item.comprado && item.preco && typeof item.preco === 'number' && !isNaN(item.preco)) {
            const quantidade = item.quantidade || 1;
            return soma + (item.preco * quantidade);
        }
        return soma;
    }, 0);
}

// ============================================
// CRUD DE ITENS (COM QUANTIDADE)
// ============================================
function adicionarItem() {
    const input = document.getElementById('item');
    const inputPreco = document.getElementById('preco');
    const inputQuantidade = document.getElementById('quantidade');
    const texto = input.value.trim();
    let preco = parseFloat(inputPreco.value);
    let quantidade = parseInt(inputQuantidade.value) || 1;
    
    if (texto === '') {
        mostrarNotificacao('Por favor, digite um item!', 'erro');
        return;
    }
    
    if (quantidade < 1) quantidade = 1;
    
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
        quantidade: quantidade,
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
    inputQuantidade.value = '1';
    input.focus();
    
    mostrarNotificacao(`"${texto}"${quantidade > 1 ? ` (${quantidade}x)` : ''} adicionado!`, 'sucesso');
}

function toggleComprado(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (item) {
        item.comprado = !item.comprado;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        const status = item.comprado ? 'comprado' : 'pendente';
        mostrarNotificacao(`"${item.texto}" marcado como ${status}!`, 'info');
    }
}

function editarItem(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoTexto = prompt('Editar nome do item:', item.texto);
    if (novoTexto && novoTexto.trim() !== '') {
        const textoAntigo = item.texto;
        item.texto = novoTexto.trim();
        
        const editarQuantidade = confirm('Deseja editar a quantidade?');
        if (editarQuantidade) {
            const novaQuantidade = prompt('Digite a quantidade:', item.quantidade || '1');
            if (novaQuantidade && !isNaN(parseInt(novaQuantidade))) {
                item.quantidade = parseInt(novaQuantidade) || 1;
            }
        }
        
        const editarPreco = confirm('Deseja editar o preço?');
        if (editarPreco) {
            const novoPreco = prompt('Digite o novo preço (R$):', item.preco || '');
            if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) {
                item.preco = parseFloat(novoPreco) || null;
            }
        }
        
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`"${textoAntigo}" atualizado!`, 'sucesso');
    }
}

function editarPreco(id) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    const novoPreco = prompt(`Preço médio de "${item.texto}":`, item.preco || '');
    if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) {
        item.preco = parseFloat(novoPreco) || null;
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarNotificacao(`Preço de "${item.texto}" atualizado!`, 'sucesso');
    }
}

function removerItem(id, skipUndo = false) {
    const item = listaDeCompras.find(item => item.id === id);
    if (!item) return;
    
    if (!skipUndo) {
        ultimaAcao = {
            tipo: 'remover',
            item: { ...item }
        };
    }
    
    listaDeCompras = listaDeCompras.filter(item => item.id !== id);
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    
    if (!skipUndo) {
        mostrarUndoToast(`"${item.texto}" removido`);
    } else {
        mostrarNotificacao(`"${item.texto}" removido!`, 'sucesso');
    }
}

function limparLista() {
    if (listaDeCompras.length === 0) {
        mostrarNotificacao('A lista já está vazia!', 'info');
        return;
    }
    
    if (confirm(`Remover TODOS os ${listaDeCompras.length} itens?`)) {
        ultimaAcao = {
            tipo: 'limpar',
            itens: [...listaDeCompras]
        };
        listaDeCompras = [];
        salvarDados();
        renderizarLista();
        atualizarEstatisticas();
        mostrarUndoToast('Todos os itens removidos');
    }
}

function limparComprados() {
    const comprados = listaDeCompras.filter(item => item.comprado);
    if (comprados.length === 0) {
        mostrarNotificacao('Não há itens comprados!', 'info');
        return;
    }
    
    ultimaAcao = {
        tipo: 'limparComprados',
        itens: [...comprados]
    };
    
    listaDeCompras = listaDeCompras.filter(item => !item.comprado);
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    mostrarUndoToast(`${comprados.length} itens comprados removidos`);
}

function desfazerUltimaAcao() {
    if (!ultimaAcao) return;
    
    if (ultimaAcao.tipo === 'remover') {
        listaDeCompras.push(ultimaAcao.item);
        listaDeCompras.sort((a, b) => a.id - b.id);
    } else if (ultimaAcao.tipo === 'limpar') {
        listaDeCompras = [...ultimaAcao.itens];
    } else if (ultimaAcao.tipo === 'limparComprados') {
        listaDeCompras = [...listaDeCompras, ...ultimaAcao.itens];
    } else if (ultimaAcao.tipo === 'bulkDelete') {
        listaDeCompras = [...ultimaAcao.itens];
    }
    
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    mostrarNotificacao('Ação desfeita!', 'sucesso');
    ultimaAcao = null;
}

// ============================================
// SELEÇÃO MÚLTIPLA
// ============================================
function toggleModoSelecao() {
    modoSelecaoMultipla = !modoSelecaoMultipla;
    itensSelecionados.clear();
    
    const btn = document.getElementById('selecionarMultiplosBtn');
    const bulkBar = document.getElementById('bulkActionsBar');
    
    if (modoSelecaoMultipla) {
        btn.classList.add('ativo');
        document.body.classList.add('selection-mode');
        mostrarNotificacao('Modo de seleção ativado. Toque nos itens para selecionar.', 'info');
    } else {
        btn.classList.remove('ativo');
        document.body.classList.remove('selection-mode');
        bulkBar.hidden = true;
    }
    
    renderizarLista();
}

function toggleSelecionarItem(id) {
    if (!modoSelecaoMultipla) return;
    
    if (itensSelecionados.has(id)) {
        itensSelecionados.delete(id);
    } else {
        itensSelecionados.add(id);
    }
    
    atualizarBulkActionsBar();
    renderizarLista();
}

function atualizarBulkActionsBar() {
    const bulkBar = document.getElementById('bulkActionsBar');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    if (itensSelecionados.size > 0 && modoSelecaoMultipla) {
        bulkBar.hidden = false;
        selectedCountSpan.textContent = itensSelecionados.size;
    } else {
        bulkBar.hidden = true;
    }
}

function bulkDelete() {
    if (itensSelecionados.size === 0) return;
    
    ultimaAcao = {
        tipo: 'bulkDelete',
        itens: [...listaDeCompras]
    };
    
    listaDeCompras = listaDeCompras.filter(item => !itensSelecionados.has(item.id));
    itensSelecionados.clear();
    modoSelecaoMultipla = false;
    
    const btn = document.getElementById('selecionarMultiplosBtn');
    btn.classList.remove('ativo');
    document.body.classList.remove('selection-mode');
    
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    mostrarUndoToast(`${itensSelecionados.size} itens removidos`);
}

function bulkComplete() {
    if (itensSelecionados.size === 0) return;
    
    listaDeCompras.forEach(item => {
        if (itensSelecionados.has(item.id)) {
            item.comprado = true;
        }
    });
    
    itensSelecionados.clear();
    modoSelecaoMultipla = false;
    
    const btn = document.getElementById('selecionarMultiplosBtn');
    btn.classList.remove('ativo');
    document.body.classList.remove('selection-mode');
    
    salvarDados();
    renderizarLista();
    atualizarEstatisticas();
    mostrarNotificacao('Itens marcados como comprados!', 'sucesso');
}

// ============================================
// MODO MERCADO
// ============================================
function toggleModoMercado() {
    modoMercadoAtivo = !modoMercadoAtivo;
    
    if (modoMercadoAtivo) {
        document.body.classList.add('market-mode');
        localStorage.setItem('modoMercado', 'true');
        mostrarNotificacao('Modo Mercado ativado! Interface gigante para usar no supermercado.', 'sucesso');
    } else {
        document.body.classList.remove('market-mode');
        localStorage.setItem('modoMercado', 'false');
        mostrarNotificacao('Modo Mercado desativado.', 'info');
    }
}

// ============================================
// AUTOCOMPLETE
// ============================================
function configurarAutocomplete() {
    const input = document.getElementById('item');
    const sugestoesDiv = document.getElementById('sugestoesList');
    let timeoutId;
    
    input.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const texto = e.target.value.trim();
            const sugestoes = sugerirProdutos(texto);
            
            if (sugestoes.length > 0 && texto.length >= 2) {
                sugestoesDiv.innerHTML = sugestoes.map(sug => `
                    <div class="sugestao-item" data-nome="${sug.nome}" data-preco="${sug.preco}">
                        <span class="sugestao-nome">${sug.nome.charAt(0).toUpperCase() + sug.nome.slice(1)}</span>
                        <span class="sugestao-preco">R$ ${sug.preco.toFixed(2)}</span>
                    </div>
                `).join('');
               